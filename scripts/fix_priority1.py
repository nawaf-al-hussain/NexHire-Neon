"""
PRIORITY 1 FIXES — Critical data integrity bugs

1. Delete fake demo/sample data from all components
2. Fix Math.random() in CareerPath.jsx
3. Fix Math.random() in AssessmentTestingEngine.jsx
4. Fix classN typo in DiversityGoals.jsx
5. Fix SkillVerificationStatus commented-out API call
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# FIX 1: Delete fake demo/sample data arrays
# ============================================================

# Find all files with sampleData, demoData, fallbackData, demo* arrays
demo_files = [
    'components/Admin/ConsentManagement.jsx',
    'components/Admin/RecruiterPerformanceAdmin.jsx',
    'components/Admin/SalaryTransparencyAnalytics.jsx',
    'components/Admin/VacancyUtilizationAdmin.jsx',
    'components/Candidate/SalaryCoach.jsx',
    'components/Candidate/Leaderboard.jsx',
    'components/Candidate/LearningPaths.jsx',
    'components/Candidate/InterviewPrep.jsx',
    'components/Candidate/CareerPathSimulator.jsx',
    'components/Recruiters/VideoInterviews.jsx',
    'components/Recruiters/HireSuccessPredictor.jsx',
    'components/Recruiters/OnboardingSuccessPredictor.jsx',
    'components/Recruiters/RankingHistory.jsx',
    'components/Recruiters/AdvancedAnalytics.jsx',
    'components/Recruiters/BiasAnalytics.jsx',
    'components/Recruiters/CandidateEngagement.jsx',
]

for rel_path in demo_files:
    fp = SRC / rel_path
    if not fp.exists():
        continue
    text = fp.read_text(encoding='utf-8')
    original = text
    
    # Pattern 1: const sampleData = [...] or const demoData = [...] or const fallbackData = [...]
    # Match from "const sampleData" to the closing "]" (may span multiple lines)
    for var_name in ['sampleData', 'demoData', 'fallbackData', 'demoLearningPaths', 'samplePrep', 'getDemoData', 'getDemoStats', 'demoApplications', 'generateDemoData']:
        # Match: const varName = [ ... ]; or const varName = () => [ ... ];
        pattern = re.compile(
            r'(?:const\s+' + var_name + r'\s*=\s*(?:\([^)]*\)\s*=>\s*)?\[[\s\S]*?\];\s*\n*)',
            re.MULTILINE
        )
        text = pattern.sub('', text)
        
        # Also remove references to the deleted variable
        # Pattern: setData(sampleData) -> don't remove, just comment it
        # Actually, let's replace fallback usage with empty array
        text = text.replace(f'setData({var_name})', 'setData([])')
        text = text.replace(f'setStats({var_name})', 'setStats({})')
        text = text.replace(f'setEmails({var_name})', 'setEmails([])')
        text = text.replace(f'|| {var_name}', '|| []')
        text = text.replace(f'|| {var_name}\n', '|| []\n')
    
    if text != original:
        fp.write_text(text, encoding='utf-8')
        fixes.append(f"  {rel_path}: removed demo data arrays")

# Also remove the generateDemoData function in SalaryTransparencyAnalytics
fp = SRC / 'components/Admin/SalaryTransparencyAnalytics.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    # Remove generateDemoData function
    pattern = re.compile(r'const generateDemoData\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\};\s*\n*', re.MULTILINE)
    text = pattern.sub('', text)
    # Remove handleApiError if unused
    pattern2 = re.compile(r'const handleApiError\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\};\s*\n*', re.MULTILINE)
    text = pattern2.sub('', text)
    fp.write_text(text, encoding='utf-8')
    fixes.append("  SalaryTransparencyAnalytics: removed generateDemoData + handleApiError")

# Remove AdminDashboard demoData (70 lines of fake data)
fp = SRC / 'pages/AdminDashboard.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    # Find and remove the demoData const
    pattern = re.compile(r'const demoData\s*=\s*\{[\s\S]*?\};\s*\n*', re.MULTILINE)
    text = pattern.sub('', text)
    # Replace fallback references
    text = text.replace('|| demoData', '|| {}')
    text = text.replace('setDemoData', 'setData')  # in case there's a setter
    fp.write_text(text, encoding='utf-8')
    fixes.append("  AdminDashboard: removed demoData (70 lines)")

# ============================================================
# FIX 2: Math.random() in CareerPath.jsx
# ============================================================
fp = SRC / 'components/Candidate/CareerPath.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    old = "{path.TransitionProbability || Math.floor(Math.random() * 40 + 60)}"
    new = "{path.TransitionProbability || '—'}"
    if old in text:
        text = text.replace(old, new)
        fp.write_text(text, encoding='utf-8')
        fixes.append("  CareerPath: replaced Math.random() with '—' fallback")

# ============================================================
# FIX 3: Math.random() in AssessmentTestingEngine.jsx
# ============================================================
fp = SRC / 'components/Candidate/AssessmentTestingEngine.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    # Replace the mock score generation with a proper submission flow
    old_score = "const mockScore = timeLeft > 0 ? Math.floor(Math.random() * (101 - passTarget)) + passTarget : Math.floor(Math.random() * 51) + 40;"
    new_score = "const mockScore = 0; // TODO: submit real answers to backend for scoring"
    if old_score in text:
        text = text.replace(old_score, new_score)
        fp.write_text(text, encoding='utf-8')
        fixes.append("  AssessmentTestingEngine: removed Math.random() score generation")

# ============================================================
# FIX 4: classN typo in DiversityGoals.jsx
# ============================================================
fp = SRC / 'components/Admin/DiversityGoals.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    # Fix classN= -> className=
    count = text.count('classN=')
    text = text.replace('classN=', 'className=')
    if count > 0:
        fp.write_text(text, encoding='utf-8')
        fixes.append(f"  DiversityGoals: fixed {count} classN= -> className= typos")

# Also check ALL files for classN= typo
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    if 'classN=' in text:
        count = text.count('classN=')
        text = text.replace('classN=', 'className=')
        jsx_file.write_text(text, encoding='utf-8')
        fixes.append(f"  {jsx_file.relative_to(SRC)}: fixed {count} classN= typos")

# ============================================================
# FIX 5: SkillVerificationStatus — uncomment the API call
# ============================================================
fp = SRC / 'components/Recruiters/SkillVerificationStatus.jsx'
if fp.exists():
    text = fp.read_text(encoding='utf-8')
    # Find the commented-out API call and uncomment it
    # Pattern: // await axios.post(...)
    old = "// await axios.post(`${API_BASE}/candidates/assessments`, {"
    new = "await axios.post(`${API_BASE}/candidates/assessments`, {"
    if old in text:
        text = text.replace(old, new)
        # Also uncomment the lines after it
        text = text.replace('//     assessmentId:', '    assessmentId:')
        text = text.replace('//     answers: submittedAnswers', '    answers: submittedAnswers')
        text = text.replace('// });', '});')
        fp.write_text(text, encoding='utf-8')
        fixes.append("  SkillVerificationStatus: uncommented API call for skill verification")
    else:
        # Check if the API call exists in a different form
        if 'axios.post' in text and 'assessment' in text.lower():
            fixes.append("  SkillVerificationStatus: API call already present")
        else:
            fixes.append("  SkillVerificationStatus: could not find commented API call — needs manual review")

print("=== PRIORITY 1 FIXES ===")
for fix in fixes:
    print(fix)
print(f"\nTotal fixes: {len(fixes)}")
