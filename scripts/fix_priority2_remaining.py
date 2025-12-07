"""
PRIORITY 2 REMAINING FIXES

10. Fix hardcoded chart colors
11. Standardize modal overlays
12. Rewrite AI cliché copy
13. Fix DesignSystemPage to use tokens
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# FIX 10: Hardcoded chart colors
# ============================================================
chart_files = list((SRC / "components/Charts").glob("*.jsx"))
chart_color_count = 0

for chart_file in chart_files:
    text = chart_file.read_text(encoding='utf-8')
    original = text
    
    # Replace hardcoded hex colors with tokens
    hex_replacements = [
        ('#4f46e5', 'var(--accent)'),
        ('#6366f1', 'var(--accent)'),
        ('#818cf8', 'var(--accent-hover)'),
        ('#10b981', 'var(--success)'),
        ('#f59e0b', 'var(--warning)'),
        ('#d97706', 'var(--warning)'),
        ('#dc2626', 'var(--danger)'),
        ('#ef4444', 'var(--danger)'),
        ('#f43f5e', 'var(--danger)'),
        ('#8884d8', 'var(--accent)'),  # recharts default purple
        ('#e2e8f0', 'var(--border-primary)'),
        ('#64748b', 'var(--text-muted)'),
        ('#7c3aed', 'var(--accent)'),
        ('#94a3b8', 'var(--text-muted)'),
        ('#0f172a', 'var(--text-primary)'),
    ]
    for old_hex, new_token in hex_replacements:
        text = text.replace(old_hex, new_token)
    
    # Replace rgba grid strokes
    text = re.sub(r'stroke="rgba\(255,\s*255,\s*255,\s*0\.0\d+\)"', 'stroke="var(--border-primary)"', text)
    text = re.sub(r'stroke="rgba\(0,\s*0,\s*0,\s*0\.0\d+\)"', 'stroke="var(--border-primary)"', text)
    
    # Replace hardcoded shadows in chart tooltips
    text = re.sub(r"boxShadow:\s*'0 \d+px \d+px[^']*rgba\(0,\s*0,\s*0[^']*\)'", "boxShadow: 'var(--shadow-lg)'", text)
    
    # Replace cursor fill
    text = re.sub(r"cursor:\s*\{\s*fill:\s*'rgba\(255,\s*255,\s*255,\s*0\.0\d+\)'\s*\}", "cursor: { fill: 'var(--surface-hover)' }", text)
    
    # Replace fontWeight: 900/800/bold -> 500
    text = re.sub(r"fontWeight:\s*(?:900|800|'bold'|'900')", "fontWeight: 500", text)
    text = re.sub(r"fontWeight:\s*700", "fontWeight: 500", text)
    
    # Replace textTransform: 'uppercase' -> remove (sentence case)
    text = re.sub(r"textTransform:\s*'uppercase',?\s*", "", text)
    
    if text != original:
        chart_file.write_text(text, encoding='utf-8')
        chart_color_count += 1

fixes.append(f"  Chart colors: fixed {chart_color_count} chart files")

# ============================================================
# FIX 11: Standardize modal overlays
# ============================================================
overlay_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    
    # Standardize overlay backgrounds to bg-black/60
    text = re.sub(r'bg-slate-950/80', 'bg-black/60', text)
    text = re.sub(r'bg-slate-950/60', 'bg-black/60', text)
    text = re.sub(r'bg-black/40', 'bg-black/60', text)
    text = re.sub(r'bg-black/50', 'bg-black/60', text)
    
    # Standardize backdrop blur to backdrop-blur-sm
    text = re.sub(r'backdrop-blur-md', 'backdrop-blur-sm', text)
    
    # Standardize z-index on modals (z-[200] -> z-[100], z-[120] -> z-[100])
    text = re.sub(r'z-\[200\]', 'z-[100]', text)
    text = re.sub(r'z-\[120\]', 'z-[100]', text)
    text = re.sub(r'z-\[110\]', 'z-[100]', text)
    
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        overlay_count += 1

fixes.append(f"  Modal overlays: standardized {overlay_count} files (bg-black/60, backdrop-blur-sm, z-[100])")

# ============================================================
# FIX 12: Rewrite AI cliché copy
# ============================================================
copy_replacements = [
    # Landing page
    ("Scale your talent pipeline.", "Hiring, start to finish."),
    ("A professional-grade recruitment platform built on PostgreSQL. Real-time matching, automated workflows, and deep analytics — without the bloat.",
     "Match candidates against job requirements, run automated screening, and track every application through to hire."),
    ("The next evolution in hiring", "Recruitment operations"),
    ("Recruit smarter,\nnot harder.", "Manage your hiring pipeline."),
    ("AI-powered matching, automated screening, and predictive analytics — built on a transactional PostgreSQL core.",
     "Match, screen, and track candidates through every stage of the hiring process."),
    ("Used by 500+ recruiters", "Demo system"),
    
    # Loading messages
    ("Scanning Global Talent Pool...", "Loading matches…"),
    ("Running Advanced Heuristics...", "Loading matches…"),
    ("Global Talent Synchronization", "Job matches"),
    ("Cross-referencing active roles with high-proficiency candidates", "Top candidates per active role"),
    ("Querying Match Engine...", "Loading…"),
    ("Synchronizing Jobs...", "Loading…"),
    ("Fetching Schedule...", "Loading…"),
    ("Analyzing Skill Gaps...", "Loading…"),
    ("Talent Match Engine", "Candidate matches"),
    ("Flow State: Healthy", "No bottlenecks"),
    ("Queue Clean", "No ghosting alerts"),
    
    # Candidate dashboard
    ("Proof Your Skills. Multiply Your Matches.", "Verify a skill to add it to your profile."),
    ("Instant Auto-Rejection", "Experience-Based Screening"),
    ("Your Career", "Candidate portal"),
    
    # Chatbot
    ("Hi! I'm your NexHire assistant. How can I help you today?", "Ask about jobs, applications, or interviews."),
    ("AI-Powered Help", "Assistant"),
    
    # Success messages (remove exclamation marks)
    ("Profile updated successfully!", "Profile updated."),
    ("Consent preferences updated!", "Consent preferences updated."),
    ("Auto-reject batch completed!", "Screening batch completed."),
    ("Screening completed!", "Screening completed."),
    ("Application submitted successfully!", "Application submitted."),
    ("Reminder sent successfully!", "Reminder sent."),
    ("Interview prep generated successfully!", "Interview prep generated."),
    ("Device registered for push notifications!", "Device registered."),
    
    # Error messages
    ("Sorry, I'm having trouble responding right now. Please try again later.", "Connection failed. Please try again."),
]

copy_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    for old_text, new_text in copy_replacements:
        if old_text in text:
            text = text.replace(old_text, new_text)
            copy_count += 1
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')

fixes.append(f"  AI cliché copy: {copy_count} phrases rewritten in plain English")

# ============================================================
# FIX 13: Fix DesignSystemPage to use tokens (already partially fixed by #6)
# The rainbow color sweep should have caught most of it.
# Just verify and clean up remaining issues.
# ============================================================
ds_file = SRC / "pages/DesignSystemPage.jsx"
if ds_file.exists():
    text = ds_file.read_text(encoding='utf-8')
    original = text
    
    # Fix dark mode toggle to use ThemeContext
    # (This is a bigger change — just note it for now)
    
    # Fix tab labels
    text = text.replace("'TAB1'", "'Overview'")
    text = text.replace("'TAB2'", "'Details'")
    text = text.replace("'TAB3'", "'Activity'")
    
    # Remove footer caption
    text = re.sub(r'NexHire Design System • \d+ Sections • Live Components', 'NexHire', text)
    
    if text != original:
        ds_file.write_text(text, encoding='utf-8')
        fixes.append("  DesignSystemPage: fixed tab labels + removed footer caption")

# ============================================================
# FIX: Remove window.alert/prompt/confirm — replace with console.warn
# (Proper Toast component is a bigger task — for now, at least don't block UI)
# ============================================================
# Actually this is too risky to auto-fix — alert() calls are in specific
# business logic contexts. Leave for manual fix.

# ============================================================
# FIX: Add id="main-content" to pages missing it
# ============================================================
for page_file in ['pages/LandingPage.jsx', 'pages/LoginPage.jsx', 'pages/NotFoundPage.jsx', 'pages/DesignSystemPage.jsx']:
    fp = SRC / page_file
    if not fp.exists():
        continue
    text = fp.read_text(encoding='utf-8')
    if 'id="main-content"' not in text and 'main-content' not in text:
        # Add id to the <main> element
        text = text.replace('<main ', '<main id="main-content" ', 1)
        if '<main ' not in text:
            # Try <main> without attributes
            text = text.replace('<main>', '<main id="main-content">', 1)
        if 'main-content' in text:
            fp.write_text(text, encoding='utf-8')
            fixes.append(f"  {page_file}: added id=\"main-content\"")

# ============================================================
# FIX: Add aria-current to DashboardShell active nav
# ============================================================
shell_file = SRC / "components/DashboardShell.jsx"
if shell_file.exists():
    text = shell_file.read_text(encoding='utf-8')
    if 'aria-current' not in text:
        # Add aria-current to the button element in nav
        text = text.replace(
            'key={i}\n                            onClick',
            'key={i}\n                            aria-current={item.active ? "page" : undefined}\n                            onClick'
        )
        # Try CRLF
        text = text.replace(
            'key={i}\r\n                            onClick',
            'key={i}\r\n                            aria-current={item.active ? "page" : undefined}\r\n                            onClick'
        )
        shell_file.write_text(text, encoding='utf-8')
        fixes.append("  DashboardShell: added aria-current=\"page\" on active nav")

print("=== PRIORITY 2 REMAINING FIXES ===")
for fix in fixes:
    print(fix)
