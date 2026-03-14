# CoreInventory — UI/UX Specification (Pro-Max)

> **Version:** 2.0.0 | **Date:** 2026-03-14  
> Follows `/ui-ux-pro-max` protocol: OKLCH color, fluid typography, spring physics, APCA contrast, no hamburger menus.

---

## 1. Design Philosophy

CoreInventory is an **enterprise warehouse operations tool** — closer in spirit to a Bloomberg terminal or aircraft HUD than to a consumer app. Every design decision must pass one test: *does this help an operator make faster, more accurate decisions under pressure?*

| Principle | Implementation |
|---|---|
| **Command not decoration** | UI elements earn their place by communicating data, not aesthetics |
| **Ambient awareness** | Operators must read stock status at a glance — color + shape, never color alone |
| **Zero cognitive interruption** | No unnecessary animations, no popups mid-task, no layout shifts |
| **Two-hand density** | Desktop: high-density data grids. Mobile: single-task card views |
| **Industrial provenance** | Dark, amber-accented — references warehouse safety signaling and industrial control panels |

**Explicitly banned design patterns:**
- Purple/violet as any primary color
- Standard hero layouts (left text / right image)
- Decorative glassmorphism or mesh gradients
- Inter font everywhere (generic SaaS cliché)
- Hamburger menus on mobile (low discoverability, 1-tap access is required)
- Skeleton screens with pulse animation for data that loads in < 300ms

---

## 2. Color System — OKLCH Algorithmic Palette

All colors defined in OKLCH for perceptual uniformity. Hue anchor: **amber (h ≈ 70°)** — industrial signal color.

```css
:root {
  /* ── Backgrounds — Z-axis depth layers ── */
  --bg-base:         oklch(10% 0.010 250);   /* #0D1117 — main canvas */
  --bg-surface:      oklch(13% 0.012 250);   /* #161B22 — panels, cards */
  --bg-elevated:     oklch(16% 0.013 250);   /* #21262D — modals, dropdowns */
  --bg-hover:        oklch(20% 0.014 250);   /* #30363D — interactive hover */
  --bg-oled:         oklch(0% 0 0);          /* #000000 — mobile OLED optimization */

  /* ── Amber Accent — primary identity color ── */
  --accent:          oklch(72% 0.180 70);    /* #F0A500 — primary amber */
  --accent-dim:      oklch(55% 0.140 70);    /* #B07800 — secondary/subdued */
  --accent-subtle:   oklch(20% 0.040 70);    /* rgba(240,165,0,0.12) — glow fill */
  --accent-border:   oklch(40% 0.120 70);    /* amber border on active items */

  /* ── Semantic Status Colors ── */
  --status-done:     oklch(60% 0.160 145);   /* #3FB950 — Done, In Stock */
  --status-waiting:  oklch(65% 0.140 70);    /* #D29922 — Waiting, Low Stock */
  --status-danger:   oklch(55% 0.210 25);    /* #F85149 — Canceled, Out of Stock */
  --status-info:     oklch(62% 0.150 250);   /* #58A6FF — Scheduled, Info */
  --status-draft:    oklch(40% 0.010 250);   /* muted gray — Draft */

  /* ── Typography ── */
  --text-primary:    oklch(93% 0.008 250);   /* #E6EDF3 */
  --text-secondary:  oklch(58% 0.010 250);   /* #8B949E */
  --text-muted:      oklch(32% 0.008 250);   /* #484F58 */
  --text-on-accent:  oklch(10% 0.005 250);   /* dark text on amber bg */

  /* ── Borders ── */
  --border:          oklch(22% 0.013 250);   /* #30363D */
  --border-subtle:   oklch(15% 0.010 250);   /* #21262D */
  --border-accent:   oklch(45% 0.140 70);    /* amber border on focus */

  /* ── Shadows ── */
  --shadow-sm:  0 1px 2px oklch(0% 0 0 / 0.4);
  --shadow-md:  0 4px 12px oklch(0% 0 0 / 0.5);
  --shadow-lg:  0 8px 32px oklch(0% 0 0 / 0.6);
  --shadow-accent: 0 0 16px oklch(72% 0.18 70 / 0.25);   /* amber glow */
}
```

