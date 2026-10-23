import type { SoundMode } from '@/features/bridge/store'

/**
 * Answer sounds for the drill. Off by default. "Gentle" is a soft chime for
 * right and a quiet tone for wrong; "joker" is a random fart on a wrong answer
 * and a random cheer on a right one — the owner's mum's request. Assets live in
 * public/sounds/. Everything is wrapped so a blocked or missing sound never
 * throws; audio only plays from the answer tap, which satisfies the mobile
 * "needs a user gesture" rule.
 */
const FARTS = ['fart-1.wav', 'fart-2.wav', 'fart-3.wav', 'fart-4.wav']
const CHEERS = ['cheer-applause.wav', 'cheer-crowd.wav', 'cheer-whee.wav']

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]!

function play(file: string, volume: number) {
  if (typeof Audio === 'undefined') return
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}sounds/${file}`)
    audio.volume = volume
    void audio.play().catch(() => {})
  } catch {
    /* audio unavailable; stay silent */
  }
}

export function playAnswer(correct: boolean, mode: SoundMode) {
  if (mode === 'off') return
  if (mode === 'gentle') {
    play(correct ? 'gentle-correct.wav' : 'gentle-wrong.wav', 0.5)
    return
  }
  // joker
  play(correct ? pick(CHEERS) : pick(FARTS), 0.75)
}
