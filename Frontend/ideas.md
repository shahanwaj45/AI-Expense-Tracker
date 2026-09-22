# Design directions

## Approach 1
**Theme Name:** Soft Signal
**Very Brief Intro:** A light, editorial finance workspace with warm paper surfaces, quiet neumorphism, and confident ink typography. Motion feels like a calm operating system: crisp, intentional, and reassuring.
**Probability:** 0.04

## Approach 2
**Theme Name:** Atlas Ledger
**Very Brief Intro:** A structured modernist dashboard that treats money like a navigable map, pairing cobalt wayfinding accents with generous white space and sharp data landmarks. The mood is clear, capable, and quietly ambitious.
**Probability:** 0.07

## Approach 3
**Theme Name:** Night Pulse
**Very Brief Intro:** A dark, atmospheric command center with electric color cues for alerts, AI, and goals. The mood is focused and energetic, reserved for users who want their finances to feel like a live control room.
**Probability:** 0.02

# Chosen approach: Soft Signal

## Design Movement
Contemporary editorial software design with material-inspired neumorphism, influenced by Swiss information systems and tactile paper interfaces.

## Core Principles
1. **Clarity before decoration:** Every visual accent explains a category, state, or next action.
2. **Soft surfaces, sharp type:** Cards have pillowy shadows, while typography stays precise and slightly condensed.
3. **Asymmetric confidence:** The dashboard uses a strong left rail and offset content blocks instead of a centered marketing grid.
4. **Motion as reassurance:** Small rises, number reveals, and progress sweeps make the product feel alive without creating noise.

## Color Philosophy
The base is warm, almost-paper white with deep ink for reading and muted slate for secondary information. Semantic accents carry meaning: mint for income/savings, violet for budgets, indigo for AI, coral for expenses, amber for risk, and cyan for travel. The signature brand color is **signal mint #7BE2BE**, chosen to feel optimistic, current, and financially restorative.

## Layout Paradigm
Persistent left navigation on wide screens, a compact top bar on small screens, and an intentionally offset dashboard canvas: a dominant welcome/health panel, two compact metric cards, then dense insight panels with purposeful whitespace. Tables become stacked list rows on mobile.

## Signature Elements
- A thin mint signal line that appears in the logo, active nav state, and chart highlights.
- Soft inset metric tiles with a small colored index dot and count-up number treatment.
- A translucent “AI note” ribbon with a sparkle icon and one-sentence recommendation.

## Interaction Philosophy
Controls should feel easy to trust. Hover states lift cards by a few pixels; primary actions use a quick press scale; form actions show immediate toast feedback. Drawer/sidebar motion is short and directional, while numbers and progress bars reveal only once on first view.

## Animation
Use spring-like ease-out transitions under 280ms. Stagger the first dashboard row by 50ms per card, animate progress bars from 0 to their values, and use subtle y-axis movement for chart columns. Respect reduced motion by disabling decorative transforms and retaining only opacity changes.

## Typography System
Use **Plus Jakarta Sans** for body/UI and **DM Sans** for prominent numbers and headings. H1 is 42–56px with tight tracking; section titles are 20–24px; body copy is 14–15px. Labels use uppercase 11px with 0.12em tracking.

## Brand Essence
**Positioning:** A smarter, calmer money cockpit for students and professionals who want clarity without spreadsheets. **Personality:** observant, optimistic, grounded.

## Brand Voice
Headlines are direct and warm. CTAs are active, specific, and low-pressure. Microcopy explains what changed and what to do next.

Example lines:
- “Your money has a rhythm. Let’s make it work for you.”
- “You’re on track — one small move keeps the month comfortable.”

## Wordmark & Logo
A compact monogram mark built from two offset rounded bars forming an abstract “S” and upward signal arrow. It should work as a standalone icon, with the wordmark set in a custom-tracked DM Sans treatment rather than default text.

## Signature Brand Color
**Signal Mint — #7BE2BE**

## Style Decisions
- Keep the overall surface light and tactile; do not introduce a dark theme in the first pass.
- Use data color semantically and consistently across cards, charts, tags, and alerts.
- Prefer rounded rectangles with variation in radius and shadow depth over identical pills everywhere.