### APCA Contrast Verification

| Pair | APCA Lc | WCAG 3.0 Result |
|---|---|---|
| `--text-primary` on `--bg-base` | Lc 88 | ✅ Pass (body text) |
| `--text-secondary` on `--bg-surface` | Lc 58 | ✅ Pass (UI labels) |
| `--text-muted` on `--bg-surface` | Lc 38 | ⚠ Disabled states only |
| `--accent` on `--bg-base` | Lc 72 | ✅ Pass (interactive) |
| `--text-on-accent` on `--accent` | Lc 80 | ✅ Pass (buttons) |
| Status green on `--bg-surface` | Lc 55 | ✅ Pass (with label) |
| Status red on `--bg-surface` | Lc 52 | ✅ Pass (with label) |

---

## 3. Typography System

| Role | Font | Loading |
|---|---|---|
| KPI numbers / page headings | `DM Mono` — Variable | `font-display: swap` |
| Body / UI labels | `IBM Plex Sans` — Variable | `font-display: swap` |
| SKUs / reference numbers / code | `IBM Plex Mono` | `font-display: swap` |

> **Why DM Mono for headings?** Tabular figures (equal-width digits) make scanning stock quantity columns precise and fast — a functional choice, not aesthetic.

### Fluid Type Scale (CSS `clamp()`)

```css
:root {
  --text-xs:   clamp(0.6875rem, 0.65rem + 0.2vw,  0.75rem);   /* 11–12px */
  --text-sm:   clamp(0.8125rem, 0.78rem + 0.2vw,  0.875rem);  /* 13–14px */
  --text-base: clamp(0.9375rem, 0.88rem + 0.3vw,  1.0625rem); /* 15–17px */
  --text-lg:   clamp(1.125rem,  1.05rem + 0.4vw,  1.25rem);   /* 18–20px */
  --text-xl:   clamp(1.375rem,  1.25rem + 0.6vw,  1.625rem);  /* 22–26px */
  --text-kpi:  clamp(2rem,      1.6rem  + 2vw,    3rem);       /* 32–48px — KPI numbers */

  /* Line heights */
  --leading-tight:  1.25;
  --leading-base:   1.5;
  --leading-loose:  1.75;

  /* Max prose width */
  --measure:  65ch;
}
```

---

## 4. Spacing & Grid System

```css
:root {
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;

  /* Sidebar widths */
  --sidebar-expanded:  240px;
  --sidebar-collapsed: 60px;

  /* Bottom nav height (mobile) */
  --bottom-nav-height: 60px;

  /* Touch target minimum (Fitts' Law) */
  --touch-min: 48px;
}
```

---

## 5. Motion & Interaction System

All animations respect `prefers-reduced-motion: reduce`.

