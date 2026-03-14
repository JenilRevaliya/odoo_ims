# CoreInventory — Design System

> **Version:** 2.0.0 | **Date:** 2026-03-14  
> Single source of truth for all visual tokens, component states, and implementation notes.

---

## Token Reference

All tokens are defined in `:root` in `globals.css`. Never hardcode hex values in components — always reference tokens.

### Color Tokens

```css
/* Backgrounds */
--bg-base         /* main canvas */
--bg-surface      /* cards, panels, sidebar */
--bg-elevated     /* modals, dropdowns, bottom sheets */
--bg-hover        /* interactive hover fill */
--bg-oled         /* #000 — use on mobile OLED for battery */

/* Accent */
--accent          /* primary amber CTA, active states */
--accent-dim      /* secondary amber, subdued */
--accent-subtle   /* low-opacity amber fill (glow, alert bg) */
--accent-border   /* amber border on focused/active items */

/* Status */
--status-done     /* green */
--status-waiting  /* amber */
--status-danger   /* red */
--status-info     /* blue */
--status-draft    /* muted gray */

/* Text */
--text-primary    /* body text, labels */
--text-secondary  /* metadata, helper text */
--text-muted      /* disabled, placeholder */
--text-on-accent  /* dark text on amber background */

/* Borders */
--border          /* default dividers */
--border-subtle   /* very subtle section dividers */
--border-accent   /* amber — focus rings, active indicators */

/* Shadows */
--shadow-sm       /* 1px lift */
--shadow-md       /* card shadow */
--shadow-lg       /* modal shadow */
--shadow-accent   /* amber glow — low-stock alert */
```

### Spacing Tokens

```css
--space-1  →  4px    --space-2  →  8px    --space-3  →  12px
--space-4  →  16px   --space-5  →  20px   --space-6  →  24px
--space-8  →  32px   --space-10 →  40px   --space-12 →  48px
```

### Layout Tokens

```css
--sidebar-expanded:    240px   /* desktop sidebar */
--sidebar-collapsed:   60px    /* tablet icon rail */
--bottom-nav-height:   60px    /* mobile bottom navigation */
--touch-min:           48px    /* Fitts' Law minimum touch target */
--radius-sm:           4px
--radius-md:           8px
--radius-lg:           12px
--radius-pill:         9999px
```

### Typography Tokens (fluid `clamp()` sizes)

```css
--text-xs:    clamp(0.6875rem, 0.65rem  + 0.2vw, 0.75rem)    /* 11–12px */
--text-sm:    clamp(0.8125rem, 0.78rem  + 0.2vw, 0.875rem)   /* 13–14px */
--text-base:  clamp(0.9375rem, 0.88rem  + 0.3vw, 1.0625rem)  /* 15–17px */
--text-lg:    clamp(1.125rem,  1.05rem  + 0.4vw, 1.25rem)    /* 18–20px */
--text-xl:    clamp(1.375rem,  1.25rem  + 0.6vw, 1.625rem)   /* 22–26px */
--text-kpi:   clamp(2rem,      1.6rem   + 2vw,   3rem)       /* 32–48px */
```

### Easing Tokens

```css
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)   /* spring physics */
--ease-in:       cubic-bezier(0.0,  0.0,  0.2,  1.0) /* elements entering */
--ease-out:      cubic-bezier(0.4,  0.0,  1.0,  1.0) /* elements leaving */
--ease-standard: cubic-bezier(0.4,  0.0,  0.2,  1.0) /* layout/size changes */
```

---

## Component States Reference

Every interactive component has defined states:

| State | Visual Treatment |
|---|---|
| Default | Base values via tokens |
| Hover | `--bg-hover` fill, 80ms transition |
| Focus | `2px solid var(--border-accent)` outline, `outline-offset: 2px` |
| Active/Pressed | `scale(0.97)`, 80ms |
| Disabled | `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none` |
| Loading | Replaced by spinner icon; parent row/card shows skeleton |
| Error | `--status-danger` border on input, error message below |
| Success | Brief green flash, then resolves to normal state |

