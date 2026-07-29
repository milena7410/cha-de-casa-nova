'use client'

import { useActionState } from 'react'
import { KeyRoundIcon, LockKeyholeIcon } from 'lucide-react'

import { loginAdmin } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function AdminLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(loginAdmin, { error: null })

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="surface-shadow w-full max-w-md rounded-3xl border border-border bg-card p-7 sm:p-9">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LockKeyholeIcon className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-7 text-sm font-bold tracking-[0.14em] text-primary uppercase">Área privada</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Oi, Bruna!</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Entre com sua senha para cadastrar presentes, preços e links de compra.
        </p>

        <form action={action} className="mt-7 flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="admin-password">Senha de acesso</FieldLabel>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
              autoFocus
              disabled={!configured}
            />
          </Field>

          {state.error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
              {state.error}
            </p>
          ) : null}

          {!configured ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Falta configurar a variável <strong>ADMIN_PASSWORD</strong> no ambiente do site.
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending || !configured}>
            <KeyRoundIcon data-icon="inline-start" />
            {pending ? 'Entrando...' : 'Entrar no painel'}
          </Button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar para a lista
        </a>
      </div>
    </main>
  )
}