```css
/* Spring-physics easing — used for all layout transitions */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
/* Smooth decelerate — entering elements */
--ease-in:      cubic-bezier(0.0,  0.0,  0.2,  1.0);
/* Smooth accelerate — exiting elements */
--ease-out:     cubic-bezier(0.4,  0.0,  1.0,  1.0);
/* Standard UI transitions */
--ease-standard: cubic-bezier(0.4, 0.0,  0.2,  1.0);

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

### Animation Catalogue

| Interaction | Spec | Notes |
|---|---|---|
| Page enter | `opacity 0→1` + `translateY 6px→0`, 160ms `--ease-out`, staggered 40ms per section | No layout shift |
| KPI card enter | Staggered 50ms per card, same fade-up | Count increments 0→value over 600ms |
| Sidebar expand/collapse | Width 60px↔240px, 220ms `--ease-standard` | Label fades in after 120ms delay |
| Modal open | `scale(0.96)→scale(1)` + `opacity 0→1`, 140ms `--ease-spring` | Backdrop: 120ms fade |
| Modal close | `scale(1)→scale(0.96)` + `opacity 1→0`, 100ms `--ease-in` | Faster exit feels snappy |
| Dropdown open | `translateY(-4px)→0` + opacity, 120ms | |
| Table row hover | `background` 80ms linear | No transform — avoids reflow |
| Button press | `scale(0.97)`, 80ms | Spring back on release |
| Status badge change | Color cross-fade 200ms + brief scale(1.05) pulse | |
| Low-stock glow | `box-shadow` pulse: `0 0 0px` → `0 0 12px var(--accent)`, 2s loop | |
| Bottom nav tab switch | Active icon scale 1→1.2, 200ms `--ease-spring` | Label slides up 4px |
| Form submit | Button `opacity 0.6` + spinner replaces icon; inputs `pointer-events: none` | |
| Success flash | Green checkmark `scale(0)→scale(1)`, 300ms `--ease-spring`, auto-dismiss 2s | |
| Swipe to dismiss (mobile) | `translateX` follows finger; snap back or dismiss at 60px threshold | |

---

## 6. Component Library — Detailed Specs

### `KPICard`

```
┌──────────────────────────────┐
│ ▌ [amber left-border 3px]    │
│                              │
│   1,250                      │  ← DM Mono, --text-kpi, --text-primary
│   Total Stock Items          │  ← IBM Plex Sans, --text-sm, --text-secondary
│                              │
│   ↑ +12 from yesterday       │  ← --status-done, --text-xs
└──────────────────────────────┘
```

States: `loading` (shimmer), `healthy`, `warning` (amber bg-subtle fill), `critical` (danger border)

---

### `StatusBadge`

```
● Draft     → --status-draft   bg  | muted dot
◷ Waiting   → --status-waiting bg  | amber dot
◈ Ready     → --status-info    bg  | blue dot
✓ Done      → --status-done    bg  | green dot
✕ Canceled  → --status-danger  bg  | red dot
```

Rule: **always color + text + icon**. Never color alone. Pill shape, `--radius-pill`, 5px 10px padding.

---

### `DataTable`

- Sticky header: `position: sticky; top: 0; z-index: 10; background: var(--bg-surface)`
- Sort indicators: `↑ ↓` with amber color on active column
- Row hover: `background: var(--bg-hover)` — 80ms transition
- Selected row: `border-left: 2px solid var(--accent)`
- Alternating rows: subtle `oklch(11.5% 0.011 250)` on odd rows
- Pagination: prev/next + page number pills, current page amber

**Desktop columns:** full data (all columns visible)  
**Tablet columns:** hide low-priority columns (e.g., hide "Updated At", keep "Status", "Type", "Qty")  
**Mobile view:** Not a table — renders as `OperationCard` list (see Mobile section)

---

### `FilterBar`

```
Desktop:  [Type ▾]  [Status ▾]  [Warehouse ▾]  [── Date range ──]  [🔍 Search]
Tablet:   [Type ▾]  [Status ▾]  [More ▾]
Mobile:   [🔍 Search bar — full width]  [⊞ Filter] (opens bottom sheet)
```

- Sticky on scroll: `position: sticky; top: 0; z-index: 9`
- Active filter → amber pill with ✕ to clear
- Bottom sheet on mobile: slides up from bottom, `border-radius: 16px 16px 0 0`

---

### `Sidebar` (Desktop / Tablet)

```
┌─────────────────────┐
│  ⬡ CoreInventory    │  ← logo + wordmark (expanded) or ⬡ (collapsed)
├─────────────────────┤
│  ⌂  Dashboard       │  ← active: amber text + left indicator bar
│  📦 Products        │
│  📋 Operations   ›  │  ← expandable group
│     └ Receipts      │
│     └ Deliveries    │
│     └ Transfers     │
│     └ Adjustments   │
│  📜 History         │
│  ⚙  Settings     ›  │
│     └ Warehouses    │
├─────────────────────┤
│  [RJ] Ravi Sharma   │  ← avatar initials + name (expanded only)
│       Manager       │
│  ↗  Logout          │
└─────────────────────┘
```

**Collapsed state (tablet):** icons only, 60px wide. Hover reveals tooltip with item label.  
**Expanded state (desktop):** 240px. Icon + label visible.  
**No hamburger at any breakpoint.**

---

### `Modal`

- Backdrop: `oklch(0% 0 0 / 0.65)` — blurs if `supports(backdrop-filter: blur)`
- Container: `--bg-elevated`, `--radius-lg`, `--shadow-lg`, max-width 560px
- Header: title (--text-lg, IBM Plex Sans 500) + optional subtitle + close icon button
- Body: scrollable if content overflows
- Footer: action row — secondary action left, primary CTA right
- Keyboard: `Escape` closes; focus trapped inside while open

---

### `AlertBanner`

```
⚠  Steel Rod (STL-001) is below minimum stock.  Current: 3 / Minimum: 20   [Review →]
```

- Amber left accent bar (3px)
- Background: `var(--accent-subtle)`
- Dismissible with ✕
- Stacks vertically if multiple alerts

---

### `ConfirmDialog`

Destructive actions (Cancel Operation, Delete Product, Delete Location) always require:

```
┌────────────────────────────────────┐
│  Cancel Receipt REC-2026-001?      │
│                                    │
│  This action cannot be undone.     │
│  The operation will be marked as   │
│  Canceled and no stock will change.│
│                                    │
│  [Keep Operation]  [Cancel Receipt]│  ← destructive CTA is danger color
└────────────────────────────────────┘
```

---

### `StockBadge` (inline in tables)

```
● 150 kg    → green   (quantity > minimum_stock)
⚠ 3 kg     → amber   (0 < quantity ≤ minimum_stock)
✕ 0         → red     (quantity = 0)
```

---

### `LoadingSkeleton`

- `background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)`
- `background-size: 200% 100%`
- `animation: shimmer 1.4s ease infinite`
- KPI cards: full card skeleton. Tables: 6 row skeletons matching column widths exactly.
- Never shown if data loads in < 300ms (prevents flash of skeleton)

---

### `Toast Notifications`

Positioned top-right (desktop), top-center (mobile). Auto-dismiss: 4 seconds.

```
┌──────────────────────────────────────┐
│  ✓  Receipt validated successfully   │  ← success: green left bar
│     REC-2026-001 · 3 products        │
└──────────────────────────────────────┘
```

Variants: success (green), error (red), warning (amber), info (blue). Stack vertically, max 3 visible.

---

## 7. Desktop Layout System (≥ 1024px)

### Layout Grid

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR 240px fixed    │  MAIN CONTENT — fluid                  │
│  ─────────────────────  │  ──────────────────────────────────── │
│  logo                   │  PAGE HEADER                          │
│  nav items              │  Breadcrumb + Page title + CTA button │
│  ─────────────────────  │  ──────────────────────────────────── │
│  user avatar + name     │  CONTENT AREA (padding: 24px)         │
│  logout                 │  KPI cards / Table / Form / Detail    │
└─────────────────────────┴──────────────────────────────────────┘
```

