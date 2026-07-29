'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageCircleHeartIcon, SendIcon } from 'lucide-react'

import { postMessage } from '@/app/actions/gifts'
import type { Message } from '@/lib/db/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(value))
}

export function MessageWall({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [guestName, setGuestName] = React.useState('')
  const [body, setBody] = React.useState('')
  const [pending, startTransition] = React.useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await postMessage({ guestName, message: body })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setBody('')
      toast.success('Recadinho enviado! Obrigada por essa fofura.')
      router.refresh()
    })
  }

  return (
    <section id="recados" className="scroll-mt-4 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-16 sm:px-8 md:py-24 lg:flex-row lg:gap-16">
        <div className="w-full lg:max-w-md">
          <Card className="surface-shadow rounded-3xl border border-border/80 py-6 ring-0 lg:sticky lg:top-8">
            <CardHeader>
              <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircleHeartIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="text-2xl font-bold tracking-[-0.025em]">
                Deixe um recadinho
              </CardTitle>
              <CardDescription className="leading-6">
                Um conselho de casa nova, uma piada interna ou um voto de felicidade. Vale tudo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="wall-name">Seu nome</FieldLabel>
                    <Input
                      id="wall-name"
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      placeholder="Ex.: Prima Letícia"
                      maxLength={60}
                      autoComplete="name"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="wall-message">Mensagem</FieldLabel>
                    <Textarea
                      id="wall-message"
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Que essa casa seja cheia de risadas e comida boa..."
                      maxLength={500}
                      rows={5}
                      required
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" size="lg" disabled={pending}>
                  {pending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
                  Enviar recado
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-7">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold tracking-[0.16em] text-primary uppercase">
              Carinho de quem veio junto
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">
              Mural de recados
            </h2>
            <p className="leading-relaxed text-muted-foreground text-pretty">
              {messages.length > 0
                ? `${messages.length} ${messages.length === 1 ? 'mensagem' : 'mensagens'} pra guardar pra sempre.`
                : 'Assim que chegarem os primeiros recados, eles aparecem aqui.'}
            </p>
          </div>

          {messages.length === 0 ? (
            <Empty className="rounded-3xl border border-dashed border-border bg-card/80 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleHeartIcon />
                </EmptyMedia>
                <EmptyTitle>Mural vazio por enquanto</EmptyTitle>
                <EmptyDescription>Seja a primeira pessoa a escrever algo fofo.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {messages.map((message) => (
                <li key={message.id}>
                  <article className="flex h-full min-h-48 flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                    <MessageCircleHeartIcon className="size-5 text-primary/60" aria-hidden="true" />
                    <p className="leading-7 text-pretty">{message.body}</p>
                    <div className="mt-auto flex items-center gap-3 border-t border-border/70 pt-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {initials(message.guestName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{message.guestName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
