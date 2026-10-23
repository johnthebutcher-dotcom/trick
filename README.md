# Finesse

A bridge trainer for one learner: five-minute drills, one idea at a time, big cards, instant feedback, and the hands she misses come back tomorrow. Built from `app-starter`; the rules Claude follows are in [`CLAUDE.md`](./CLAUDE.md), the plan is in [`docs/SPEC.md`](./docs/SPEC.md), and the history is in [`docs/BUILD_LOG.md`](./docs/BUILD_LOG.md).

## Run locally

```
npm install
npm run dev
npm run check
```

Works without a backend (local progress only). Add Supabase values to `.env` to sync across devices.
