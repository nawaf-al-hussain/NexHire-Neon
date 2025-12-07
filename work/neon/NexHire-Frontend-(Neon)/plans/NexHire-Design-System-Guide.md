# NexHire Design System Guide

## Executive Summary

This document establishes the **Gold Standard Design System** for NexHire, derived from the most consistent and well-implemented components across the codebase. All future development and refactoring should adhere to these specifications to ensure visual consistency.

---

## 1. Design Token Reference

### 1.1 Color Palette

#### Primary Brand Colors
| Token | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| Primary | `#6366f1` | `#6366f1` | `indigo-500` |
| Primary Dark | `#4f46e5` | `#4f46e5` | `indigo-600` |
| Primary Light | `#818cf8` | `#818cf8` | `indigo-400` |

#### Semantic Status Colors
| Status | Color | Tailwind Classes |
|--------|-------|------------------|
| Success/Pass | Emerald | `text-emerald-500 bg-emerald-500/10 border-emerald-500/20` |
| Warning/Pending | Amber | `text-amber-500 bg-amber-500/10 border-amber-500/20` |
| Error/Fail | Rose | `text-rose-500 bg-rose-500/10 border-rose-500/20` |
| Info | Blue | `text-blue-500 bg-blue-500/10 border-blue-500/20` |
| Special | Purple | `text-purple-500 bg-purple-500/10 border-purple-500/20` |

#### CSS Variable System
```css
/* Add to index.css @theme block */
--accent: #6366f1;
--accent-hover: #4f46e5;
--success: #10b981;
--warning: #f59e0b;
--error: #f43f5e;
--info: #3b82f6;
```

### 1.2 Typography Scale

| Element | Size | Weight | Tracking | Tailwind Classes |
|---------|------|--------|----------|------------------|
| Page Title | 18-20px | 900 | -0.025em | `text-lg font-black uppercase tracking-tighter` |
| Section Header | 14px | 900 | 0.1em | `text-sm font-black uppercase tracking-widest` |
| Card Title | 14px | 900 | 0.1em | `text-sm font-black uppercase tracking-widest` |
| Body Text | 12px | 500-700 | normal | `text-xs font-medium` or `text-xs font-bold` |
| Label | 10px | 900 | 0.2em | `text-[10px] font-black uppercase tracking-widest` |
| Micro Label | 9px | 900 | 0.2em | `text-[9px] font-black uppercase tracking-widest` |
| Stat Number | 30-48px | 900 | normal | `text-3xl font-black` to `text-5xl font-black` |

### 1.3 Spacing System

| Context | Padding | Tailwind Classes |
|---------|---------|------------------|
| Card Container | 32px | `p-8` |
| Section Header | 32px | `p-8` |
| Small Card | 24px | `p-6` |
| Compact Card | 16px | `p-4` |
| Grid Gap (Large) | 32px | `gap-8` |
| Grid Gap (Medium) | 24px | `gap-6` |
| Grid Gap (Small) | 16px | `gap-4` |
| Section Spacing | 32-48px | `space-y-8` or `space-y-12` |

### 1.4 Border Radius Scale

| Element | Radius | Tailwind Classes |
|---------|--------|------------------|
| Major Cards/Panels | 40px | `rounded-[2.5rem]` |
| Header Cards | 48px | `rounded-[3rem]` |
| Buttons (Primary) | 16px | `rounded-2xl` |
| Input Fields | 16px | `rounded-2xl` |
| Badges/Tags | 9999px | `rounded-full` |
| Small Elements | 12px | `rounded-xl` |
| Icons Containers | 16-24px | `rounded-2xl` |

### 1.5 Shadow System

```css
/* Card shadows - use glass-card class */
.glass-card {
  @apply bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-xl;
}

/* Colored shadows for emphasis */
.shadow-indigo { @apply shadow-lg shadow-indigo-600/20; }
.shadow-emerald { @apply shadow-lg shadow-emerald-500/20; }
.shadow-rose { @apply shadow-lg shadow-rose-500/20; }
```

---

## 2. Component Patterns

### 2.1 Standard Card Structure

```jsx
{/* Standard Glass Card */}
<div className="glass-card p-8 rounded-[2.5rem]">
  {/* Card Header */}
  <div className="flex items-center gap-3 mb-6">
    <IconComponent className="w-5 h-5 text-indigo-500" />
    <h3 className="text-sm font-black uppercase tracking-widest">Card Title</h3>
  </div>
  
  {/* Card Content */}
  <div className="space-y-4">
    {/* Content here */}
  </div>
</div>
```

### 2.2 Header Card Pattern (Admin Components)

