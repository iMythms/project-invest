# DESIGN.md

## 1. Product Intent

Design for a family office investment portal. The product serves authenticated business users who review opportunities, submit investment requests, approve or reject requests, inspect audit history, and monitor portfolio activity.

Default the information hierarchy to the `approver` role because that role sees the widest operational surface. Other roles should inherit the same design language with reduced actions and narrower data visibility.

This system should feel:
- Institutional, calm, and credible
- Premium through restraint, not decoration
- Efficient for real work, not styled like generic CRUD or noisy consumer fintech
- Clear on desktop and tablet first, with solid mobile fallback for auth and lighter review flows
- Public-facing on the outside, operationally disciplined on the inside

When elegance and operational speed compete, choose operational speed.

## 2. Visual Theme And Atmosphere

Reference direction: Tanami-style institutional credibility combined with Coinbase-style landing-page clarity and blue-accent trust cues.

The UI should read as:
- Light-first
- Airy on public pages, tighter inside the app
- Softly layered, never bulky
- Minimal motion
- Minimal but strategic imagery or product mockups
- Executive in tone, but still practical for daily operations

Avoid loud gradients, neon accents, glossy startup visuals, oversized marketing gestures, and playful consumer patterns.
Avoid heavy cards stacked on tinted backgrounds. Prefer cleaner white sections, thinner borders, more breathing room, and fewer nested containers.

## 3. Color Palette And Roles

### Core Neutrals

| Token | Hex | Role |
| --- | --- | --- |
| `ink-950` | `#0F172A` | Primary headings, high-emphasis text |
| `ink-800` | `#1E293B` | Secondary headings, sidebar active text |
| `slate-700` | `#334155` | Default body text |
| `slate-500` | `#64748B` | Muted text, helper copy |
| `slate-300` | `#CBD5E1` | Strong borders, dividers |
| `slate-200` | `#E2E8F0` | Standard borders, table separators |
| `slate-100` | `#F1F5F9` | Subtle backgrounds, hover surfaces |
| `cloud-50` | `#F8FAFC` | App canvas |
| `white` | `#FFFFFF` | Cards, panels, inputs |

### Brand And Action Colors

| Token | Hex | Role |
| --- | --- | --- |
| `trust-700` | `#1D4ED8` | Primary action, active nav, key links |
| `trust-600` | `#2563EB` | Primary button background |
| `trust-500` | `#3B82F6` | Focus ring, chart highlight, selected states |
| `trust-100` | `#DBEAFE` | Selected row, active pill background |
| `trust-50` | `#EFF6FF` | Soft brand wash |
| `trust-25` | `#F8FBFF` | Public hero wash, very soft highlight sections |

### Semantic Status Colors

Use muted but clear semantics. Color supports meaning; labels and icons must still carry the state.

| Token | Hex | Role |
| --- | --- | --- |
| `success-700` | `#166534` | Approved text/icon |
| `success-100` | `#DCFCE7` | Approved badge background |
| `warning-700` | `#A16207` | Pending text/icon |
| `warning-100` | `#FEF3C7` | Pending badge background |
| `danger-700` | `#B91C1C` | Rejected/error text/icon |
| `danger-100` | `#FEE2E2` | Rejected/error badge background |
| `info-700` | `#1D4ED8` | Informational callouts |
| `info-100` | `#DBEAFE` | Informational surfaces |

## 4. Typography Rules

Primary direction: modern sans-serif with disciplined hierarchy. Use `Inter` or a similar neutral grotesk. Monospace is allowed only for IDs, audit metadata, exact values, and code-like fields.

Public pages should feel closer to editorial fintech marketing than to a dashboard. Headlines may be larger and more spacious than the internal app, but they should still remain controlled and trustworthy.

### Type Hierarchy

| Usage | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | `32px` | `600` | Tight, confident, never theatrical |
| Section title | `24px` | `600` | Used above cards, tables, and grouped content |
| Card title | `18px` | `600` | Summary cards and panel headers |
| Body | `14px` to `16px` | `400` to `500` | Prefer `16px` in forms and auth pages |
| Label | `13px` to `14px` | `500` | Form labels, field group headings |
| Caption | `12px` to `13px` | `400` to `500` | Metadata, helper text, timestamps |
| Numeric KPI | `28px` to `36px` | `600` | Strong but not flashy |

### Typography Behavior

