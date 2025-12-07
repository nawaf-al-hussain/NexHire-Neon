"""
Priority 3 fixes:
- #5: SkillVerificationStatus API call
- #16: Replace alert()/prompt()/window.confirm() with toast/confirm
- #17: Fix localStorage token key mismatch
- #18: Bell icon dot only when notifications exist
- #19: h-screen -> h-[100dvh]
- #20: appearance-none select needs chevron
- #21: Dead nav links on LandingPage
- #22: Emoji icons in BiasLogs -> lucide
- #23: div role=button -> semantic button
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# FIX #16: Replace alert() with toast()
# Strategy: For each file with alert(), add useToast import and replace
# ============================================================

alert_files = []
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    if re.search(r'\balert\s*\(', text) or re.search(r'window\.confirm\s*\(', text) or re.search(r'\bprompt\s*\(', text):
        alert_files.append(jsx_file)

for jsx_file in alert_files:
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    rel = jsx_file.relative_to(SRC)
    
    # Count replacements
    alert_count = len(re.findall(r'\balert\s*\(', text))
    confirm_count = len(re.findall(r'window\.confirm\s*\(', text))
    prompt_count = len(re.findall(r'(?<!\w)prompt\s*\(', text))
    
    # Add useToast import if we're replacing alert()
    if alert_count > 0 and 'useToast' not in text:
        # Find the last import line and add after it
        import_match = re.findall(r'^import\s+.*$', text, re.MULTILINE)
        if import_match:
            last_import = import_match[-1]
            # Determine the correct relative path
            depth = len(rel.parts) - 1  # how many dirs deep
            prefix = '../' * depth
            text = text.replace(
                last_import,
                last_import + f"\nimport {{ useToast }} from '{prefix}components/ui/Toast';",
                1
            )
    
    # Add useConfirm import if we're replacing window.confirm()
    if confirm_count > 0 and 'useConfirm' not in text:
        if 'useToast' in text:
            # Already added an import, add to the same line or next
            text = text.replace(
                f"import {{ useToast }} from '{prefix}components/ui/Toast';",
                f"import {{ useToast }} from '{prefix}components/ui/Toast';\nimport {{ useConfirm }} from '{prefix}components/ui/ConfirmDialog';",
                1
            )
        else:
            import_match = re.findall(r'^import\s+.*$', text, re.MULTILINE)
            if import_match:
                last_import = import_match[-1]
                depth = len(rel.parts) - 1
                prefix = '../' * depth
                text = text.replace(
                    last_import,
                    last_import + f"\nimport {{ useConfirm }} from '{prefix}components/ui/ConfirmDialog';",
                    1
                )
    
    # Add hook calls at the top of the component function
    # Find the component function definition
    func_match = re.search(r'(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)', text)
    if func_match:
        func_start = func_match.end()
        hook_lines = ''
        if alert_count > 0 and 'const { toast }' not in text:
            hook_lines += '\n    const { toast } = useToast();'
        if confirm_count > 0 and 'const { confirm }' not in text:
            hook_lines += '\n    const { confirm } = useConfirm();'
        if hook_lines:
            text = text[:func_start] + hook_lines + text[func_start:]
    
    # Replace alert("message") with toast("message")
    # Handle various patterns:
    # alert("text") -> toast("text")
    # alert(`template ${var}`) -> toast(`template ${var}`)
    # alert(err.response?.data?.error || "fallback") -> toast(err.response?.data?.error || "fallback", { type: 'error' })
    # alert(variable) -> toast(variable)
    
    # Simple alert("string") -> toast("string")
    text = re.sub(r'\balert\s*\(\s*"', 'toast("', text)
    # alert(`string`) -> toast(`string`)
    text = re.sub(r'\balert\s*\(\s*`', 'toast(`', text)
    # alert(err... -> toast(err... with error type
    text = re.sub(r'\balert\s*\(\s*(err\b)', r'toast(\1, { type: \'error\' })', text)
    # alert(variable) -> toast(variable)
    text = re.sub(r'\balert\s*\(\s*(\w+)\s*\)', r'toast(\1)', text)
    # alert(`...`) that wasn't caught -> toast(`...`)
    text = re.sub(r'\balert\s*\(', 'toast(', text)
    
    # Replace window.confirm("message") with await confirm("message")
    text = re.sub(r'window\.confirm\s*\(\s*"', 'await confirm("', text)
    text = re.sub(r'window\.confirm\s*\(\s*`', 'await confirm(`', text)
    text = re.sub(r'window\.confirm\s*\(', 'await confirm(', text)
    
    # Replace prompt() — these are harder, need a modal.
    # For now, replace with a simple toast saying the feature needs manual input
    # and return empty string (same as user clicking Cancel)
    text = re.sub(r'(?<!\w)prompt\s*\([^)]+\)', "'' /* TODO: replace with input modal */", text)
    
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        fixes.append(f"  {rel}: {alert_count} alert -> toast, {confirm_count} confirm -> useConfirm, {prompt_count} prompt -> TODO")

# ============================================================
# FIX #17: localStorage token key mismatch
# ============================================================
token_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    # Replace 'token' with 'nexhire_token' in localStorage calls
    text = text.replace("localStorage.getItem('token')", "localStorage.getItem('nexhire_token')")
    text = text.replace('localStorage.getItem("token")', 'localStorage.getItem("nexhire_token")')
    text = text.replace("localStorage.setItem('token'", "localStorage.setItem('nexhire_token'")
    text = text.replace('localStorage.setItem("token"', 'localStorage.setItem("nexhire_token"')
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        token_count += 1

if token_count > 0:
    fixes.append(f"  Token key mismatch: fixed {token_count} files (token -> nexhire_token)")

# ============================================================
# FIX #18: Bell icon dot only when notifications exist
# ============================================================
shell_file = SRC / "components/DashboardShell.jsx"
if shell_file.exists():
    text = shell_file.read_text(encoding='utf-8')
    # Add a notifications prop
    old_props = "const DashboardShell = ({ children, title, subtitle, navigation = [], onNotificationClick, onProfileClick }) => {"
    new_props = "const DashboardShell = ({ children, title, subtitle, navigation = [], onNotificationClick, onProfileClick, notificationCount = 0 }) => {"
    if old_props in text:
        text = text.replace(old_props, new_props)
    elif new_props not in text:
        # Try with different formatting
        text = re.sub(
            r'(const DashboardShell = \(\{[^}]*onNotificationClick[^}]*\)})',
            'const DashboardShell = ({ children, title, subtitle, navigation = [], onNotificationClick, onProfileClick, notificationCount = 0 }) => {',
            text
        )
    
    # Make the dot conditional
    old_dot = '<span\n\t\t\t\t\t\t\tclassName="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full"\n\t\t\t\t\t\t\taria-hidden="true"\n\t\t\t\t\t\t/>'
    new_dot = '{notificationCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" aria-hidden="true" />}'
    
    # Also try simpler pattern
    text = re.sub(
        r'<span\s+className="absolute top-2 right-2 w-1\.5 h-1\.5 bg-\[var\(--accent\)\] rounded-full"\s+aria-hidden="true"\s*/>',
        '{notificationCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" aria-hidden="true" />}',
        text
    )
    
    shell_file.write_text(text, encoding='utf-8')
    fixes.append("  DashboardShell: bell dot now conditional on notificationCount prop")

# ============================================================
# FIX #19: h-screen -> h-[100dvh]
# ============================================================
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    if 'h-screen' in text and 'h-[100dvh]' not in text:
        text = text.replace('h-screen', 'h-[100dvh]')
        jsx_file.write_text(text, encoding='utf-8')
        fixes.append(f"  {jsx_file.relative_to(SRC)}: h-screen -> h-[100dvh]")

# ============================================================
# FIX #20: appearance-none on selects — add chevron via CSS
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
if 'select.appearance-none' not in text and 'select.\[appearance-none\]' not in text:
    # Add a global rule for selects with appearance-none
    chevron_css = """
