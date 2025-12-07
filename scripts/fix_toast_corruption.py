"""Fix corrupted toast(err, ...) calls that the regex created."""
from pathlib import Path
import re

SRC = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src")

for f in SRC.rglob('*.jsx'):
    text = f.read_text()
    if 'toast(err,' not in text:
        continue
    
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        if 'toast(err, { type:' in line and '}).response' in line:
            # This is a corrupted line
            # Extract the message part after ||
            match = re.search(r'\|\|\s*(.+?)\);', line)
            if match:
                msg = match.group(1)
                line = line.replace(
                    re.search(r'toast\(err.*\);', line).group(),
                    f"toast(err.response?.data?.error || {msg}, {{ type: 'error' }});"
                )
        new_lines.append(line)
    
    new_text = '\n'.join(new_lines)
    if new_text != text:
        f.write_text(new_text)
        print(f"  Fixed {f.relative_to(SRC)}")
