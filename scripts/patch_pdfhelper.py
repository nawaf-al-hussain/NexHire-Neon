"""Patch pdfHelper.js to lazy-load pdf-parse (avoids DOMMatrix crash on Vercel)."""
from pathlib import Path

FILE = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/pdfHelper.js")
text = FILE.read_text(encoding='utf-8')

# Replace the eager require with a lazy loader
old = "const pdf = require('pdf-parse');\nconst { query } = require('./db');"
new = """// pdf-parse is lazy-loaded below to avoid DOMMatrix crash on Vercel serverless
const { query } = require('./db');

let _pdf = null;
function getPdfParse() {
    if (_pdf === null) {
        _pdf = require('pdf-parse');
    }
    return _pdf;
}"""

if old in text:
    text = text.replace(old, new, 1)
    print("OK: replaced eager require with lazy loader")
else:
    print("NOT FOUND: header pattern not present")
    raise SystemExit(1)

# Replace usages of `pdf(` (the function call) with `getPdfParse()(` since pdf was a function
# Actually pdf-parse exports a function. So calls like `await pdf(pdfBuffer)` need to become
# `await getPdfParse()(pdfBuffer)`. Find them.
import re
# Count current usages
matches = list(re.finditer(r'\bpdf\(', text))
print(f"Found {len(matches)} call sites of pdf(")
for m in matches:
    line_no = text[:m.start()].count('\n') + 1
    print(f"  L{line_no}: ...{text[max(0,m.start()-30):m.start()+50]}...")

# Replace `pdf(` with `getPdfParse()(` everywhere
new_text = re.sub(r'\bpdf\(', 'getPdfParse()(', text)
# But we don't want to replace `getPdfParse()` itself
# Verify by counting again
print(f"\nAfter replacement, 'getPdfParse()' appears {new_text.count('getPdfParse()')} times")
print(f"After replacement, standalone 'pdf(' appears {new_text.count(' pdf(')} times")

FILE.write_text(new_text, encoding='utf-8')
print("\nFile patched successfully.")