- Prefer sentence case over all caps
- Keep line lengths moderate on auth and public pages
- Use tighter spacing for tables and metadata, more open spacing for auth and landing sections
- Let typography and whitespace carry the premium quality
- Prefer fewer words with stronger line breaks on hero sections
- On public pages, use large but clean headline blocks rather than dense feature-card walls

## 5. Layout Principles

### Application Shell

Authenticated product pages should use a left sidebar shell.

Shell rules:
- Fixed or sticky left sidebar on desktop
- Compact top header for page title, role-aware actions, and account controls
- Main content region should prioritize tables, queues, and summary panels
- Use a max content width for dashboard-like overviews, but allow wider spans for tables and audit logs

Suggested navigation order:
1. Dashboard
2. Opportunities
3. Investments
4. Approvals
5. Audit Log

### Public And Auth Surfaces

- Public pages should be cleaner and more spacious than the app core
- Auth screens should feel secure, minimal, and quiet
- Public marketing can borrow from Coinbase-style section rhythm: large headline, clear CTA, product mockup, trust proof, and simplified feature rows
- Tanami-style proof elements are encouraged: manager logos, credibility statements, governance language, access framing
- Avoid stuffing public pages with too many boxed cards. Use more open sections, restrained dividers, and only a few high-value surfaces
- Login pages must never expose seeded demo accounts or passwords directly in the UI

### Spacing Scale

