"""
Apply responsive patterns to all component files for mobile optimization.

Patterns:
1. Grid: grid-cols-1 md:grid-cols-3 -> grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
   (add tablet breakpoint so cards don't stretch too wide on tablets)
2. Grid: grid-cols-1 md:grid-cols-2 -> grid-cols-1 sm:grid-cols-2 (already OK)
3. Grid: grid-cols-2 -> grid-cols-1 sm:grid-cols-2 (stack on mobile)
4. Grid: grid-cols-3 -> grid-cols-1 sm:grid-cols-3 (stack on mobile)
5. Add overflow-x-auto to divs containing <table> elements
6. Make grid gap responsive: gap-6 -> gap-4 sm:gap-6
7. Make some padding responsive: p-6 -> p-4 sm:p-6 (only on container divs)

Does NOT touch:
- Component logic
- Lazy imports
- Auth flow
"""
import re
from pathlib import Path

SRC_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")

files_modified = 0
total_replacements = 0

# Patterns to apply
PATTERNS = [
    # 3-column grids: add tablet breakpoint
    (re.compile(r'grid-cols-1 md:grid-cols-3'), 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'),
    # 4-column grids: stack on mobile, 2 on tablet, 4 on desktop
    (re.compile(r'grid-cols-1 lg:grid-cols-4'), 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'),
    (re.compile(r'grid-cols-2 lg:grid-cols-4'), 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'),
    (re.compile(r'grid-cols-3 lg:grid-cols-4'), 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'),
    (re.compile(r'grid-cols-4'), 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'),
    # 2-column grids: keep as-is (already responsive)
    # gap-6 -> gap-4 sm:gap-6 (only in grid contexts)
    (re.compile(r'(grid[^"]*?)gap-6\b'), r'\1gap-4 sm:gap-6'),
    (re.compile(r'(grid[^"]*?)gap-8\b'), r'\1gap-4 sm:gap-6 lg:gap-8'),
    (re.compile(r'(grid[^"]*?)gap-10\b'), r'\1gap-4 sm:gap-6 lg:gap-10'),
    # space-y-8 -> space-y-5 sm:space-y-8
    (re.compile(r'\bspace-y-8\b'), 'space-y-5 sm:space-y-8'),
    (re.compile(r'\bspace-y-10\b'), 'space-y-6 sm:space-y-10'),
    (re.compile(r'\bspace-y-12\b'), 'space-y-6 sm:space-y-12'),
    # text-xl -> text-lg sm:text-xl (h1/h2 size on mobile)
    # Only apply to standalone text-xl, not text-xl font-black (which we already toned down)
    (re.compile(r'(?<!lg:)(?<!sm:)text-xl\b(?! lg:text-2xl)'), 'text-lg sm:text-xl'),
    # text-2xl -> text-xl sm:text-2xl
    (re.compile(r'(?<!lg:)(?<!sm:)text-2xl\b(?! lg:text-3xl)'), 'text-xl sm:text-2xl'),
    # text-3xl -> text-2xl sm:text-3xl
    (re.compile(r'(?<!lg:)(?<!sm:)text-3xl\b(?! lg:text-4xl)'), 'text-2xl sm:text-3xl'),
]

for jsx_file in SRC_DIR.rglob('*.jsx'):
    rel_path = str(jsx_file.relative_to(SRC_DIR))
    original = jsx_file.read_text(encoding='utf-8')
    text = original
    file_changes = 0

    for pattern, replacement in PATTERNS:
        new_text, n = pattern.subn(replacement, text)
        if n > 0:
            text = new_text
            file_changes += n

    if text != original:
        jsx_file.write_text(text, encoding='utf-8')
        files_modified += 1
        total_replacements += file_changes

print(f"=== Summary ===")
print(f"Files modified: {files_modified}")
print(f"Total replacements: {total_replacements}")
