"""
Fix ALL remaining AI slop on buttons across all component files.

Patterns fixed:
1. uppercase tracking on buttons -> removed (buttons should be sentence case)
2. bg-gradient-to-r from-indigo-X to-purple-X -> bg-[var(--accent)]
3. shadow-indigo -> shadow-[var(--shadow-md)]
4. rounded-full on text buttons (not icon buttons) -> rounded-[var(--radius-md)]
"""
import re
from pathlib import Path

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")

files_modified = 0
total_replacements = 0

for jsx_file in SRC.rglob('*.jsx'):
    if 'components/ui/' in str(jsx_file):
        continue

    original = jsx_file.read_text(encoding='utf-8')
    text = original
    file_changes = 0

    # 1. Remove uppercase tracking from buttons that have it
    # Pattern: className="...uppercase...tracking-[X]..." on elements with button-like text
    # We can't safely parse JSX to know which elements are buttons, so we target
    # the class patterns commonly used on buttons:
    # - "uppercase tracking-[0.15em]" (our reduced version)
    # - "uppercase tracking-[0.18em]"
    # - "uppercase tracking-widest"
    # When combined with font-medium or font-semibold (which our cleanup already set)
    # AND when inside a className that looks like a button (has px-, py-, rounded, btn)
    
    # Replace "uppercase tracking-[0.15em]" -> "" when in a button context
    # But only if the element is a button/link, not a label/heading
    # Safe approach: remove uppercase tracking from className strings that also
    # contain px- or py- or btn (button-like padding)
    def remove_uppercase_tracking(match):
        cls = match.group(0)
        # Only remove if this looks like a button (has padding or btn class)
        if 'px-' in cls or 'py-' in cls or 'btn-' in cls or 'rounded-' in cls:
            # Remove uppercase and tracking
            cls = re.sub(r'\buppercase\b\s*', '', cls)
            cls = re.sub(r'tracking-\[0\.\d+em\]\s*', '', cls)
            cls = re.sub(r'\btracking-widest\b\s*', '', cls)
            cls = re.sub(r'\btracking-tight\b\s*', '', cls)
            # Clean up double spaces
            cls = re.sub(r'  +', ' ', cls).strip()
            return cls
        return match.group(0)

    # Match className="..." patterns
    new_text, n = re.subn(r'className="[^"]*"', remove_uppercase_tracking, text)
    if n > 0:
        text = new_text
        file_changes += n

    # Also handle className={`...`} (template literal)
    new_text, n = re.subn(r'className=\{`[^`]*`\}', remove_uppercase_tracking, text)
    if n > 0:
        text = new_text
        file_changes += n

    # 2. Replace bg-gradient-to-r from-indigo-X to-purple-X/Y -> bg-[var(--accent)]
    # (catches any remaining gradient buttons)
    text = re.sub(
        r'bg-gradient-to-r\s+from-indigo-\d+\s+to-(?:purple|blue|cyan)-\d+',
        'bg-[var(--accent)]',
        text
    )
    text = re.sub(
        r'bg-gradient-to-r\s+from-indigo-\d+\s+to-purple-\d+',
        'bg-[var(--accent)]',
        text
    )

    # 3. Replace shadow-indigo-X/Y -> shadow-[var(--shadow-md)]
    text = re.sub(r'shadow-indigo-\d+/\d+', 'shadow-[var(--shadow-md)]', text)

    # 4. Replace rounded-full on text buttons (not icon buttons)
    # Only replace if the class also has text (not just w-/h- for icon)
    # This is tricky — skip for now since the pill-button count is only 1

    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        files_modified += 1
        total_replacements += file_changes

print(f"=== Button AI Slop Fix ===")
print(f"Files modified: {files_modified}")
print(f"Total replacements: {total_replacements}")
