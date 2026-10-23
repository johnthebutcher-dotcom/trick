# Build log

Newest first. One entry per push or decision. Future sessions start here, so write for someone with no memory of this chat.

## 2026-10-22 — Acol content pack (bidding system is now real, not greyed out)

- **Built:** Acol as a second bidding system. A system is now a rule module behind a registry (`features/bridge/systems/`: `types.ts` the `RuleModule`/`SystemId` contract, `index.ts` the `SYSTEMS` list + `rulesFor(id)`, `sayc.ts` and `acol.ts` each exporting a `rules` object). `acol.ts` encodes the beginner differences: four-card majors (open 1♥/1♠ with four; 1♥ when 4-4), a WEAK 1NT of 12–14, 2NT 20–22, prepared 1♣ with equal minors; same rule-of-20 and point counting as SAYC. The drill engine (`skills.ts`), scheduler and the bot/hint (`play/auction.ts advise`) now take the active system and dispatch through `rulesFor`; the 1NT responder derives invite/game thresholds from the system's NT range instead of a hardcoded 15–17. Cheat-sheet is per-system (`ACOL_SHEET` in `sheet.ts`, `SheetPage` reads `prefs.system`). SettingsPage un-greys ACOL automatically (the registry marks it `available`). `useGame`/`PlayPage`/`DrillPage`/`TodayPage` thread `prefs.system` through. 6 Acol tests + 1 scheduler test (41 total).
- **Decided:** question ids are now `skill:n` for the system-independent skills (count points, points with shape) and `system:skill:n` for the bidding skills, so switching systems keeps point-counting progress and gives each system its own spaced-repetition ladder for bidding. The skill-unlock ladder counts concepts, not systems (16 open-pass hands in any system unlocks the next). `parseQuestionId` still accepts the old `sayc:` prefix. SAYC output is byte-for-byte unchanged (the old tests still pass); only the responder invite/game boundary shifted by one point as a side effect of making it range-aware, still landing 3NT on the pinned 11-opposite-strong-NT test.
- **Verified:** full `npm run check` green; previewed the Acol cheat-sheet and an Acol opening-bid drill at 390px in both modes (page text stays cream over the felt, cards finished in both). Spot-checked the bot: weak-NT responder passes with 10 and bids game with 14, SAYC responder still bids game with 11 opposite a strong NT.
- **Left out:** 2-over-1 (still greyed; it is a third content pack). Acol responses in the bot beyond what SAYC already covered (no Acol-specific strong-two openings; the strong 2♣ is modelled the same simplified way). Acol-specific drills for responding/rebidding — the four skills are shared and only the opening-bid answers differ by system so far.
- **Status:** CI should be green on push.

## 2026-10-22 — Playable hand against bots, with a coach

- **Built:** `features/play/`: four-hand seeded deal; auction with legal-call rules, contract and declarer resolution, and a bot bidder that follows the drill rules (open/pass, opening bid, responses to 1NT and 1-of-a-suit, one rebid, simple overcalls); card play with follow-suit enforcement, trick winners with trumps, bot card choice by beginner rules of thumb (top of sequence, fourth-best, second hand low, third hand high, cheapest winner, draw trumps, ruff when it wins); non-vulnerable duplicate scoring. `useGame` drives bots on a short delay; the human plays South, and both North and South whenever their side declares. `PlayPage`: table with hidden hands as backs, dummy face-up after the lead, trick area, bidding box with only legal bids, Coach card with a Tips toggle (contextual one-liners) and a "Give me a hint" button that highlights the suggested bid or card with a reason; result card with score and Next board. Play tab, "Play a hand" on Today, Tips setting. Header removed (felt runs to the top; sun/moon in Settings). 7 new tests (34 total).
- **Decided:** hint and opponents are the same mind, so the hint never recommends something the bots would not do. No doubles/redoubles, no vulnerability, no Stayman/transfers in the bot yet. Board numbers seed the deal, so a board can be replayed.
- **Left out:** claim, undo, play review, smarter bots, duplicate scoring with vulnerability, saving results. All natural next steps, best done in a fresh session dedicated to the game.
- **Status:** CI green; preview republished.

## 2026-10-22 — Renamed to Finesse; accessibility pass for older players

