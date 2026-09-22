'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  GiftIcon,
  SearchIcon,
  SparklesIcon,
  UndoIcon,
  XIcon,
} from 'lucide-react'

import { claimGift, releaseGift } from '@/app/actions/gifts'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const ALL = 'Todos'

type Mode = 'claim' | 'release'
type PriceRange = 'all' | 'under-50' | '50-100' | '100-200' | 'over-200'
type SortMode = 'list' | 'lowest' | 'highest'

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'Todos os valores' },
  { value: 'under-50', label: 'Até R$ 50' },
  { value: '50-100', label: 'R$ 50 a R$ 100' },
  { value: '100-200', label: 'R$ 100 a R$ 200' },
  { value: 'over-200', label: 'Acima de R$ 200' },
]

function numericPrice(price: Gift['price']) {
  if (price === null) return null
  const value = Number(price)
  return Number.isFinite(value) ? value : null
}

function formatPrice(price: Gift['price']) {
  const value = numericPrice(price)
  if (value === null) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function matchesPrice(price: Gift['price'], range: PriceRange) {
  if (range === 'all') return true
  const value = numericPrice(price)
  if (value === null) return false
  if (range === 'under-50') return value <= 50
  if (range === '50-100') return value > 50 && value <= 100
  if (range === '100-200') return value > 100 && value <= 200
  return value > 200
}

function roomEmoji(room: string) {
  const value = room.toLocaleLowerCase('pt-BR')
  if (value.includes('cozinha')) return '🍳'
  if (value.includes('banheiro')) return '🫧'
  if (value.includes('quarto')) return '🛏️'
  if (value.includes('sala')) return '🛋️'
  if (value.includes('lavanderia') || value.includes('limpeza')) return '🧺'
  if (value.includes('organiza')) return '🧺'
  return '🏠'
}

export function GiftBoard({ gifts }: { gifts: Gift[] }) {
  const router = useRouter()
  const [room, setRoom] = React.useState(ALL)
  const [priceRange, setPriceRange] = React.useState<PriceRange>('all')
  const [sort, setSort] = React.useState<SortMode>('list')
  const [onlyAvailable, setOnlyAvailable] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState<{ gift: Gift; mode: Mode } | null>(null)
  const [guestName, setGuestName] = React.useState('')
  const [note, setNote] = React.useState('')
  const [pending, startTransition] = React.useTransition()

  const rooms = React.useMemo(() => {
    const unique: string[] = []
    for (const gift of gifts) if (!unique.includes(gift.room)) unique.push(gift.room)
    return [ALL, ...unique]
  }, [gifts])

  const filtered = React.useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR')
    const result = gifts.filter((gift) => {
      if (room !== ALL && gift.room !== room) return false
      if (onlyAvailable && gift.claimedBy) return false
      if (!matchesPrice(gift.price, priceRange)) return false
      if (
        term &&
        !gift.name.toLocaleLowerCase('pt-BR').includes(term) &&
        !gift.room.toLocaleLowerCase('pt-BR').includes(term)
      ) {
        return false
      }
      return true
    })

    if (sort !== 'list') {
      result.sort((a, b) => {
        const aPrice = numericPrice(a.price) ?? Number.POSITIVE_INFINITY
        const bPrice = numericPrice(b.price) ?? Number.POSITIVE_INFINITY
        return sort === 'lowest' ? aPrice - bPrice : bPrice - aPrice
      })
    }
    return result
  }, [gifts, room, onlyAvailable, priceRange, query, sort])

  const hasFilters =
    room !== ALL || priceRange !== 'all' || onlyAvailable || query.trim().length > 0 || sort !== 'list'

  function clearFilters() {
    setRoom(ALL)
    setPriceRange('all')
    setOnlyAvailable(false)
    setQuery('')
    setSort('list')
  }

  function openDialog(gift: Gift, mode: Mode) {
    setActive({ gift, mode })
    setNote('')
    if (mode === 'release') setGuestName('')
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active) return
    const current = active

    startTransition(async () => {
      const result =
        current.mode === 'claim'
          ? await claimGift({ giftId: current.gift.id, guestName, message: note })
          : await releaseGift({ giftId: current.gift.id, guestName })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setActive(null)
      setGuestName('')
      setNote('')
      toast.success(
        current.mode === 'claim'
          ? `Prontinho! "${current.gift.name}" ficou reservado no seu nome.`
          : `"${current.gift.name}" voltou para a lista.`,
      )
      router.refresh()
    })
  }

  return (
    <section id="lista" className="mx-auto w-full max-w-7xl scroll-mt-4 px-5 py-16 sm:px-8 md:py-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold tracking-[0.16em] text-primary uppercase">
            Escolha com carinho
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">
            Lista de presentes
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground text-pretty">
            Escolha o que combina com você e clique em reservar. O item fica marcado na hora para
            ninguém acabar repetindo.
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'presente encontrado' : 'presentes encontrados'}
        </p>
      </div>

      <div className="surface-shadow mt-9 rounded-3xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1.35fr)_minmax(170px,.8fr)_minmax(170px,.8fr)]">
          <InputGroup className="h-11 w-full rounded-xl">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar presente..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar presente"
            />
          </InputGroup>

          <label className="relative">
            <span className="sr-only">Filtrar por cômodo</span>
            <select
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm font-medium outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
            >
              {rooms.map((item) => (
                <option key={item} value={item}>
                  {item === ALL ? 'Todos os cômodos' : item}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </label>

          <label className="relative">
            <span className="sr-only">Filtrar por preço</span>
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value as PriceRange)}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm font-medium outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
            >
              {priceRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          <Button
            size="sm"
            variant={onlyAvailable ? 'default' : 'outline'}
            onClick={() => setOnlyAvailable((value) => !value)}
            aria-pressed={onlyAvailable}
          >
            {onlyAvailable ? <CheckIcon data-icon="inline-start" /> : <GiftIcon data-icon="inline-start" />}
            Só disponíveis
          </Button>

          <label className="relative ml-auto">
            <span className="sr-only">Ordenar presentes</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-8 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-xs font-semibold outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="list">Ordem da lista</option>
              <option value="lowest">Menor preço</option>
              <option value="highest">Maior preço</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </label>

          {hasFilters ? (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="mt-10 rounded-3xl border border-dashed border-border bg-card/70 py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum presente por aqui</EmptyTitle>
            <EmptyDescription>
              Tente mudar o cômodo ou a faixa de preço para ver outras opções.
            </EmptyDescription>
            <Button variant="outline" className="mt-2" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gift) => {
            const taken = Boolean(gift.claimedBy)
            const displayPrice = formatPrice(gift.price)

            return (
              <li key={gift.id}>
                <article
                  className={cn(
                    'group relative flex h-full min-h-64 flex-col overflow-hidden rounded-3xl border bg-card p-5 transition-all sm:p-6',
                    taken
                      ? 'border-primary/15 bg-secondary/45'
                      : 'border-border/80 shadow-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        'flex size-12 items-center justify-center rounded-2xl text-2xl',
                        taken ? 'bg-card/60 grayscale' : 'bg-secondary',
                      )}
                      aria-hidden="true"
                    >
                      {roomEmoji(gift.room)}
                    </span>
                    {taken ? (
                      <Badge className="border border-primary/15 bg-card text-primary shadow-none">
                        <CheckIcon data-icon="inline-start" />
                        Reservado
                      </Badge>
                    ) : gift.tier === 'especial' ? (
                      <Badge className="bg-amber-100 text-amber-800 shadow-none">
                        <SparklesIcon data-icon="inline-start" />
                        Especial
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold tracking-[0.12em] text-primary uppercase">
                      {gift.room}
                    </p>
                    <h3
                      className={cn(
                        'text-lg leading-snug font-bold tracking-[-0.015em] text-pretty sm:text-xl',
                        taken && 'text-muted-foreground',
                      )}
                    >
                      {gift.name}
                    </h3>
                    {gift.note ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{gift.note}</p>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-6">
                    {displayPrice ? (
                      <p className="mb-4 text-xl font-bold tracking-tight text-foreground">
                        {displayPrice}
                      </p>
                    ) : (
                      <p className="mb-4 text-sm font-medium text-muted-foreground">
                        Valor não informado
                      </p>
                    )}

                    {taken ? (
                      <div className="rounded-2xl border border-primary/10 bg-card/70 p-3">
                        <p className="text-sm font-semibold text-primary">
                          Escolhido por {gift.claimedBy}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 -ml-2"
                          onClick={() => openDialog(gift, 'release')}
                        >
                          <UndoIcon data-icon="inline-start" />
                          Quero desmarcar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button className="w-full" onClick={() => openDialog(gift, 'claim')}>
                          <GiftIcon data-icon="inline-start" />
                          Reservar presente
                        </Button>
                        {gift.url ? (
                          <Button
                            variant="ghost"
                            className="w-full"
                            render={
                              <a href={gift.url} target="_blank" rel="noreferrer noopener" />
                            }
                          >
                            Ver onde comprar
                            <ArrowUpRightIcon data-icon="inline-end" />
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setActive(null)
        }}
      >
        <DialogContent className="p-6 sm:max-w-md">
          <form onSubmit={submit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {active?.mode === 'release' ? 'Desmarcar presente' : active?.gift.name}
              </DialogTitle>
              <DialogDescription className="leading-6">
                {active?.mode === 'release'
                  ? `Confirme seu nome para liberar "${active?.gift.name}" novamente.`
                  : 'Só preciso do seu nome. O recadinho é opcional, mas a Brenda vai amar ler.'}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="guest-name">Seu nome</FieldLabel>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Ex.: Tia Márcia"
                  maxLength={60}
                  autoComplete="name"
                  required
                />
              </Field>

              {active?.mode === 'claim' ? (
                <Field>
                  <FieldLabel htmlFor="guest-note">Recadinho (opcional)</FieldLabel>
                  <Textarea
                    id="guest-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Escreva algo fofo para a Brenda..."
                    maxLength={500}
                    rows={4}
                  />
                  <FieldDescription>Ele também aparece no mural de recados.</FieldDescription>
                </Field>
              ) : null}
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
                {pending ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                {active?.mode === 'release' ? 'Desmarcar' : 'Confirmar reserva'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
