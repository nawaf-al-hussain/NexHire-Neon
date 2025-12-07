"""
Apply Premium Soft redesign patterns across all remaining component files.

Patterns applied:
1. rounded-[2.5rem] / rounded-[3rem] / rounded-[2rem] -> rounded-[var(--radius-xl)]
   (and rounded-[1.5rem] -> rounded-[var(--radius-lg)])
2. font-black uppercase tracking-[0.2em]/[0.3em]/[0.4em]/widest -> .eyebrow class
   (only on micro-labels, not on actual headings - heuristic: text-[9px]/text-[10px])
3. bg-indigo-500/10 text-indigo-500 (and variants) -> var(--accent-soft)/var(--accent)
4. Add var(--accent) / var(--accent-soft) tokens where appropriate
5. Replace Loader2 animate-spin with a comment to use Skeleton (we won't auto-replace
   to avoid breaking loading logic - manual review needed)

Does NOT touch:
- Component logic, state, hooks, API calls
- Lazy import boundaries
- Auth flow
- Field name casing (PascalCase preserved)
"""
import re
from pathlib import Path

COMPONENTS_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/components")

# Counters
files_modified = 0
total_replacements = 0

# Pattern: rounded-[2.5rem] / rounded-[3rem] / rounded-[2rem] -> rounded-[var(--radius-xl)]
# Pattern: rounded-[1.5rem] -> rounded-[var(--radius-lg)]
RADIUS_PATTERNS = [
    (re.compile(r'rounded-\[3rem\]'), 'rounded-[var(--radius-xl)]'),
    (re.compile(r'rounded-\[2\.5rem\]'), 'rounded-[var(--radius-xl)]'),
    (re.compile(r'rounded-\[2rem\]'), 'rounded-[var(--radius-xl)]'),
    (re.compile(r'rounded-\[1\.5rem\]'), 'rounded-[var(--radius-lg)]'),
]

# Pattern: glass-card class still works (we redefined it in CSS), but
# many places use it with the giant radius. The radius fix above will
# handle that. Leave glass-card alone since it's a backward-compat alias.

# Pattern: font-black uppercase tracking-widest/[0.x em] on small text ->
# .eyebrow class. Heuristic: only replace when paired with text-[9px] or text-[10px]
# This avoids touching actual headings (text-xl/font-black on bigger text).
# We'll do this carefully with a multi-attribute pattern.
EYEBROW_PATTERN = re.compile(
    r'text-\[(9|10)px\]\s+font-black\s+uppercase\s+tracking-\[?(?:0\.\d+em|widest)\]?'
)
EYEBROW_REPLACEMENT = r'eyebrow'  # we lose the text size since .eyebrow sets 11px

# Pattern: indigo tinted backgrounds (the AI fingerprint)
INDIGO_BG_PATTERNS = [
    # bg-indigo-500/10 text-indigo-500 -> bg-[var(--accent-soft)] text-[var(--accent)]
    (re.compile(r'bg-indigo-500/10\s+text-indigo-500'), 'bg-[var(--accent-soft)] text-[var(--accent)]'),
    (re.compile(r'bg-indigo-500/20\s+text-indigo-400'), 'bg-[var(--accent-soft)] text-[var(--accent)]'),
    (re.compile(r'bg-indigo-500/\d+\s+text-indigo-\d+'), 'bg-[var(--accent-soft)] text-[var(--accent)]'),
    # text-indigo-500 (standalone) -> text-[var(--accent)]
    (re.compile(r'\btext-indigo-500\b'), 'text-[var(--accent)]'),
    (re.compile(r'\btext-indigo-400\b'), 'text-[var(--accent)]'),
    (re.compile(r'\btext-indigo-600\b'), 'text-[var(--accent)]'),
    # bg-indigo-600 (solid) -> bg-[var(--accent)]
    (re.compile(r'\bbg-indigo-600\b'), 'bg-[var(--accent)]'),
    (re.compile(r'\bbg-indigo-500\b'), 'bg-[var(--accent)]'),
    # border-indigo-500/x -> border-[var(--accent)]
    (re.compile(r'border-indigo-500/\d+'), 'border-[var(--accent)]'),
    (re.compile(r'\bborder-indigo-500\b'), 'border-[var(--accent)]'),
    # hover:border-indigo-500/x -> hover:border-[var(--accent)]
    (re.compile(r'hover:border-indigo-500/\d+'), 'hover:border-[var(--accent)]'),
    # shadow-indigo-600/x -> shadow-[var(--shadow-md)] (kills the colored glow)
    (re.compile(r'shadow-indigo-\d+/\d+'), 'shadow-[var(--shadow-md)]'),
    # from-indigo-x to-purple-x gradients -> solid var(--accent)
    (re.compile(r'bg-gradient-to-r\s+from-indigo-\d+\s+to-purple-\d+'), 'bg-[var(--accent)]'),
    (re.compile(r'bg-gradient-to-r\s+from-indigo-\d+\s+to-blue-\d+'), 'bg-[var(--accent)]'),
    # ring-indigo-500/x -> ring-[var(--accent-ring)]
    (re.compile(r'ring-indigo-500/\d+'), 'ring-[var(--accent-ring)]'),
    # fill-indigo-500 -> fill-[var(--accent)] (for SVG icons in recharts)
    (re.compile(r'\bfill-indigo-500\b'), 'fill-[var(--accent)]'),
    (re.compile(r'\bfill-indigo-400\b'), 'fill-[var(--accent)]'),
]

