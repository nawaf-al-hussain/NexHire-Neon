"""Patch AdminDashboard.jsx and CandidateDashboard.jsx for lazy loading."""
from pathlib import Path
import re

PAGES_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/pages")

# === AdminDashboard.jsx ===
file = PAGES_DIR / "AdminDashboard.jsx"
text = file.read_text(encoding='utf-8')

# Replace the import block
old_admin_imports = """import React from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';"""

new_admin_imports = """import React, { lazy, Suspense } from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';"""

if old_admin_imports in text:
    text = text.replace(old_admin_imports, new_admin_imports, 1)
    print("OK: replaced React import with lazy/Suspense")
else:
    print("NOT FOUND: top React import")

# Replace each component import (lines 11-33) with a lazy version.
# We need to be careful — some of these are Charts used inside other tabs.
# Strategy: lazy-load only Admin tab components and chart components that
# are used as standalone tab content. Charts rendered inside other components
# stay eager (their parent already pulls them in).
admin_components_to_lazy = [
    'RecruiterPerformanceAdmin',
    'ConsentManagement',
    'VacancyUtilizationAdmin',
    'SalaryTransparencyAnalytics',
    'RemoteWorkAnalytics',
    'DiversityGoals',
    'BiasLogs',
    'EmailQueueManager',
    'SQLViews',
    'ReferralIntelligence',  # from Recruiters folder, used as a tab
]

# Charts that are imported but only used inside specific tabs
charts_to_lazy = [
    'InterviewerPerformanceChart',
    'HiringFunnelChart',
    'RejectionAnalysisChart',
    'EngagementTrendChart',
    'BiasAnalysisChart',
    'SkillGapChart',
    'RecruiterLeaderboardChart',
    'VacancyUtilizationChart',
    'HireRatePerJobChart',
    'DiversityChart',
    'SalaryRangeChart',
    'RemoteWorkChart',
    'MarketIntelligenceChart',
]

# Replace Admin component imports
for comp in admin_components_to_lazy:
    if comp == 'ReferralIntelligence':
        old = f"import {comp} from '../components/Recruiters/{comp}';"
        new = f"const {comp} = lazy(() => import('../components/Recruiters/{comp}'));"
    elif comp in ['RecruiterPerformanceAdmin', 'ConsentManagement', 'VacancyUtilizationAdmin',
                   'SalaryTransparencyAnalytics', 'RemoteWorkAnalytics', 'DiversityGoals',
                   'BiasLogs', 'EmailQueueManager', 'SQLViews']:
        old = f"import {comp} from '../components/Admin/{comp}';"
        new = f"const {comp} = lazy(() => import('../components/Admin/{comp}'));"
    if old in text:
        text = text.replace(old, new, 1)
        print(f"OK: lazy-loaded {comp}")
    else:
        # Try with CRLF
        old_crlf = old.replace('\n', '\r\n')
        new_crlf = new.replace('\n', '\r\n')
        if old_crlf in text:
            text = text.replace(old_crlf, new_crlf, 1)
            print(f"OK: lazy-loaded {comp} (CRLF)")
        else:
            print(f"NOT FOUND: {comp}")

# Replace Chart imports
for comp in charts_to_lazy:
    old = f"import {comp} from '../components/Charts/{comp}';"
    new = f"const {comp} = lazy(() => import('../components/Charts/{comp}'));"
    if old in text:
        text = text.replace(old, new, 1)
        print(f"OK: lazy-loaded chart {comp}")
    else:
        print(f"NOT FOUND: chart {comp}")

# Add a TabLoader component right before the AdminDashboard function declaration
# Find: const AdminDashboard
tab_loader = """
// Lightweight fallback for lazy-loaded tab content.
const TabLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#6b7280' }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '24px', height: '24px',
                border: '2px solid #e5e7eb', borderTopColor: '#3b82f6',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                margin: '0 auto 8px',
            }} />
            <div style={{ fontSize: '0.75rem', fontFamily: 'system-ui' }}>Loading\u2026</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);

"""

