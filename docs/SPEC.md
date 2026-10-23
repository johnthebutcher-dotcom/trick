# Finesse — spec

_Written from the description sent on Oct 22, 2026. Update it when scope changes; the build log records why._

## One sentence

A bridge trainer for one learner who has a hard time with long lessons: five-minute drills, one idea at a time, big cards on screen, instant feedback, and the things she misses come back tomorrow.

## Who it's for

The owner's mother, learning bridge, likely in a club or class setting, who loses focus on text-heavy material and does better with short, concrete, hands-on practice. Design for: one thing on screen, no reading before doing, immediate "why", no guilt mechanics, large touch targets, calm visuals.

## Style

- Preset: `card-room` (Trick-only, derived from warm-editorial): green felt backdrop in both modes (owner's photo, `public/felt.webp`), cream cards in light and dark-brown cards in dark, Tenor Sans headings, DM Sans text (Google Fonts, system fallbacks). Dark by default with the sun/moon toggle.
- Name: Finesse (repo `trick`). Icon letter F, theme colour `#1d3a26`.

## Effects (chosen before build)

_Owner's ticks, Oct 22, 2026. `npm run check:effects` enforces this list._

- [x] Soft UI / neumorphism (`neu`, `neu-inset`) — answer buttons and toggles only
- [x] Multi-layer shadow (`shadow-stack`) — the active hand card
- [x] Hover lift and press feedback (`hover-lift`, `press`)
- [x] Entrance and feedback keyframes (`animate-pop-in`, `animate-shake`, `animate-pulse-ring`, `animate-float`) — pop on correct, shake on wrong, pulse on the hint button
- [x] Scroll-driven reveals (`reveal`) — cheat-sheet sections
- [x] View Transitions (`viewTransition`, `withViewTransition`) — between hands in a drill
- [x] Fluid display type (`text-hero`, `text-display`, `text-title`) — point counter and the bid
- [x] Edge fades (`mask-fade-x`, `mask-fade-b`) — the bidding ladder strip
- [x] Container-query layouts and subgrid (`@sm:`, `@md:`, `grid-rows-subgrid`) — drill cards on tablet
- [x] Conic gradient and progress ring (`bg-conic`, `ring-progress`) — today's drill progress
- [ ] Liquid glass, aurora/mesh, gradient text, glow borders, blobs, blends, parallax, reading bar, icon glow, slant clips: not for this app

## Bidding system

v1 content is **Standard American** (five-card majors, 15–17 1NT, strong 2♣, weak twos, Stayman, Jacoby transfers, Blackwood). The system is a setting from day one: every drill hand stores its correct answer per system (`answers: { sayc: '1♠', twoOverOne: '1♠', acol: '1♠' }`) and the cheat-sheet is per system. 2-over-1 and ACOL ship later as content packs; until then they are greyed out in Settings with "coming soon". If the owner learns her class uses a different system, the pack order changes, not the app.

## Features (v1, in build order)

1. **Today** (home): one big "Start today's drill" button, a progress ring (0–8 hands), a one-line streak note ("3 days in a row" / "Welcome back"). Nothing else above the fold.
2. **Drill engine**: a drill = 8 hands from one skill; each hand shows the cards, a question, 2–5 answer buttons; tap → instant verdict + one-line reason (+ "show me" expands a 2–3 line explanation); next hand with a cross-fade. End screen: score, which hands to revisit, "Another?" or "Done for today". Target: under five minutes.
3. **Skill ladder** (the content): in order, unlocked by doing not by scoring.
   1. Count your points (HCP; then distribution points once HCP is solid)
   2. Open or pass? (12+ HCP rules of thumb, rule of 20 later)
   3. Which suit to open (five-card majors, longer minor, 1NT 15–17 balanced)
   4. Responding to 1 of a suit (6+ raise/new suit/1NT, 10+ game interest, 13+ game)
   5. Responding to 1NT (pass/2NT/3NT by points; Stayman with a 4-card major; transfers with a 5-card major)
   6. Opener's rebid (minimum/medium/maximum; support or new suit)
   7. Competitive basics (takeout double, simple overcall)
   8. Blackwood and slam tries
   9. Play: counting trumps, drawing trumps, when to finesse (later; needs a trick-by-trick view)
4. **Spaced repetition**: each hand has an ease and a due date (SM-2 lite). Wrong → due tomorrow; right → interval grows (1, 3, 7, 16 days). "Today's drill" = due hands first, then new hands from the current skill, capped at 8. Done entirely on device; synced to Supabase when signed in.
5. **Cheat-sheet tab**: the system's bidding ladder on one screen (opening bids, responses to 1NT, responses to 1 of a suit, rebids), as scannable strips with edge fades, searchable by "I have X points and …". Works offline. Meant to be open at the table.
6. **Settings**: bidding system (SAYC active; others "coming soon"), hand size (normal/large), sound off/on (default off), reminders off/on (default off, uses the push recipe later), sign in (optional, to sync across devices), delete account.
7. **Onboarding** (three screens): "Five minutes a day", "Tap the answer, we explain why", "Nothing to memorise first; start with counting points". Then straight into drill 1.

## Deliberately not in v1

- Playing full hands against bots (training mode). It needs a trick-by-trick board and a play engine; it is the v2 headline once drills are used daily.
- Any lesson longer than three lines. Explanations are per hand, in context.
- Leaderboards, XP, lives, timers. Streaks are soft ("welcome back"), never broken chains.
- Other systems' content (the switch exists; packs come later).
- Camera/AI. Nothing to scan here.

## Data

Local first (IndexedDB via a small wrapper) so it works offline and without sign-in; Supabase mirrors it when signed in.

| Table (Supabase) | Columns                                                                                                                                  | Owner / RLS      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `profiles`       | (template) + `system text default 'sayc'`, `hand_size text default 'normal'`                                                             | owner read/write |
| `drill_progress` | `user_id`, `hand_id text`, `ease real`, `interval_days int`, `due date`, `seen int`, `correct int`, `updated_at` ; pk (user_id, hand_id) | owner read/write |
| `drill_sessions` | `id uuid`, `user_id`, `skill text`, `started_at`, `finished_at`, `correct int`, `total int`                                              | owner read/write |

Hands themselves are content in the repo (`src/content/sayc/*.json`), generated once by a script with a seed so every hand has a deterministic id and a verified answer; no model calls at runtime.

## Integrations

- AI: none at runtime. (Content generation uses a script and bridge rules, not a model.)
- Storage: none.
- Push: no in v1 (reminder toggle is wired to the recipe later).
- Third-party APIs: none.

## Secrets the owner must set

- Hosting env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (only needed for cross-device sync; the app runs without them)
- GitHub secrets for the Supabase workflow: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`

## Open questions for the owner

- Does her class or club name a system? If it is 2-over-1 or ACOL, that pack moves to the front of the queue.
- Should the first build skip sign-in entirely (local only) so she can start the same day? Default: yes; sync comes with the Supabase project.
- Her first name for the greeting, or keep it nameless? Default: nameless.
