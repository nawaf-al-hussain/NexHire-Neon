"""
Apply targeted fixes to recruiters.js, handling CRLF line endings properly.
Each fix is (old_substr, new_substr) — we replace by stripping CR first for matching.
"""
import re
from pathlib import Path

FILE = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes/recruiters.js")

# Read raw bytes, normalize for matching, but preserve CRLF in output
raw = FILE.read_bytes()
text = raw.decode('utf-8')

# Fixes to apply. Each tuple: (search_substring, replacement)
# We match against text with \r\n normalized to \n for search,
# then write back with \r\n preserved.
fixes = [
    # Fix 1: screeningbotdecisions INSERT — drop extra ? and drop thresholdVal param
    (
        "VALUES (?, ?, ?, ?, ?, ?, 'InlineV1', NOW())\r\n                        `, [app.applicationid, decision, finalScore / 100, JSON.stringify(criteria), finalScore, thresholdVal]);",
        "VALUES (?, ?, ?, ?, ?, 'InlineV1', NOW())\r\n                        `, [app.applicationid, decision, finalScore / 100, JSON.stringify(criteria), finalScore]);"
    ),
    # Fix 2: marketalerts ORDER BY createdat -> triggeredat
    (
        'SELECT * FROM marketalerts ORDER BY createdat DESC LIMIT 20',
        'SELECT * FROM marketalerts ORDER BY triggeredat DESC LIMIT 20'
    ),
    # Fix 3: candidategostingscore typo -> candidateghostingscore
    (
        'candidategostingscore as candidategostingscore',
        'candidateghostingscore as candidateghostingscore'
    ),
    # Fix 4: ns.lastnetworkinteraction source column -> ns.lastinteraction
    # (the alias "AS lastnetworkinteraction" stays so frontend keeps working)
    (
        'MAX(ns.lastnetworkinteraction) AS lastnetworkinteraction',
        'MAX(ns.lastinteraction) AS lastnetworkinteraction'
    ),
    # Fix 5: referralnetwork JOIN uses rn.candidateid (doesn't exist) -> rn.referredcandidateid
    #         and ORDER BY rn.createdat (doesn't exist) -> rn.referraldate
    (
        'JOIN candidates c ON rn.candidateid = c.candidateid WHERE rn.jobid = ? ORDER BY rn.createdat DESC LIMIT 20',
        'JOIN candidates c ON rn.referredcandidateid = c.candidateid WHERE rn.jobid = ? ORDER BY rn.referraldate DESC LIMIT 20'
    ),
]

# Note: Bug 6 (CALL sp_generatemarketalerts) is intentionally NOT fixed here.
# The procedure doesn't exist on Neon yet (it was never ported from SSMS).
# The current try/catch fallback already handles the failure gracefully —
# we'll port the procedure in option 2.

results = []
for i, (old, new) in enumerate(fixes, 1):
    if old in text:
        text = text.replace(old, new, 1)
        results.append((i, "OK", old[:80]))
    else:
        # Try with \n only
        old_lf = old.replace('\r\n', '\n')
        if old_lf in text:
            new_lf = new.replace('\r\n', '\n')
            text = text.replace(old_lf, new_lf, 1)
            results.append((i, "OK (LF)", old[:80]))
        else:
            results.append((i, "NOT FOUND", old[:80]))

# Write back as UTF-8 with original line endings preserved
FILE.write_bytes(text.encode('utf-8'))

print("Fix results:")
for i, status, preview in results:
    print(f"  Fix {i}: {status:<12} | {preview}")
