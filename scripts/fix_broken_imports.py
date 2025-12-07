"""Fix broken imports where useToast was inserted in the middle of a multi-line import."""
from pathlib import Path
import re

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")

for f in SRC.rglob('*.jsx'):
    text = f.read_text()
    # Pattern: import { useToast } ... import { useToast } from '...'; REST } from '...'
    # This happens when the last import line was part of a multi-line import
    # e.g.:
    # import {
    # import { useToast } from '../../components/ui/Toast'; useAuth } from '../../context/AuthContext';
    
    # Fix: move the useToast import to before the multi-line import
    pattern = re.compile(
        r'^(import \{[^}]*\nimport \{ useToast \} from [^;]+; )(.+)} from (.+;)',
        re.MULTILINE
    )
    
    match = pattern.search(text)
    if match:
        # Extract parts
        before = text[:match.start()]
        # The useToast import
        useToast_import = f"import {{ useToast }} from {match.group(1).split('from')[1].split(';')[0].strip()};\n"
        # The original multi-line import, reconstructed
        original_import = f"import {{\n{match.group(2)}}} from {match.group(3)}"
        after = text[match.end():]
        
        text = before + useToast_import + original_import + after
        f.write_text(text)
        print(f"  Fixed {f.relative_to(SRC)}")

# Also check for any other broken patterns
for f in SRC.rglob('*.jsx'):
    text = f.read_text()
    # Check if useToast import is on the same line as other code
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'import { useToast }' in line and line.count('from') > 1:
            # This line has multiple imports - split them
            print(f"  WARNING: {f.relative_to(SRC)}:{i+1} has multiple imports on one line: {line[:80]}")
