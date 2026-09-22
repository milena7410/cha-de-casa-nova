import { getGifts } from '@/app/actions/gifts'
import { AdminLogin } from '@/components/admin-login'
import { AdminPanel } from '@/components/admin-panel'
import { hasAdminSession, isAdminConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Painel da Brenda | Chá de Casa Nova',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return <AdminLogin configured={isAdminConfigured()} />
  }

  const gifts = await getGifts()
  return <AdminPanel gifts={gifts} />
}
