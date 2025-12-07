#!/usr/bin/env python3
"""
Test all dashboard tabs at 375px for mobile overflow issues.
Usage: python3 test_mobile_tabs.py <username> [tab1,tab2,...]
"""
import subprocess
import time
import json
import re
import sys

USERNAME = sys.argv[1] if len(sys.argv) > 1 else 'admin1'
TABS_ARG = sys.argv[2].split(',') if len(sys.argv) > 2 else None

def run(cmd):
    """Run a shell command and return stdout."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    return result.stdout + result.stderr

def agent(cmd):
    """Run an agent-browser command."""
    return run(f'agent-browser {cmd}')

def eval_js(js):
    """Run JS in the browser and return the result."""
    # Write JS to a temp file to avoid shell quoting issues
    import tempfile, os
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(js)
        f.flush()
        tmpfile = f.name
    out = agent(f'eval "$(cat {tmpfile})"')
    os.unlink(tmpfile)
    # The output is a quoted string, parse it
    out = out.strip()
    if out.startswith('"') and out.endswith('"'):
        out = out[1:-1]
    out = out.replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
    return out

def snapshot_i():
    """Get interactive snapshot."""
    return agent('snapshot -i')

def find_ref(snapshot, text):
    """Find a button ref by text."""
    # Pattern: button "TEXT" ... [ref=eXX] (ref may be inside brackets with other attrs)
    pattern = rf'button "{re.escape(text)}".*?\[.*?ref=(e\d+)\]'
    m = re.search(pattern, snapshot)
    return m.group(1) if m else None

def find_textbox_ref(snapshot, name):
    """Find a textbox ref by name."""
    pattern = rf'textbox "{re.escape(name)}".*?\[.*?ref=(e\d+)\]'
    m = re.search(pattern, snapshot)
    return m.group(1) if m else None

def main():
    # Set viewport
    agent('set viewport 375 812')
    time.sleep(0.5)

    # Open login
    agent('open https://nex-hire-neon.vercel.app/login')
    time.sleep(3)

    # Login
    snap = snapshot_i()
    username_ref = find_textbox_ref(snap, 'USERNAME')
    submit_ref = find_ref(snap, 'Sign in')

    print(f"Username ref: {username_ref}, Submit ref: {submit_ref}")

    if username_ref:
        agent(f'fill @{username_ref} "{USERNAME}"')
    if submit_ref:
        agent(f'click @{submit_ref}')
    time.sleep(5)

    # Verify we're logged in
    url = agent('get url').strip()
    print(f"URL after login: {url}")

    # Get default tabs if not specified
    if TABS_ARG is None:
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
    else:
        TABS = TABS_ARG

    print(f"\nTesting {len(TABS)} tabs at 375px:\n")

    issues_found = []

    for tab_name in TABS:
        # Open sidebar
        snap = snapshot_i()
        open_ref = find_ref(snap, 'Open sidebar')
        if open_ref:
            agent(f'click @{open_ref}')
            time.sleep(1)

        # Find tab in sidebar
        snap = snapshot_i()
        tab_ref = find_ref(snap, tab_name)

        if not tab_ref:
            print(f"  ❓ {tab_name}: tab not found")
            continue

        # Click tab
        agent(f'click @{tab_ref}')
        time.sleep(0.5)

        # Close sidebar
        run('agent-browser press Escape')
        time.sleep(2.5)

        # Check for overflow — simple one-liner to avoid quoting issues
        result_str = agent('eval "document.body.scrollWidth > window.innerWidth ? \\"OVERFLOW:\\" + document.body.scrollWidth : \\"OK:\\" + window.innerWidth"')
        result_str = result_str.strip().strip('"')
        try:
            if result_str.startswith('OVERFLOW:'):
                scroll_w = result_str.split(':')[1]
                print(f"  ❌ {tab_name}: OVERFLOW scrollW={scroll_w}")
                issues_found.append(tab_name)
            elif result_str.startswith('OK:'):
                print(f"  ✅ {tab_name}: clean")
            else:
                print(f"  ⚠️  {tab_name}: unexpected result: {result_str[:60]}")
        except:
            print(f"  ⚠️  {tab_name}: parse error: {result_str[:60]}")

    print(f"\n=== Summary ===")
    print(f"Total tabs: {len(TABS)}")
    print(f"Clean: {len(TABS) - len(issues_found)}")
    print(f"Issues: {len(issues_found)}")
    if issues_found:
        print(f"Problem tabs: {', '.join(issues_found)}")

if __name__ == '__main__':
    main()
