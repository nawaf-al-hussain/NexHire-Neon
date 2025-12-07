"""
Compare SSMS dump vs Neon PostgreSQL state.
Outputs a clean migration audit report.
"""
import psycopg2
import re
from pathlib import Path

CS = ("postgresql://neondb_owner:npg_FJg8z6kGfWLb"
      "@ep-rough-field-a19919o2-pooler.ap-southeast-1.aws.neon.tech/neondb"
      "?sslmode=require&channel_binding=require")

SSMS_DUMP = "/home/z/my-project/upload/RecruitmentDBDump.sql"


def extract_ssms_objects():
    """Parse the SSMS dump to list tables, views, procedures, functions, triggers."""
    # SSMS dumps are typically UTF-16 LE with a BOM
    raw = Path(SSMS_DUMP).read_bytes()
    for enc in ('utf-16-le', 'utf-16', 'utf-8', 'latin-1'):
        try:
            text = raw.decode(enc)
            if 'CREATE TABLE' in text.upper():
                break
        except UnicodeDecodeError:
            continue
    # Normalize: collapse whitespace
    text = re.sub(r'\s+', ' ', text)

    tables = set()
    views = set()
    procs = set()
    funcs = set()
    triggers = set()

    # Patterns
    pat_table = re.compile(r'CREATE\s+TABLE\s+\[dbo\]\.\[([^\]]+)\]', re.I)
    pat_view  = re.compile(r'CREATE\s+VIEW\s+\[dbo\]\.\[([^\]]+)\]', re.I)
    pat_proc  = re.compile(r'CREATE\s+PROCEDURE\s+\[dbo\]\.\[([^\]]+)\]', re.I)
    pat_func  = re.compile(r'CREATE\s+FUNCTION\s+\[dbo\]\.\[([^\]]+)\]', re.I)
    pat_trig  = re.compile(r'CREATE\s+TRIGGER\s+\[?dbo\]?\.\[?([^\]]+)\]?', re.I)

    for m in pat_table.finditer(text): tables.add(m.group(1).lower())
    for m in pat_view.finditer(text):  views.add(m.group(1).lower())
    for m in pat_proc.finditer(text):  procs.add(m.group(1).lower())
    for m in pat_func.finditer(text):  funcs.add(m.group(1).lower())
    for m in pat_trig.finditer(text):  triggers.add(m.group(1).lower())

    return tables, views, procs, funcs, triggers


def extract_neon_objects():
    """Query Neon for user-defined objects (filter out extension-provided funcs)."""
    conn = psycopg2.connect(CS); cur = conn.cursor()

    # Tables & views
    cur.execute("""
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema='public'
    """)
    tables, views = set(), set()
    for t, ty in cur.fetchall():
        (tables if ty == 'BASE TABLE' else views).add(t.lower())

    # User-defined functions/procs (exclude extension-owned)
    cur.execute("""
        SELECT p.proname, p.prokind
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
        WHERE n.nspname = 'public'
          AND d.objid IS NULL
    """)
    funcs, procs = set(), set()
    for name, kind in cur.fetchall():
        name = name.lower()
        if kind == 'p':
            procs.add(name)
        else:
            funcs.add(name)

    # Triggers (just the names)
    cur.execute("""
        SELECT trigger_name FROM information_schema.triggers
        WHERE trigger_schema='public'
    """)
    triggers = {r[0].lower() for r in cur.fetchall()}

    # Also collect "trg_*" functions (they are trigger functions)
    cur.execute("""
        SELECT p.proname FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
        WHERE n.nspname = 'public' AND d.objid IS NULL
          AND p.proname ILIKE 'trg_%'
    """)
    trg_funcs = {r[0].lower() for r in cur.fetchall()}

    cur.close(); conn.close()
    return tables, views, procs, funcs, triggers | trg_funcs


def diff(label, ssms, neon):
    print(f"\n{'='*70}\n{label}\n{'='*70}")
    print(f"  SSMS: {len(ssms):>3}   Neon: {len(neon):>3}")
    missing = sorted(ssms - neon)
    extra   = sorted(neon - ssms)
    if missing:
        print(f"  MISSING in Neon ({len(missing)}):")
        for m in missing: print(f"     - {m}")
    if extra:
        print(f"  NEW in Neon (not in SSMS) ({len(extra)}):")
        for e in extra: print(f"     + {e}")
    if not missing and not extra:
        print("  [OK] perfectly matched")


def main():
    s_t, s_v, s_p, s_f, s_tr = extract_ssms_objects()
    n_t, n_v, n_p, n_f, n_tr = extract_neon_objects()

    print("MIGRATION AUDIT — SSMS vs Neon PostgreSQL")
    print(f"SSMS source: {SSMS_DUMP}")
    print(f"Neon target: neondb @ ep-rough-field-a19919o2-pooler")

    diff("TABLES", s_t, n_t)
    diff("VIEWS", s_v, n_v)
    diff("STORED PROCEDURES", s_p, n_p)
    diff("FUNCTIONS (scalar/TVF)", s_f, n_f)
    diff("TRIGGERS / TRIGGER FUNCTIONS", s_tr, n_tr)

    # Total summary
    print("\n" + "=" * 70)
    print("OVERALL COUNTS")
    print("=" * 70)
    print(f"  {'Object Type':<30} {'SSMS':>8} {'Neon':>8} {'Match':>8}")
    print(f"  {'-'*30} {'-'*8} {'-'*8} {'-'*8}")
    for lbl, s, n in [
        ("Tables", s_t, n_t),
        ("Views", s_v, n_v),
        ("Stored Procedures", s_p, n_p),
        ("Functions", s_f, n_f),
        ("Triggers (functions)", s_tr, n_tr),
    ]:
        match = "OK" if s == n or s.issubset(n) else "DIFF"
        print(f"  {lbl:<30} {len(s):>8} {len(n):>8} {match:>8}")


if __name__ == "__main__":
    main()