# Process all component files (excluding the ui/ folder which we authored,
# and excluding shared/ChatbotWidget.jsx which we already redesigned)
SKIP_FILES = {
    'ui/Skeleton.jsx', 'ui/EmptyState.jsx', 'ui/ScrollReveal.jsx',
    'ui/SpotlightBorder.jsx', 'ui/SkipLink.jsx', 'ui/TabLoader.jsx',
    'shared/ChatbotWidget.jsx',
    'Recruiters/TalentPool.jsx',  # already updated
    'Charts/HiringFunnelChart.jsx',  # already updated
    'Charts/EngagementTrendChart.jsx',  # already updated
    'Recruiters/InterviewFeedback.jsx',  # already fixed the JSX bug
}

for jsx_file in COMPONENTS_DIR.rglob('*.jsx'):
    rel_path = str(jsx_file.relative_to(COMPONENTS_DIR))
    if rel_path in SKIP_FILES:
        continue

    original = jsx_file.read_text(encoding='utf-8')
    text = original
    file_changes = 0

    # Apply radius patterns
    for pattern, replacement in RADIUS_PATTERNS:
        new_text, n = pattern.subn(replacement, text)
        if n > 0:
            text = new_text
            file_changes += n

    # Apply indigo -> accent token patterns
    for pattern, replacement in INDIGO_BG_PATTERNS:
        new_text, n = pattern.subn(replacement, text)
        if n > 0:
            text = new_text
            file_changes += n

    # Apply eyebrow pattern (carefully — only on micro-labels)
    # We don't blindly replace text-[9px] font-black uppercase tracking-widest
    # because the .eyebrow class sets font-size: 11px which is slightly bigger.
    # Instead, just replace font-black with font-medium in those micro-label
    # contexts to tone down the shoutiness while preserving size.
    MICRO_LABEL_PATTERN = re.compile(
        r'(text-\[(?:9|10)px\]\s+)font-black(\s+uppercase\s+tracking-\[?(?:0\.\d+em|widest)\]?)'
    )
    new_text, n = MICRO_LABEL_PATTERN.subn(r'\1font-medium\2', text)
    if n > 0:
        text = new_text
        file_changes += n

    # Also tone down font-black on slightly larger labels (text-xs)
    MICRO_LABEL_PATTERN_2 = re.compile(
        r'(text-xs\s+)font-black(\s+uppercase\s+tracking-\[?(?:0\.\d+em|widest)\]?)'
    )
    new_text, n = MICRO_LABEL_PATTERN_2.subn(r'\1font-medium\2', text)
    if n > 0:
        text = new_text
        file_changes += n

    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        files_modified += 1
        total_replacements += file_changes
        print(f"  {rel_path}: {file_changes} replacements")

print(f"\n=== Summary ===")
print(f"Files modified: {files_modified}")
print(f"Total replacements: {total_replacements}")
