/**
 * Test all tabs in a dashboard for mobile overflow issues.
 * Usage: node test_mobile_tabs.js <username> <password>
 * Logs in, opens sidebar, clicks each tab, checks for overflow.
 */
const { spawn } = require('child_process');

const USERNAME = process.argv[2] || 'admin1';
const BASE = 'https://nex-hire-neon.vercel.app';

// Tabs to test (by visible text in the sidebar)
const TABS_TO_TEST = process.argv[3]
    ? process.argv[3].split(',')
    : ['Core Analytics', 'Market Intel', 'Salary Transp', 'Remote Work', 'Career Path',
       'Recruiter Perf', 'Referral Intelligence', 'Diversity Goals', 'Bias Logs',
       'System Reports', 'Consent Mgmt', 'Vacancy Util', 'Email Queue', 'SQL Views'];

async function run(cmd) {
    return new Promise((resolve) => {
        const [cmdName, ...args] = cmd.split(' ');
        const proc = spawn(cmdName, args, { stdio: 'pipe' });
        let out = '';
        proc.stdout.on('data', d => out += d);
        proc.stderr.on('data', d => out += d);
        proc.on('close', () => resolve(out));
    });
}

async function main() {
    // Set viewport
    await run('agent-browser set viewport 375 812');
    await run('agent-browser open ' + BASE + '/login');
    await new Promise(r => setTimeout(r, 3000));

    // Login
    const snapshot1 = await run('agent-browser snapshot -i');
    const usernameRef = (snapshot1.match(/textbox "USERNAME"[^[]*\[ref=(e\d+)\]/) || [])[1];
    const submitRef = (snapshot1.match(/button "Sign in"[^[]*\[ref=(e\d+)\]/) || [])[1];
    if (usernameRef) await run(`agent-browser fill @${usernameRef} "${USERNAME}"`);
    if (submitRef) await run(`agent-browser click @${submitRef}`);
    await new Promise(r => setTimeout(r, 5000));

    console.log(`\nTesting ${TABS_TO_TEST.length} tabs at 375px for user ${USERNAME}:\n`);

    for (const tabName of TABS_TO_TEST) {
        // Open sidebar
        const openSnapshot = await run('agent-browser snapshot -i');
        const openRef = (openSnapshot.match(/button "Open sidebar"[^[]*\[ref=(e\d+)\]/) || [])[1];
        if (openRef) {
            await run(`agent-browser click @${openRef}`);
            await new Promise(r => setTimeout(r, 1000));
        }

        // Find the tab in the sidebar
        const sidebarSnapshot = await run('agent-browser snapshot -i');
        // Match tab by exact label
        const tabRegex = new RegExp(`button "${tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^[]*\\[ref=(e\\d+)\\]`);
        const tabRef = (sidebarSnapshot.match(tabRegex) || [])[1];

        if (!tabRef) {
            console.log(`  ❓ ${tabName}: tab not found in sidebar`);
            continue;
        }

        // Click the tab
        await run(`agent-browser click @${tabRef}`);
        await new Promise(r => setTimeout(r, 500));

        // Close sidebar (Escape)
        await run('agent-browser press Escape');
        await new Promise(r => setTimeout(r, 2500));

        // Check for overflow
        const overflowResult = await run('agent-browser eval "(() => { const v = window.innerWidth; const issues = []; document.querySelectorAll(\'div, table, h1, h2, h3, h4, p, button, input, select\').forEach(el => { const r = el.getBoundingClientRect(); if (r.right > v + 2 && r.width > 0 && r.width < 2000) { const p = el.parentElement; if (p && (p.className || \'\').includes(\'overflow\')) return; issues.push({ tag: el.tagName, w: Math.round(r.width), right: Math.round(r.right), text: (el.textContent || \'\').substring(0, 20).trim() }); } }); return JSON.stringify({ v, hasHScroll: document.body.scrollWidth > v, scrollW: document.body.scrollWidth, count: issues.length, samples: issues.slice(0, 3) }); })()"');

        try {
            const result = JSON.parse(overflowResult.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
            if (result.hasHScroll || result.count > 0) {
                console.log(`  ❌ ${tabName}: ${result.count} overflow elements, scrollW=${result.scrollW}`);
                if (result.samples.length > 0) {
                    result.samples.forEach(s => console.log(`      ${s.tag} w=${s.w} right=${s.right} text="${s.text}"`));
                }
            } else {
                console.log(`  ✅ ${tabName}: clean (no overflow)`);
            }
        } catch (e) {
            console.log(`  ⚠️  ${tabName}: couldn't parse result`);
        }
    }
}

main().catch(console.error);
