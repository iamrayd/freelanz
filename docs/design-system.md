# Freelanz — Design System

| | |
|---|---|
| Story | FLZ-4 |
| Version | 1.0 (Sprint 0) |
| Owner | ui-ux |
| Stack | Next.js 16 App Router, Tailwind CSS v4 (`@theme`), `next/font/google` |

This file is the source of truth for tokens, components, and screen patterns. Update it in the same PR as any UI change that adds or alters a token, component, or pattern.

---

## 1. Brand direction: "Field Ledger"

Freelanz is a working tool, not a landing page. It should feel like a well-kept ledger: quiet paper, dark ink, one confident accent, and numbers that line up.

- **Mood:** calm, trustworthy, dense. Many jobs per screen, scannable in seconds.
- **Palette:** warm off-white "paper" neutrals (dark mode: deep green-black "slate"), near-black ink, and a single **pine green** accent. Pine reads as "go / safe" without the alarm of bright green or the sameness of SaaS blue and purple. Amber is reserved for warnings and red for danger, so flags stand out because nothing else is loud.
- **Shape:** small radii (4–8 px), 1 px hairline borders, nearly flat surfaces. Shadows only on things that float (menus, toasts).
- **Density:** 14 px base for data views, 16 px for reading (job description, landing). Tight vertical rhythm on a 4 px grid.
- **Not:** gradients, glassmorphism, illustrations of people at laptops, emoji in UI, decorative motion.

### Type pairing

| Role | Font | `next/font` variable | Why |
|---|---|---|---|
| UI and body | **Public Sans** (variable, 100–900) | `--font-public-sans` | Neutral, highly legible grotesque built for government services: reads as trustworthy, not trendy. Large x-height holds up at 13–14 px in dense lists. |
| Data and meta | **JetBrains Mono** (variable, 100–800) | `--font-jetbrains-mono` | Signals the developer audience. Used only for numbers and short metadata (pay, "3h ago", counts, source IDs) so columns align and figures scan quickly. Never for paragraphs. |

```tsx
// src/app/layout.tsx (reference for the scaffold; implementer owns the file)
import { Public_Sans, JetBrains_Mono } from 'next/font/google'

const sans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

// <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
```

Wordmark: "freelanz" set in Public Sans 700, lowercase, letter-spacing −0.02em, with a 6 px pine square before it (the "ledger mark"). No logo image needed for v1.

---

## 2. Design tokens

### 2.1 Paste-ready `globals.css`

Raw values live on `:root` as plain custom properties. `@theme inline` maps them to Tailwind utilities (`bg-surface`, `text-muted`, `border-border-strong`, `bg-danger-subtle`, ...), so the theme switches by swapping variables, with no `dark:` prefixes needed in components.

Theme resolution: system preference by default; `<html data-theme="light|dark">` overrides it (set by the theme toggle in UserMenu and persisted in a cookie so the server renders the right value without a flash).

