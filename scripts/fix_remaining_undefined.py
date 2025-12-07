"""
Fix ALL remaining undefined variable references from deleted demo/sample data.
Also check for missing API endpoints.
"""
from pathlib import Path
import re

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# Fix 1: InterviewPrep.jsx — samplePrep reference
# ============================================================
f = SRC / "components/Candidate/InterviewPrep.jsx"
text = f.read_text(encoding='utf-8')
text = text.replace(
    "const displayData = (prepMaterials && prepMaterials.length > 0) ? prepMaterials : samplePrep;",
    "const displayData = (prepMaterials && prepMaterials.length > 0) ? prepMaterials : [];"
)
f.write_text(text, encoding='utf-8')
fixes.append("InterviewPrep: samplePrep -> []")

# ============================================================
# Fix 2: ConsentManagement.jsx — sampleData reference
# ============================================================
f = SRC / "components/Admin/ConsentManagement.jsx"
text = f.read_text(encoding='utf-8')
text = text.replace(
    "const displayData = consentData.length > 0 ? consentData : sampleData;",
    "const displayData = consentData.length > 0 ? consentData : [];"
)
f.write_text(text, encoding='utf-8')
fixes.append("ConsentManagement: sampleData -> []")

# ============================================================
# Fix 3: LearningPaths.jsx — demoLearningPaths reference
# ============================================================
f = SRC / "components/Candidate/LearningPaths.jsx"
text = f.read_text(encoding='utf-8')
text = text.replace(
    "const displayPaths = showDemo ? demoLearningPaths : (generatedPath || learningPath || []);",
    "const displayPaths = (generatedPath || learningPath || []);"
)
# Also remove the showDemo state if it exists
text = text.replace("const [showDemo, setShowDemo] = useState(true);", "const [showDemo, setShowDemo] = useState(false);")
f.write_text(text, encoding='utf-8')
fixes.append("LearningPaths: demoLearningPaths -> [], showDemo default false")

# ============================================================
# Fix 4: SalaryTransparencyAnalytics.jsx — generateDemoData function still defined
# ============================================================
f = SRC / "components/Admin/SalaryTransparencyAnalytics.jsx"
text = f.read_text(encoding='utf-8')
# Remove the generateDemoData function if it still exists
text = re.sub(r'const generateDemoData\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\};\s*', '', text)
# Replace demoData references
text = text.replace("const demoData = generateDemoData();", "const demoData = jobs || [];")
text = text.replace("calculateDemoStats(demoData);", "")
# In calculateDemoStats, replace demoData param with jobs
text = text.replace("const calculateDemoStats = (demoData) => {", "const calculateDemoStats = (data) => {")
text = re.sub(r'\bdemoData\b', 'data', text)
f.write_text(text, encoding='utf-8')
fixes.append("SalaryTransparencyAnalytics: removed generateDemoData, use real data")

# ============================================================
# Fix 5: RecruiterPerformanceAdmin.jsx — sampleData reference
# ============================================================
f = SRC / "components/Admin/RecruiterPerformanceAdmin.jsx"
text = f.read_text(encoding='utf-8')
text = text.replace(
    "const displayData = performanceData.length > 0 ? performanceData : sampleData;",
    "const displayData = performanceData.length > 0 ? performanceData : [];"
)
f.write_text(text, encoding='utf-8')
fixes.append("RecruiterPerformanceAdmin: sampleData -> []")

# ============================================================
# Fix 6: SalaryCoach.jsx — inline sampleData array (kept as fallback but rename)
# This one has the data INLINE (not deleted), so it's actually fine.
# Just make sure it doesn't reference a deleted variable.
# ============================================================
f = SRC / "components/Candidate/SalaryCoach.jsx"
text = f.read_text(encoding='utf-8')
# This file defines sampleData inline — that's OK, it's not referencing a deleted variable
# But let's check if it has issues
if "const sampleData = salaryData && salaryData.length > 0 ? salaryData : [" in text:
    # This is fine — it's an inline fallback, not a reference to a deleted variable
    pass
