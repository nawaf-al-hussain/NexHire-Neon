# Pipeline Interface Redesign - UI/UX Specification

> **Design System**: This specification follows the [NexHire Design System Guide](plans/NexHire-Design-System-Guide.md)

## Overview

This document outlines a complete redesign of the **Application Pipeline** interface in the Recruiter Dashboard. The goal is to transform the current cramped, overwhelming modal into an intuitive, efficient, and visually appealing workflow tool.

---

## Table of Contents

1. [Design System Alignment](#design-system-alignment)
2. [Current Problems](#current-problems)
3. [Design Principles](#design-principles)
4. [New Layout Structure](#new-layout-structure)
5. [Component Specifications](#component-specifications)
6. [Visual Design](#visual-design)
7. [Interaction Patterns](#interaction-patterns)
8. [New Features](#new-features)
9. [Implementation Priority](#implementation-priority)

---

## Design System Alignment

This specification strictly follows the [NexHire Design System Guide](plans/NexHire-Design-System-Guide.md). All components use:

### Color Tokens
| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary | `indigo-600` | Main actions, highlights |
| Success | `emerald-500` | Hired status, high match |
| Warning | `amber-500` | Screening, medium match |
| Error | `rose-500` | Rejected, low match |
| Info | `blue-500` | Interview stage |

### Typography
| Element | Classes |
|---------|----------|
| Page Title | `text-lg font-black uppercase tracking-tighter` |
| Section Header | `text-sm font-black uppercase tracking-widest` |
| Label | `text-[10px] font-black uppercase tracking-widest` |
| Micro Label | `text-[9px] font-black uppercase tracking-widest` |
| Body | `text-xs font-medium` or `text-xs font-bold` |
| Stat Number | `text-3xl font-black` |

### Spacing & Radius
| Element | Classes |
|---------|----------|
| Card Container | `glass-card p-8 rounded-[2.5rem]` |
| Header Card | `glass-card rounded-[3rem] p-8` |
| Small Card | `glass-card p-6 rounded-[2rem]` |
| Compact Card | `p-4` |
| Buttons | `rounded-2xl` |
| Badges | `rounded-full` |

### Component Patterns
All components follow these patterns from the Design System:
- Glass card containers with `glass-card` class
- Icon headers with `flex items-center gap-3`
- Proper loading states with `Loader2 animate-spin`
- Empty states with `border-2 border-dashed`

---

## Current Problems

| Issue | Description | Impact |
|-------|-------------|--------|
| **Modal Overwhelm** | Full-screen takeover causes disorientation | Users hesitate to open pipeline |
| **Card Clutter** | 8+ data points crammed in small space | Hard to scan and compare |
| **Unclear Actions** | Buttons lack visual hierarchy | Users don't know what to click |
| **No Context** | Can't see overall job progress | No sense of pipeline health |
| **Poor Empty States** | Dashed borders with minimal guidance | Unclear next steps |
| **Fixed Columns** | No flexibility for varying candidate volumes | Wasted space or overflow |
| **No Search/Filter** | Must scroll through all candidates | Inefficient for large pools |

---

## Design Principles

### 1. Progressive Disclosure
Show essential information by default, reveal details on interaction (hover, click).

### 2. Visual Efficiency
Every pixel should convey meaning or enable action. Remove decorative elements.

### 3. Flow-Oriented
Design for the recruiter's mental model: **Assess → Compare → Decide → Act**.

### 4. Contextual Awareness
Always show pipeline health (counts, conversion rates, bottlenecks).

### 5. Delightful Micro-interactions
Small animations create polish and provide clear feedback.

---

## New Layout Structure

### Overall Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (64px)                                                          │
│  [← Back]  Senior React Developer  •  NYC  •  3 Openings    [Search] [⚙️]  │
├────────────────┬───────────────────────────────────────────────────────────────┤
│                │                                                               │
│   SIDEBAR      │   MAIN CONTENT AREA                                          │
│   (280px)      │   (Flexible)                                                 │
│                │                                                               │
│  - Job Stats   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  - Filters     │   │ APPLIED │ │SCREENING│ │INTERVIEW│ │  HIRED  │          │
│  - Quick       │   │   (12)  │ │   (5)   │ │   (3)   │ │   (2)   │          │
│    Actions     │   │         │ │         │ │         │ │         │          │
│                │   │ [Cards] │ │ [Cards] │ │ [Cards] │ │ [Cards] │          │
│                │   │         │ │         │ │         │ │         │          │
│                │   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                │                                                               │
├────────────────┴───────────────────────────────────────────────────────────────┤
│  FOOTER BAR (48px) - Stage Conversion Rates: Applied→Screening 42%         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dimensions

- **Modal Size**: `max-w-[1600px] h-[90vh]` - Not fullscreen, leaves breathing room
- **Sidebar**: Fixed `280px` width, collapsible to `64px` icons-only
- **Stage Columns**: Flexible width, min `260px`, max `360px`
- **Cards**: Full column width with `16px` padding

---

## Component Specifications

### 1. Header Bar

> Follows: **Header Card Pattern** from Design System (Section 2.3)

```jsx
// Layout - follows glass-card rounded-[3rem] pattern
<div className="h-16 flex items-center justify-between px-6 bg-[var(--bg-accent)] border-b border-[var(--border-primary)]">

  // Left: Back + Job Title
  <div className="flex items-center gap-4">
    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-all">
      <ChevronLeft size={20} />
    </button>
    <div>
      <h2 className="text-lg font-black uppercase tracking-tighter">{job.JobTitle}</h2>
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{job.Location} • {vacanciesLeft} openings</p>
    </div>
  </div>

  // Center: Search - follows Input Field Pattern
  <div className="flex-1 max-w-md mx-8">
    <input 
      type="text" 
      placeholder="Search candidates..." 
      className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500"
    />
  </div>

  // Right: Actions - follows Icon Button Pattern
  <div className="flex items-center gap-2">
    <button className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-all" title="View Toggle">
      <LayoutGrid size={18} />
    </button>
    <button className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-all" title="Export">
      <Download size={18} />
    </button>
  </div>
</div>
```

### 2. Sidebar Panel

> Follows: **Standard Card Structure** and **Stat Card Pattern** from Design System

```jsx
// Sections - 280px width, glass-card pattern
<div className="w-[280px] bg-[var(--bg-accent)] border-r border-[var(--border-primary)] p-4 flex flex-col gap-6 overflow-y-auto">

  // Job Health Score - follows Stat Card Pattern
  <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
    <div className="flex items-center gap-3 mb-2">
      <TrendingUp size={18} className="text-indigo-500" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Pipeline Health</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
        <TrendingUp className="text-emerald-500" size={24} />
      </div>
      <div>
        <p className="text-3xl font-black">72%</p>
        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Conversion Rate</p>
      </div>
    </div>
  </div>

  // Stage Breakdown - follows List Item Pattern
  <div>
    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
      By Stage
    </h3>
    <div className="space-y-2">
      {stages.map(stage => (
        <div key={stage.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-indigo-500/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${stage.color}`} />
            <span className="text-xs font-bold">{stage.name}</span>
          </div>
          <span className="text-[10px] font-black bg-[var(--bg-accent)] px-3 py-1 rounded-full">{stage.count}</span>
        </div>
      ))}
    </div>
  </div>

  // Quick Filters - Filter Chips
  <div>
    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
      Quick Filters
    </h3>
    <div className="flex flex-wrap gap-2">
      <FilterChip label="High Match (>80%)" active />
      <FilterChip label="New Today" />
      <FilterChip label="Needs Review" />
    </div>
  </div>

  // Bulk Actions - follows Primary Button Pattern
  <div className="mt-auto pt-4 border-t border-[var(--border-primary)]">
    <button className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
      <Users size={16} />
      Advance Selected (3)
    </button>
  </div>
</div>

// FilterChip component
const FilterChip = ({ label, active }) => (
  <button className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
    active 
      ? 'bg-indigo-600 text-white' 
      : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-indigo-500/30'
  }`}>
    {label}
  </button>
);
```

### 3. Stage Column

```jsx
<div className="min-w-[280px] max-w-[320px] flex flex-col">

  // Column Header
  <div className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-t-2xl border-x border-t border-[var(--border-primary)]">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${stage.bgColor}`}>
        <stage.icon size={16} className={stage.color} />
      </div>
      <div>
        <h3 className="text-sm font-black">{stage.name}</h3>
        <p className="text-[10px] text-[var(--text-muted)]">{stage.count} candidates</p>
      </div>
    </div>
    <button className="p-1 hover:bg-[var(--bg-secondary)] rounded">
      <MoreHorizontal size={16} />
    </button>
  </div>

  // Column Body
  <div className="flex-1 p-3 bg-[var(--bg-secondary)] border-x border-b border-[var(--border-primary)] rounded-b-2xl overflow-y-auto">
    {candidates.map(candidate => (
      <CandidateCard key={candidate.id} data={candidate} />
    ))}
  </div>
</div>
```

### 4. Candidate Card (Redesigned)

```jsx
// Layout
<div className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl p-4 mb-3 hover:border-indigo-500/30 transition-all cursor-pointer group">

  // Top Row: Avatar + Name + Match Score
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
        {candidate.initials}
      </div>
      <div>
        <h4 className="text-sm font-bold">{candidate.FullName}</h4>
        <p className="text-[10px] text-[var(--text-muted)]">{candidate.ExperienceLabel}</p>
      </div>
    </div>
    <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${
      candidate.MatchScore >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
      candidate.MatchScore >= 60 ? 'bg-amber-500/20 text-amber-500' :
      'bg-rose-500/20 text-rose-500'
    }`}>
      {candidate.MatchScore}% Match
    </div>
  </div>

  // Match Score Bar
  <div className="mb-3">
    <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
        style={{ width: `${candidate.MatchScore}%` }}
      />
    </div>
  </div>

  // Skills (top 3)
  <div className="flex flex-wrap gap-1 mb-3">
    {candidate.topSkills.slice(0, 3).map(skill => (
      <span key={skill} className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[10px] font-medium rounded-full">
        {skill}
      </span>
    ))}
    {candidate.topSkills.length > 3 && (
      <span className="px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
        +{candidate.topSkills.length - 3}
      </span>
    )}
  </div>

  // Bottom Row: Time in Stage + Actions
  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
    <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
      <Clock size={12} />
      <span>{candidate.daysInStage} days</span>
    </div>
    
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => { e.stopPropagation(); onViewProfile(candidate); }}
        className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg"
        title="View Profile"
      >
        <User size={14} />
      </button>
      {stage.id < 4 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onAdvance(candidate); }}
          className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg"
          title="Advance"
        >
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  </div>
</div>
```

### 5. Footer Stats Bar

```jsx
<div className="h-12 bg-[var(--bg-accent)] border-t border-[var(--border-primary)] px-6 flex items-center justify-between">

  // Conversion Metrics
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Applied → Screening</span>
      <span className="text-sm font-bold text-indigo-500">42%</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Screening → Interview</span>
      <span className="text-sm font-bold text-indigo-500">60%</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Interview → Hired</span>
      <span className="text-sm font-bold text-emerald-500">67%</span>
    </div>
  </div>

  // Legend
  <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
    <span>Avg. Time to Hire: <strong className="text-[var(--text-primary)]">14 days</strong></span>
    <span>•</span>
    <span>Total Candidates: <strong className="text-[var(--text-primary)]">22</strong></span>
  </div>
</div>
```

---

## Visual Design

### Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| **Stage: Applied** | `text-slate-400` | New applications |
| **Stage: Screening** | `text-indigo-400` | Being reviewed |
| **Stage: Interview** | `text-amber-400` | In process |
| **Stage: Hired** | `text-emerald-500` | Success state |
| **Stage: Rejected** | `text-rose-500` | Closed state |
| **Match: High** | `bg-emerald-500/20 text-emerald-500` | >80% match |
| **Match: Medium** | `bg-amber-500/20 text-amber-500` | 60-80% match |
| **Match: Low** | `bg-rose-500/20 text-rose-500` | <60% match |

### Typography

| Element | Style |
|---------|-------|
| **Stage Title** | `text-sm font-black uppercase tracking-widest` |
| **Candidate Name** | `text-sm font-bold` |
| **Meta Text** | `text-[10px] text-[var(--text-muted)]` |
| **Stats Numbers** | `text-2xl font-black` |

### Animations

| Interaction | Animation |
|-------------|-----------|
| **Card Hover** | `hover:border-indigo-500/30 hover:translate-y-[-2px]` |
| **Stage Enter** | `animate-in slide-in-from-bottom-2 fade-in duration-200` |
| **Card Drag** | `scale-105 shadow-2xl rotate-2` |
| **Button Click** | `active:scale-95` |
| **Loading** | `animate-pulse` on skeleton cards |

---

## Interaction Patterns

### 1. Candidate Selection

- **Single Click**: Select/deselect candidate (checkbox appears)
- **Double Click**: Open candidate profile modal
- **Drag**: Move between stages (if implemented)

### 2. Stage Actions

- **Hover on Stage Header**: Shows "Add Filter" button
- **Click Stage Count**: Filters to show only that stage
- **Drag Column Edge**: Resize column width

### 3. Quick Actions

- **Hover Card**: Reveal action buttons (View Profile, Advance)
- **Right-Click Card**: Context menu (View, Advance, Reject, Schedule Interview)

### 4. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate cards |
| `Enter` | Open selected candidate |
| `→` | Advance selected |
| `←` | Move back |
| `R` | Reject |
| `/` | Focus search |
| `Esc` | Close modal |

---

## New Features

### 1. View Toggles

- **Kanban View** (default): Current column layout
- **List View**: Table format with sortable columns
- **Compact View**: Smaller cards, more visible at once

### 2. Advanced Filtering

- Match score range slider
- Skills filter (multi-select)
- Date range picker
- Experience level
- Location proximity

### 3. Bulk Operations

- Select multiple candidates with checkboxes
- Bulk advance to next stage
- Bulk reject with shared reason
- Bulk schedule interviews

### 4. Stage Analytics

- Average time in stage
- Conversion rate to next stage
- Bottleneck detection (highlight stages with >X candidates stuck >Y days)

### 5. Candidate Quick View

- Hover card with expanded info
- Mini profile: skills, experience, match details
- One-click actions without leaving pipeline

### 6. Interview Integration

- Show scheduled interview dates on cards in Interview stage
- Quick reschedule button
- Interview feedback scores display

---

## Implementation Priority

### Phase 1: Visual Refresh (High Impact, Low Effort)

1. ✅ New card design with better spacing
2. ✅ Sidebar with pipeline health stats
3. ✅ Improved header with search
4. ✅ Footer with conversion metrics
5. ✅ Better empty states

**Estimated Effort**: 4-6 hours

### Phase 2: Interaction Improvements (Medium Impact, Medium Effort)

1. ✅ Hover reveals actions on cards
2. ✅ Keyboard shortcuts
3. ✅ View toggles (Kanban/List)
4. ✅ Better loading states

**Estimated Effort**: 6-8 hours

### Phase 3: Advanced Features (High Impact, High Effort)

1. ⬜ Drag & drop between stages
2. ⬜ Bulk selection and actions
3. ⬜ Advanced filtering
4. ⬜ Stage analytics

**Estimated Effort**: 12-16 hours

---

## API Enhancements Needed

The backend may need updates to support new features:

```js
// New endpoint for pipeline stats
GET /api/jobs/:id/pipeline-stats
// Returns: { totalCandidates, byStage: {...}, avgTimeToHire, conversionRates: {...} }

// New endpoint for candidate skills (for card display)
GET /api/candidates/:id/skills-summary
// Returns: { topSkills: [...], verifiedCount }

// New endpoint for bulk status update
PUT /api/applications/bulk-status
// Body: { applicationIds: [...], statusId, rejectionReason? }
```

---

## Summary

This redesign transforms the pipeline from a cluttered modal into a **professional recruitment command center**. Key improvements:

1. **Better Information Architecture** - Sidebar for context, main area for work
2. **Improved Card Design** - Scannable, with progressive disclosure
3. **Visual Hierarchy** - Clear stage colors, match indicators, action buttons
4. **Pipeline Health** - Always-visible conversion metrics
5. **Efficient Interactions** - Hover reveals, keyboard shortcuts, bulk actions

The result is a pipeline that feels **purpose-built** for recruiters rather than an afterthought.