### Dashboard — Desktop

```
┌──────────────────────────────────────────────────────────┐
│ SIDEBAR │  Dashboard                    [↻] [Ravi J ▾]   │
│─────────│──────────────────────────────────────────────  │
│ ⌂ Dash  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐ │
│ 📦 Prod │ │ TOTAL    │ │ LOW      │ │ PENDING  │ │PEN.│ │
│ 📋 Ops ›│ │ STOCK    │ │ STOCK    │ │ RECEIPTS │ │DEL.│ │
│  Rcpts  │ │  1,250   │ │    8     │ │    4     │ │  7 │ │
│  Deliv  │ │ ↑ +12    │ │ ⚠ alert  │ │          │ │    │ │
│  Trans  │ └──────────┘ └──────────┘ └──────────┘ └────┘ │
│  Adj    │─────────────────────────────────────────────── │
│ 📜 Hist │ ⚠ Copper Wire (COP-002) is below minimum (3/20)│
│ ⚙ Set  ›│─────────────────────────────────────────────── │
│  Whse   │ [Type ▾] [Status ▾] [Warehouse ▾] [Date range] │
│─────────│─────────────────────────────────────────────── │
│[RJ]Ravi │ RECENT OPERATIONS                              │
│ Manager │ Ref        │ Type    │ Status  │ Lines │ Date  │
│ Logout  │ REC-2026-1 │ Receipt │ ●Done   │  3    │ 09:00 │
│         │ DEL-2026-4 │Delivery │ ◷Waiting│  2    │ 08:12 │
└─────────┴────────────────────────────────────────────────┘
```

