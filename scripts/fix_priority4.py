"""
Priority 4 fixes — code quality cleanup.

#25: Delete dead CSS utilities
#27: Delete dead code in ProfileManagement
#28: Delete dead handleGenerateLearningPath in CandidateDashboard
#29: Delete dead viewColumns state in SQLViews
#30: Delete dead networks array in BlockchainVerifications
#32: Add id=main-content to remaining pages
#33: Fix broken CSS animation classes
#34: Replace Skeleton shimmer with static fill
#35: Remove SpotlightBorder usage (keep component but remove from LandingPage)
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# FIX #25: Delete dead CSS utilities from index.css
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
original = text

# Remove dead utility classes that are never used in any JSX file
dead_css_blocks = [
    # .mobile-only — never used
    r'/\* Mobile-only utility: hide on desktop, show on mobile \*/\s*\.mobile-only\s*\{[^}]*\}\s*(@media[^{]*\{[^}]*\})?\s*',
    # .desktop-only — never used
    r'/\* Desktop-only utility: show on desktop, hide on mobile \*/\s*\.desktop-only\s*\{[^}]*\}\s*(@media[^{]*\{[^}]*\})?\s*',
    # .mobile-drawer — never used (DashboardShell uses its own classes)
    r'/\* Mobile sidebar drawer animation.*?\*/\s*\.mobile-drawer\s*\{[^}]*\}\s*\.mobile-drawer\.open\s*\{[^}]*\}\s*',
    # .mobile-backdrop — never used
    r'/\* Mobile overlay backdrop \*/\s*\.mobile-backdrop\s*\{[^}]*\}\s*',
    # .safe-top, .safe-bottom, .safe-left, .safe-right — never used
    r'/\* Mobile-safe-area padding.*?\*/\s*@supports[^{]*\{[^}]*\}\s*',
    # .h-screen-mobile — never used (we use h-[100dvh] directly)
    r'/\* Prevent layout shift.*?\*/\s*@supports[^{]*\{[^}]*\}\s*@supports not[^{]*\{[^}]*\}\s*',
    # .text-responsive-* — never used
    r'/\* Responsive font scaling.*?\*/\s*\.text-responsive-hero\s*\{[^}]*\}\s*\.text-responsive-h1\s*\{[^}]*\}\s*\.text-responsive-h2\s*\{[^}]*\}\s*',
    # .btn-premium — kept as alias but the ::after shimmer was already removed
    # Keep .btn-premium itself for backward compat, just remove the comment about shimmer
]

for pattern in dead_css_blocks:
    text, n = re.subn(pattern, '', text, flags=re.DOTALL)
    if n:
        fixes.append(f"  CSS: removed dead utility ({n} block(s))")

# Clean up empty .card-soft mobile override
text = re.sub(r'/\* On mobile, reduce padding.*?\*/\s*@media[^{]*\{[^}]*\}\s*', '', text, flags=re.DOTALL)

# Remove .glass-card and .glass-nav (replaced by .card-soft and direct styling)
# Actually keep them for backward compat — they're aliased in the @layer components
# Just remove the shimmer comment
text = text.replace("/* Remove the old shimmer effect — it's an AI tell */", "/* shimmer removed — AI tell */")

if text != original:
    css_file.write_text(text, encoding='utf-8')
    fixes.append("  index.css: cleaned up dead CSS utilities")

# ============================================================
# FIX #27: Delete dead code in ProfileManagement
# ============================================================
pm_file = SRC / "components/Candidate/ProfileManagement.jsx"
if pm_file.exists():
    text = pm_file.read_text(encoding='utf-8')
    original = text
    
    # Remove testServer function
    text = re.sub(r'\s*const testServer\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\};\s*', '', text)
    
    # Remove fetchExtractedSkills function
    text = re.sub(r'\s*const fetchExtractedSkills\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\};\s*', '', text)
    
    # Remove references to testServer
    text = text.replace('testServer();', '')
    text = text.replace('// testServer();', '')
    text = text.replace('fetchExtractedSkills();', '')
    text = text.replace('// fetchExtractedSkills();', '')
    
    if text != original:
        pm_file.write_text(text, encoding='utf-8')
        fixes.append("  ProfileManagement: removed testServer + fetchExtractedSkills dead code")

# ============================================================
# FIX #28: Delete dead handleGenerateLearningPath in CandidateDashboard
# ============================================================
cd_file = SRC / "pages/CandidateDashboard.jsx"
if cd_file.exists():
    text = cd_file.read_text(encoding='utf-8')
    original = text
    
    # Remove the placeholder function
    text = re.sub(
        r'\s*const handleGenerateLearningPath\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?// Placeholder[\s\S]*?\};\s*',
        '\n',
        text
    )
    # Also try without the Placeholder comment
    text = re.sub(
        r'\s*const handleGenerateLearningPath\s*=\s*\([^)]*\)\s*=>\s*\{\s*\};\s*',
        '\n',
        text
    )
    
    if text != original:
        cd_file.write_text(text, encoding='utf-8')
        fixes.append("  CandidateDashboard: removed dead handleGenerateLearningPath")

# ============================================================
# FIX #29: Delete dead viewColumns state in SQLViews
# ============================================================
sv_file = SRC / "components/Admin/SQLViews.jsx"
if sv_file.exists():
    text = sv_file.read_text(encoding='utf-8')
    original = text
    
    # Remove viewColumns state
    text = text.replace("const [viewColumns, setViewColumns] = useState([]);", "")
    
    # Remove setViewColumns calls
    text = text.replace("setViewColumns([]);", "")
    text = text.replace("setViewColumns(response.data);", "")
    
    # Remove the commented-out colsResponse code
    text = re.sub(r'\s*// const colsResponse.*?\n', '', text)
    text = re.sub(r'\s*// setViewColumns\(colsResponse.*?\n', '', text)
    
    if text != original:
        sv_file.write_text(text, encoding='utf-8')
        fixes.append("  SQLViews: removed dead viewColumns state")

# ============================================================
# FIX #30: Delete dead networks array in BlockchainVerifications
# ============================================================
bv_file = SRC / "components/Recruiters/BlockchainVerifications.jsx"
if bv_file.exists():
    text = bv_file.read_text(encoding='utf-8')
    original = text
    
    # Remove networks array
    text = re.sub(r"\s*const networks\s*=\s*\[[\s\S]*?\];\s*", '', text)
    
    if text != original:
        bv_file.write_text(text, encoding='utf-8')
        fixes.append("  BlockchainVerifications: removed dead networks array")

# ============================================================
# FIX #32: Add id=main-content to remaining pages
# ============================================================
for page_name in ['LoginPage.jsx', 'NotFoundPage.jsx', 'DesignSystemPage.jsx']:
    fp = SRC / f"pages/{page_name}"
    if not fp.exists():
        continue
    text = fp.read_text(encoding='utf-8')
    if 'main-content' in text:
        continue  # Already has it
    
    # Try to add id to <main> element
    if '<main ' in text:
        text = text.replace('<main ', '<main id="main-content" ', 1)
    elif '<main>' in text:
        text = text.replace('<main>', '<main id="main-content">', 1)
    elif '<div ' in text and 'min-h-screen' in text:
        # Some pages use div instead of main
        text = text.replace('<div className="min-h-screen', '<div id="main-content" className="min-h-screen', 1)
    
    if 'main-content' in text:
        fp.write_text(text, encoding='utf-8')
        fixes.append(f"  {page_name}: added id=\"main-content\"")

# ============================================================
# FIX #33: Fix broken CSS animation classes
# ============================================================
# Define the missing animation classes in index.css
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')

missing_animations = """
/* Missing animation utilities — referenced by components but not previously defined */
@keyframes slideInFromTop {
    from { opacity: 0; transform: translateY(-1rem); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInFromRight {
    from { opacity: 0; transform: translateX(1rem); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.slide-in-from-top-2 { animation: slideInFromTop 0.2s var(--ease-out-soft) backwards; }
.slide-in-from-top-4 { animation: slideInFromTop 0.4s var(--ease-out-soft) backwards; }
.slide-in-from-right { animation: slideInFromRight 0.3s var(--ease-out-soft) backwards; }
.zoom-in-95 { animation: zoomIn 0.2s var(--ease-out-soft) backwards; }
.duration-200 { animation-duration: 200ms; }
.duration-300 { animation-duration: 300ms; }
.duration-500 { animation-duration: 500ms; }
.duration-1000 { animation-duration: 1000ms; }
"""

if 'slideInFromTop' not in text:
    text += missing_animations
    css_file.write_text(text, encoding='utf-8')
    fixes.append("  CSS: defined 8 missing animation classes (slideInFromTop, zoomIn, durations)")

# ============================================================
# FIX #34: Replace Skeleton shimmer with static fill
# ============================================================
skel_file = SRC / "components/ui/Skeleton.jsx"
if skel_file.exists():
    text = skel_file.read_text(encoding='utf-8')
    # Replace shimmer animation with static fill + subtle pulse
    text = text.replace(
        """const baseShimmer = {
    backgroundImage:
        'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--surface-hover) 37%, var(--bg-tertiary) 63%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.4s ease infinite',
};""",
        """const baseShimmer = {
    backgroundColor: 'var(--bg-tertiary)',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite alternate',
};"""
    )
    
    # Add the skeleton-pulse keyframe if not in CSS
    css_text = css_file.read_text(encoding='utf-8')
    if 'skeleton-pulse' not in css_text:
        css_text += """
@keyframes skeleton-pulse {
    from { opacity: 0.6; }
    to { opacity: 1; }
}
"""
        css_file.write_text(css_text, encoding='utf-8')
    
    skel_file.write_text(text, encoding='utf-8')
    fixes.append("  Skeleton: replaced shimmer animation with subtle pulse (AI tell removal)")

# ============================================================
# FIX #35: Remove SpotlightBorder from LandingPage (keep component file)
# ============================================================
lp_file = SRC / "pages/LandingPage.jsx"
if lp_file.exists():
    text = lp_file.read_text(encoding='utf-8')
    original = text
    
    # Remove SpotlightBorder import
    text = text.replace("import SpotlightBorder from '../components/ui/SpotlightBorder';\n", "")
    
    # Replace <SpotlightBorder> wrapper with plain div
    text = text.replace('<SpotlightBorder\n                            className="h-full"\n                            as="div"\n                        >', '<div className="h-full">')
    text = text.replace('<SpotlightBorder\n\t\t\t\t\t\tclassName="h-full"\n\t\t\t\t\t\tas="div"\n\t\t\t\t\t\t>', '<div className="h-full">')
    
    # Close the div (replace </SpotlightBorder> with </div>)
    text = text.replace('</SpotlightBorder>', '</div>')
    
    if text != original:
        lp_file.write_text(text, encoding='utf-8')
        fixes.append("  LandingPage: removed SpotlightBorder (AI tell) — plain border hover instead")

# ============================================================
# BONUS: Remove the .spotlight-card CSS and ::before pseudo-element
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
# Remove the spotlight-card CSS block
text = re.sub(r'/\* Spotlight card.*?\*/\s*\.spotlight-card\s*\{[\s\S]*?\}\s*\.spotlight-card:hover::before\s*\{[^}]*\}\s*', '', text, flags=re.DOTALL)
css_file.write_text(text, encoding='utf-8')
fixes.append("  CSS: removed .spotlight-card rules (AI tell)")

# ============================================================
# BONUS: Remove .text-gradient if it still exists
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
if '.text-gradient' in text:
    text = re.sub(r'/\* Legacy text gradient.*?\*/\s*\.text-gradient\s*\{[^}]*\}\s*', '', text, flags=re.DOTALL)
    css_file.write_text(text, encoding='utf-8')
    fixes.append("  CSS: removed .text-gradient (AI gradient fingerprint)")

# ============================================================
# BONUS: Remove .bg-mesh if it still exists
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
if '.bg-mesh' in text:
    text = re.sub(r'/\* Animated Gradients.*?\*/\s*\.bg-mesh\s*\{[^}]*\}\s*', '', text, flags=re.DOTALL)
    css_file.write_text(text, encoding='utf-8')
    fixes.append("  CSS: removed .bg-mesh (AI gradient background)")

print("=== PRIORITY 4 FIXES ===")
for fix in fixes:
    print(fix)
print(f"\nTotal: {len(fixes)} fixes")
