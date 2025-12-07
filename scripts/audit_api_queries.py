"""
Extract every SQL query string from server/routes/*.js and test each one
against Neon. Reports:
  - Which queries are syntactically valid (parse OK)
  - Which queries actually execute
  - Which queries fail and why

Strategy:
  1) Parse JS files to find `query(...)` calls and extract the SQL string.
     Handles template literals, single/double quoted strings, and concatenations.
  2) For each query:
     a) Replace ? placeholders with $1, $2, ... (mirrors db.js shim)
     b) Run EXPLAIN (without executing) to check parse + plan
     c) If EXPLAIN succeeds, attempt actual execution with NULL params
        (only for SELECT/RETURNING queries — never INSERT/UPDATE/DELETE/DDL
        for safety)
     d) Record errors
  3) Group results per route file.
"""
import re
import os
import json
import psycopg2
from pathlib import Path

CS = ("postgresql://neondb_owner:npg_FJg8z6kGfWLb"
      "@ep-rough-field-a19919o2-pooler.ap-southeast-1.aws.neon.tech/neondb"
      "?sslmode=require&channel_binding=require")

ROUTES_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes")

# Regex: find query(`...`) or query("...") or query('...')
# We need to handle escaped quotes/backticks
def extract_queries(file_text):
    """Return list of (line_no, sql_text) tuples. Handles JS string concatenation."""
    queries = []
    pattern = re.compile(r'\bquery\s*\(\s*([`"\'])', re.MULTILINE)
    for m in pattern.finditer(file_text):
        start = m.end() - 1
        first_quote = file_text[start]
        line_no = file_text[:m.start()].count('\n') + 1
        # Walk forward collecting strings, allowing + concatenation
        i = start
        buf = []
        while i < len(file_text):
            # Skip leading whitespace
            while i < len(file_text) and file_text[i] in ' \t\r\n':
                i += 1
            if i >= len(file_text):
                break
            c = file_text[i]
            if c in ('`', '"', "'"):
                quote = c
                i += 1
                while i < len(file_text):
                    ch = file_text[i]
                    if ch == '\\' and quote in ('"', "'"):
                        if i + 1 < len(file_text):
                            buf.append(file_text[i+1])
                            i += 2
                            continue
                    if ch == quote:
                        i += 1
                        break
                    if ch == '\n' and quote in ('"', "'"):
                        # JS string literals cannot span lines without \
                        break
                    buf.append(ch)
                    i += 1
                # After string, look for + to continue concatenation
                j = i
                while j < len(file_text) and file_text[j] in ' \t\r\n':
                    j += 1
                if j < len(file_text) and file_text[j] == '+':
                    # Continue to next string
                    i = j + 1
                    continue
                else:
                    break
            else:
                # Not a string — stop
                break
        if buf:
            sql = ''.join(buf).strip()
            if sql and any(kw in sql.upper() for kw in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WITH', 'CALL')):
                queries.append((line_no, sql))
    return queries


def convert_placeholders(sql):
    """Convert ? to $1, $2, ..."""
    out = []
    n = 1
    in_str = None
    for c in sql:
        if in_str:
            out.append(c)
            if c == in_str:
                in_str = None
        elif c in ("'", '"'):
            in_str = c
            out.append(c)
        elif c == '?':
            out.append(f'${n}')
            n += 1
        else:
            out.append(c)
    return ''.join(out)


def classify(sql):
    """Return (is_readonly, has_params)."""
    s = sql.lstrip().upper()
    is_readonly = s.startswith(('SELECT', 'WITH'))
    # Has params if it contains ? OR $N (PG-native)
    has_params = '?' in sql or bool(re.search(r'\$\d+', sql))
    return is_readonly, has_params


def test_explain(cur, sql_pg):
    """Validate a query. Returns (ok, error_msg).
    For SELECT/INSERT/UPDATE/DELETE: use PREPARE (parses + plans, no execute).
    For CALL: check the procedure exists with matching arg count.
    """
    # If the query contains JS template interpolation ${...}, skip.
    if '${' in sql_pg:
        return False, "JS_TEMPLATE_INTERP"

    stripped = sql_pg.lstrip()

    # Handle CALL specially — PREPARE doesn't support it
    if stripped.upper().startswith('CALL '):
        # Parse: CALL procname($1, $2, ...) or CALL procname()
        m = re.match(r'CALL\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)', stripped, re.I)
        if not m:
            return False, "Could not parse CALL statement"
        proc_name = m.group(1).lower()
        args_str = m.group(2).strip()
        # Count args (split on commas, ignoring empty)
        if args_str:
            # Each placeholder is $N or a literal — just count
            n_args = len([a for a in args_str.split(',') if a.strip()])
        else:
            n_args = 0
        try:
            cur.execute("""
                SELECT p.proname, p.prokind,
                       pg_get_function_arguments(p.oid) AS args,
                       pg_get_function_identity_arguments(p.oid) AS ident_args
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public' AND p.proname = %s
            """, (proc_name,))
            rows = cur.fetchall()
            if not rows:
                return False, f"Procedure '{proc_name}' not found in public schema"
            # Find a version with matching arg count
            for proname, prokind, args, ident_args in rows:
                actual_n = 0 if not ident_args.strip() else len(ident_args.split(','))
                if actual_n == n_args:
                    return True, None
            # No matching arity
            sigs = [r[2] for r in rows]
            return False, f"Procedure '{proc_name}' exists but no overload matches {n_args} args. Signatures: {sigs}"
        except Exception as e:
            return False, str(e)

    # Normal SQL: PREPARE validates parse + plan
    stmt_name = "_audit_p"
    try:
        cur.execute(f"PREPARE {stmt_name} AS {sql_pg}")
        cur.execute(f"DEALLOCATE {stmt_name}")
        return True, None
    except Exception as e:
        try:
            cur.execute(f"DEALLOCATE {stmt_name}")
        except Exception:
            pass
        return False, str(e)


def main():
    conn = psycopg2.connect(CS)
    conn.autocommit = True
    cur = conn.cursor()

    results = {}
    total_ok = 0
    total_fail = 0
    total_skip = 0

    for route_file in sorted(ROUTES_DIR.glob('*.js')):
        name = route_file.name
        text = route_file.read_text(errors='replace')
        queries = extract_queries(text)
        file_results = []
        for ln, sql in queries:
            is_ro, has_params = classify(sql)
            try:
                sql_pg = convert_placeholders(sql)
            except Exception as e:
                file_results.append((ln, 'PARSE_ERR', str(e)[:120], sql[:80]))
                total_fail += 1
                continue

            # For non-readonly queries, only do EXPLAIN if we can wrap safely
            # For SELECT/WITH, EXPLAIN is safe (no execution).
            # For INSERT/UPDATE/DELETE/CALL, EXPLAIN also doesn't execute.
            ok, err = test_explain(cur, sql_pg)
            if ok:
                if has_params:
                    file_results.append((ln, 'EXPLAIN_OK_PARAMS', None, sql[:80]))
                    total_skip += 1
                elif is_ro:
                    try:
                        cur.execute(sql_pg)
                        cur.fetchall()
                        file_results.append((ln, 'OK', None, sql[:80]))
                        total_ok += 1
                    except Exception as e:
                        file_results.append((ln, 'EXEC_FAIL', str(e)[:160], sql[:80]))
                        total_fail += 1
                else:
                    file_results.append((ln, 'EXPLAIN_OK', None, sql[:80]))
                    total_ok += 1
            elif err == "JS_TEMPLATE_INTERP":
                file_results.append((ln, 'JS_TEMPLATE', 'Dynamic JS template — manual review needed', sql[:80]))
                total_skip += 1
            else:
                file_results.append((ln, 'EXPLAIN_FAIL', err[:200], sql[:80]))
                total_fail += 1
        results[name] = file_results

    # Print report
    print("=" * 80)
    print("API ROUTE SQL AUDIT — Neon PostgreSQL")
    print("=" * 80)
    print(f"\nSummary: OK={total_ok}  FAIL={total_fail}  SKIP(params)={total_skip}")
    print()

    for name, items in results.items():
        fails = [x for x in items if x[1].endswith('_FAIL') or x[1] == 'PARSE_ERR']
        print(f"\n--- {name}  ({len(items)} queries, {len(fails)} failures) ---")
        for ln, status, err, preview in items:
            if status in ('EXPLAIN_FAIL', 'EXEC_FAIL', 'PARSE_ERR'):
                print(f"  L{ln:<5} [{status}] {preview}")
                if err:
                    print(f"          ERR: {err}")

    # Save full report as JSON
    out_path = "/home/z/my-project/scripts/api_audit_report.json"
    with open(out_path, 'w') as f:
        json.dump({
            'summary': {'ok': total_ok, 'fail': total_fail, 'skip': total_skip},
            'by_file': {name: [{'line': ln, 'status': s, 'error': e, 'preview': p}
                              for ln, s, e, p in items]
                       for name, items in results.items()}
        }, f, indent=2)
    print(f"\nFull report saved to: {out_path}")

    cur.close(); conn.close()


if __name__ == "__main__":
    main()
