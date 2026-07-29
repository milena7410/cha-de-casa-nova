import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDownIcon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  MessageCircleHeartIcon,
  SparklesIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export function SiteHero({ total, claimed }: { total: number; claimed: number }) {
  const percent = total > 0 ? Math.round((claimed / total) * 100) : 0

  return (
    <header className="relative overflow-hidden border-b border-border/70">
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Início">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <HomeIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <strong className="text-sm font-bold tracking-tight">Casa nova da Bruna</strong>
            <span className="text-xs text-muted-foreground">um cantinho pra chamar de meu</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" render={<Link href="#lista" />}>
            Lista
          </Button>
          <Button variant="ghost" render={<Link href="#recados" />}>
            Recados
          </Button>
        </div>
      </nav>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 left-[5%] size-44 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[4%] bottom-0 size-64 rounded-full bg-amber-200/35 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-9 pb-16 sm:px-8 sm:pt-14 sm:pb-24 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="flex flex-col items-start">
          <Badge className="mb-6 border border-primary/15 bg-primary/8 px-3 py-1.5 text-primary shadow-none">
            <SparklesIcon data-icon="inline-start" />
            Chá de casa nova
          </Badge>

          <h1 className="max-w-3xl text-4xl leading-[1.06] font-bold tracking-[-0.045em] text-balance sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Um novo cantinho está começando —{' '}
            <span className="relative whitespace-nowrap text-primary">
              vem fazer parte
              <svg
                aria-hidden="true"
                viewBox="0 0 320 14"
                className="absolute -bottom-2 left-0 h-3 w-full text-amber-300"
                preserveAspectRatio="none"
              >
                <path d="M3 10C82 2 222 2 317 8" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg sm:leading-8">
            Oi, eu sou a Bruna Vitória! Escolhi cada item com carinho pra montar meu primeiro
            lar. Você escolhe um presente, reserva aqui e pronto: ninguém repete.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" render={<Link href="#lista" />}>
              <GiftIcon data-icon="inline-start" />
              Escolher um presente
              <ArrowDownIcon data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#recados" />}>
              <MessageCircleHeartIcon data-icon="inline-start" />
              Deixar um recado
            </Button>
          </div>

          <div className="mt-9 flex w-full max-w-lg items-center gap-4 rounded-2xl border border-border/80 bg-card/85 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <HeartIcon className="size-5 fill-primary/15" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold">A casa já está tomando forma</p>
                <p className="shrink-0 text-sm font-bold text-primary">
                  {claimed} de {total}
                </p>
              </div>
              <Progress value={percent} aria-label={`${percent}% da lista já foi escolhida`} />
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -top-5 -right-3 grid grid-cols-4 gap-2 opacity-50 sm:-right-6"
          >
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className="size-1.5 rounded-full bg-primary" />
            ))}
          </div>
          <div className="surface-shadow relative aspect-[1.04] rotate-1 overflow-hidden rounded-[2rem] border-8 border-card bg-secondary sm:rounded-[2.5rem]">
            <Image
              src="/images/casa-nova.png"
              alt="Ilustração de um apartamento aconchegante em tons de lilás com plantas, sofá e caixas de mudança"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-left-7">
            <span className="text-2xl" aria-hidden="true">🔑</span>
            <span className="text-sm font-semibold">Meu primeiro lar!</span>
          </div>
        </div>
      </div>
    </header>
  )
}
