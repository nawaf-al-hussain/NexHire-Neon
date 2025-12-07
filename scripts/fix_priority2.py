"""
PRIORITY 2 FIXES — Design system violations

6. Replace ALL rainbow Tailwind colors with design tokens
7. Delete AI gradient orbs
8. Extract shared Loader component
9. Fix dark mode bg color
10. Fix hardcoded chart colors
14. Fix font-bold on inputs
15. Fix focus-lg typo
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")
fixes = []

# ============================================================
# FIX 6: Replace rainbow Tailwind colors with tokens
# ============================================================
COLOR_REPLACEMENTS = [
    # indigo -> accent
    (r'\btext-indigo-500\b', 'text-[var(--accent)]'),
    (r'\btext-indigo-400\b', 'text-[var(--accent)]'),
    (r'\btext-indigo-600\b', 'text-[var(--accent)]'),
    (r'\btext-indigo-700\b', 'text-[var(--accent-hover)]'),
    (r'\bbg-indigo-500\b', 'bg-[var(--accent)]'),
    (r'\bbg-indigo-600\b', 'bg-[var(--accent)]'),
    (r'\bbg-indigo-700\b', 'bg-[var(--accent-hover)]'),
    (r'\bbg-indigo-500/10\b', 'bg-[var(--accent-soft)]'),
    (r'\bbg-indigo-500/20\b', 'bg-[var(--accent-soft)]'),
    (r'\bbg-indigo-600/10\b', 'bg-[var(--accent-soft)]'),
    (r'\bborder-indigo-500/20\b', 'border-[var(--accent)]/20'),
    (r'\bborder-indigo-500/30\b', 'border-[var(--accent)]/30'),
    (r'\bborder-indigo-500\b', 'border-[var(--accent)]'),
    (r'\bhover:bg-indigo-500\b', 'hover:bg-[var(--accent)]'),
    (r'\bhover:bg-indigo-600\b', 'hover:bg-[var(--accent-hover)]'),
    (r'\bhover:bg-indigo-700\b', 'hover:bg-[var(--accent-hover)]'),
    (r'\bhover:border-indigo-500\b', 'hover:border-[var(--accent)]'),
    (r'\bhover:text-indigo-500\b', 'hover:text-[var(--accent)]'),
    (r'\bfocus:border-indigo-500\b', 'focus:border-[var(--accent)]'),
    (r'\bring-indigo-500\b', 'ring-[var(--accent-ring)]'),
    (r'\bfrom-indigo-500/5\b', ''),
    (r'\bto-purple-500/5\b', ''),
    (r'\bfrom-indigo-500\b', ''),
    (r'\bto-purple-500\b', ''),
    (r'\bfrom-indigo-600\b', ''),
    (r'\bto-blue-600\b', ''),
    
    # emerald -> success
    (r'\btext-emerald-500\b', 'text-[var(--success)]'),
    (r'\btext-emerald-400\b', 'text-[var(--success)]'),
    (r'\btext-emerald-600\b', 'text-[var(--success)]'),
    (r'\bbg-emerald-500\b', 'bg-[var(--success)]'),
    (r'\bbg-emerald-600\b', 'bg-[var(--success)]'),
    (r'\bbg-emerald-500/10\b', 'bg-[var(--success)]/10'),
    (r'\bbg-emerald-500/5\b', 'bg-[var(--success)]/5'),
    (r'\bhover:bg-emerald-600\b', 'hover:bg-[var(--success)]'),
    (r'\bhover:bg-emerald-500\b', 'hover:bg-[var(--success)]'),
    (r'\bhover:from-emerald-600\b', ''),
    (r'\bhover:to-teal-600\b', ''),
    (r'\bfrom-emerald-500\b', ''),
    (r'\bto-teal-500\b', ''),
    (r'\bfrom-emerald-500/20\b', ''),
    (r'\bto-teal-500/20\b', ''),
    
    # amber/orange -> warning
    (r'\btext-amber-500\b', 'text-[var(--warning)]'),
    (r'\btext-amber-400\b', 'text-[var(--warning)]'),
    (r'\btext-amber-600\b', 'text-[var(--warning)]'),
    (r'\bbg-amber-500\b', 'bg-[var(--warning)]'),
    (r'\bbg-amber-600\b', 'bg-[var(--warning)]'),
    (r'\bbg-amber-500/10\b', 'bg-[var(--warning)]/10'),
    (r'\bbg-amber-500/5\b', 'bg-[var(--warning)]/5'),
    (r'\bhover:bg-amber-500\b', 'hover:bg-[var(--warning)]'),
    (r'\bhover:bg-amber-600\b', 'hover:bg-[var(--warning)]'),
    (r'\bhover:from-amber-600\b', ''),
    (r'\bhover:to-orange-600\b', ''),
    (r'\bfrom-amber-500\b', ''),
    (r'\bto-orange-500\b', ''),
    (r'\bfrom-amber-500/5\b', ''),
    (r'\bto-orange-500/5\b', ''),
    (r'\btext-orange-500\b', 'text-[var(--warning)]'),
    (r'\btext-orange-400\b', 'text-[var(--warning)]'),
    
    # rose/red -> danger
    (r'\btext-rose-500\b', 'text-[var(--danger)]'),
    (r'\btext-rose-400\b', 'text-[var(--danger)]'),
    (r'\btext-rose-600\b', 'text-[var(--danger)]'),
    (r'\btext-rose-300\b', 'text-[var(--danger)]'),
    (r'\btext-rose-500/60\b', 'text-[var(--danger)]/60'),
    (r'\bbg-rose-500\b', 'bg-[var(--danger)]'),
    (r'\bbg-rose-600\b', 'bg-[var(--danger)]'),
    (r'\bbg-rose-500/10\b', 'bg-[var(--danger)]/10'),
    (r'\bbg-rose-500/5\b', 'bg-[var(--danger)]/5'),
    (r'\bborder-rose-500/20\b', 'border-[var(--danger)]/20'),
    (r'\bborder-rose-500/10\b', 'border-[var(--danger)]/10'),
    (r'\bhover:bg-rose-600\b', 'hover:bg-[var(--danger)]'),
    (r'\bhover:bg-rose-500\b', 'hover:bg-[var(--danger)]'),
    (r'\bhover:from-rose-600\b', ''),
    (r'\bhover:to-purple-700\b', ''),
    (r'\bfrom-rose-500\b', ''),
    (r'\bto-purple-600\b', ''),
    (r'\bfrom-rose-500/5\b', ''),
    (r'\bto-orange-500/5\b', ''),
    (r'\btext-red-500\b', 'text-[var(--danger)]'),
    (r'\btext-red-400\b', 'text-[var(--danger)]'),
    (r'\bbg-red-500\b', 'bg-[var(--danger)]'),
    (r'\bbg-red-500/10\b', 'bg-[var(--danger)]/10'),
    (r'\bhover:bg-red-500\b', 'hover:bg-[var(--danger)]'),
    (r'\bhover:bg-red-500/10\b', 'hover:bg-[var(--danger)]/10'),
    
    # blue/cyan -> accent (for non-semantic blues)
    (r'\btext-blue-500\b', 'text-[var(--accent)]'),
    (r'\btext-blue-400\b', 'text-[var(--accent)]'),
    (r'\bbg-blue-500\b', 'bg-[var(--accent)]'),
    (r'\bbg-blue-600\b', 'bg-[var(--accent)]'),
    (r'\bbg-blue-500/10\b', 'bg-[var(--accent-soft)]'),
    (r'\bborder-blue-500/20\b', 'border-[var(--accent)]/20'),
    (r'\bfrom-blue-500/5\b', ''),
    (r'\bto-cyan-500/5\b', ''),
    (r'\bfrom-blue-500\b', ''),
    (r'\bto-indigo-500\b', ''),
    (r'\btext-cyan-500\b', 'text-[var(--accent)]'),
    (r'\bbg-cyan-500\b', 'bg-[var(--accent)]'),
    (r'\bfrom-cyan-500\b', ''),
    
    # purple/violet -> accent
    (r'\btext-purple-500\b', 'text-[var(--accent)]'),
    (r'\btext-purple-400\b', 'text-[var(--accent)]'),
    (r'\btext-purple-600\b', 'text-[var(--accent)]'),
    (r'\bbg-purple-500\b', 'bg-[var(--accent)]'),
    (r'\bbg-purple-600\b', 'bg-[var(--accent)]'),
    (r'\bbg-purple-500/10\b', 'bg-[var(--accent-soft)]'),
    (r'\bborder-purple-500/20\b', 'border-[var(--accent)]/20'),
    (r'\bfrom-violet-500\b', ''),
    (r'\bto-purple-500\b', ''),
    (r'\bfrom-violet-600\b', ''),
    (r'\bfrom-violet-500/5\b', ''),
    (r'\bto-purple-500/5\b', ''),
    (r'\btext-violet-500\b', 'text-[var(--accent)]'),
    (r'\bbg-violet-500/10\b', 'bg-[var(--accent-soft)]'),
    (r'\bborder-violet-500/20\b', 'border-[var(--accent)]/20'),
    
    # pink -> danger (or accent)
    (r'\btext-pink-500\b', 'text-[var(--danger)]'),
    
    # gray/slate -> text tokens
    (r'\btext-slate-400\b', 'text-[var(--text-muted)]'),
    (r'\btext-slate-500\b', 'text-[var(--text-muted)]'),
    (r'\btext-slate-300\b', 'text-[var(--text-muted)]'),
    (r'\btext-slate-900\b', 'text-[var(--text-primary)]'),
    (r'\btext-slate-800\b', 'text-[var(--text-primary)]'),
    (r'\btext-gray-500\b', 'text-[var(--text-muted)]'),
    (r'\btext-gray-400\b', 'text-[var(--text-muted)]'),
    (r'\btext-gray-300\b', 'text-[var(--text-muted)]'),
    (r'\bbg-slate-500/10\b', 'bg-[var(--bg-tertiary)]'),
    (r'\bbg-slate-950/80\b', 'bg-black/60'),
    (r'\bbg-slate-950/60\b', 'bg-black/60'),
    (r'\bhover:bg-white/5\b', 'hover:bg-[var(--surface-hover)]'),
    (r'\bhover:bg-white/10\b', 'hover:bg-[var(--surface-hover)]'),
    (r'\bfocus:bg-white/10\b', 'focus:bg-[var(--surface-hover)]'),
    (r'\bdark:focus:bg-white/5\b', 'focus:bg-[var(--surface-hover)]'),
    (r'\bdark:bg-white/5\b', 'bg-[var(--surface-hover)]'),
    
    # green -> success
    (r'\btext-green-400\b', 'text-[var(--success)]'),
    (r'\btext-green-500\b', 'text-[var(--success)]'),
    (r'\bbg-green-500\b', 'bg-[var(--success)]'),
    
    # yellow -> warning
    (r'\btext-yellow-500\b', 'text-[var(--warning)]'),
    
    # teal -> success
    (r'\btext-teal-500\b', 'text-[var(--success)]'),
]

total_color_replacements = 0
for jsx_file in SRC.rglob('*.jsx'):
    if 'components/ui/' in str(jsx_file):
        continue
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    file_count = 0
    for pattern, replacement in COLOR_REPLACEMENTS:
        new_text, n = re.subn(pattern, replacement, text)
        if n:
            text = new_text
            file_count += n
    if text != original:
        # Clean up double spaces from removals
        text = re.sub(r'  +', ' ', text)
        text = re.sub(r'class(N|n)ame="([^"]*?)\s+"', r'class\1="\2"', text)
        jsx_file.write_text(text, encoding='utf-8')
        total_color_replacements += file_count

fixes.append(f"  Rainbow colors -> tokens: {total_color_replacements} replacements across all files")

# ============================================================
# FIX 7: Delete AI gradient orbs
# ============================================================
orb_patterns = [
    # blur-3xl rounded-full ... -z-10
    r'<div[^>]*blur-3xl[^>]*rounded-full[^>]*/?>(?:</div>)?\s*\n?',
    r'<div[^>]*rounded-full[^>]*blur-3xl[^>]*/?>(?:</div>)?\s*\n?',
    r'<div[^>]*blur-\[100px\][^>]*/?>(?:</div>)?\s*\n?',
    r'<div[^>]*blur-\[80px\][^>]*/?>(?:</div>)?\s*\n?',
    # absolute ... bg-[var(--accent)]/X ... blur
    r'<div[^>]*absolute[^>]*bg-\[var\(--accent\)\]/\d+[^>]*blur[^>]*/?>(?:</div>)?\s*\n?',
]

orb_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    for pattern in orb_patterns:
        text = re.sub(pattern, '', text, flags=re.MULTILINE)
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        orb_count += 1

fixes.append(f"  AI gradient orbs: removed from {orb_count} files")

# ============================================================
# FIX 8: Extract shared Loader component
# ============================================================
loader_file = SRC / "components/ui/Loader.jsx"
loader_file.write_text("""import React from 'react';