```jsx
{/* Gradient Header Card */}
<div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
      <IconComponent size={28} />
    </div>
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight">Page Title</h2>
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
        Subtitle description
      </p>
    </div>
  </div>
</div>
```

### 2.3 Stat Card Pattern

```jsx
{/* Stat Card */}
<div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
  <div className="flex items-center gap-3 mb-2">
    <IconComponent size={18} className="text-indigo-500" />
    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Label</span>
  </div>
  <div className="text-3xl font-black">{value}</div>
  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Description</p>
</div>
```

### 2.4 List Item Pattern

```jsx
{/* List Item */}
<div className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
  <div className="flex items-center gap-3">
    <IconComponent className="w-5 h-5 text-emerald-500" />
    <span className="text-xs font-black">Item Label</span>
  </div>
  <span className="text-xs font-black text-emerald-500">+value</span>
</div>
```

### 2.5 Status Badge Pattern

```jsx
{/* Status Badge */}
<span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
  {status}
</span>

{/* Status Color Helper */}
const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
    case 'Pass':
    case 'Hired':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'Pending':
    case 'Screening':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'Rejected':
    case 'Fail':
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    default:
      return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
  }
};
```

### 2.6 Button Patterns

```jsx
{/* Primary Action Button - Use indigo-600 */}
<button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2">
  <IconComponent size={16} />
  Button Label
</button>

{/* Active Tab - Use indigo-600 */}
<button className="px-6 py-3 text-sm font-bold rounded-xl bg-indigo-600 text-white">
  Active Tab
</button>

{/* Secondary Button */}
<button className="px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
  Secondary
</button>

{/* Danger Button */}
<button className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
  Danger
</button>

{/* Icon Button */}
<button className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-all">
  <IconComponent size={18} />
</button>
```

### 2.7 Input Field Pattern

```jsx
{/* Select Dropdown */}
<select className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500">
  <option value="">Select option...</option>
  {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
</select>

{/* Text Input */}
<input
  type="text"
  placeholder="Placeholder text..."
  className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
/>
```

### 2.8 Loading State Pattern

```jsx
{/* Standard Loading */}
<div className="flex flex-col items-center justify-center py-20">
  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
    Loading Content...
  </p>
</div>

{/* Skeleton Loading */}
<div className="glass-card h-96 rounded-[3rem] animate-pulse"></div>
```

### 2.9 Empty State Pattern

```jsx
{/* Empty State */}
<div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
  <IconComponent className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
  <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
    No data available.
  </p>
  <p className="text-[10px] text-[var(--text-muted)] opacity-60">
    Additional description text here.
  </p>
</div>
```

### 2.10 Table Pattern

```jsx
{/* Standard Table */}
<div className="glass-card rounded-[3rem] p-8">
  <h3 className="text-lg font-black uppercase tracking-tight mb-6">Table Title</h3>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
          <th className="text-left pb-4 pr-4">Column 1</th>
          <th className="text-left pb-4 pr-4">Column 2</th>
          <th className="text-left pb-4">Column 3</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border-primary)]">
        {data.map((item, i) => (
          <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
            <td className="py-4 pr-4">
              <span className="text-sm font-black">{item.field1}</span>
            </td>
            <td className="py-4 pr-4">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{item.field2}</span>
            </td>
            <td className="py-4">
              <span className="text-xs font-bold text-indigo-500">{item.field3}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## 3. Page Layout Patterns

### 3.1 Standard Page Container

```jsx
{/* Page Container */}
<div className="space-y-8">
  {/* Page Header */}
  <div className="flex items-center gap-3 mb-6">
    <IconComponent className="w-5 h-5 text-indigo-500" />
    <h2 className="text-lg font-black uppercase tracking-tighter">Page Title</h2>
  </div>
  
  {/* Content Sections */}
  <div className="space-y-8">
    {/* Sections here */}
  </div>
</div>
```

### 3.2 Grid Layouts

```jsx
{/* 4-Column Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>

{/* 2-Column Content Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Content cards */}
</div>

{/* 3-Column Feature Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Feature cards */}
</div>
```

---

## 4. Animation Classes

```jsx
/* Entry animations */
className="animate-in fade-in slide-in-from-bottom-8 duration-1000"

/* Hover transitions */
className="transition-all duration-300"
className="transition-colors duration-300"

/* Interactive feedback */
className="active:scale-[0.98]"

