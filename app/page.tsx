import { getGifts, getMessages } from '@/app/actions/gifts'
import { GiftBoard } from '@/components/gift-board'
import { MessageWall } from '@/components/message-wall'
import { SiteHero } from '@/components/site-hero'
import Link from 'next/link'
import { LockKeyholeIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [gifts, messages] = await Promise.all([getGifts(), getMessages()])
  const claimed = gifts.filter((gift) => gift.claimedBy).length

  return (
    <main className="flex min-h-dvh flex-col">
      <SiteHero total={gifts.length} claimed={claimed} />
      <GiftBoard gifts={gifts} />
      <MessageWall messages={messages} />
      <footer className="border-t border-border/70 bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-9 text-center sm:flex-row sm:px-8 sm:text-left">
          <div>
            <p className="font-bold">Feito para Brenda, Diego, Alice e Nicolas 💚</p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LockKeyholeIcon className="size-3.5" aria-hidden="true" />
            Área da Brenda
          </Link>
        </div>
      </footer>
    </main>
  )
}
