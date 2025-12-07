"""Fix CandidateDashboard.jsx — restore DashboardShell as eager, wrap all
component renders that take props in Suspense."""
from pathlib import Path
import re

file = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/pages/CandidateDashboard.jsx")
text = file.read_text(encoding='utf-8')

# 1. Restore DashboardShell as eager import
old_lazy_shell = "const DashboardShell = lazy(() => import('../components/DashboardShell'));"
new_eager_shell = "import DashboardShell from '../components/DashboardShell';"
if old_lazy_shell in text:
    text = text.replace(old_lazy_shell, new_eager_shell, 1)
    print("OK: restored DashboardShell as eager import")

# 2. Find all "return <ComponentName ...props... />;" patterns and wrap in Suspense
# Match: return <SomeComponent any props here />;
# But skip ones already wrapped in Suspense
# Pattern: return <([A-Z]\w+)([^>]*?)\s*/>;  (not preceded by Suspense)
pattern = re.compile(r'return\s+<([A-Z]\w+)((?:[^>]*?))\s*/>;')
matches = list(pattern.finditer(text))
print(f"\nFound {len(matches)} return <Component .../> statements to wrap:")
for m in matches:
    print(f"  L{text[:m.start()].count(chr(10))+1}: {m.group(0)[:80]}")

# Wrap each one (skip if already wrapped)
def wrap_in_suspense(match):
    full = match.group(0)
    # Check if already wrapped (look backwards for Suspense)
    start = match.start()
    preceding = text[max(0, start-50):start]
    if 'Suspense fallback' in preceding:
        return full  # skip
    comp_name = match.group(1)
    props = match.group(2)
    return f'return <Suspense fallback={{<TabLoader />}}><{comp_name}{props} /></Suspense>;'

# Apply replacements (in reverse order to preserve indices)
new_text = text
for m in reversed(matches):
    full = m.group(0)
    preceding = text[max(0, m.start()-50):m.start()]
    if 'Suspense fallback' in preceding:
        continue
    comp_name = m.group(1)
    props = m.group(2)
    replacement = f'return <Suspense fallback={{<TabLoader />}}><{comp_name}{props} /></Suspense>;'
    new_text = new_text[:m.start()] + replacement + new_text[m.end():]

text = new_text
print(f"\nAll eligible component renders wrapped in Suspense")

file.write_text(text, encoding='utf-8')
print(f"Saved {file.name}")
