"""
Test connection to Neon PostgreSQL and inspect schema.
"""
import psycopg2

CONNECTION_STRING = (
    "postgresql://neondb_owner:npg_FJg8z6kGfWLb"
    "@ep-rough-field-a19919o2-pooler.ap-southeast-1.aws.neon.tech/neondb"
    "?sslmode=require&channel_binding=require"
)


def main():
    print("-> Attempting to connect to Neon PostgreSQL...")
    try:
        conn = psycopg2.connect(CONNECTION_STRING)
        cur = conn.cursor()
        print("[OK] Connection established!\n")

        # 1) Server version
        cur.execute("SELECT version();")
        print("Server version:")
        print(cur.fetchone()[0])
        print()

        # 2) Current DB / user
        cur.execute("SELECT current_database(), current_user, current_schema();")
        db, user, schema = cur.fetchone()
        print(f"Database: {db}")
        print(f"User:     {user}")
        print(f"Schema:   {schema}")
        print()

        # 3) List all schemas
        cur.execute("""
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
            ORDER BY schema_name;
        """)
        schemas = [r[0] for r in cur.fetchall()]
        print(f"Schemas (non-system): {schemas}")
        print()

        # 4) List all tables in public schema (and any other non-system schemas)
        cur.execute("""
            SELECT table_schema, table_name, table_type
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        """)
        rows = cur.fetchall()
        print(f"Total tables/views: {len(rows)}")
        print("-" * 70)
        from collections import defaultdict
        grouped = defaultdict(list)
        for s, t, ty in rows:
            grouped[s].append((t, ty))
        for s, items in grouped.items():
            print(f"\nSchema: {s}  ({len(items)} objects)")
            for t, ty in sorted(items):
                print(f"   - {t:<55} [{ty}]")

        # 5) Row counts for each user table (top-level)
        print("\n" + "=" * 70)
        print("ROW COUNTS (base tables only)")
        print("=" * 70)
        cur.execute("""
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
              AND table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        """)
        tables = cur.fetchall()
        for s, t in tables:
            try:
                cur.execute(f'SELECT COUNT(*) FROM "{s}"."{t}";')
                cnt = cur.fetchone()[0]
                print(f"   {s}.{t:<45} {cnt:>10,} rows")
            except Exception as e:
                conn.rollback()
                print(f"   {s}.{t:<45} ERROR: {e}")

        # 6) List of functions / procedures (Postgres stored procs)
        print("\n" + "=" * 70)
        print("FUNCTIONS / PROCEDURES")
        print("=" * 70)
        cur.execute("""
            SELECT n.nspname AS schema, p.proname AS name,
                   pg_get_function_result(p.oid) AS result,
                   pg_get_function_arguments(p.oid) AS args,
                   p.prokind AS kind
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
            ORDER BY n.nspname, p.proname;
        """)
        procs = cur.fetchall()
        print(f"Total: {len(procs)} functions/procedures")
        for s, n, r, a, k in procs[:200]:
            kind_label = {'p': 'PROC', 'f': 'FUNC', 'a': 'AGG'}.get(k, k)
            print(f"   [{kind_label}] {s}.{n}({a})")

        # 7) List of views
        print("\n" + "=" * 70)
        print("VIEWS")
        print("=" * 70)
        cur.execute("""
            SELECT table_schema, table_name
            FROM information_schema.views
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        """)
        views = cur.fetchall()
        print(f"Total: {len(views)} views")
        for s, t in views:
            print(f"   {s}.{t}")

        # 8) List of triggers
        print("\n" + "=" * 70)
        print("TRIGGERS")
        print("=" * 70)
        cur.execute("""
            SELECT event_object_schema, event_object_table, trigger_name,
                   action_timing, event_manipulation, action_statement
            FROM information_schema.triggers
            ORDER BY event_object_schema, event_object_table, trigger_name;
        """)
        trigs = cur.fetchall()
        print(f"Total: {len(trigs)} triggers")
        for s, t, tn, at, em, ast in trigs[:100]:
            print(f"   {s}.{t} -> {tn} [{at} {em}]")
            print(f"        {(ast or '')[:120]}")

        cur.close()
        conn.close()
        print("\n[OK] Done.")

    except Exception as e:
        print(f"[ERROR] Connection/query failed: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
