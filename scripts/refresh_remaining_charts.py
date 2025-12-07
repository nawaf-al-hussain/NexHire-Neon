"""Replace rainbow COLORS arrays in remaining 5 charts with a token-based palette.
Each chart gets a 2-3 color palette using design tokens instead of hardcoded hex.
Also replace hardcoded grid/tooltip styles with tokens."""
from pathlib import Path
import re

CHARTS_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/components/Charts")

# Common chart color palette using tokens
# We'll define a small palette per chart based on what makes sense for the data
CHART_PALETTES = {
    'SalaryRangeChart.jsx': {
        'old': "const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185'];",
        'new': "// Premium Soft palette: indigo accent + neutral grays (no rainbow)\n    const COLORS = ['var(--accent)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--success)', 'var(--warning)'];",
    },
    'RejectionAnalysisChart.jsx': {
        'old': "const COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2'];",
        'new': "// Premium Soft palette: danger red + neutral tints\n    const COLORS = ['var(--danger)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--warning)'];",
    },
    'DiversityChart.jsx': {
        'old': "const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];",
        'new': "// Premium Soft palette: semantic colors (success/accent/warning)\n    const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--text-muted)', 'var(--text-secondary)'];",
    },
    'HireRatePerJobChart.jsx': {
        'old': "const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185'];",
        'new': "// Premium Soft palette: indigo accent + neutral grays (no rainbow)\n    const COLORS = ['var(--accent)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--success)', 'var(--warning)'];",
    },
    'ReferralIntelChart.jsx': {
        'old': "const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fb7185', '#f43f5e', '#e11d48'];",
        'new': "// Premium Soft palette: warning amber + neutral tints\n    const COLORS = ['var(--warning)', 'var(--accent)', 'var(--text-muted)', 'var(--text-secondary)'];",
    },
}

count = 0
for fname, palette in CHART_PALETTES.items():
    fp = CHARTS_DIR / fname
    text = fp.read_text(encoding='utf-8')
    if palette['old'] in text:
        text = text.replace(palette['old'], palette['new'], 1)
        count += 1
        print(f"OK: {fname} - COLORS replaced")
    else:
        print(f"NOT FOUND: {fname}")

    # Also replace common hardcoded chart styles with tokens
    # CartesianGrid stroke
    text = re.sub(
        r'stroke="rgba\(255,\s*255,\s*255,\s*0\.0\d+\)"',
        'stroke="var(--border-primary)"',
        text
    )
    text = re.sub(
        r'stroke="rgba\(0,\s*0,\s*0,\s*0\.0\d+\)"',
        'stroke="var(--border-primary)"',
        text
    )
    # Tooltip hardcoded shadow
    text = re.sub(
        r"boxShadow:\s*'0 \d+px \d+px[^']*rgba\(0,\s*0,\s*0[^']*\)'\s*}",
        "boxShadow: 'var(--shadow-lg)' }",
        text
    )
    # Tooltip hardcoded border radius
    text = re.sub(
        r"borderRadius:\s*'(?:1rem|2rem|\d+px)'\s*",
        "borderRadius: 'var(--radius-md)' ",
        text
    )
    # Tooltip hardcoded font weight
    text = re.sub(
        r"fontWeight:\s*'(?:bold|900)'\s*",
        "fontWeight: '500' ",
        text
    )
    # Tick fontWeight: 900 -> 500
    text = re.sub(
        r"fontWeight:\s*900\s*",
        "fontWeight: 500 ",
        text
    )
    # Tick fontWeight: 700 -> 500
    text = re.sub(
        r"fontWeight:\s*700\s*",
        "fontWeight: 500 ",
        text
    )
    # cursor fill rgba(255,255,255,X) -> var(--surface-hover)
    text = re.sub(
        r"cursor:\s*\{\s*fill:\s*'rgba\(255,\s*255,\s*255,\s*0\.0\d+\)'\s*\}",
        "cursor: { fill: 'var(--surface-hover)' }",
        text
    )

    fp.write_text(text, encoding='utf-8')

print(f"\n{count}/{len(CHART_PALETTES)} charts updated")
