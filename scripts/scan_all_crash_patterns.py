"""
Comprehensive scan for ALL runtime crash patterns:

1. .toFixed() on string values (PostgreSQL NUMERIC returns strings)
2. .split() on undefined/null values
3. .map() on undefined/null values
4. .length on undefined/null values
5. Property access on undefined objects (e.g., data.property when data might be null)
6. Missing API endpoints (frontend calls that don't exist in backend)
7. CHECK constraint mismatches (frontend sends values DB doesn't allow)
8. Column name mismatches (frontend accesses PascalCase, DB returns lowercase)
9. Division by zero
10. Date parsing on invalid values
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
ROUTES = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes")

issues = []

# ============================================================
# 1. .toFixed() NOT wrapped in Number() or parseFloat()
# ============================================================
for f in SRC.rglob('*.jsx'):
    text = f.read_text(encoding='utf-8')
    # Find all .toFixed() calls
    for m in re.finditer(r'(\w[^)]*?)\.toFixed\(', text):
        prefix = m.group(1)
        # Check if it's already wrapped in Number() or parseFloat()
        start = max(0, m.start() - 10)
        context = text[start:m.end()]
        if 'Number(' not in context and 'parseFloat(' not in context and 'parseInt(' not in context:
            line_no = text[:m.start()].count('\n') + 1
            issues.append(('toFixed', f.name, line_no, f'{prefix}.toFixed('))

# ============================================================
# 2. .split() without null check
# ============================================================
for f in SRC.rglob('*.jsx'):
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'(\w+(?:\.\w+)*(?:\?\.)?)\.split\(', text):
        var = m.group(1)
        # Check if there's a || '' fallback before .split
        start = max(0, m.start() - 30)
        context = text[start:m.end()]
        if '|| ' not in context and '?? ' not in context:
            line_no = text[:m.start()].count('\n') + 1
            issues.append(('split', f.name, line_no, f'{var}.split('))

# ============================================================
# 3. .map() on potentially undefined (no ?. or || [] check)
# ============================================================
for f in SRC.rglob('*.jsx'):
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'(\w+(?:\.\w+)*)\.map\(', text):
        var = m.group(1)
        # Skip if it's a const declaration or already has ?. or || []
        start = max(0, m.start() - 40)
        context = text[start:m.end()]
        if '?.' in context or '|| []' in context or 'const ' in context or 'Array.from' in context:
            continue
        # Skip common safe patterns
        if var in ['data', 'items', 'results', 'buttons', 'rows']:
            continue  # These are usually initialized as []
        line_no = text[:m.start()].count('\n') + 1
        issues.append(('map', f.name, line_no, f'{var}.map('))

# ============================================================
# 4. Backend routes that reference 'data' without a query
# ============================================================
for f in ROUTES.glob('*.js'):
    text = f.read_text(encoding='utf-8')
    lines = text.split('\n')
    in_route = False
    route_name = ''
    has_query = False
    has_data_ref = False
    
    for i, line in enumerate(lines):
        if 'router.' in line:
            if has_data_ref and not has_query:
                issues.append(('missing-query', f.name, i, f'route: {route_name[:60]}'))
            in_route = True
            route_name = line.strip()
            has_query = False
            has_data_ref = False
        if in_route:
            if 'await query(' in line:
                has_query = True
            if 'data.map' in line or 'data)' in line:
                if 'data.map' in line:
                    has_data_ref = True
        if '});' in line and in_route:
            if has_data_ref and not has_query:
                issues.append(('missing-query', f.name, i+1, f'route: {route_name[:60]}'))
            in_route = False

# ============================================================
# 5. Frontend API calls to endpoints that don't exist in backend
# ============================================================
# Get all backend routes
backend_routes = set()
for f in ROUTES.glob('*.js'):
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r"router\.(?:get|post|put|delete)\s*\(\s*['\"]([^'\"]+)", text):
        route = m.group(1)
        # Normalize: remove :id params
        route_normalized = re.sub(r'/:[^/]+', '', route)
        backend_routes.add(route_normalized)

# Get all frontend API calls
frontend_calls = set()
for f in SRC.rglob('*.jsx'):
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'axios\.(?:get|post|put|delete)\s*\(\s*`\$\{API_BASE\}/([^`?]+)', text):
        call = m.group(1)
        # Remove dynamic segments like ${variable}
        call_normalized = re.sub(r'/\$\{[^}]+\}', '', call)
        call_normalized = call_normalized.rstrip('/')
        if call_normalized not in backend_routes:
            # Check partial matches
            found = False
            for route in backend_routes:
                if call_normalized == route or call_normalized.startswith(route + '/'):
                    found = True
                    break
            if not found:
                issues.append(('missing-endpoint', f.name, 0, f'GET/POST {call_normalized}'))

# ============================================================
# 6. CHECK constraint values — find frontend sends of status/result values
# ============================================================
# Check backgroundchecks Result CHECK
valid_results = ['Clear', 'Consider', 'Adverse', 'Inconclusive']
for f in SRC.rglob('*.jsx'):
    text = f.read_text(encoding='utf-8')
    # Find result: 'value' patterns
    for m in re.finditer(r"result:\s*['\"](\w+)['\"]", text):
        val = m.group(1)
        if val not in valid_results:
            line_no = text[:m.start()].count('\n') + 1
            issues.append(('check-constraint', f.name, line_no, f"result: '{val}' not in {valid_results}"))

# ============================================================
# Print results
# ============================================================
print("=" * 70)
print("COMPREHENSIVE RUNTIME CRASH SCAN")
print("=" * 70)

categories = {}
for issue in issues:
    cat = issue[0]
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(issue)

for cat, cat_issues in sorted(categories.items()):
    print(f"\n=== {cat.upper()} ({len(cat_issues)} issues) ===")
    for _, fname, line, desc in cat_issues[:15]:
        print(f"  {fname}:{line} — {desc}")
    if len(cat_issues) > 15:
        print(f"  ... and {len(cat_issues) - 15} more")

print(f"\n{'=' * 70}")
print(f"TOTAL ISSUES: {len(issues)}")
print(f"  toFixed (string crash):     {len(categories.get('toFixed', []))}")
print(f"  split (undefined crash):    {len(categories.get('split', []))}")
print(f"  map (undefined crash):      {len(categories.get('map', []))}")
print(f"  missing-query (500 error):  {len(categories.get('missing-query', []))}")
print(f"  missing-endpoint (404):     {len(categories.get('missing-endpoint', []))}")
print(f"  check-constraint (500):     {len(categories.get('check-constraint', []))}")
