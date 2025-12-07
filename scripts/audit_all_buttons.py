#!/usr/bin/env python3
"""
Audit ALL buttons across ALL tabs for AI slop patterns.
Logs in, opens sidebar, clicks each tab, scans all visible buttons.
"""
import subprocess
import time
import json
import re
import sys

USERNAME = sys.argv[1] if len(sys.argv) > 1 else 'admin1'

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    return result.stdout + result.stderr

def agent(cmd):
    return run(f'agent-browser {cmd}')

def find_ref(snapshot, text):
    pattern = rf'button "{re.escape(text)}".*?\[.*?ref=(e\d+)\]'
    m = re.search(pattern, snapshot)
    return m.group(1) if m else None

def find_textbox_ref(snapshot, name):
    pattern = rf'textbox "{re.escape(name)}".*?\[.*?ref=(e\d+)\]'
    m = re.search(pattern, snapshot)
    return m.group(1) if m else None

def audit_buttons():
    """Scan all visible buttons for AI slop patterns."""
    js = """(() => {
        const buttons = document.querySelectorAll('button, a[class*=btn], a[href], [role=button], input[type=submit]');
        const issues = [];
        buttons.forEach(b => {
            const cls = (b.className || '').toString();
            const text = (b.textContent || '').trim().substring(0, 50);
            const r = b.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            
            const btnIssues = [];
            if (cls.includes('font-black')) btnIssues.push('font-black');
            if (cls.includes('uppercase') && cls.includes('tracking') && text.length > 3) btnIssues.push('uppercase-tracking');
            if (cls.includes('text-[8px]') || cls.includes('text-[9px]')) btnIssues.push('tiny-text');
            if (cls.includes('bg-gradient')) btnIssues.push('gradient');
            if (cls.includes('shadow-indigo')) btnIssues.push('colored-glow');
            if (cls.includes('rounded-full') && text.length > 5 && !cls.includes('w-9') && !cls.includes('w-10') && !cls.includes('w-12')) btnIssues.push('pill-button');
            if (text.length > 3 && text === text.toUpperCase() && /[A-Z]/.test(text) && text.length < 30) {
                if (!cls.includes('eyebrow') && !text.includes('SQL') && !text.includes('API') && !text.includes('HR') && !text.match(/^[A-Z\s]+$/) === false) {
                    btnIssues.push('ALL-CAPS-TEXT');
                }
            }
            if (cls.includes('animate-bounce')) btnIssues.push('animate-bounce');
            if (cls.includes('animate-pulse') && !cls.includes('loading') && !cls.includes('spinner')) btnIssues.push('animate-pulse');
            
            if (btnIssues.length > 0) {
                issues.push({ text, issues: btnIssues.join(','), cls: cls.substring(0, 50) });
            }
        });
        return JSON.stringify({ total: buttons.length, issues: issues });
    })()"""
    
    # Write JS to temp file
    with open('/tmp/audit_buttons.js', 'w') as f:
        f.write(js)
    
    result = agent(f'eval "$(cat /tmp/audit_buttons.js)"')
    result = result.strip().strip('"').replace('\\"', '"').replace('\\n', '\n')
    try:
        return json.loads(result)
    except:
        return {'total': 0, 'issues': []}

def main():
    agent('set viewport 1440 900')
    time.sleep(0.5)
    agent('open https://nex-hire-neon.vercel.app/login')
    time.sleep(3)
    
    # Login
    snap = agent('snapshot -i')
    uid_ref = find_textbox_ref(snap, 'USERNAME')
    submit_ref = find_ref(snap, 'Sign in')
    if uid_ref:
        agent(f'fill @{uid_ref} "{USERNAME}"')
    if submit_ref:
        agent(f'click @{submit_ref}')
    time.sleep(5)
    
    url = agent('get url').strip()
    print(f"Logged in as {USERNAME} -> {url}")
    
    # Determine tabs based on role
    if 'admin' in url:
        TABS = ['Core Analytics', 'Market Intel', 'Salary Transp', 'Remote Work',
                'Career Path', 'Recruiter Perf', 'Referral Intelligence',
                'Diversity Goals', 'Bias Logs', 'System Reports',
                'Consent Mgmt', 'Vacancy Util', 'Email Queue', 'SQL Views']
    elif 'recruiter' in url:
        TABS = ['Job Roles', 'Talent Pool', 'Interview Schedule', 'Video Interviews',
                'Skill Verify', 'Background Checks', 'Engagement', 'Platform Sync',
                'Hire Analytics', 'Time to Hire', 'Referral Intel', 'Market Alerts',
                'Ghosting Risk', 'AI Questions', 'Hire Predictor', 'Onboarding',
                'Interview Fatigue', 'Blockchain Verif']
    elif 'candidate' in url:
        TABS = ['Discover Jobs', 'Applications', 'Interviews', 'Interview Prep',
                'Skills', 'Skill Gaps', 'Learning', 'Career Path', 'Resume Score',
                'Salary Coach', 'Achievements', 'Location Prefs']
    else:
        print(f"Unknown URL: {url}")
        return
    
    all_issues = []
    
    # Also audit the default view (before clicking any tab)
    print(f"\n=== Default view ===")
    result = audit_buttons()
    if result['issues']:
        for issue in json.loads(result['issues']) if isinstance(result['issues'], str) else result['issues']:
            print(f"  ❌ \"{issue['text']}\" — {issue['issues']}")
            all_issues.append(('default', issue))
    else:
        print(f"  ✅ Clean ({result['total']} buttons)")
    
    for tab_name in TABS:
        # Open sidebar
        snap = agent('snapshot -i')
        open_ref = find_ref(snap, 'Open sidebar')
        if open_ref:
            agent(f'click @{open_ref}')
            time.sleep(1)
        
        # Find tab
        snap = agent('snapshot -i')
        tab_ref = find_ref(snap, tab_name)
        if not tab_ref:
            print(f"\n=== {tab_name} === (tab not found)")
            continue
        
        # Click tab
        agent(f'click @{tab_ref}')
        time.sleep(0.5)
        agent('press Escape')  # Close sidebar
        time.sleep(2.5)
        
        # Audit buttons
        print(f"\n=== {tab_name} ===")
        result = audit_buttons()
        issues = result['issues']
        if isinstance(issues, str):
            issues = json.loads(issues)
        
        if issues:
            for issue in issues:
                print(f"  ❌ \"{issue['text']}\" — {issue['issues']}")
                all_issues.append((tab_name, issue))
        else:
            print(f"  ✅ Clean ({result['total']} buttons)")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY: {len(all_issues)} issues found across {len(TABS)+1} views")
    if all_issues:
        # Group by issue type
        by_type = {}
        for tab, issue in all_issues:
            for t in issue['issues'].split(','):
                by_type.setdefault(t, []).append((tab, issue['text']))
        for issue_type, occurrences in sorted(by_type.items()):
            print(f"\n  {issue_type} ({len(occurrences)} occurrences):")
            for tab, text in occurrences[:5]:
                print(f"    [{tab}] \"{text}\"")
            if len(occurrences) > 5:
                print(f"    ... and {len(occurrences)-5} more")
    
    agent('close')

if __name__ == '__main__':
    main()