/* Loading spinners */
className="animate-spin"
className="animate-pulse"
```

---

## 5. Icon Usage Guidelines

| Icon Size | Context | Tailwind Class |
|-----------|---------|----------------|
| 28px | Header icons | `size={28}` |
| 18-20px | Card headers | `w-5 h-5` |
| 16px | Buttons, badges | `size={16}` |
| 14px | Inline, small badges | `size={14}` |
| 12px | Micro elements | `size={12}` |

---

## 6. Do's and Don'ts

### Do's
- Always use `glass-card` class for card containers
- Use CSS variables for theme-aware colors
- Apply `font-black` for all headers and labels
- Use uppercase + tracking-widest for labels
- Include loading states for async content
- Provide empty states with helpful guidance
- **Use `indigo-600` for active tabs and buttons (not indigo-500)**

### Don'ts
- Don't use hardcoded colors (e.g., `#6366f1`) - use Tailwind classes
- Don't mix border-radius values inconsistently
- Don't skip the icon in card headers
- Don't use `font-normal` for important text
- Don't forget hover states on interactive elements

---

## 7. Dashboard Layout & Shell

### 7.1 Main Layout Structure

```jsx
{/* Dashboard Shell */}
<div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
  {/* Sidebar */}
  <aside className="w-80 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] p-8 flex flex-col">
    {/* Logo */}
    <div className="flex items-center gap-4 mb-12">
      <div className="w-10 h-10 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
        <img src={logo} className="w-full h-full object-contain" />
      </div>
      <span className="font-black text-2xl tracking-tighter uppercase">NexHire</span>
    </div>
    
    {/* Navigation */}
    <nav className="space-y-2 flex-1">
      {navigation.map(item => (
        <button className={`flex items-center justify-between w-full p-4 rounded-2xl ${item.active ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-[var(--bg-accent)]'}`}>
          <div className="flex items-center gap-4">
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </div>
          {item.badge && <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full">{item.badge}</span>}
        </button>
      ))}
    </nav>
    
    {/* User Profile */}
    <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-accent)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border flex items-center justify-center">
          <User size={20} className="text-indigo-500" />
        </div>
        <div>
          <div className="text-xs font-black">{user.Username}</div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{user.Role}</div>
        </div>
      </div>
    </div>
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 flex flex-col">
    {/* Header */}
    <header className="h-24 border-b border-[var(--border-primary)] flex items-center justify-between px-12 bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-40">
      <div>
        <div className="text-indigo-500 font-bold text-[10px] uppercase tracking-[.4em]">{subtitle}</div>
        <h1 className="text-xl font-black tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center">
          <Sun size={18} />
        </button>
        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
      </div>
    </header>
    
    {/* Page Content */}
    <div className="p-12 overflow-y-auto">
      {children}
    </div>
  </main>
</div>
```

### 7.2 Sidebar Navigation Patterns

| Pattern | Class | Description |
|---------|-------|-------------|
| Active Item | `bg-indigo-500/10 text-indigo-500 font-bold` | Current page highlight |
| Hover State | `hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)]` | Mouse over state |
| Nav Label | `text-sm tracking-tight` | Navigation item text |
| Nav Icon | `w-5 h-5` | Icon size in navigation |
| Badge | `px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full` | Notification badge |

### 7.3 Header Patterns

| Element | Class | Description |
|---------|-------|-------------|
| Header Height | `h-24` | Standard header height |
| Subtitle | `text-indigo-500 font-bold text-[10px] uppercase tracking-[.4em]` | Page section label |
| Title | `text-xl font-black tracking-tight` | Page main title |
| Header BG | `bg-[var(--header-bg)] backdrop-blur-md` | Sticky header with blur |

---

## 8. Charts & Data Visualization

### 8.1 Chart Container

```jsx
{/* Chart Wrapper */}
<div className="h-[350px] w-full mt-4">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      {/* Chart Content */}
    </PieChart>
  </ResponsiveContainer>
</div>
```

### 8.2 Tooltip Styling

```jsx
<Tooltip
  contentStyle={{
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '1rem',
    fontSize: '11px',
    fontWeight: 'bold'
  }}
/>
```

### 8.3 Chart Color Palette

```js
const CHART_COLORS = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
];
```

### 8.4 Legend Styling

```jsx
<Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  wrapperStyle={{
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }}
/>
```

---

## 9. Modal Patterns

### 9.1 Standard Modal

```jsx
{/* Modal Overlay */}
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
  {/* Modal Content */}
  <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[var(--border-primary)] animate-in zoom-in-95 duration-300">
    {/* Header */}
    <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between">
      <h2 className="text-xl font-black">{title}</h2>
      <button onClick={onClose} className="p-3 rounded-xl bg-[var(--bg-accent)] hover:bg-rose-500/10 hover:text-rose-500">
        <X size={20} />
      </button>
    </div>
    {/* Body */}
    <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
      {children}
    </div>
  </div>
