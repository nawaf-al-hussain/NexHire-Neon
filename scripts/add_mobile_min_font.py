"""
Bump up small text sizes for mobile readability.
On mobile (max-width: 768px), text should be at least 11px.

Strategy: Add a global CSS rule that sets minimum font sizes on mobile
for the text-[8px], text-[9px], text-[10px] Tailwind utility classes.
This is safer than modifying every component file.
"""
from pathlib import Path

CSS_FILE = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/index.css")
text = CSS_FILE.read_text(encoding='utf-8')

# Find the mobile optimization section and add the minimum font size rule
# Insert after the "Improve form input experience on mobile" block
old = "/* Improve form input experience on mobile — prevent zoom on focus"
new = """/* Mobile minimum font size — bump up tiny text (8-10px) to 11px for readability.
   These text-[8px]/text-[9px]/text-[10px] classes are used for micro-labels
   and stats throughout the app. On desktop they're fine, but on mobile
   they're hard to read. This rule overrides them on mobile only. */
@media (max-width: 768px) {
  .text-\\[8px\\],
  .text-\\[9px\\],
  .text-\\[10px\\] {
    font-size: 11px !important;
    line-height: 1.4 !important;
  }
}

/* Improve form input experience on mobile — prevent zoom on focus"""

if old in text:
    text = text.replace(old, new, 1)
    CSS_FILE.write_text(text, encoding='utf-8')
    print("OK: Added mobile minimum font size rule")
else:
    print("NOT FOUND: insertion point")