# Insert before the component declaration
match = re.search(r'\nconst AdminDashboard\s*=', text)
if match:
    text = text[:match.start()] + tab_loader + text[match.start()+1:]
    print("OK: inserted TabLoader before AdminDashboard component")
else:
    print("NOT FOUND: AdminDashboard declaration")

# Wrap return statements in Suspense
patterns = [
    ("return <SQLViews />;", "return <Suspense fallback={<TabLoader />}><SQLViews /></Suspense>;"),
    ("return <RecruiterPerformanceAdmin />;", "return <Suspense fallback={<TabLoader />}><RecruiterPerformanceAdmin /></Suspense>;"),
    ("return <ConsentManagement />;", "return <Suspense fallback={<TabLoader />}><ConsentManagement /></Suspense>;"),
    ("return <VacancyUtilizationAdmin />;", "return <Suspense fallback={<TabLoader />}><VacancyUtilizationAdmin /></Suspense>;"),
    ("return <SalaryTransparencyAnalytics />;", "return <Suspense fallback={<TabLoader />}><SalaryTransparencyAnalytics /></Suspense>;"),
    ("return <ReferralIntelligence />;", "return <Suspense fallback={<TabLoader />}><ReferralIntelligence /></Suspense>;"),
    ("return <DiversityGoals />;", "return <Suspense fallback={<TabLoader />}><DiversityGoals /></Suspense>;"),
    ("return <BiasLogs />;", "return <Suspense fallback={<TabLoader />}><BiasLogs /></Suspense>;"),
    ("return <EmailQueueManager />;", "return <Suspense fallback={<TabLoader />}><EmailQueueManager /></Suspense>;"),
]

count = 0
for old, new in patterns:
    if old in text:
        text = text.replace(old, new, 1)
        count += 1

print(f"OK: wrapped {count} lazy components in Suspense")
file.write_text(text, encoding='utf-8')
print(f"Saved {file.name}")
print()

# === CandidateDashboard.jsx ===
file = PAGES_DIR / "CandidateDashboard.jsx"
text = file.read_text(encoding='utf-8')

# Replace React import
old_cand_imports = "import React from 'react';"
new_cand_imports = "import React, { lazy, Suspense } from 'react';"
if old_cand_imports in text:
    text = text.replace(old_cand_imports, new_cand_imports, 1)
    print("OK: replaced Candidate React import")
else:
    print("NOT FOUND: Candidate React import (already patched?)")

# Find candidate component imports
cand_imports = re.findall(r"import\s+(\w+)\s+from\s+'(\.\./components/[^']+)';", text)
print(f"\nFound {len(cand_imports)} component imports in CandidateDashboard:")
for name, path in cand_imports:
    print(f"  {name} <- {path}")

# Lazy-load all of them
for name, path in cand_imports:
    old = f"import {name} from '{path}';"
    new = f"const {name} = lazy(() => import('{path}'));"
    if old in text:
        text = text.replace(old, new, 1)
        print(f"OK: lazy-loaded {name}")

# Add TabLoader
tab_loader = """
// Lightweight fallback for lazy-loaded tab content.
const TabLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#6b7280' }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '24px', height: '24px',
                border: '2px solid #e5e7eb', borderTopColor: '#3b82f6',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                margin: '0 auto 8px',
            }} />
            <div style={{ fontSize: '0.75rem', fontFamily: 'system-ui' }}>Loading\u2026</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);

"""

match = re.search(r'\nconst CandidateDashboard\s*=', text)
if match:
    text = text[:match.start()] + tab_loader + text[match.start()+1:]
    print("OK: inserted TabLoader")

# Find all "return <ComponentName />;" patterns and wrap in Suspense
returns = re.findall(r'return <([A-Z]\w+)\s*/>;', text)
print(f"\nFound {len(returns)} return <Component /> statements: {returns}")
count = 0
for comp_name in returns:
    old = f"return <{comp_name} />;"
    new = f"return <Suspense fallback={{<TabLoader />}}><{comp_name} /></Suspense>;"
    if old in text:
        text = text.replace(old, new, 1)
        count += 1
print(f"OK: wrapped {count} lazy components in Suspense")

file.write_text(text, encoding='utf-8')
print(f"Saved {file.name}")