Base spacing rhythm:
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`

Use:
- `16px` to `24px` inside cards
- `24px` to `32px` between major dashboard sections
- `12px` to `16px` between stacked form fields
- `8px` vertical rhythm inside tables and metadata groups
- On landing pages, allow `48px` to `88px` between major sections when that creates cleaner pacing

## 6. Depth And Elevation

Surfaces should feel softly layered, not heavy.

Surface hierarchy:
- App background: `cloud-50`
- Primary surface: `white`
- Secondary surface: `slate-100`
- Elevated popover or modal: `white` with slightly stronger shadow and border

Shadow style:
- Prefer faint, diffused shadows over dramatic blur
- A subtle border is often more important than the shadow
- Tables and cards should feel separated through contrast and rhythm, not visual weight

Suggested elevation behavior:
- Default cards: light border + subtle shadow
- Hoverable cards: slightly stronger shadow, no large lift animation
- Dropdowns and modals: crisp border, calm shadow, strong layering clarity
- Public sections should often work without card chrome at all; use cards only when they add structure

## 7. Component Stylings

### Sidebar Navigation

- Use a pale canvas slightly darker than the main background
- Active item uses `trust-50` background, `trust-700` text, and a subtle left indicator or inset highlight
- Inactive items use `slate-700` text with clear hover affordance
- Group admin or approver-only routes clearly, but do not over-separate the shell

### Top Header

- Keep compact and utility-first
- Show page title, optional page subtitle, and high-value actions on the right
- User identity and role badge should be visible but quiet

### Buttons

- Primary: deep blue background, white text, medium radius, crisp hover darkening
- Secondary: white or very light neutral background with border
- Tertiary: text button for row-level actions or low-emphasis controls
- Destructive: white or pale red background with red text unless the action requires stronger emphasis

Button rules:
- Use medium radius, not pill shapes
- Avoid oversized CTAs in the app shell
- Keep padding disciplined and predictable
- On landing pages, primary CTAs may be slightly more prominent, but still clean and compact rather than oversized pills

### Inputs

- White background, neutral border, strong focus ring in `trust-500`
- Labels sit above fields
- Validation errors use muted red surfaces with explicit text
- Disabled fields should reduce contrast clearly without becoming unreadable

### Cards

- Use for KPIs, summaries, approval context, and document metadata
- Prefer simple headers and one dominant value or insight per card
- Avoid stuffing multiple unrelated metrics into one card
- On public pages, use fewer cards overall. Prefer one strong mockup panel or one trust panel instead of repeated equal-weight boxes

### Tables

Tables are a core pattern for this product.

Table rules:
- Prioritize scanability over decorative density
- Use crisp row dividers and restrained zebra or hover treatment
- Keep column labels clear and slightly stronger than body text
- Row actions should be obvious but not visually noisy
- Selected rows should use soft brand tinting, never saturated fills

### Status Badges

- Use muted backgrounds and darker text
- Include consistent casing and shape across statuses
- `pending`, `approved`, and `rejected` should be instantly distinguishable even with restrained color

### Modals And Drawers

- Use for approval confirmation, request details, notes entry, or document preview
- Keep headers concise and action structure obvious
- Prefer drawers for contextual review and modals for confirmation or short-form edits

### Empty States

- Calm and direct, never playful
- Include one sentence explaining the state and one relevant next action
- Light iconography is acceptable; illustration-heavy empty states are not

### Public Landing Composition

Landing pages should use a clear marketing rhythm:
- slim top navigation
- one hero section with headline, supporting copy, CTA group, and trust/product mockup
- one trust proof strip or manager/logo band
- one or two product explanation sections with alternating text and visual emphasis
- one closing CTA section
- quiet footer

Public page rules:
- maintain generous whitespace
- do not turn every content chunk into a bordered panel
- use blue selectively to pull the eye toward trust and action
- use screenshots, mock surfaces, or product frames rather than decorative illustration when possible

## 8. Data Visualization Guidance

Charts should support executive clarity.

Rules:
- Prefer simple bar, line, and allocation charts
- Use limited series counts and strong labeling
- Avoid dense legends, excessive gridlines, and saturated palettes
- Let one blue accent carry the primary series; secondary series should rely on cool neutrals
- If a chart becomes busy, convert it into a table or KPI group

Tables and charts should feel coordinated: same spacing discipline, same text contrast logic, same restrained use of accent color.

## 9. Responsive Behavior

Primary optimization target: desktop and tablet.

Responsive rules:
- Desktop: full sidebar shell with wide data views
- Tablet: collapsible sidebar, stacked summary cards, preserved table usefulness via horizontal scroll where needed
- Mobile: focus on auth, dashboard summary, opportunities list, and lightweight review flows

On smaller screens:
- Collapse multi-column layouts quickly
- Keep tap targets at least `40px` high
- Convert dense toolbars into segmented stacks
- Preserve status visibility and primary actions without requiring horizontal scanning whenever possible
- For large tables, allow horizontal overflow instead of destroying column meaning

## 10. Role-Aware UX Rules

The system must visually reflect permissions without becoming inconsistent.

- `viewer`: emphasize read-only clarity and portfolio visibility
- `investor`: emphasize opportunity review and request submission
- `approver`: emphasize queue management, decision actions, bulk review, and audit visibility

Rules:
- Hide unavailable actions instead of teasing inaccessible controls by default
- When a page is role-limited, explain access boundaries plainly
- Approver workflows should feel fastest and most information-rich

## 11. Motion And Interaction

Motion should be minimal.

Allowed motion:
- Subtle hover feedback
- Soft panel or modal entrance
- Small opacity or translate transitions under `200ms`

Avoid:
- Large parallax effects
- Bouncy transitions
- Continuous ambient motion
- Decorative animation in dashboards or auth pages

## 12. Imagery And Iconography

Imagery should be minimal.

- Prefer abstract linework, subtle grid texture, architectural cropping, or quiet financial motifs if imagery is needed
- Do not rely on stock-trader cliches or exuberant business photography
- Screenshots or product mock frames inspired by trusted fintech sites are acceptable when they reinforce clarity and control
- Icons should be simple, crisp, and outline-first or lightly filled

## 13. Do And Do Not

### Do

- Design for trust, governance, and clarity
- Use whitespace intentionally to create quality
- Keep financial states obvious and readable
- Make approvals and audit trails feel controlled and high-confidence
- Use deep blue selectively as the main accent
- Let tables and workflow views drive the product identity
- Let public pages feel polished and inviting without becoming loud or promotional

### Do Not

- Do not make the portal feel like retail banking or consumer investing
- Do not use loud gradients, glossy cards, or trend-driven glassmorphism
- Do not rely on color alone to communicate request status
- Do not over-round controls or surfaces
- Do not make dashboards look like marketing pages
- Do not trade legibility for visual cleverness
- Do not expose demo credentials or passwords in production-facing auth screens

## 14. Agent Implementation Guide

When generating UI for this project:

- Start from a light institutional base with soft neutral layering
- Use a left sidebar for authenticated pages
- Optimize the visual hierarchy for approver workflows first
- Keep auth and public pages more spacious, but within the same restrained design language
- For the landing page, combine Tanami-style trust framing with Coinbase-style airy section pacing and blue-led CTA emphasis
- Favor clean tables, muted badges, measured typography, and disciplined spacing
- Use blue as the primary accent and keep semantic colors subdued
- If unsure, choose the more conservative and operationally clear design option