---

## Typography Usage Rules

| Token | Font | Usage |
|---|---|---|
| `DM Mono` | Variable | KPI numbers, page headings, quantity fields |
| `IBM Plex Sans` | Variable | All body text, labels, nav items, form fields |
| `IBM Plex Mono` | Regular | SKUs, Reference numbers, Operation IDs, stock quantities in tables |

**Tabular figures:** All numeric display (quantities, KPIs, deltas) must use `font-variant-numeric: tabular-nums` to ensure column alignment.

---

## Component Catalogue

### Implemented (v1.0)

| Component | Variants | Responsive? |
|---|---|---|
| `KPICard` | healthy, warning (amber), critical (red), loading | ✅ 2-col mobile, 4-col desktop |
| `StatusBadge` | draft, waiting, ready, done, canceled | ✅ Scales with text |
| `DataTable` | default, sortable, selectable, loading | ✅ Cards on mobile |
| `FilterBar` | desktop full, tablet compact, mobile bottom-sheet | ✅ |
| `Sidebar` | expanded (240px), collapsed (60px), icon-rail (tablet) | ✅ |
| `BottomNav` | 4 tabs, active states, badge count | Mobile only |
| `BottomSheet` | default, with drag handle, with footer action | Mobile only |
| `Modal` | small (400px), medium (560px), large (720px) | ✅ Full-screen on mobile |
| `AlertBanner` | amber (warning), red (critical), dismissible | ✅ |
| `Toast` | success, error, warning, info | ✅ Top-center mobile |
| `ConfirmDialog` | destructive (danger CTA), informational | ✅ |
| `StockBadge` | in-stock (green), low (amber), out (red) | ✅ |
| `LoadingSkeleton` | KPI card, table row, product card | ✅ |
| `EmptyState` | with CTA, without CTA | ✅ |
| `Breadcrumb` | desktop/tablet only | Desktop + tablet |
| `ProductSearchInput` | with autocomplete dropdown | ✅ |
| `OperationLineRow` | desktop (table row), mobile (card row) | ✅ |

---

## Responsive Behaviour Rules

| Element | Mobile (< 768px) | Tablet (768–1023px) | Desktop (≥ 1024px) |
|---|---|---|---|
| Navigation | Bottom nav (4 tabs) | Icon rail (60px) | Full sidebar (240px) |
| DataTable | Becomes card list | Hides low-priority columns | All columns visible |
| FilterBar | Collapses to search + "Filter" sheet | 2 visible filters + "More" | Full horizontal bar |
| KPI Cards | 2×2 grid | 2×2 or 4×1 | 4×1 row |
| Operation Lines | Stacked cards | Stacked cards | Table rows |
| Sidebar | Not rendered | Icon rail | Full sidebar |
| Breadcrumb | Hidden (back arrow instead) | Visible | Visible |
| CTA buttons | Full-width, sticky bottom | Normal | Normal |
| Modals | Full-screen sheet | Centered dialog | Centered dialog |

---

## Do / Don't Rules (Quick Reference)

| ✅ Do | ❌ Don't |
|---|---|
| Use `--accent` for all primary CTAs | Use amber for decorative purposes |
| Show status as color + icon + text | Use color as the only status indicator |
| Use `--text-secondary` for metadata | Use `--text-muted` for readable content |
| Size all touch targets to ≥ 48px | Create icon-only buttons without `aria-label` |
| Use `DM Mono` for all numerical data | Mix fonts within the same data cell |
| Use bottom sheets on mobile | Use popovers or tooltips as primary nav |
| Use spring easing for layout changes | Use linear easing for motion |
| Lazy-load tables beyond 20 rows | Dump 100+ rows without pagination |
| Show skeleton while data loads | Flash empty state before data arrives |
| Trap focus inside open modals | Allow tab to escape an open dialog |
