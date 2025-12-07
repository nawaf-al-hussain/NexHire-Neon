"""Replace ALL gradient buttons with solid var(--accent) and remove colored glows."""
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

    # 1. Replace ALL bg-gradient-to-r from-X-500 to-Y-500/600 patterns
    # Match: bg-gradient-to-r from-{color}-{shade} to-{color}-{shade}
    # Also match hover:from-X and hover:to-Y
    new_text, n = re.subn(
        r'bg-gradient-to-r\s+from-\w+-\d+\s+to-\w+-\d+',
        'bg-[var(--accent)]',
        text
    )
    if n: text = new_text; file_changes += n

    # 2. Replace bg-gradient-to-br (diagonal gradients)
    new_text, n = re.subn(
        r'bg-gradient-to-br\s+from-\w+-\d+/\d+\s+to-\w+-\d+/\d+',
        'bg-[var(--accent-soft)]',
        text
    )
    if n: text = new_text; file_changes += n

    # 3. Remove hover:from-X and hover:to-Y (no longer needed without gradient)
    new_text, n = re.subn(r'\s*hover:from-\w+-\d+', '', text)
    if n: text = new_text; file_changes += n
    new_text, n = re.subn(r'\s*hover:to-\w+-\d+', '', text)
    if n: text = new_text; file_changes += n

    # 4. Remove colored shadow glows: shadow-{color}-500/{opacity}
    new_text, n = re.subn(r'\s*shadow-\w+-\d+/\d+', '', text)
    if n: text = new_text; file_changes += n
    new_text, n = re.subn(r'\s*hover:shadow-\w+-\d+/\d+', '', text)
    if n: text = new_text; file_changes += n

    # 5. Remove bg-gradient-to-r from-X-500/5 to-Y-500/5 (subtle background gradients on divs)
    # Replace with solid bg-[var(--bg-elevated)]
    new_text, n = re.subn(
        r'bg-gradient-to-r\s+from-\w+-\d+/\d+\s+to-\w+-\d+/\d+',
        '',
        text
    )
    if n: text = new_text; file_changes += n

    # 6. Remove text-transparent bg-clip-text bg-gradient (gradient text)
    new_text, n = re.subn(
        r'text-transparent\s+bg-clip-text\s+bg-gradient-to-r\s+from-\w+-\d+\s+to-\w+-\d+',
        'text-[var(--accent)]',
        text
    )
    if n: text = new_text; file_changes += n

    # 7. Remove bg-gradient-to-r from-X-500 to-Y-500 (progress bars, etc.)
    new_text, n = re.subn(
        r'bg-gradient-to-r\s+from-\w+-\d+\s+to-\w+-\d+',
        'bg-[var(--accent)]',
        text
    )
    if n: text = new_text; file_changes += n

    # 8. Remove tracking-wider (leftover from button cleanup)
    new_text, n = re.subn(r'\s*tracking-wider\b', '', text)
    if n: text = new_text; file_changes += n

    # 9. Clean up double spaces
    text = re.sub(r'  +', ' ', text)
    text = re.sub(r'class(N|n)ame="([^"]*?)\s+"', r'class\1="\2"', text)

    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        files_modified += 1
        total_replacements += file_changes

print(f"Files modified: {files_modified}")
print(f"Total replacements: {total_replacements}")
