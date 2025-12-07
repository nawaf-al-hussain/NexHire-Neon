"""
Final cleanup: remove uppercase tracking from headings (h2/h3/h4) and
section labels. These should be sentence case, not ALL CAPS.

Also fix:
- text-[10px] -> text-[11px] (minimum readable size on desktop too)
- tracking-tighter -> tracking-tight (less aggressive)
- tracking-tight -> remove if combined with uppercase
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

    # 1. Remove "uppercase tracking-[0.15em]" -> "" (on headings and labels)
    new_text, n = re.subn(r'\buppercase\s+tracking-\[0\.15em\]\s*', '', text)
    if n: text = new_text; file_changes += n

    # 2. Remove "uppercase tracking-tight" -> "" (on headings)
    new_text, n = re.subn(r'\buppercase\s+tracking-tight\b\s*', '', text)
    if n: text = new_text; file_changes += n

    # 3. Remove "uppercase tracking-tighter" -> "" (on headings)
    new_text, n = re.subn(r'\buppercase\s+tracking-tighter\b\s*', '', text)
    if n: text = new_text; file_changes += n

    # 4. Remove standalone "uppercase tracking-[0.18em]" -> "" (on non-eyebrow)
    # Only if not preceded by "eyebrow"
    new_text, n = re.subn(r'(?<!eyebrow["\s])\buppercase\s+tracking-\[0\.18em\]\s*', '', text)
    if n: text = new_text; file_changes += n

    # 5. text-[10px] -> text-[11px] (desktop too, not just mobile)
    new_text, n = re.subn(r'\btext-\[10px\]\b', 'text-[11px]', text)
    if n: text = new_text; file_changes += n

    # 6. Clean up double spaces left behind by removals
    text = re.sub(r'  +', ' ', text)
    # Clean up trailing spaces in className
    text = re.sub(r'class(N|n)ame="([^"]*?)\s+"', r'class\1="\2"', text)

    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        files_modified += 1
        total_replacements += file_changes

print(f"Files modified: {files_modified}")
print(f"Total replacements: {total_replacements}")
