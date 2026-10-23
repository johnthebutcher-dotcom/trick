/** Cheat-sheet content, one set of sections per bidding system. Short rows, scannable at the table. */

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

/** Cheat-sheet content for Acol: four-card majors and a WEAK 1NT (12–14). */
export const ACOL_SHEET: SheetSection[] = [
  {
    id: 'opening',
    title: 'Opening bids',
    intro: 'Count high-card points first: A 4, K 3, Q 2, J 1. Acol opens four-card majors.',
    rows: [
      { points: '0–11', shape: 'any (no long suit)', bid: 'Pass', min: 0, max: 11 },
      { points: '11–12', shape: 'rule of 20 met', bid: 'Open (see below)', min: 11, max: 12 },
      { points: '12–14', shape: 'balanced', bid: '1NT (weak)', min: 12, max: 14 },
      {
        points: '13–19',
        shape: '4+ card major',
        bid: '1♥ / 1♠ (longer, or ♥ if 4-4)',
        min: 13,
        max: 19,
      },
      {
        points: '13–19',
        shape: 'no 4-card major',
        bid: '1♣ / 1♦ (longer minor, 1♣ if equal)',
        min: 13,
        max: 19,
      },
      { points: '20–22', shape: 'balanced', bid: '2NT', min: 20, max: 22 },
      { points: '23+', shape: 'any', bid: '2♣ (strong, game-forcing)', min: 23, max: 40 },
    ],
  },
  {
    id: 'respond-suit',
    title: 'Partner opened 1 of a suit',
    rows: [
      { points: '0–5', shape: 'any', bid: 'Pass', min: 0, max: 5 },
      { points: '6–9', shape: '4+ card support', bid: 'Raise to 2', min: 6, max: 9 },
      { points: '6–9', shape: 'no support', bid: '1 of a new suit, or 1NT', min: 6, max: 9 },
      {
        points: '10–12',
        shape: '4+ card support',
        bid: 'Raise to 3 (invitational)',
        min: 10,
        max: 12,
      },
      {
        points: '9+',
        shape: 'new suit at the 2 level',
        bid: '2 of a lower new suit (needs 9+)',
        min: 9,
        max: 40,
      },
      {
        points: '13+',
        shape: '4+ card support for a major',
        bid: 'Game: 4♥ / 4♠',
        min: 13,
        max: 40,
      },
    ],
  },
  {
    id: 'respond-nt',
    title: 'Partner opened 1NT (weak, 12–14)',
    intro: 'A weak 1NT, so you need more than opposite a strong no-trump to reach game.',
    rows: [
      { points: '0–10', shape: 'balanced', bid: 'Pass', min: 0, max: 10 },
      { points: '11–12', shape: 'balanced', bid: '2NT (invite)', min: 11, max: 12 },
      { points: '13+', shape: 'balanced', bid: '3NT', min: 13, max: 40 },
      { points: '11+', shape: '4-card major', bid: '2♣ Stayman', min: 11, max: 40 },
      { points: 'any', shape: '5+ hearts', bid: '2♦ (transfer to ♥)', min: 0, max: 40 },
      { points: 'any', shape: '5+ spades', bid: '2♥ (transfer to ♠)', min: 0, max: 40 },
      { points: '0–10', shape: 'weak, 5+ card suit', bid: '2♦ / 2♥ / 2♠ to play', min: 0, max: 10 },
    ],
  },
  {
    id: 'rebid',
    title: "Opener's second bid",
    rows: [
      {
        points: '12–15',
        shape: 'minimum',
        bid: 'Cheapest sensible bid; raise partner with support',
        min: 12,
        max: 15,
      },
      {
        points: '16–18',
        shape: 'medium',
        bid: 'Jump raise, or jump in a new suit',
        min: 16,
        max: 18,
      },
      { points: '19+', shape: 'maximum', bid: 'Bid game, or jump shift', min: 19, max: 40 },
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
        bid: '1NT overcall (15–18, stronger than opening)',
        min: 15,
        max: 18,
      },
    ],
  },
]
