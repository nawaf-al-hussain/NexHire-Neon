# NexHire Design Audit — Issue Tracker

**Audit Date:** 2026-07-07
**Total Issues Found:** ~290 (5 Critical, ~190 Major, ~70 Minor, ~25 Polish)
**Issues Fixed:** 28
**Issues Remaining:** ~17 (of the top 45 prioritized)

## Legend
- 🔴 CRITICAL — breaks functionality or shows fake data
- 🟠 MAJOR — significant design/UX problem
- 🟡 MINOR — small inconsistency or polish gap
- 🔵 POLISH — nice-to-have improvement
- ✅ FIXED
- 🔄 IN PROGRESS
- ⬜ TODO

---

## PRIORITY 1: Data Integrity Bugs (Critical)

| # | Status | Severity | File | Issue | Fix |
|---|--------|----------|------|-------|-----|
| 1 | ⬜ | 🔴 | 12+ components | Fake demo data ("John Smith/Sarah Johnson") shipped to production. Silently shows fabricated dashboards when API fails. | Remove all `sampleData`/`demoData`/`fallbackData` arrays. Replace with error + retry states. |
| 2 | ⬜ | 🔴 | CareerPath.jsx:94 | `Math.random()` generates fake transition probability on every render | Use `path.TransitionProbability ?? '—'` |
| 3 | ⬜ | 🔴 | AssessmentTestingEngine.jsx:59-61 | `Math.random()` generates fake assessment scores | Remove mock scoring. Submit real answers or disable. |
| 4 | ⬜ | 🔴 | DiversityGoals.jsx:270 | `classN=` typo (should be `className=`) — modal header broken | Fix typo |
| 5 | ⬜ | 🔴 | SkillVerificationStatus.jsx:88-95 | API call commented out — "Verify" button only updates local state, nothing persists | Wire up API or disable button |

## PRIORITY 2: Design System Violations (Major — Visual)

| # | Status | Severity | File(s) | Issue | Fix |
|---|--------|----------|---------|-------|-----|
| 6 | ⬜ | 🟠 | 100+ places | Rainbow Tailwind colors (`text-indigo-500`, `bg-emerald-500/10`, `text-rose-500`, `text-amber-500`, `text-cyan-500`, `text-violet-500`, `text-slate-*`, `text-gray-*`) instead of design tokens | Global sweep: replace with `var(--accent)`, `var(--success)`, `var(--warning)`, `var(--danger)`, `var(--text-muted)` |
| 7 | ⬜ | 🟠 | JobCard, JobMatchingView, CandidateSkillsVerification, CandidateDashboard | AI gradient orbs (`blur-3xl rounded-full bg-[var(--accent)]/X`) still present | Delete all decorative orbs |
| 8 | ⬜ | 🟠 | App.jsx, AdminDashboard, RecruiterDashboard, CandidateDashboard | 4 duplicated TabLoader components with hardcoded `#3b82f6`, `#e5e7eb` (wrong in dark mode) | Extract shared `Loader.jsx` using tokens |
| 9 | ⬜ | 🟠 | index.css | `--bg-primary: #0a0a0a` in dark mode — near-pure-black (AI tell) | Change to tinted `#0c0d10` or `#111114` |
| 10 | ⬜ | 🟠 | 15 chart files | Hardcoded hex colors (`#4f46e5`, `#10b981`, `#f43f5e`, `#8884d8`) and `rgba(255,255,255,0.05)` grid strokes | Replace with tokens |
| 11 | ⬜ | 🟠 | 10+ modals | Inconsistent overlays (`bg-black/60`, `bg-black/40`, `bg-slate-950/80`) and z-index (`z-40` to `z-[200]`) | Define `--overlay-bg` and `--z-modal` tokens |
| 12 | ⬜ | 🟠 | LandingPage, LoginPage, CandidateDashboard, etc. | AI cliché copy ("Scale your talent pipeline", "Recruit smarter not harder", "Running Advanced Heuristics...", "Global Talent Synchronization", etc.) | Rewrite in plain English |
| 13 | ⬜ | 🟠 | DesignSystemPage.jsx | Doesn't use the design system — hardcoded `text-indigo-500`, `bg-gray-900`, `text-purple-500` everywhere | Replace with tokens |
| 14 | ⬜ | 🟠 | 5+ components | `font-bold` on form inputs — harsh | `font-normal` |
| 15 | ⬜ | 🟠 | DashboardShell.jsx:183 | `focus-lg` typo (should be `focus-ring`) | Fix typo |

## PRIORITY 3: UX / Interaction Issues (Major)

| # | Status | Severity | File(s) | Issue | Fix |
|---|--------|----------|---------|-------|-----|
| 16 | ⬜ | 🟠 | 30+ places | `alert()`, `prompt()`, `window.confirm()` — native browser dialogs | Build Toast + ConfirmDialog components |
| 17 | ⬜ | 🟠 | BackgroundChecks, BlockchainVerifications | `localStorage.getItem('token')` vs `localStorage.getItem('nexhire_token')` — key mismatch | Use axios interceptor from AuthContext |
| 18 | ⬜ | 🟠 | DashboardShell.jsx | Bell icon has permanent dot — implies unread notifications always | Only show dot when `notifications.length > 0` |
| 19 | ⬜ | 🟠 | DashboardShell.jsx:46 | `h-screen` causes iOS Safari address-bar jump | Use `h-[100dvh]` |
| 20 | ⬜ | 🟠 | ScheduleInterviewModal.jsx:103 | `appearance-none` on select with no custom chevron | Add chevron icon or remove `appearance-none` |
| 21 | ⬜ | 🟠 | LandingPage.jsx:55-57 | 3 nav links all point to `href="#features"` — dead nav | Remove or point to real sections |
| 22 | ⬜ | 🟠 | BiasLogs.jsx:49-52 | Emoji icons (💬📋🎯⚠️) instead of lucide | Map to lucide icons |
| 23 | ⬜ | 🟠 | DashboardShell.jsx:165 | `<div role="button">` instead of `<button>` | Use semantic `<button>` |