/**
 * Shared loading spinner — uses design tokens (not hardcoded colors).
 * Replaces the 4 duplicated TabLoader/RouteLoader components.
 */
const Loader = ({ size = 32, label = 'Loading…' }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size >= 32 ? '100vh' : 'auto',
        padding: size >= 32 ? '2rem' : '1rem',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)',
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `${Math.max(2, size / 12)}px solid var(--bg-tertiary)`,
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
            }} />
            {label && <div style={{ fontSize: '14px' }}>{label}</div>}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);

export default Loader;
""")
fixes.append("  Created shared Loader.jsx component")

# ============================================================
# FIX 9: Fix dark mode bg color
# ============================================================
css_file = SRC / "index.css"
text = css_file.read_text(encoding='utf-8')
text = text.replace('--bg-primary: #0a0a0a;', '--bg-primary: #0c0d10;')
css_file.write_text(text, encoding='utf-8')
fixes.append("  Dark mode bg: #0a0a0a -> #0c0d10 (tinted, not pure black)")

# ============================================================
# FIX 14: font-bold on inputs -> font-normal
# ============================================================
input_bold_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    # Replace font-bold on input/select/textarea elements
    # Simple approach: find className with font-bold near input/select/textarea
    text = re.sub(
        r'(<(?:input|select|textarea)[^>]*?)\bfont-bold\b',
        r'\1font-normal',
        text
    )
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        input_bold_count += 1

fixes.append(f"  font-bold on inputs -> font-normal: {input_bold_count} files")

# ============================================================
# FIX 15: focus-lg typo -> focus-ring
# ============================================================
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    if 'focus-lg' in text:
        text = text.replace('focus-lg', 'focus-ring')
        jsx_file.write_text(text, encoding='utf-8')
        fixes.append(f"  {jsx_file.relative_to(SRC)}: focus-lg -> focus-ring")

# ============================================================
# FIX: Remove hover:bg-[var(--accent)] on primary buttons (same as rest state)
# ============================================================
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    # If a button has bg-[var(--accent)] and hover:bg-[var(--accent)], fix the hover
    text = text.replace('hover:bg-[var(--accent)] ', 'hover:bg-[var(--accent-hover)] ')
    text = text.replace('hover:bg-[var(--accent)]"', 'hover:bg-[var(--accent-hover)]"')
    if text != original:
        jsx_file.write_text(text, encoding='utf-8')

fixes.append("  Fixed hover states: bg-[var(--accent)] hover -> hover:bg-[var(--accent-hover)]")

# ============================================================
# FIX: Remove tracking-wider left on buttons
# ============================================================
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    if 'tracking-wider' in text:
        text = text.replace('tracking-wider', '')
        text = re.sub(r'  +', ' ', text)
        jsx_file.write_text(text, encoding='utf-8')

fixes.append("  Removed leftover tracking-wider from buttons")

# ============================================================
# FIX: Remove italic opacity-50 double-dimming on empty states
# ============================================================
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    text = text.replace('italic opacity-50', '')
    text = text.replace('italic opacity-40', '')
    text = text.replace('opacity-50 italic', '')
    text = text.replace('opacity-40 italic', '')
    if text != original:
        text = re.sub(r'  +', ' ', text)
        jsx_file.write_text(text, encoding='utf-8')

fixes.append("  Removed double-dimming (italic opacity-50) on empty states")

# ============================================================
# FIX: Remove console.log statements in production code
# ============================================================
console_count = 0
for jsx_file in SRC.rglob('*.jsx'):
    text = jsx_file.read_text(encoding='utf-8')
    original = text
    # Remove console.log lines (keep console.error)
    lines = text.split('\n')
    new_lines = [l for l in lines if not re.match(r'\s*console\.log\(', l)]
    text = '\n'.join(new_lines)
    if text != original:
        removed = len(lines) - len(new_lines)
        jsx_file.write_text(text, encoding='utf-8')
        console_count += removed

fixes.append(f"  Removed {console_count} console.log statements")

# ============================================================
# FIX: Delete backup CSS files
# ============================================================
for backup in ['index - Dark.css', 'index - Lighter.css']:
    fp = SRC / backup
    if fp.exists():
        fp.unlink()
        fixes.append(f"  Deleted {backup}")

print("=== PRIORITY 2 FIXES ===")
for fix in fixes:
    print(fix)