</div>
```

### 9.2 Modal Z-Index Levels

| Context | Z-Index | Class |
|---------|---------|-------|
| Sidebar | 50 | `z-50` |
| Header | 40 | `z-40` |
| Modal | 110 | `z-[110]` |
| Dropdown | 50 | `z-50` |
| Tooltip | 60 | `z-60` |

### 9.3 Modal Animations

| Animation | Class |
|-----------|-------|
| Entry | `animate-in zoom-in-95 duration-300` |
| Exit | `animate-out fade-out duration-200` |

---

## 10. Form Patterns

### 10.1 Complex Form with Skills

```jsx
{/* Skill Selector */}
<div className="space-y-4">
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Search skills..."
      className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold"
    />
    <button className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black">
      <Search size={18} />
    </button>
  </div>
  
  {/* Selected Skills Tags */}
  <div className="flex flex-wrap gap-2">
    {selectedSkills.map(skill => (
      <span key={skill.id} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm font-bold text-indigo-500 flex items-center gap-2">
        {skill.name}
        <button onClick={() => removeSkill(skill.id)}><X size={14} /></button>
      </span>
    ))}
  </div>
</div>
```

### 10.2 Toggle Switch

```jsx
{/* Toggle */}
<button
  onClick={() => setValue(!value)}
  className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-[var(--bg-accent)]'}`}
>
  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
</button>
```

### 10.3 Range Slider

```jsx
<input
  type="range"
  min="0"
  max="10"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full h-2 bg-[var(--bg-accent)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
/>
```

---

## 11. Navigation Components

### 11.1 Tabs

```jsx
{/* Tab Navigation */}
<div className="flex gap-2 border-b border-[var(--border-primary)]">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all ${
        activeTab === tab.id
          ? 'bg-indigo-500 text-white'
          : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### 11.2 Breadcrumbs

```jsx
{/* Breadcrumb */}
<div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
  <a href="/" className="hover:text-indigo-500">Home</a>
  <ChevronRight size={14} />
  <a href="/jobs" className="hover:text-indigo-500">Jobs</a>
  <ChevronRight size={14} />
  <span className="text-[var(--text-primary)]">Job Details</span>
</div>
```

### 11.3 Pagination

```jsx
{/* Pagination */}
<div className="flex items-center justify-between p-4">
  <button className="px-4 py-2 bg-[var(--bg-accent)] rounded-xl text-sm font-bold">Previous</button>
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map(page => (
      <button key={page} className={`w-10 h-10 rounded-xl font-bold ${page === current ? 'bg-indigo-500 text-white' : 'bg-[var(--bg-accent)]'}`}>
        {page}
      </button>
    ))}
  </div>
  <button className="px-4 py-2 bg-[var(--bg-accent)] rounded-xl text-sm font-bold">Next</button>
</div>
```

---

## 12. User Interface Elements

### 12.1 Avatar

```jsx
{/* User Avatar */}
<div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
  <User size={20} />
</div>

{/* Avatar with Image */}
<div className="w-12 h-12 rounded-2xl overflow-hidden bg-[var(--bg-accent)]">
  <img src={avatarUrl} className="w-full h-full object-cover" />
</div>
```

### 12.2 Progress Bar

```jsx
{/* Progress Bar */}
<div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
  <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: '75%' }} />
</div>
```

### 12.3 Skeleton Loading

```jsx
{/* Card Skeleton */}
<div className="glass-card rounded-[2.5rem] p-8 animate-pulse">
  <div className="h-4 bg-[var(--bg-accent)] rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-[var(--bg-accent)] rounded w-1/2"></div>
</div>
```

### 12.4 Notification Badge

```jsx
{/* Badge on Icon */}
<div className="relative">
  <Bell size={20} />
  <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
</div>

{/* Count Badge */}
<span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full">
  5
</span>
```

---

## 13. Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | `sm:` prefix |
| Tablet | 640px - 1024px | `md:` prefix |
| Desktop | > 1024px | `lg:` prefix |
| Large | > 1280px | `xl:` prefix |

### Common Responsive Patterns

```jsx
{/* Sidebar hidden on mobile, visible on lg */}
<aside className="fixed lg:static inset-y-0 -translate-x-full lg:translate-x-0">

{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

{/* Responsive text */}
<h1 className="text-xl lg:text-2xl font-black">
```

---

## 14. Utility Classes Reference

### 14.1 Scrollbar Styling

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--bg-accent);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 3px;
}
```

### 14.2 Text Truncation

```jsx
{/* Single line truncate */}
<p className="truncate">Long text...</p>

{/* Multi-line clamp */}
<p className="line-clamp-2">Long text...</p>
```

### 14.3 Focus States

```jsx
{/* Focus ring */}
<button className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]">

{/* Focus visible only */}
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
```

### 14.4 Selection Color

```jsx
{/* Custom text selection */}
<div className="selection:bg-indigo-500/30">
  Selectable text
</div>
```