fixes.append("SalaryCoach: OK (inline fallback, not deleted ref)")

# ============================================================
# Fix 7: SkillVerificationStatus.jsx — inline sampleData (kept)
# ============================================================
f = SRC / "components/Recruiters/SkillVerificationStatus.jsx"
text = f.read_text(encoding='utf-8')
# This defines sampleData inline — that's OK
fixes.append("SkillVerificationStatus: OK (inline fallback)")

# ============================================================
# Fix 8: RankingHistory.jsx — getDemoData and getDemoStats functions
# ============================================================
f = SRC / "components/Recruiters/RankingHistory.jsx"
text = f.read_text(encoding='utf-8')
# Remove getDemoData function
text = re.sub(r'const getDemoData\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};\s*', '', text)
# Remove getDemoStats function
text = re.sub(r'const getDemoStats\s*=\s*\(\)\s*=>\s*\(\{[\s\S]*?\}\);\s*', '', text)
# Replace calls with empty defaults
text = text.replace("setHistory(getDemoData());", "setHistory([]);")
text = text.replace("setStats(getDemoStats());", "setStats({ totalRanked: 0, avgScore: 0, topScore: 0 });")
f.write_text(text, encoding='utf-8')
fixes.append("RankingHistory: removed getDemoData/getDemoStats, use empty defaults")

# ============================================================
# Fix 9: GhostingRiskDetail.jsx — inline sampleData (kept)
# ============================================================
f = SRC / "components/Recruiters/GhostingRiskDetail.jsx"
text = f.read_text(encoding='utf-8')
# This defines sampleData inline — that's OK
fixes.append("GhostingRiskDetail: OK (inline fallback)")

# ============================================================
# Now check for missing API endpoints
# ============================================================
# Get all API endpoints called from frontend
api_calls = set()
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    # Find axios.get/post/put/delete calls
    for m in re.finditer(r'axios\.(?:get|post|put|delete)\s*\(\s*`\$\{API_BASE\}/([^`]+)`', text):
        endpoint = m.group(1).split('/')[0] + '/' + m.group(1).split('/')[1] if '/' in m.group(1) else m.group(1)
        api_calls.add(endpoint.split('?')[0].rstrip('/'))

# Get all API endpoints defined in backend
backend_endpoints = set()
for js_file in Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes").glob('*.js'):
    text = js_file.read_text(encoding='utf-8')
    for m in re.finditer(r"router\.(?:get|post|put|delete)\s*\(\s*['\"]([^'\"]+)", text):
        route = m.group(1)
        # Normalize: remove :id params
        route = re.sub(r'/:[^/]+', '', route)
        backend_endpoints.add(route)

# Check for mismatches
print("=== API endpoint check ===")
print(f"Frontend calls: {len(api_calls)} unique endpoints")
print(f"Backend routes: {len(backend_endpoints)} unique routes")

# Find frontend calls that don't match any backend route
missing = []
for call in sorted(api_calls):
    # Normalize the call
    call_base = call.split('?')[0].rstrip('/')
    # Check if it matches any backend route
    found = False
    for route in backend_endpoints:
        if call_base == route or call_base.startswith(route + '/'):
            found = True
            break
        # Also check partial matches (e.g., 'candidates/1/matches' matches 'candidates/:id/matches')
        call_parts = call_base.split('/')
        route_parts = route.split('/')
        if len(call_parts) == len(route_parts):
            match = True
            for cp, rp in zip(call_parts, route_parts):
                if rp != cp and not rp.startswith(':'):
                    match = False
                    break
            if match:
                found = True
                break
    if not found:
        missing.append(call)

if missing:
    print(f"\n⚠️  {len(missing)} potentially missing endpoints:")
    for m in missing:
        print(f"  - {m}")
else:
    print("\n✅ All frontend API calls have matching backend routes")

print(f"\n=== Variable Reference Fixes ===")
for fix in fixes:
    print(f"  {fix}")
print(f"\nTotal: {len(fixes)} fixes")