### Operation Detail — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR │ ← Receipts  /  REC-2026-001            [●Draft]   │
│─────────├─────────────────────────────────────────────────  │
│         │ ┌── OPERATION DETAILS ──────────────────────────┐ │
│         │ │ Destination  Warehouse A / Rack B             │ │
│         │ │ Reference #  REC-2026-001                     │ │
│         │ │ Notes        Delivery from Steel Co. Ltd      │ │
│         │ │ Created      2026-03-14 09:00 · by Ravi Sharma│ │
│         │ └───────────────────────────────────────────────┘ │
│         │                                                    │
│         │ PRODUCT LINES                      [+ Add Line]   │
│         │ ┌──────────────┬────────┬──────────┬───────────┐  │
│         │ │ Product      │ SKU    │ Expected │ Done      │  │
│         │ │ Steel Rod    │STL-001 │    50    │ [  50  ]  │  │
│         │ │ Copper Wire  │COP-002 │    20    │ [  20  ]  │  │
│         │ └──────────────┴────────┴──────────┴───────────┘  │
│         │──────────────────────────────────────────────────  │
│         │ [Cancel Operation]          [▶ Validate Receipt]   │
└─────────┴────────────────────────────────────────────────────┘
```

---

## 8. Tablet Layout (768px – 1023px)

- Sidebar collapses to **60px icon rail** on the left
- Hovering an icon reveals a **tooltip label** floating right
- Clicking an icon with sub-items reveals a **flyout panel** (not a dropdown)
- Main content expands to fill remaining width
- DataTable hides low-priority columns (keeps: Name/Ref, Status, Qty, Date)
- FilterBar: 2 primary filters visible, "More ▾" groups the rest
- KPI cards: 2×2 grid (instead of 4-column row)
- Page header: breadcrumb + title on one line, CTA floats right

---

## 9. Mobile Layout (< 768px) — No Hamburger

> **Design rule:** No hamburger. Full navigation is always one tap away via the **Bottom Navigation Bar**. Secondary pages use a top-bar with a back arrow.

### 9.1 Bottom Navigation Bar (persistent)

```
┌──────────────────────────────────────────┐
│  (content area fills screen above)       │
├────────────┬────────────┬────────────────┤
│  ⌂         │  📦        │  📋   │  📜   │
│ Dashboard  │ Products   │ Ops   │ History│
│            │            │       │        │
└────────────┴────────────┴───────┴────────┘
```

- **4 tabs:** Dashboard, Products, Operations, History
- Height: 60px + safe area inset (for notched phones)
- Active tab: amber icon + label scales up, amber underline indicator
- Inactive: muted icon + label
- "Operations" tab: opens a bottom sheet with sub-items (Receipts, Deliveries, Transfers, Adjustments)
- Settings and Profile: accessible via profile avatar in top-right header (not in bottom nav)
- **No hamburger at any point.** Always 1 tap to main sections.

### 9.2 Mobile Top Bar

```
┌──────────────────────────────────────────┐
│ [← Back]    Receipts             [RJ] ⚙ │
└──────────────────────────────────────────┘
```

- Back arrow navigates up the hierarchy
- Contextual title (page name, not app name)
- Right: profile avatar (taps → profile/logout sheet) + optional action icon

### 9.3 Operations Bottom Sheet (from "Ops" tab)

```
Tapping "Ops" slides up a bottom sheet:
┌─────────────────────────────┐
│        ━━━━━  (drag handle) │
│  Operations                  │
│  ─────────────────────────  │
│  📥  Receipts          ›    │
│  📤  Deliveries        ›    │
│  ↔   Transfers         ›    │
│  ≈   Adjustments       ›    │
│  ─────────────────────────  │
│  [Cancel]                    │
└─────────────────────────────┘
```

- `border-radius: 16px 16px 0 0`
- Background: `--bg-elevated`
- Swipe down to dismiss
- Each row: 56px tall (Fitts' Law compliant)

### 9.4 Mobile Dashboard

```
┌──────────────────────────────────────────┐
│ Dashboard                      [RJ]       │
├──────────────────────────────────────────┤
│ ⚠ Copper Wire below minimum (3/20)  [›] │
├──────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────┐  │
│ │  TOTAL STOCK   │  │  LOW STOCK     │  │
│ │    1,250       │  │      8         │  │
│ └────────────────┘  └────────────────┘  │
│ ┌────────────────┐  ┌────────────────┐  │
│ │ PENDING RCPTS  │  │ PENDING DEL.   │  │
│ │      4         │  │      7         │  │
│ └────────────────┘  └────────────────┘  │
├──────────────────────────────────────────┤
│ RECENT OPERATIONS                        │
│ ┌──────────────────────────────────────┐ │
│ │ REC-2026-001  Receipt   ●Done        │ │
│ │ Warehouse A · 3 products · 09:00     │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ DEL-2026-004  Delivery  ◷Waiting     │ │
│ │ Warehouse A · 2 products · 08:12     │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│  ⌂         │  📦        │  📋  │  📜    │
└──────────────────────────────────────────┘
```

- KPI cards: 2-column grid, square aspect ratio
- Operations: card list (not table) — each card is a tappable row
- Scroll area between top bar and bottom nav

### 9.5 Mobile Products List

```
┌──────────────────────────────────────────┐
│ ← Dashboard   Products         [+ New]   │
│ ──────────────────────────────────────── │
│ 🔍 Search SKU or product name...         │
│ [All Categories ▾]  [⊞ Filter]           │
│ ──────────────────────────────────────── │
│ ┌──────────────────────────────────────┐ │
│ │ Steel Rod                 ● 150 kg   │ │
│ │ STL-001  ·  Raw Materials            │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Copper Wire               ⚠ 3 kg    │ │
│ │ COP-002  ·  Raw Materials            │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Chair Frame               ✕ 0        │ │
│ │ CHF-001  ·  Finished Goods           │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 9.6 Mobile Operation Detail