- **Built:** app name Finesse (repo stays `trick`); 18px base size with a "Text size: Large" setting that scales the whole app (125%) via `html[data-size]`; text over the felt at 90% cream for contrast; every tappable thing ≥ 44px (header toggle 44, +/- 56, answer buttons 64, links given min-height); ✓/✗ icons inside the revealed answer buttons so colour is not the only signal, plus "correct" for screen readers; hand card ranks larger with a spoken "spades: 8 4 3 2" summary; verdict card is a polite live region; explanations one size up; cheat-sheet rows restacked (points + bid, then shape); settings rows stack on narrow screens via container queries.
- **Decided:** one weight of Tenor Sans, so headings are regular; emphasis comes from size. Font sizes everywhere are rem so the Large setting lifts spacing too.
- **Left out:** a dyslexia-friendly font option and a high-contrast mode (both easy to add as settings later); voice-over of hands beyond the suit summaries.
- **Status:** CI green; preview republished.

## 2026-10-22 — Card-room look: felt, Tenor Sans, DM Sans

- **Built:** `card-room` preset (app-local): the owner's felt photo as a fixed, covering backdrop in both modes; page-level text always cream, cards cream (light) or dark brown (dark) with their own foreground; dark green frame for header and tabs; Tenor Sans for headings and ranks, DM Sans for text, loaded from Google Fonts with system fallbacks; soft-UI controls take their fill from the surface they sit on (`on-felt` for the felt). Screens updated so nothing readable sits on the felt except titles, captions and the primary button.
- **Decided:** warm-editorial in the starter stays untouched; the felt look is specific to this app. Icons and theme colour now dark green.
- **Left out:** a light felt; light mode keeps the felt and switches the cards, which reads better than a pale table.
- **Status:** CI green; preview republished.

## 2026-10-22 — First playable: drill engine, Today, cheat-sheet, settings

- **Built:** cards/evaluation with a seeded dealer (stable hand ids); Standard American rules for open-or-pass (13+, rule of 20) and opening bids (1NT 15–17, 2NT 20–21, five-card majors, longer minor, 1♦ with 4-4, 1♣ with 3-3); four skills (count points, points with shape, open or pass, which bid opens) with generated questions, one-line why and a longer "show me"; spaced repetition (steps 1/3/7/16/35 days, wrong resets); local-first store (idb-keyval); drill screen with the hand card (shadow-stack), neumorphic answer buttons, green/red reveal with shake and pop-in, View Transitions between hands, summary with misses; Today with progress ring, soft streak copy and the skill ladder (unlocks after 16 hands of the previous skill); cheat-sheet with a points stepper that highlights matching rows; settings (system with 2/1 and ACOL greyed, card size, appearance, account only when Supabase is configured); onboarding without sign-in. 27 tests. Suit colour tokens (`--suit-red/--suit-black`) added to every preset for this app.
- **Decided:** no sign-in required; onboarding and settings are public routes. Teaching-example filters keep ambiguous hands (5-card-major 15–17 balanced, 18–19 balanced, preempts, strong 2♣) out of the drills until those lessons exist. Preview build shows the app, not the styleguide.
- **Design pass:** hierarchy per screen is one action; answer grid uses 2 columns for 2 or 4 options so nothing orphans; serif headings only on titles and ranks; status colours only on the reveal. Checked at 390px in both modes with screenshots.
- **Left out:** responding skills, conventions, play of the hand, sync, reminders, sound (toggle stored, unused).
- **Needs the owner:** a Vercel project for the URL to install on the iPad; later a Supabase project if sync is wanted.
- **Status:** CI green; playable from the preview artifact.

## 2026-10-22 — Spec and setup

- **Built:** repo created from the template; renamed to Trick; preset warm-editorial applied; icons; spec written.
- **Decided:** v1 is Standard American with the system as a setting and per-system answers on every hand, so 2/1 and ACOL are content packs later. Local-first progress (IndexedDB) so the app works offline and without sign-in; Supabase sync once a project exists. No AI at runtime; hands are generated by a seeded script and verified by rules. Effects limited to the owner's ticks (see SPEC → Effects); no glass or gradients in this app.
- **Left out:** full-hand play against bots (v2), long lessons, hard streaks, other systems' content.
- **Needs the owner:** confirm or change the open questions in the spec; later, a Supabase project for sync.
- **Status:** spec only; no screens yet.
