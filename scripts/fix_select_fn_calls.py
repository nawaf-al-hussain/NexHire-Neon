"""
Fix all 4 routes that use `SELECT sp_X(...)` style — they need to use
`SELECT * FROM sp_X(...)` to unpack the composite columns.

Affected routes:
1. analytics.js L733 - sp_predicthiresuccess
2. candidates.js L436 - sp_predictcareerpath
3. candidates.js L892 - sp_generateinterviewprep
4. interviews.js L648 - sp_optimizeinterviewrounds
5. jobs.js L248 - sp_advancedcandidatematchingenhanced
6. recruiters.js L107 - sp_fuzzysearchcandidates
7. recruiters.js L361 - sp_autoscreenapplicationenhanced
"""
from pathlib import Path

ROUTES_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes")

# (file, old_pattern, new_pattern)
fixes = [
    # 1. sp_predicthiresuccess
    ("analytics.js",
     "const result = await query(`SELECT sp_predicthiresuccess($1)`, [applicationId]);",
     "const result = await query(`SELECT * FROM sp_predicthiresuccess($1)`, [applicationId]);"),

    # 2. sp_predictcareerpath
    ("candidates.js",
     '"SELECT sp_predictcareerpath($1, $2, $3)",',
     '"SELECT * FROM sp_predictcareerpath($1, $2, $3)",'),

    # 3. sp_generateinterviewprep
    ("candidates.js",
     'const result = await query("SELECT sp_generateinterviewprep($1, $2)", [candidateID, jobID]);',
     'const result = await query("SELECT * FROM sp_generateinterviewprep($1, $2)", [candidateID, jobID]);'),

    # 4. sp_optimizeinterviewrounds
    ("interviews.js",
     'result = await query("SELECT sp_optimizeinterviewrounds($1, $2)", [candidateId, jobId]);',
     'result = await query("SELECT * FROM sp_optimizeinterviewrounds($1, $2)", [candidateId, jobId]);'),

    # 5. sp_advancedcandidatematchingenhanced
    ("jobs.js",
     "const matches = await query('SELECT sp_advancedcandidatematchingenhanced($1, $2)', [req.params.id, topN]);",
     "const matches = await query('SELECT * FROM sp_advancedcandidatematchingenhanced($1, $2)', [req.params.id, topN]);"),

    # 6. sp_fuzzysearchcandidates
    ("recruiters.js",
     'const fuzzyResults = await query("SELECT sp_fuzzysearchcandidates($1, $2)", [name, parseFloat(threshold) || 0.85]);',
     'const fuzzyResults = await query("SELECT * FROM sp_fuzzysearchcandidates($1, $2)", [name, parseFloat(threshold) || 0.85]);'),

    # 7. sp_autoscreenapplicationenhanced (this one is just `await query()` - no result used, but still wrong syntax)
    ("recruiters.js",
     'await query("SELECT sp_autoscreenapplicationenhanced($1)", [app.applicationid]);',
     'await query("SELECT * FROM sp_autoscreenapplicationenhanced($1)", [app.applicationid]);'),
]

for fname, old, new in fixes:
    fp = ROUTES_DIR / fname
    text = fp.read_text(encoding='utf-8')
    if old in text:
        text = text.replace(old, new, 1)
        fp.write_text(text, encoding='utf-8')
        print(f"OK: {fname} - applied")
    else:
        # Try LF normalization
        old_lf = old.replace('\r\n', '\n')
        if old_lf in text:
            new_lf = new.replace('\r\n', '\n')
            text = text.replace(old_lf, new_lf, 1)
            fp.write_text(text, encoding='utf-8')
            print(f"OK (LF): {fname} - applied")
        else:
            print(f"NOT FOUND: {fname} - pattern not present")
            print(f"  Looking for: {old[:100]}")