```
┌──────────────────────────────────────────┐
│ ← Receipts    REC-2026-001    [● Draft]  │
│ ──────────────────────────────────────── │
│ Destination  Warehouse A / Rack B        │
│ Created      2026-03-14 09:00            │
│ By           Ravi Sharma                  │
│ Notes        Delivery from Steel Co.     │
│ ──────────────────────────────────────── │
│ PRODUCT LINES              [+ Add Line]  │
│ ┌──────────────────────────────────────┐ │
│ │ Steel Rod (STL-001)                  │ │
│ │ Expected: 50      Done: [  50  ]     │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Copper Wire (COP-002)                │ │
│ │ Expected: 20      Done: [  20  ]     │ │
│ └──────────────────────────────────────┘ │
│ ──────────────────────────────────────── │
│ [Cancel]                [▶ Validate]     │  ← full-width sticky at bottom
└──────────────────────────────────────────┘
```

- Product lines stack vertically (not a table)
- Action buttons: sticky at bottom of screen, above keyboard
- `Done` input: large touch target, numeric keyboard auto-opens

### 9.7 Mobile Move History

```
┌──────────────────────────────────────────┐
│ ← Dashboard    Move History              │
│ ──────────────────────────────────────── │
│ 🔍 Search product...    [⊞ Filter]       │
│ ──────────────────────────────────────── │
│ 2026-03-14                               │
│ ┌──────────────────────────────────────┐ │
│ │ +50 kg   Steel Rod                   │ │
│ │ Receipt · Warehouse A/Rack B · 09:00 │ │
│ │ Balance after: 150 kg                │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ −20 kg   Steel Rod                   │ │
│ │ Delivery · Warehouse A · 08:12       │ │
│ │ Balance after: 100 kg                │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- Grouped by date
- Delta: `+` green, `−` red, monospace font

---

## 10. Auth Pages (All Breakpoints)

Auth pages use a **centered single-column card** on a `--bg-base` full-screen background.

```
Desktop:
┌────────────────────────────────────────────────────┐
│  --bg-base (full screen)                           │
│                                                    │
│         ┌──────────────────────────┐               │
│         │  ⬡ CoreInventory         │               │
│         │  ─────────────────────  │               │
│         │  Welcome back            │               │
│         │  Sign in to continue    │               │
│         │                          │               │
│         │  [Email address        ] │               │
│         │  [Password      ◉ show ] │               │
│         │                          │               │
│         │  [    Sign In           ]│               │
│         │                          │               │
│         │  Forgot password?        │               │
│         └──────────────────────────┘               │
│                                                    │
└────────────────────────────────────────────────────┘
```

Mobile: same centered card, full-width with 16px horizontal padding.

No hero image, no split-panel layout, no decorative backgrounds.

---

## 11. Accessibility — Full Audit Checklist

| Requirement | Specification |
|---|---|
| **Touch targets** | Minimum 48×48px on all interactive elements (Fitts' Law) |
| **Color** | Never sole indicator — always icon + color + text label |
| **Focus ring** | `outline: 2px solid var(--accent); outline-offset: 2px` on all focusable elements |
| **Keyboard nav** | Full tab order; `Escape` closes modals/sheets; arrow keys navigate tables |
| **ARIA roles** | `role="navigation"`, `role="main"`, `role="dialog"`, `aria-live="polite"` on KPI updates |
| **Labels** | All inputs have associated `<label>` — never placeholder-only |
| **Error messages** | `aria-describedby` links input to error message element |
| **Screen reader** | Semantic HTML5 — `<nav>`, `<main>`, `<header>`, `<section>`, `<table>` |
| **Reduced motion** | All animation respects `@media (prefers-reduced-motion: reduce)` |
| **Font size** | Never below 11px rendered; no fixed `px` on body — use `rem` |
| **Bottom nav** | `role="tablist"` + `role="tab"` + `aria-selected` per item |
| **Skip link** | `<a href="#main-content" class="skip-link">Skip to content</a>` at page top |
| **Status badges** | `aria-label="Status: Done"` — not just visual color |
| **APCA contrast** | All text pairs verified (see Section 2) |

---

## 12. Design Anti-Patterns (Banned)

```
❌ Hamburger menu at any breakpoint
❌ Purple or violet as any primary or accent color
❌ Mesh gradient backgrounds
❌ Glassmorphism used decoratively (backdrop-filter only for functional depth)
❌ Full-page loading spinners (use skeleton or optimistic UI)
❌ Auto-playing or looping content animations
❌ Tooltips as the only way to discover critical actions
❌ Placeholder text as the only label for an input
❌ Tables on mobile without a card-list fallback
❌ More than 3 font weights per page
❌ Layout shift (CLS > 0) from dynamic content loading
❌ Color contrast below WCAG AA (4.5:1) on any body text
```

---

## 13. Responsive Breakpoints Summary

| Breakpoint | Range | Navigation | Layout |
|---|---|---|---|
| **Mobile S** | < 375px | Bottom nav (4 tabs) | Single column, full width |
| **Mobile L** | 375px–767px | Bottom nav (4 tabs) | Single column, 16px gutter |
| **Tablet** | 768px–1023px | Icon rail sidebar (60px) + flyout | 2-column grid for KPIs |
| **Desktop** | 1024px–1279px | Sidebar (240px) | Content 800px max |
| **Desktop L** | ≥ 1280px | Sidebar (240px) | Content 1024px max |

> **No hamburger at any breakpoint.** Mobile uses bottom nav. Tablet uses icon rail. Desktop uses full sidebar.
