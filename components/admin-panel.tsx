'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  GiftIcon,
  Link2Icon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'

import { deleteGift, logoutAdmin, saveGift } from '@/app/admin/actions'
import type { Gift } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

const ROOM_SUGGESTIONS = ['Cozinha', 'Sala', 'Quarto', 'Banheiro', 'Lavanderia', 'Organização']

function priceLabel(price: Gift['price']) {
  if (price === null) return 'Sem preço'
  const value = Number(price)
  if (!Number.isFinite(value)) return 'Sem preço'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function AdminPanel({ gifts }: { gifts: Gift[] }) {
  const router = useRouter()
  const [active, setActive] = React.useState<Gift | 'new' | null>(null)
  const [pending, startTransition] = React.useTransition()

  const editing = active && active !== 'new' ? active : null
  const claimedCount = gifts.filter((gift) => gift.claimedBy).length
  const linkedCount = gifts.filter((gift) => gift.url).length
  const pricedCount = gifts.filter((gift) => gift.price !== null).length

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await saveGift(formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(editing ? 'Presente atualizado.' : 'Presente adicionado à lista.')
      setActive(null)
      router.refresh()
    })
  }

  function remove(gift: Gift) {
    const reservation = gift.claimedBy
      ? ` Ele está reservado por ${gift.claimedBy}.`
      : ''
    if (!window.confirm(`Excluir "${gift.name}" da lista?${reservation}`)) return

    startTransition(async () => {
      const result = await deleteGift(gift.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Presente excluído.')
      router.refresh()
    })
  }

  return (
    <main className="min-h-dvh pb-16">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GiftIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold tracking-tight">Painel da Bruna</p>
              <p className="text-xs text-muted-foreground">Gerencie sua lista de presentes</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" render={<Link href="/" />}>
              <ArrowLeftIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Ver site</span>
            </Button>
            <form action={logoutAdmin}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOutIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.14em] text-primary uppercase">Sua lista</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Presentes e links
            </h1>
            <p className="mt-2 text-muted-foreground">
              Cadastre, ajuste valores e mantenha os links de compra sempre atualizados.
            </p>
          </div>
          <Button size="lg" onClick={() => setActive('new')}>
            <PlusIcon data-icon="inline-start" />
            Novo presente
          </Button>
        </div>

        <section aria-label="Resumo da lista" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard icon={<GiftIcon />} label="Total" value={gifts.length} />
          <SummaryCard icon={<CheckCircle2Icon />} label="Reservados" value={claimedCount} />
          <SummaryCard icon={<CircleDollarSignIcon />} label="Com preço" value={pricedCount} />
          <SummaryCard icon={<Link2Icon />} label="Com link" value={linkedCount} />
        </section>

        <section className="surface-shadow mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold">Todos os presentes</h2>
              <p className="text-sm text-muted-foreground">
                {gifts.length} {gifts.length === 1 ? 'item na lista' : 'itens na lista'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActive('new')}>
              <PlusIcon data-icon="inline-start" />
              Adicionar
            </Button>
          </div>

          {gifts.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <GiftIcon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">Sua lista ainda está vazia</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Adicione o primeiro presente com nome, valor e link para compra.
              </p>
              <Button className="mt-5" onClick={() => setActive('new')}>
                <PlusIcon data-icon="inline-start" />
                Adicionar presente
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {gifts.map((gift) => (
                <li
                  key={gift.id}
                  className="grid gap-4 px-5 py-5 transition-colors hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold">{gift.name}</h3>
                      {gift.claimedBy ? (
                        <Badge className="bg-primary/10 text-primary shadow-none">
                          Reservado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disponível</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{gift.room}</span>
                      <span aria-hidden="true">•</span>
                      <strong className="font-semibold text-foreground">{priceLabel(gift.price)}</strong>
                      {gift.url ? (
                        <>
                          <span aria-hidden="true">•</span>
                          <a
                            href={gift.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            Abrir link
                            <ArrowUpRightIcon className="size-3.5" />
                          </a>
                        </>
                      ) : null}
                    </div>
                    {gift.claimedBy ? (
                      <p className="mt-2 text-xs font-medium text-primary">
                        Reservado por {gift.claimedBy}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActive(gift)}>
                      <PencilIcon data-icon="inline-start" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => remove(gift)}
                      disabled={pending}
                      aria-label={`Excluir ${gift.name}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setActive(null)
        }}
      >
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-xl">
          <form
            key={editing?.id ?? 'new'}
            onSubmit={submit}
            className="flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {editing ? 'Editar presente' : 'Novo presente'}
              </DialogTitle>
              <DialogDescription className="leading-6">
                Os dados salvos aqui aparecem na lista pública imediatamente.
              </DialogDescription>
            </DialogHeader>

            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
                <Field>
                  <FieldLabel htmlFor="gift-name">Nome do presente</FieldLabel>
                  <Input
                    id="gift-name"
                    name="name"
                    defaultValue={editing?.name ?? ''}
                    placeholder="Ex.: Jogo de panelas"
                    maxLength={120}
                    required
                    autoFocus
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="gift-room">Cômodo</FieldLabel>
                  <Input
                    id="gift-room"
                    name="room"
                    list="room-suggestions"
                    defaultValue={editing?.room ?? ''}
                    placeholder="Cozinha"
                    maxLength={60}
                    required
                  />
                  <datalist id="room-suggestions">
                    {ROOM_SUGGESTIONS.map((room) => (
                      <option key={room} value={room} />
                    ))}
                  </datalist>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="gift-price">Preço</FieldLabel>
                  <Input
                    id="gift-price"
                    name="price"
                    inputMode="decimal"
                    defaultValue={editing?.price ?? ''}
                    placeholder="Ex.: 129,90"
                  />
                  <FieldDescription>Pode usar vírgula ou ponto.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="gift-tier">Tipo</FieldLabel>
                  <select
                    id="gift-tier"
                    name="tier"
                    defaultValue={editing?.tier ?? 'essencial'}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                  >
                    <option value="essencial">Essencial</option>
                    <option value="especial">Especial</option>
                  </select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="gift-url">Link para compra</FieldLabel>
                <Input
                  id="gift-url"
                  name="url"
                  type="url"
                  defaultValue={editing?.url ?? ''}
                  placeholder="https://loja.com.br/produto"
                />
                <FieldDescription>Cole o endereço completo da loja, começando com https://.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="gift-note">Observação (opcional)</FieldLabel>
                <Textarea
                  id="gift-note"
                  name="note"
                  defaultValue={editing?.note ?? ''}
                  placeholder="Ex.: Pode ser de qualquer cor."
                  maxLength={300}
                  rows={3}
                />
              </Field>

              <Field className="max-w-40">
                <FieldLabel htmlFor="gift-sort">Ordem na lista</FieldLabel>
                <Input
                  id="gift-sort"
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={9999}
                  defaultValue={editing?.sortOrder ?? gifts.length * 10}
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="-mx-6 -mb-6 rounded-b-xl px-6 py-4">
              <DialogClose
                render={
                  <Button type="button" variant="outline" disabled={pending}>
                    <XIcon data-icon="inline-start" />
                    Cancelar
                  </Button>
                }
              />
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner data-icon="inline-start" /> : <CheckCircle2Icon data-icon="inline-start" />}
                {editing ? 'Salvar alterações' : 'Adicionar presente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary [&_svg]:size-4">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