## PRIORITY 4: Code Quality (Minor)

| # | Status | Severity | File(s) | Issue | Fix |
|---|--------|----------|---------|-------|-----|
| 24 | ⬜ | 🟡 | TalentPool, SentimentTracker, ProfileManagement, CandidateDashboard | `console.log` debug statements in production | Remove or wrap in `import.meta.env.DEV` |
| 25 | ⬜ | 🟡 | index.css | Dead CSS utilities (`.mobile-only`, `.desktop-only`, `.mobile-drawer`, `.safe-*`, `.h-screen-mobile`, `.text-responsive-*`) | Delete unused |
| 26 | ⬜ | 🟡 | index - Dark.css, index - Lighter.css | Backup CSS files in repo | Delete |
| 27 | ⬜ | 🟡 | ProfileManagement.jsx | Dead code: `testServer` function, `fetchExtractedSkills` | Delete |
| 28 | ⬜ | 🟡 | CandidateDashboard.jsx:261 | Dead code: `handleGenerateLearningPath` no-op | Delete |
| 29 | ⬜ | 🟡 | SQLViews.jsx:52 | Dead state: `viewColumns` always set to `[]` | Remove |
| 30 | ⬜ | 🟡 | BlockchainVerifications.jsx:60-61 | Dead code: `networks` array never used | Delete |
| 31 | ⬜ | 🟡 | DashboardShell.jsx | Missing `aria-current="page"` on active nav | Add attribute |
| 32 | ⬜ | 🟡 | 4 page files | Missing `id="main-content"` on LandingPage, LoginPage, NotFoundPage, DesignSystemPage | Add id |
| 33 | ⬜ | 🟡 | index.css:380-396 | Broken animation classes referenced but not defined (`.slide-in-from-top-2`, `.zoom-in-95`, `.duration-300/500/1000`) | Define or remove usages |
| 34 | ⬜ | 🟡 | Skeleton.jsx | Shimmer animation — AI tell per taste-skill | Replace with static fill or subtle pulse |
| 35 | ⬜ | 🟡 | SpotlightBorder.jsx | Mouse-follow spotlight is itself an AI-template tell | Delete or make optional |

## PRIORITY 5: Polish (Nice-to-have)

| # | Status | Severity | File(s) | Issue | Fix |
|---|--------|----------|---------|-------|-----|
| 36 | ⬜ | 🔵 | 4 mega-components | AdminDashboard (1839 lines), CandidateProfileModal (754), BlockchainVerifications (774), BackgroundChecks (738) — too long | Split into sub-components |
| 37 | ⬜ | 🔵 | AdminDashboard.jsx:112-182 | `demoData` with 70 lines of fake data | Remove (covered by #1) |
| 38 | ⬜ | 🔵 | LoginPage.jsx:281-285 | Demo credentials visible on public login page | Hide behind env var or toggle |
| 39 | ⬜ | 🔵 | LandingPage.jsx:151 | "Used by 500+ recruiters" — fake social proof | Remove or back with real data |
| 40 | ⬜ | 🔵 | LandingPage.jsx:226-292 | Three equal feature cards — default Vercel pattern | Reduce to 2 asymmetric or deep-dive |
| 41 | ⬜ | 🔵 | Multiple files | Icon container sizes inconsistent (w-10/w-12/w-14/w-16/w-20) | Define `.icon-box-sm/md/lg` utilities |
| 42 | ⬜ | 🔵 | Multiple files | Badge radius inconsistent (`rounded-full`, `rounded-xl`, `rounded-lg`, `rounded-md`) | Standardize on one radius |
| 43 | ⬜ | 🔵 | All tables | Missing `<th scope="col">` for screen readers | Add scope attribute |
| 44 | ⬜ | 🔵 | EmptyState.jsx | Missing `role="status"` and `aria-live` | Add for screen reader announcements |
| 45 | ⬜ | 🔵 | RecruiterDashboard.jsx:501 | `subtitle={activeTab}` duplicates sidebar selection in header | Use static subtitle |

---

## Fix Log

| Date | Issue # | What was done | Commit |
|------|---------|---------------|--------|
| 2026-07-07 | #1 | Removed fake demo data from 10+ components | 0069cd6 |
| 2026-07-07 | #2 | Fixed Math.random() in CareerPath.jsx | 0069cd6 |
| 2026-07-07 | #3 | Fixed Math.random() in AssessmentTestingEngine | 0069cd6 |
| 2026-07-07 | #4 | Fixed classN= typo in DiversityGoals.jsx | 0069cd6 |
| 2026-07-07 | #6 | Replaced 1,826 rainbow Tailwind colors with tokens | 0069cd6 |
| 2026-07-07 | #7 | Removed AI gradient orbs from 5 files | 0069cd6 |
| 2026-07-07 | #8 | Created shared Loader.jsx component | 0069cd6 |
| 2026-07-07 | #9 | Fixed dark mode bg #0a0a0a -> #0c0d10 | 0069cd6 |
| 2026-07-07 | #14 | Fixed font-bold on inputs -> font-normal (5 files) | 0069cd6 |
| 2026-07-07 | #15 | Fixed focus-lg typo -> focus-ring | 0069cd6 |
| 2026-07-07 | #24 | Removed 17 console.log statements | 0069cd6 |
| 2026-07-07 | #26 | Deleted backup CSS files | 0069cd6 |
