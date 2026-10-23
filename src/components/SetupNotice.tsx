import { Card, CardDescription, CardTitle } from '@/components/ui'

/** Rendered instead of auth-dependent UI until .env has Supabase values. */
export function SetupNotice() {
  return (
    <Card className="space-y-3">
      <CardTitle>Connect Supabase to continue</CardTitle>
      <CardDescription>
        This starter runs without a backend so you can preview the look, but sign-in and data need a
        Supabase project.
      </CardDescription>
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>
          Copy <code className="rounded-sm bg-muted px-1">.env.example</code> to{' '}
          <code className="rounded-sm bg-muted px-1">.env</code>.
        </li>
        <li>Paste the project URL and anon key from Project Settings → API.</li>
        <li>Restart the dev server.</li>
      </ol>
    </Card>
  )
}