```css
@import "tailwindcss";

/* ---------- Light (default) ---------- */
:root {
  color-scheme: light;

  --background: #F5F4EF;
  --surface: #FBFAF7;
  --surface-raised: #FFFFFF;
  --border: #DAD6CC;          /* decorative dividers, card outlines */
  --border-strong: #7D827C;   /* input/checkbox outlines (>= 3:1) */
  --text: #1A1D1C;
  --text-muted: #575D59;

  --primary: #17614F;
  --primary-hover: #114D3F;
  --primary-foreground: #FFFFFF;
  --primary-subtle: #E1EFEA;

  --success: #1E6B3A;
  --success-subtle: #E3F1E7;
  --warning: #8A4B00;
  --warning-subtle: #FBEBD3;
  --danger: #B3261E;
  --danger-subtle: #FBE4E1;
  --info: #1F5AA6;
  --info-subtle: #E2ECF8;

  --focus-ring: #17614F;
  --overlay: rgb(26 29 28 / 0.45);

  --shadow-color: 30 25 15;
}

/* ---------- Dark values (shared by both selectors below) ---------- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --background: #111413;
    --surface: #171B1A;
    --surface-raised: #1F2422;
    --border: #2C3230;
    --border-strong: #68716D;
    --text: #E6E8E5;
    --text-muted: #A2A9A5;
    --primary: #5BC2A4;
    --primary-hover: #7FD3BA;
    --primary-foreground: #0A1D17;
    --primary-subtle: #15302A;
    --success: #6DCB8C;
    --success-subtle: #16291D;
    --warning: #E8B04F;
    --warning-subtle: #2E2312;
    --danger: #F28B82;
    --danger-subtle: #341B19;
    --info: #82B4F2;
    --info-subtle: #16233A;
    --focus-ring: #5BC2A4;
    --overlay: rgb(0 0 0 / 0.6);
    --shadow-color: 0 0 0;
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --background: #111413;
  --surface: #171B1A;
  --surface-raised: #1F2422;
  --border: #2C3230;
  --border-strong: #68716D;
  --text: #E6E8E5;
  --text-muted: #A2A9A5;
  --primary: #5BC2A4;
  --primary-hover: #7FD3BA;
  --primary-foreground: #0A1D17;
  --primary-subtle: #15302A;
  --success: #6DCB8C;
  --success-subtle: #16291D;
  --warning: #E8B04F;
  --warning-subtle: #2E2312;
  --danger: #F28B82;
  --danger-subtle: #341B19;
  --info: #82B4F2;
  --info-subtle: #16233A;
  --focus-ring: #5BC2A4;
  --overlay: rgb(0 0 0 / 0.6);
  --shadow-color: 0 0 0;
}

/* `dark:` variant, only for rare non-token cases (e.g. swapping an image). */
@custom-variant dark {
  @media (prefers-color-scheme: dark) {
    &:where(:root:not([data-theme="light"]) *) { @slot; }
  }
  &:where([data-theme="dark"], [data-theme="dark"] *) { @slot; }
}

@theme inline {
  /* Colors */
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-subtle: var(--primary-subtle);
  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning);
  --color-warning-subtle: var(--warning-subtle);
  --color-danger: var(--danger);
  --color-danger-subtle: var(--danger-subtle);
  --color-info: var(--info);
  --color-info-subtle: var(--info-subtle);
  --color-focus-ring: var(--focus-ring);
  --color-overlay: var(--overlay);

  /* Fonts (from next/font) */
  --font-sans: var(--font-public-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, "SFMono-Regular", monospace;

  /* Shadows: only for floating layers */
  --shadow-sm: 0 1px 2px rgb(var(--shadow-color) / 0.06);
  --shadow-md: 0 4px 12px -2px rgb(var(--shadow-color) / 0.12), 0 1px 3px rgb(var(--shadow-color) / 0.08);
  --shadow-lg: 0 12px 32px -8px rgb(var(--shadow-color) / 0.24), 0 2px 6px rgb(var(--shadow-color) / 0.10);
}

@theme {
  /* Spacing: Tailwind v4 derives every p-/m-/gap- step from this base (4px grid). */
  --spacing: 0.25rem;

  /* Radius */
  --radius-xs: 2px;   /* focus ring offset, tiny chips */
  --radius-sm: 4px;   /* badges, inputs */
  --radius-md: 6px;   /* buttons, cards */
  --radius-lg: 8px;   /* menus, dialogs, toasts */
  --radius-full: 9999px; /* avatars only */

  /* Type scale: size / line-height */
  --text-xs: 0.75rem;     --text-xs--line-height: 1rem;        /* 12/16 meta, badges */
  --text-sm: 0.8125rem;   --text-sm--line-height: 1.25rem;     /* 13/20 secondary */
  --text-base: 0.875rem;  --text-base--line-height: 1.375rem;  /* 14/22 UI default */
  --text-md: 1rem;        --text-md--line-height: 1.625rem;    /* 16/26 reading: job description, landing */
  --text-lg: 1.125rem;    --text-lg--line-height: 1.625rem;    /* 18/26 card title on detail, section h2 */
  --text-xl: 1.375rem;    --text-xl--line-height: 1.875rem;    /* 22/30 page h1 (app) */
  --text-2xl: 1.75rem;    --text-2xl--line-height: 2.25rem;    /* 28/36 detail h1 */
  --text-3xl: 2.5rem;     --text-3xl--line-height: 3rem;       /* 40/48 landing hero only */

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --duration-fast: 100ms;  /* hover, press, color changes */
  --duration-base: 160ms;  /* menus, popovers, toggles */
  --duration-slow: 240ms;  /* toasts, dialogs, page-level reveals */

  /* Breakpoints (mobile first) */
  --breakpoint-sm: 40rem;  /* 640 */
  --breakpoint-md: 48rem;  /* 768 */
  --breakpoint-lg: 64rem;  /* 1024: filter sidebar appears */
  --breakpoint-xl: 80rem;  /* 1280 */
}

@layer base {
  html { background: var(--background); color: var(--text); }
  body {
    @apply font-sans text-base antialiased;
    font-feature-settings: "cv11", "ss01";
  }
  .font-mono, time, data { font-variant-numeric: tabular-nums; }

  :focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }
}

/* Reduced motion: keep state changes, drop movement. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Notes for the implementer:
- Both dark blocks are intentionally identical. Keep them in sync (or generate one from the other); the duplication is the price of "system default + explicit override" without JS.
- To avoid a theme flash, read the theme cookie in the root layout and render `data-theme` on `<html>` server-side. If no cookie, omit the attribute and let the media query decide.
- Never use raw hex or Tailwind palette colors (`gray-500`, `emerald-600`) in components. Lint/review rule: tokens only.

### 2.2 Contrast ratios (WCAG 2.2)

Computed with the WCAG 2.x relative-luminance formula (sRGB linearization, `(L1 + 0.05) / (L2 + 0.05)`). Script used:

```js
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const[x,y]=[L(a),L(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
```

Requirement: text **4.5:1** (AA normal), UI components and focus indicators **3:1**. Ratios below are against `background` / `surface` / `surface-raised`.

| Pair | Light | Dark | Use | AA |
|---|---|---|---|---|
| `text` on bg / surface / raised | 15.42 / 16.27 / 16.98 | 15.03 / 14.10 / 12.78 | body, titles | pass |
| `text-muted` on bg / surface / raised | 6.12 / 6.46 / 6.74 | 7.73 / 7.25 / 6.56 | meta, helper text | pass |
| `primary` on bg / surface / raised | 6.67 / 7.04 / 7.34 | 8.56 / 8.03 / 7.27 | links, active filter text | pass |
| `success` on bg / surface / raised | 5.92 / 6.25 / 6.52 | 9.33 / 8.75 / 7.93 | "Synced" text | pass |
| `warning` on bg / surface / raised | 6.18 / 6.52 / 6.80 | 9.49 / 8.90 / 8.06 | flag text | pass |
| `danger` on bg / surface / raised | 5.94 / 6.26 / 6.54 | 7.76 / 7.28 / 6.59 | errors | pass |
| `info` on bg / surface / raised | 6.21 / 6.55 / 6.84 | 8.61 / 8.08 / 7.32 | info notes | pass |
| `primary-foreground` on `primary` | 7.34 | 8.07 | primary button | pass |
| `primary-foreground` on `primary-hover` | 9.74 | 9.93 | primary button hover | pass |
| `text` on `primary-subtle` | 14.34 | 11.45 | tag badge | pass |
| `primary` on `primary-subtle` | 6.20 | 6.52 | selected chip | pass |
| `success` on `success-subtle` | 5.59 | 7.72 | success badge | pass |
| `warning` on `warning-subtle` | 5.81 | 7.88 | flag badge | pass |
| `danger` on `danger-subtle` | 5.38 | 6.68 | error banner | pass |
| `info` on `info-subtle` | 5.73 | 7.31 | info banner | pass |
| `text` on any `*-subtle` | 13.98–14.56 | 12.45–12.94 | banner body copy | pass |
| `text-muted` on any `*-subtle` | 5.55–5.78 | 6.39–6.65 | banner meta | pass |
| `border-strong` on bg / surface / raised | 3.56 / 3.76 / 3.92 | 3.68 / 3.45 / 3.13 | input outlines (UI 3:1) | pass |
| `focus-ring` on bg / surface / raised | 6.67 / 7.04 / 7.34 | 8.56 / 8.03 / 7.27 | focus outline (UI 3:1) | pass |
| `border` on bg / surface / raised | 1.32 / 1.39 / 1.45 | 1.42 / 1.33 / 1.20 | decorative only | n/a |

Rule: `border` is decorative (card edges, dividers). Any boundary a user must perceive to operate a control (input, checkbox, select, toggle track) uses `border-strong`.

### 2.3 Spacing

4 px grid via `--spacing: 0.25rem`. Use these steps only:

| Token | px | Typical use |
|---|---|---|
| `1` | 4 | icon-to-label gap, badge padding-y |
| `1.5` | 6 | badge padding-x |
| `2` | 8 | gap between badges, compact stacks |
| `3` | 12 | card inner gap, input padding-x |
| `4` | 16 | card padding, page gutter on mobile |
| `6` | 24 | section gap, page gutter on desktop |
| `8` | 32 | between page sections |
| `12` | 48 | landing section rhythm |
| `16` | 64 | landing hero padding |

Layout: content max width 72rem (1152 px); reading column max 42rem (672 px) on job detail; filter sidebar 16rem (256 px) at `lg`.

### 2.4 Radius, shadow, elevation

| Level | Surface | Border | Shadow | Examples |
|---|---|---|---|---|
| 0 | `background` | none | none | page |
| 1 | `surface` | `border` | none | JobCard, SourceCard, FilterBar |
| 2 | `surface-raised` | `border` | `shadow-md` | UserMenu, dropdowns, sticky mobile filter sheet |
| 3 | `surface-raised` | `border` | `shadow-lg` | Toast, dialog |

### 2.5 Motion

- Only `opacity`, `transform` and `color`/`background-color` animate. No layout animation, no parallax, no auto-playing anything.
- Enter uses `--ease-standard`, exit uses `--ease-exit`. Exits are ~25% faster than enters.
- Skeleton shimmer: 1.4 s linear loop of a background-position gradient. Under reduced motion it becomes a static `surface-raised` block (the global rule stops the animation; the block still reads as "loading").
- Reduced motion: the global rule in `globals.css` above. Toasts and menus still appear, just without slide.

---

## 3. Component inventory

Conventions: `variant` = visual role, `size` = density, state = interaction. All components live in `src/components/` and are presentational (no data access). Minimum touch target 44×44 px on touch layouts; on desktop, visual size may be smaller if the hit area (padding or pseudo-element) still reaches 24×24 px (WCAG 2.5.8) and 44 px on `pointer: coarse`.

### Button

| | |
|---|---|
| Variants | `primary` (pine fill, one per view), `secondary` (surface + `border-strong` outline), `ghost` (text only, for toolbars and card actions), `danger` (danger text on `danger-subtle`, destructive confirms only) |
| Sizes | `sm` 32 px high (desktop toolbars; 44 px hit area on coarse pointers), `md` 40 px (default), `lg` 48 px (landing CTA, mobile primary) |
| States | default, hover (`primary-hover` / `surface-raised`), active (translateY 0.5px), focus-visible (ring), disabled (`opacity-50`, `aria-disabled`, no pointer), loading (spinner replaces leading icon, label stays, `aria-busy="true"`) |
| Content | Verb first: "Save", "Hide", "Mark applied", "Retry". Icon-only allowed in JobCard actions with `aria-label` and a tooltip. |

### Link

| | |
|---|---|
| Variants | `inline` (primary color, underline always visible, 1px, offset 3px), `nav` (text color, no underline, `aria-current="page"` gets primary color + 2px bottom bar), `external` (inline + trailing "↗" icon, `target="_blank" rel="noopener noreferrer"`, visually hidden "(opens in new tab)") |
| States | hover (underline thickens to 2px), visited (no change: feed revisits are normal), focus-visible (ring) |
| Apply link | Rendered as a `primary` Button-styled `<a>`: "Apply on RemoteOK ↗". Never a `<button>`. |

### Badge

Small, 12 px text, `radius-sm`, padding 2×6 px. Never interactive by itself (if it filters on click, it is a Button styled as a chip).

| Variant | Style | Example |
|---|---|---|
| `source` | `surface-raised` bg, `border`, mono text, plus rating "★ 4.6" in `text-muted` | `RemoteOK ★4.6` |
| `tag` | `primary-subtle` bg, `text` color | `typescript` |
| `tag` (matched skill) | same + leading "✓" and `font-semibold`; label "Matches your skills" in tooltip/SR text | `✓ react` |
| `flag` | `warning-subtle` bg, `warning` text, leading ⚠ icon, full reason text | `⚠ Asks for payment upfront` |
| `status` | success/warning/danger subtle bg + text, leading dot icon | `● Synced 6h ago`, `● Failed` |
| `meta` | no bg, `text-muted`, mono | `Contract`, `Remote · EU` |

### JobCard

Level-1 surface, `radius-md`, padding 16 px (12 px under 400 px). Whole title is the link to job detail; actions are separate controls (no nested interactive elements).

| | |
|---|---|
| Variants | `default`, `compact` (desktop dense list: description excerpt hidden), `saved` (bookmark filled), `applied` (left 3px `success` rule + "Applied 2d ago" status badge), `flagged` (flag badges shown above the tags; card border stays neutral, the badge carries the message) |
| States | default, hover (bg `surface-raised`, desktop only), focus-within (ring on the focused control only), visited title (no change), hiding (fades out 160 ms, then removed; Undo toast) |
| Actions | Save (toggle, `aria-pressed`), Hide, Mark applied (toggle), Apply on {source} ↗. Mobile: Save + Apply visible, Hide/Mark applied in an overflow "More" menu. |

### FilterBar

| | |
|---|---|
| Layout | Mobile: sticky top bar with search input + "Filters (3)" button that opens a full-height sheet. Desktop (`lg`+): search across the top, filters in a left sidebar. |
| Controls | Keyword search (`type="search"`, submit on Enter, 300 ms debounce for live results), Tags (combobox with multi-select chips), Source (checkbox list), Job type (checkbox: Contract, Freelance, Part-time, Full-time), Remote/Region (select), Pay range (two number inputs: min/max, with period select /hr, /mo, /yr, fixed), Posted (radio: 24h, 3 days, 7 days, 30 days, Any) |
| States | default, has-active-filters (active chip row "Remote ✕ · $40+/hr ✕ · Clear all"), applying (results region `aria-busy`), invalid (min > max: inline error under pay field) |
| Sync | All filter state lives in the URL query string so results are shareable and Back works. |

### Pagination

| | |
|---|---|
| Variants | `numbered` (desktop: Prev, 1 … 4 **5** 6 … 20, Next), `simple` (mobile: "‹ Prev   Page 5 of 20   Next ›") |
| States | current page (`aria-current="page"`, filled), disabled Prev/Next at ends (rendered as text, not a dead link), loading (target page link shows spinner) |
| Behavior | Real links (`?page=6`) so it works without JS. Focus moves to the results heading after navigation. |

### EmptyState

Centered in the results region, max 28rem. Icon (24 px, `text-muted`), heading, one-line reason, one primary action.

| Variant | Heading | Body | Action |
|---|---|---|---|
| `no-results` | No jobs match these filters | Try removing a filter or widening the pay range. | Clear all filters |
| `no-jobs-yet` | No jobs yet today | Sources sync daily at 06:00 UTC. Check back after the next sync. | View sources |
| `all-hidden` | You've hidden everything here | Hidden jobs stay out of your feed. | Show hidden jobs |
| `no-saved` | No saved jobs | Tap Save on any job to keep it here. | Browse the feed |

### ErrorState

Inline in the region that failed (not a full page) unless the whole route failed (`error.tsx`).

| | |
|---|---|
| Variants | `inline` (inside a card or list: `danger-subtle` banner, icon, message, Retry), `page` (route-level: heading, message, Retry + "Go to feed") |
| States | default, retrying (Retry shows loading state) |
| Copy | Say what failed and what to do: "We couldn't load jobs. Check your connection and try again." Never show stack traces or raw error codes; a short reference ID is fine: "Ref: 7f3a". |

### Skeleton

| | |
|---|---|
| Variants | `job-card` (matches JobCard geometry: title bar 70% width, meta row, 3 badge pills), `source-card`, `detail` (title, meta, 6 text lines), `text-line` |
| Behavior | Show after 150 ms delay (avoid flash on fast loads). Render 6 job-card skeletons for the feed. Shimmer per §2.5. |

### UserMenu

| | |
|---|---|
| Trigger | 32 px avatar (initials fallback on `primary-subtle`), 44 px hit area, `aria-label="Account menu"`, `aria-haspopup="menu"`, `aria-expanded` |
| Items | Name + email (non-interactive header), Profile & skills, Saved, Applied, Theme (System / Light / Dark radio group), Sign out |
| States | closed, open (level-2 surface, fades + 4px slide in 160 ms), item hover/focus (`surface` bg) |

### SourceCard

| | |
|---|---|
| Content | Source name (h3), kind badge (`API`, `RSS`, `Browse directly`), user base ("≈ 50M monthly users"), rating ("★ 4.6 / 5"), fee notes ("Freelancer pays 10% per project"), last sync status badge, "Visit {source} ↗" external link |
| Variants | `ingested` (shows sync status and job count "312 jobs"), `browse-only` (Upwork, Fiverr, Toptal: no sync status; note "We don't collect jobs from this site. Its terms don't allow it." + "Browse on Upwork ↗") |
| States | synced (`success` status), stale >36h (`warning` status "Last sync 2d ago"), failed (`danger` status "Last sync failed"), disabled (`text-muted`, "Paused") |

### Toast

| | |
|---|---|
| Placement | Bottom-center on mobile (above safe area), bottom-right on desktop. Max 3 stacked. |
| Variants | `neutral` (default, "Job hidden"), `success` ("Marked as applied"), `error` ("Couldn't save. Try again.") |
| Actions | Optional single action ("Undo"). Dismiss button "✕" with `aria-label="Dismiss"`. |
| Timing | 5 s, paused on hover and focus. Toasts with an action stay 8 s. Errors persist until dismissed. |
| Rule | Toasts confirm; they never carry the only copy of important info. |

---

## 4. Wireframes

Legend: `[ Button ]`, `( input )`, `{Badge}`, `▢` checkbox, `◉` radio, `▒▒▒` skeleton, `↗` opens in new tab.

### 4.1 Landing (signed out) — `/`

Purpose: explain in one screen what Freelanz does and get the user signed in. No marketing fluff; show a real-looking card so the value is concrete.

**Mobile 360 px**
```
┌──────────────────────────────────┐
│ ■ freelanz              [Sign in]│  header, 56px
├──────────────────────────────────┤
│                                  │
│ Legit freelance dev work,        │  h1 text-3xl→2xl on mobile
│ one feed, checked daily.         │
│                                  │
│ We pull jobs from 8 trusted      │  text-md, muted
│ boards every morning, rank them, │
│ and flag likely scams.           │
│                                  │
│ [  Continue with GitHub       ]  │  lg buttons, full width
│ [  Continue with Google       ]  │
│ No passwords. We only read your  │  text-xs muted
│ name and email.                  │
│                                  │
│ ┌──────────────────────────────┐ │  sample JobCard (static, aria-hidden
│ │ Senior React dev (contract)  │ │  content replaced by a caption for SR)
│ │ Acme Labs · {RemoteOK ★4.6}  │ │
│ │ $60–80/hr · Remote · 3h ago  │ │
│ │ {react}{typescript}{next.js} │ │
│ └──────────────────────────────┘ │
│                                  │
│ How it works                     │  h2
│ 1 Collected daily from public    │
│   APIs and feeds                 │
│ 2 Ranked by source, freshness,   │
│   pay and your skills            │
│ 3 Scam signals flagged with the  │
│   reason                         │
│                                  │
│ Sources                          │  h2
│ RemoteOK · Remotive · WWR ·      │
│ Himalayas · Jobicy · Arbeitnow · │
│ Freelancer · HN Who is hiring    │
├──────────────────────────────────┤
│ About · Sources · Privacy        │  footer
└──────────────────────────────────┘
```

**Desktop 1280 px**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ freelanz                                              Sources   [Sign in] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Legit freelance dev work,              ┌─────────────────────────────────┐ │
│   one feed, checked daily.               │ Senior React dev (contract)     │ │
│                                          │ Acme Labs · {RemoteOK ★4.6}     │ │
│   We pull jobs from 8 trusted boards     │ $60–80/hr · Remote · 3h ago     │ │
│   every morning, rank them, and flag     │ {react}{typescript}{next.js}    │ │
│   likely scams.                          ├─────────────────────────────────┤ │
│                                          │ Crypto wallet "test task"       │ │
│   [ Continue with GitHub ]               │ Unknown · {Jobicy ★4.1}         │ │
│   [ Continue with Google ]               │ {⚠ Asks for payment upfront}    │ │
│   No passwords. We only read your        └─────────────────────────────────┘ │
│   name and email.                                                            │
│                                                                              │
│   ┌ 1 Collected daily ────┐ ┌ 2 Ranked for you ─────┐ ┌ 3 Scams flagged ───┐ │
│   │ Public APIs and feeds │ │ Source, freshness,    │ │ With the reason,   │ │
│   │ only. No scraping.    │ │ pay, your skills.     │ │ not just a warning.│ │
│   └───────────────────────┘ └───────────────────────┘ └────────────────────┘ │
│                                                                              │
│   Sources: RemoteOK · Remotive · We Work Remotely · Himalayas · Jobicy ·     │
│   Arbeitnow · Freelancer · HN Who is hiring          See all sources →       │
├──────────────────────────────────────────────────────────────────────────────┤
│ About · Sources · Privacy                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Feed — `/app`

Purpose: scan ranked jobs, narrow with filters, act (save/hide/apply) without leaving the list.

**Desktop 1280 px — populated**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ freelanz     Feed  Saved  Applied  Sources                        (IM) ▾  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ( 🔍 Search title, company, tech…                          ) [ Search ]      │
│ Active: {Remote ✕} {$40+/hr ✕} {react ✕}   Clear all                         │
├────────────────────┬─────────────────────────────────────────────────────────┤
│ Filters            │ Jobs  · 1,248 results · sorted by best match      ⓘ    │
│                    │                                                         │
│ Posted             │ ┌─────────────────────────────────────────────────────┐ │
│ ◉ Any  ○ 24h       │ │ Senior React dev (contract, 3 months)        3h ago │ │
│ ○ 3 days ○ 7 days  │ │ Acme Labs · {RemoteOK ★4.6}                         │ │
│                    │ │ $60–80/hr · Contract · Remote · EU                  │ │
│ Job type           │ │ {✓ react}{typescript}{next.js}{+2}                  │ │
│ ▢ Contract         │ │ [☆ Save] [Hide] [✓ Applied]  [Apply on RemoteOK ↗]  │ │
│ ▢ Freelance        │ └─────────────────────────────────────────────────────┘ │
│ ▢ Part-time        │ ┌─────────────────────────────────────────────────────┐ │
│                    │ │ Build Shopify app for crypto wallet          1d ago │ │
│ Remote / Region    │ │ Company not listed · {Freelancer ★4.0}              │ │
│ ( Anywhere     ▾ ) │ │ $500 fixed · Freelance · Remote                     │ │
│                    │ │ {⚠ Asks for payment upfront}                        │ │
│ Pay                │ │ {⚠ Contact only via Telegram}                       │ │
│ ( min ) – ( max )  │ │ {shopify}{node}                                     │ │
│ ( /hr          ▾ ) │ │ [☆ Save] [Hide] [✓ Applied] [Apply on Freelancer ↗] │ │
│                    │ └─────────────────────────────────────────────────────┘ │
│ Source             │  … 18 more cards                                        │
│ ▢ RemoteOK   (312) │                                                         │
│ ▢ Remotive   (198) │  [‹ Prev]  1 … 4 [5] 6 … 63  [Next ›]                   │
│ Tags               │                                                         │
│ ( Add tag…     ▾ ) │                                                         │
└────────────────────┴─────────────────────────────────────────────────────────┘
```
"ⓘ" opens a short popover explaining ranking ("Best match = source quality, freshness, client rating, pay, and your skills").

**Mobile 360 px — populated**
```
┌──────────────────────────────────┐
│ ■ freelanz                 (IM)▾ │
├──────────────────────────────────┤
│ ( 🔍 Search jobs…             )  │  sticky
│ [ Filters · 3 ]  1,248 results   │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ Senior React dev (contract,  │ │  title wraps, max 2 lines
│ │ 3 months)                    │ │
│ │ Acme Labs · {RemoteOK ★4.6}  │ │
│ │ $60–80/hr · Remote · 3h ago  │ │
│ │ {✓ react}{typescript}{+3}    │ │
│ │ [☆ Save] [⋯]  [Apply ↗     ] │ │  44px targets; ⋯ = Hide, Mark applied
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Build Shopify app for crypto │ │
│ │ wallet                       │ │
│ │ Company not listed ·         │ │
│ │ {Freelancer ★4.0}            │ │
│ │ $500 fixed · Remote · 1d ago │ │
│ │ {⚠ Asks for payment upfront} │ │
│ │ {⚠ +1 more warning}          │ │
│ │ [☆ Save] [⋯]  [Apply ↗     ] │ │
│ └──────────────────────────────┘ │
│  …                               │
│ ‹ Prev     Page 5 of 63   Next › │
├──────────────────────────────────┤
│ Feed   Saved   Applied   Sources │  bottom nav, 56px, safe-area aware
└──────────────────────────────────┘

Filters sheet (opened):
┌──────────────────────────────────┐
│ Filters                     [✕]  │
├──────────────────────────────────┤
│ Posted   ◉ Any ○ 24h ○ 3d ○ 7d   │
│ Job type ▢ Contract ▢ Freelance  │
│ Region   ( Anywhere          ▾ ) │
│ Pay      ( min ) – ( max ) /hr ▾ │
│ Source   ▢ RemoteOK ▢ Remotive … │
│ Tags     ( Add tag…          ▾ ) │
├──────────────────────────────────┤
│ [Clear all]    [ Show 1,248 jobs]│  sticky footer
└──────────────────────────────────┘
```

**Feed — loading (both widths)**
```
Desktop                                         Mobile
┌──────────┬─────────────────────────────┐      ┌──────────────────────────┐
│ Filters  │ Jobs · Loading…             │      │ ( 🔍 Search jobs…      ) │
│ (stay    │ ┌─────────────────────────┐ │      │ [ Filters ]  Loading…    │
│ usable)  │ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒ │ │      │ ┌──────────────────────┐ │
│          │ │ ▒▒▒▒▒▒▒▒ ▒▒▒▒▒▒         │ │      │ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒     │ │
│          │ │ ▒▒▒▒ ▒▒▒▒ ▒▒▒▒           │ │      │ │ ▒▒▒▒▒▒▒ ▒▒▒▒▒        │ │
│          │ └─────────────────────────┘ │      │ │ ▒▒▒ ▒▒▒▒ ▒▒▒         │ │
│          │ ┌─────────────────────────┐ │      │ └──────────────────────┘ │
│          │ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒      ▒▒▒▒ │ │      │ ┌──────────────────────┐ │
│          │ │ …  ×6 skeleton cards     │ │      │ │ …  ×6                │ │
└──────────┴─────────────────────────────┘      └──────────────────────────┘
```
Results region has `aria-busy="true"`; a visually hidden live region says "Loading jobs". Count reads "Loading…" (not "0 results").

**Feed — empty (no results for filters)**
```
Desktop                                         Mobile
┌──────────┬─────────────────────────────┐      ┌──────────────────────────┐
│ Filters  │ Jobs · 0 results            │      │ [ Filters · 4 ] 0 results│
│ (active  │                             │      │                          │
│ chips    │          ⌕                  │      │           ⌕              │
│ shown)   │  No jobs match these filters│      │ No jobs match these      │
│          │  Try removing a filter or   │      │ filters                  │
│          │  widening the pay range.    │      │ Try removing a filter or │
│          │                             │      │ widening the pay range.  │
│          │     [ Clear all filters ]   │      │ [  Clear all filters   ] │
└──────────┴─────────────────────────────┘      └──────────────────────────┘
```
Other empty variants (`no-jobs-yet`, `all-hidden`) use the same layout with copy from §3 EmptyState.

**Feed — error**
```
Desktop                                         Mobile
┌──────────┬─────────────────────────────┐      ┌──────────────────────────┐
│ Filters  │ Jobs                        │      │ [ Filters ]              │
│          │ ┌─────────────────────────┐ │      │ ┌──────────────────────┐ │
│          │ │ ⚠ We couldn't load jobs.│ │      │ │ ⚠ We couldn't load   │ │
│          │ │ Check your connection   │ │      │ │ jobs. Check your     │ │
│          │ │ and try again. Ref: 7f3a│ │      │ │ connection and try   │ │
│          │ │            [ Retry ]    │ │      │ │ again.   [ Retry ]   │ │
│          │ └─────────────────────────┘ │      │ └──────────────────────┘ │
└──────────┴─────────────────────────────┘      └──────────────────────────┘
```
Filters remain usable; Retry keeps current filters. Banner has `role="alert"`.

### 4.3 Job detail — `/app/jobs/[id]`

Purpose: decide whether to apply. Facts and warnings first, description second, apply always visible.

**Desktop 1280 px**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ freelanz     Feed  Saved  Applied  Sources                        (IM) ▾  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ‹ Back to results                                                            │
│                                                                              │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────────────┐ │
│ │ Senior React dev (contract, 3 months)        │ │ [ Apply on RemoteOK ↗ ] │ │  sticky
│ │ Acme Labs                                    │ │ [☆ Save] [✓ Mark applied]│ │  aside
│ │                                              │ │ [ Hide this job ]       │ │
│ │ ⚠ Warnings (only when flagged)               │ ├─────────────────────────┤ │
│ │ {⚠ Asks for payment upfront}                 │ │ Pay      $60–80/hr      │ │
│ │ Why: the post asks applicants to pay a fee.  │ │ Type     Contract       │ │
│ │                                              │ │ Remote   Yes · EU only  │ │
│ │ About the role                         (h2)  │ │ Posted   3h ago         │ │
│ │ Sanitized description, text-md, 42rem max    │ │ Source   RemoteOK ★4.6  │ │
│ │ width, headings/lists preserved…             │ │ Client   ★4.8 (if known)│ │
│ │                                              │ ├─────────────────────────┤ │
│ │                                              │ │ Tags                    │ │
│ │                                              │ │ {✓ react}{typescript}   │ │
│ │                                              │ │ {next.js}{graphql}      │ │
│ │ Posted on RemoteOK. Freelanz links to the    │ └─────────────────────────┘ │
│ │ original post; apply there.                  │                             │
│ └──────────────────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Mobile 360 px**
```
┌──────────────────────────────────┐
│ ‹ Results                 (IM)▾  │
├──────────────────────────────────┤
│ Senior React dev (contract,      │  h1 text-xl
│ 3 months)                        │
│ Acme Labs · {RemoteOK ★4.6}      │
│                                  │
│ $60–80/hr · Contract             │  facts as a definition list,
│ Remote · EU only · 3h ago        │  2 lines
│ {✓ react}{typescript}{+2}        │
│                                  │
│ ┌ ⚠ 1 warning ─────────────────┐ │  only when flagged
│ │ Asks for payment upfront.    │ │
│ │ The post asks applicants to  │ │
│ │ pay a fee.                   │ │
│ └──────────────────────────────┘ │
│                                  │
│ About the role                   │
│ Description text…                │
│ …                                │
│                                  │
├──────────────────────────────────┤
│ [☆] [⋯]  [ Apply on RemoteOK ↗ ] │  sticky bottom action bar
└──────────────────────────────────┘
```
States: loading = `detail` skeleton; not found = page EmptyState "This job is gone. It may have expired (we keep jobs for 45 days)." + "Back to feed"; error = page ErrorState.

### 4.4 Sources — `/app/sources` (also linked from landing)

Purpose: show where jobs come from and how trustworthy each source is; be honest about sites we don't collect from.

**Desktop 1280 px**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ freelanz     Feed  Saved  Applied  Sources                        (IM) ▾  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Sources                                                                (h1) │
│ Jobs are collected once a day at 06:00 UTC from these sources.               │
│                                                                              │
│ Collected daily (8)                                                    (h2) │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   │
│ │ RemoteOK      {API}  │ │ Remotive      {API}  │ │ We Work Remotely{RSS}│   │
│ │ ≈ 1.5M monthly users │ │ ≈ 1M monthly users   │ │ ≈ 3M monthly users   │   │
│ │ ★ 4.6 / 5            │ │ ★ 4.5 / 5            │ │ ★ 4.4 / 5            │   │
│ │ Free for applicants  │ │ Free for applicants  │ │ Free for applicants  │   │
│ │ {● Synced 6h ago}    │ │ {● Last sync 2d ago} │ │ {● Last sync failed} │   │
│ │ 312 jobs             │ │ 198 jobs             │ │ 0 new today          │   │
│ │ Visit RemoteOK ↗     │ │ Visit Remotive ↗     │ │ Visit WWR ↗          │   │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘   │
│ …                                                                            │
│                                                                              │
│ Browse directly (3)                                                    (h2) │
│ We don't collect jobs from these sites. Their terms don't allow it.          │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   │
│ │ Upwork  {Browse}     │ │ Fiverr  {Browse}     │ │ Toptal  {Browse}     │   │
│ │ ≈ 18M monthly users  │ │ …                    │ │ …                    │   │
│ │ Fees: 0–15% per      │ │                      │ │                      │   │
│ │ contract             │ │                      │ │                      │   │
│ │ Browse on Upwork ↗   │ │ Browse on Fiverr ↗   │ │ Browse on Toptal ↗   │   │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```
(User-base and rating numbers above are placeholders; real values come from the `sources` table.)

**Mobile 360 px**
```
┌──────────────────────────────────┐
│ ■ freelanz                 (IM)▾ │
├──────────────────────────────────┤
│ Sources                          │
│ Collected daily at 06:00 UTC.    │
│                                  │
│ Collected daily (8)              │
│ ┌──────────────────────────────┐ │
│ │ RemoteOK               {API} │ │
│ │ ≈ 1.5M users · ★ 4.6         │ │
│ │ Free for applicants          │ │
│ │ {● Synced 6h ago} · 312 jobs │ │
│ │ Visit RemoteOK ↗             │ │
│ └──────────────────────────────┘ │
│ …                                │
│ Browse directly (3)              │
│ We don't collect jobs from these │
│ sites. Their terms don't allow   │
│ it.                              │
│ ┌──────────────────────────────┐ │
│ │ Upwork              {Browse} │ │
│ │ ≈ 18M users · Fees 0–15%     │ │
│ │ Browse on Upwork ↗           │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ Feed   Saved   Applied   Sources │
└──────────────────────────────────┘
```
States: loading = 6 `source-card` skeletons; empty = "No sources configured" (admin-facing, unlikely); error = inline ErrorState with Retry.

---

## 5. JobCard content priority and copy

### 5.1 Priority (what the eye hits, in order)

1. **Title** (text-base 600 on desktop list, text-md on mobile; max 2 lines, then ellipsis; full title in detail view).
2. **Flags** if any, directly under company/source. A flagged job must be impossible to misread as clean.
3. **Pay** (mono). If not stated: "Pay not listed" in `text-muted`.
4. **Company + source with rating.** Missing company: "Company not listed".
5. **Job type, remote/region, posted time** (posted time right-aligned on desktop, inline on mobile).
6. **Tags** (max 3 visible + "+N"; matched skills first, marked ✓).
7. **Actions.** Apply is the only primary button per card.

Description excerpt appears only in the `default` desktop variant (2 lines, `text-muted`), never on mobile.

### 5.2 Tone

- Plain, direct, calm. Second person ("your skills"), present tense, sentence case everywhere (including buttons and headings).
- Short: labels 1–3 words, messages one sentence plus one action.
- No hype ("Amazing opportunity!"), no exclamation marks, no blame ("You entered an invalid…" becomes "Max pay must be higher than min pay.").
- Be honest about limits: "We don't collect jobs from Upwork. Its terms don't allow it."
- Do not re-word the source's job title; show it as-is (trimmed, no ALL CAPS rewrite).

### 5.3 Formats

| Data | Format | Examples |
|---|---|---|
| Relative time | `<1 min` → "Just now"; minutes "12m ago"; hours "3h ago"; days "2d ago" up to 6d; then date "Oct 3"; previous years "Oct 3, 2025". Full ISO date in `<time datetime>` and `title`. | 3h ago · 2d ago · Oct 3 |
| Pay range | Currency symbol, en dash, no spaces, period suffix. Thousands with "k" at ≥ 10,000. | $40–60/hr · €4.5k–6k/mo · $120k–150k/yr |
| Single value | "Up to" or "From" when only one bound. | Up to $50/hr · From $90k/yr |
| Fixed price | "fixed" suffix. | $500 fixed · $2k–5k fixed |
| Unknown currency code | ISO code prefix. | CHF 90–110/hr |
| No pay | muted text | Pay not listed |
| Remote / region | "Remote" · "Remote · EU only" · "Hybrid · Berlin" · "On-site · NYC" | |
| Counts | Thousands separator; compact ≥ 10k. | 1,248 results · ≈ 18M users |
| Rating | One decimal, star glyph, "/ 5" on detail. Unknown: "No rating". | ★4.6 · ★ 4.6 / 5 |

### 5.4 Flag copy (FR-12)

Flag badges state the observed behavior, not an accusation. Detail view adds a one-line "Why".

| Heuristic | Badge | Detail "Why" |
|---|---|---|
| Payment request | Asks for payment upfront | The post asks applicants to pay a fee, deposit, or for "training". |
| Messenger-only contact | Contact only via Telegram / WhatsApp | The only way to apply is a chat app, not the source site or a company email. |
| Crypto test task | Crypto "test task" | The post asks for unpaid work involving a crypto wallet or transfer. |
| Missing company | Company not listed | The post doesn't name a company or client. |

Section header on detail: "1 warning" / "2 warnings". Never "Scam" or "Fraud": we flag signals, the user decides.

---

## 6. Accessibility notes (WCAG 2.2 AA)

Global:
- Landmarks: `<header>` with `<nav aria-label="Main">`, `<main id="main">`, `<aside aria-label="Filters">`, `<footer>`. First focusable element is a "Skip to results" / "Skip to content" link.
- One `h1` per page. Feed: h1 "Jobs" (visually can sit with the count); each JobCard title is an `h3` under a visually hidden `h2` "Results".
- Visible focus ring on every interactive element (2 px `focus-ring`, 2 px offset, ≥ 3:1 on all surfaces, §2.2). Focus is never hidden by sticky header/footers (`scroll-padding-top`/`-bottom` set to their heights; WCAG 2.4.11).
- No information by color alone: status badges have a text label, flags have icon + text, matched tags have ✓ + SR text, applied cards have a text badge besides the green rule.
- Respect `prefers-reduced-motion` (§2.5) and `prefers-color-scheme`. Text resizes to 200% and reflows at 320 CSS px with no horizontal scroll (only code blocks inside descriptions may scroll, in their own container).
- Touch targets ≥ 44×44 px on coarse pointers; ≥ 24×24 px minimum everywhere (2.5.8).

| Component | Notes |
|---|---|
| Button | Native `<button>`. Toggles use `aria-pressed`. Loading keeps the label and sets `aria-busy`; disabled uses `aria-disabled="true"` (stays focusable so the reason can be read via `aria-describedby`). Icon-only buttons need `aria-label` matching the visible tooltip. |
| Link | Native `<a href>`. External links: visible ↗ icon (`aria-hidden`) plus visually hidden "(opens in new tab)". Link text unique per card: "Apply on RemoteOK", not "Apply". Underline on inline links so color is not the only cue. |
| Badge | Plain text, not interactive. Icons `aria-hidden`. Matched-skill tag adds SR text "matches your skills". Source rating reads "rated 4.6 out of 5" via visually hidden text. |
| JobCard | `<article aria-labelledby="{titleId}">`. Title is the single link to detail (no whole-card click wrapper with nested controls). Action buttons have contextual names: "Save Senior React dev", via `aria-label` or visually hidden text. Hiding a card moves focus to the next card's title (or the results heading if last) and announces "Job hidden" via the toast's live region with Undo. |
| FilterBar | Every control has a visible `<label>`; groups use `<fieldset>`/`<legend>` (Posted, Job type, Source). Pay min/max errors are tied with `aria-describedby` and `aria-invalid`. Results count is in a polite live region ("1,248 results") updated after filtering. Mobile sheet is a modal dialog: `role="dialog" aria-modal="true"`, focus trapped, Escape closes, focus returns to the "Filters" button. Tags combobox follows the ARIA combobox pattern. |
| Pagination | `<nav aria-label="Pagination">`, list of links, `aria-current="page"` on current. Prev/Next have full names ("Previous page"). Disabled ends are non-links. After navigation, focus goes to the results heading. |
| EmptyState | Heading level fits the page outline (h2 in results region). Rendered inside the results live region so the change is announced. Decorative icon `aria-hidden`. |
| ErrorState | `role="alert"` for inline errors that appear after an action; page-level errors move focus to their heading. Retry is a real button with a clear name ("Retry loading jobs"). |
| Skeleton | Container `aria-busy="true"`; skeleton blocks `aria-hidden="true"`; one visually hidden "Loading jobs" status message. No shimmer under reduced motion. |
| UserMenu | Menu button pattern: `aria-haspopup="menu"`, `aria-expanded`; items `role="menuitem"` / `menuitemradio` for theme. Arrow keys move, Home/End jump, Escape closes and returns focus to trigger, Tab closes. Avatar `alt=""` with the button's accessible name "Account menu". |
| SourceCard | `<article>` with `h3` name. Kind and status badges as text. Sync time as `<time datetime>`. "Browse directly" explanation is real text, not a tooltip. |
| Toast | Container is a persistent `role="status"` (polite) region; error toasts use `role="alert"`. Auto-dismiss pauses on hover/focus (2.2.1); the Undo action must be keyboard-reachable before the toast dismisses (toasts render in DOM order right after `<main>`), and the same action stays available elsewhere (e.g. "Show hidden jobs"). Never steal focus. |
| Job description (HTML) | Sanitized HTML keeps headings demoted so it nests under the page h2 (h1/h2 in source become h3). Links inside get `rel="noopener noreferrer nofollow" target="_blank"` with the new-tab hint. |
| Theme toggle | Radio group (System / Light / Dark) inside UserMenu, current choice announced. Contrast verified for both themes (§2.2). |

---

## 7. Open questions for the Lead

1. Mobile bottom nav vs. hamburger: proposed bottom nav (4 items) for one-tap reach. Confirm.
2. Source rating and user-base values on the Sources page need a cited origin (FLZ-10); the design shows "≈" to signal estimates.
3. Theme preference persistence: cookie (proposed, avoids flash) vs. `user_profiles` column.