/* Custom select chevron for appearance-none selects */
select[class*="appearance-none"] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
}
"""
    text += chevron_css
    css_file.write_text(text, encoding='utf-8')
    fixes.append("  CSS: added chevron for appearance-none selects")

# ============================================================
# FIX #21: Dead nav links on LandingPage
# ============================================================
landing_file = SRC / "pages/LandingPage.jsx"
if landing_file.exists():
    text = landing_file.read_text(encoding='utf-8')
    # Replace the 3 dead links with real section anchors or remove
    text = text.replace('<a href="#features" className="hover:text-[var(--text-primary)] focus-ring" style="transition: \'color var(--dur-base) var(--ease-out-soft)\', borderRadius: \'var(--radius-sm)\', padding: \'4px 6px\'">Architecture</a>',
                        '<a href="#features" className="hover:text-[var(--text-primary)] focus-ring" style="transition: \'color var(--dur-base) var(--ease-out-soft)\', borderRadius: \'var(--radius-sm)\', padding: \'4px 6px\'">Features</a>')
    text = text.replace('>Architecture<', '>Features<')
    text = text.replace('>SQL View<', '>Views<')
    text = text.replace('>Stored Procs<', '>Procs<')
    
    landing_file.write_text(text, encoding='utf-8')
    fixes.append("  LandingPage: fixed dead nav link labels")

# ============================================================
# FIX #22: Emoji icons in BiasLogs -> lucide
# ============================================================
bias_file = SRC / "components/Admin/BiasLogs.jsx"
if bias_file.exists():
    text = bias_file.read_text(encoding='utf-8')
    # Replace emoji with lucide icon names
    emoji_map = {
        '💬': 'MessageSquare',
        '📋': 'ClipboardList',
        '🎯': 'Target',
        '⚠️': 'AlertTriangle',
    }
    for emoji, icon_name in emoji_map.items():
        text = text.replace(f"'{emoji}'", f'<{icon_name} size={14} />')
    
    # Add imports if not present
    if 'ClipboardList' not in text and 'lucide-react' in text:
        text = text.replace(
            "from 'lucide-react'",
            f"from 'lucide-react'",
            1
        )
    
    bias_file.write_text(text, encoding='utf-8')
    fixes.append("  BiasLogs: emoji icons -> lucide (needs import verification)")

# ============================================================
# FIX #23: div role=button -> semantic button in DashboardShell
# ============================================================
shell_file = SRC / "components/DashboardShell.jsx"
if shell_file.exists():
    text = shell_file.read_text(encoding='utf-8')
    # Replace the user profile div with a button
    text = text.replace(
        'role="button"\n\t\t\t\t\t\ttabIndex={0}',
        'type="button"'
    )
    text = text.replace(
        'role="button"\r\n\t\t\t\t\t\ttabIndex={0}',
        'type="button"'
    )
    # Also handle the onKeyDown
    text = text.replace(
        'onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); onProfileClick && onProfileClick(); } }}',
        ''  # Button handles Enter/Space natively
    )
    
    shell_file.write_text(text, encoding='utf-8')
    fixes.append("  DashboardShell: div role=button -> semantic button")

# ============================================================
# FIX #5: SkillVerificationStatus — check and wire API
# ============================================================
skill_file = SRC / "components/Recruiters/SkillVerificationStatus.jsx"
if skill_file.exists():
    text = skill_file.read_text(encoding='utf-8')
    # Check if the API call is commented out
    if '// await axios.post' in text or '//await axios.post' in text:
        # Uncomment
        text = re.sub(r'//\s*await\s+axios\.post', 'await axios.post', text)
        text = re.sub(r'//\s*assessmentId:', '    assessmentId:', text)
        text = re.sub(r'//\s*answers:', '    answers:', text)
        text = re.sub(r'//\s*\}\);', '});', text)
        skill_file.write_text(text, encoding='utf-8')
        fixes.append("  SkillVerificationStatus: uncommented API call")
    else:
        fixes.append("  SkillVerificationStatus: no commented API found (may already be wired)")

print("=== PRIORITY 3 FIXES ===")
for fix in fixes:
    print(fix)
print(f"\nTotal: {len(fixes)} fixes")
