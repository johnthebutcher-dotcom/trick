/** Cheat-sheet content for Standard American. Short rows, scannable at the table. */

export interface SheetRow {
  points: string
  shape: string
  bid: string
  /** HCP range for the quick filter, inclusive. */
  min: number
  max: number
}

export interface SheetSection {
  id: string
  title: string
  intro?: string
  rows: SheetRow[]
}

export const SAYC_SHEET: SheetSection[] = [
  {
    id: 'opening',
    title: 'Opening bids',
    intro: 'Count high-card points first: A 4, K 3, Q 2, J 1.',
    rows: [
      { points: '0–11', shape: 'any (no long suit)', bid: 'Pass', min: 0, max: 11 },
      { points: '11–12', shape: 'rule of 20 met', bid: 'Open (see below)', min: 11, max: 12 },
      { points: '13–21', shape: '5+ card major', bid: '1♥ / 1♠ (longer)', min: 13, max: 21 },
      {
        points: '13–21',
        shape: 'no 5-card major',
        bid: '1♣ / 1♦ (longer minor)',
        min: 13,
        max: 21,
      },
      { points: '15–17', shape: 'balanced', bid: '1NT', min: 15, max: 17 },
      { points: '20–21', shape: 'balanced', bid: '2NT', min: 20, max: 21 },
      { points: '22+', shape: 'any', bid: '2♣ (strong)', min: 22, max: 40 },
      { points: '5–11', shape: '6-card suit', bid: '2♦ / 2♥ / 2♠ (weak two)', min: 5, max: 11 },
    ],
  },
  {
    id: 'respond-suit',
    title: 'Partner opened 1 of a suit',
    rows: [
      { points: '0–5', shape: 'any', bid: 'Pass', min: 0, max: 5 },
      { points: '6–9', shape: '3+ card support', bid: 'Raise to 2', min: 6, max: 9 },
      { points: '6–9', shape: 'no support', bid: '1 of a new suit, or 1NT', min: 6, max: 9 },
      {
        points: '10–12',
        shape: '3+ card support',
        bid: 'Raise to 3 (invitational)',
        min: 10,
        max: 12,
      },
      { points: '10+', shape: 'new suit', bid: '2 of a new suit (needs 10+)', min: 10, max: 40 },
      {
        points: '13+',
        shape: '4+ card support',
        bid: 'Game: 4♥ / 4♠, or 2NT then game',
        min: 13,
        max: 40,
      },
    ],
  },
  {
    id: 'respond-nt',
    title: 'Partner opened 1NT (15–17)',
    rows: [
      { points: '0–7', shape: 'no 5-card major', bid: 'Pass', min: 0, max: 7 },
      { points: '8–9', shape: 'balanced', bid: '2NT (invite)', min: 8, max: 9 },
      { points: '10–15', shape: 'balanced', bid: '3NT', min: 10, max: 15 },
      { points: '8+', shape: '4-card major', bid: '2♣ Stayman', min: 8, max: 40 },
      { points: 'any', shape: '5+ hearts', bid: '2♦ (transfer to ♥)', min: 0, max: 40 },
      { points: 'any', shape: '5+ spades', bid: '2♥ (transfer to ♠)', min: 0, max: 40 },
      { points: '16–17', shape: 'balanced', bid: '4NT (invite slam)', min: 16, max: 17 },
    ],
  },
  {
    id: 'rebid',
    title: "Opener's second bid",
    rows: [
      {
        points: '13–15',
        shape: 'minimum',
        bid: 'Cheapest sensible bid; raise partner with support',
        min: 13,
        max: 15,
      },
      {
        points: '16–18',
        shape: 'medium',
        bid: 'Jump raise, or jump in a new suit',
        min: 16,
        max: 18,
      },
      { points: '19–21', shape: 'maximum', bid: 'Bid game, or jump shift', min: 19, max: 21 },
    ],
  },
  {
    id: 'competitive',
    title: 'They opened first',
    rows: [
      { points: '8–16', shape: '5+ card suit', bid: 'Overcall 1 of your suit', min: 8, max: 16 },
      {
        points: '12+',
        shape: 'short in their suit, support for the rest',
        bid: 'Double (takeout)',
        min: 12,
        max: 40,
      },
      {
        points: '15–18',
        shape: 'balanced, stopper in their suit',
        bid: '1NT overcall',
        min: 15,
        max: 18,
      },
    ],
  },
]
