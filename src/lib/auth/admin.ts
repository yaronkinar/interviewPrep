import { isUserAdmin } from '@/lib/repositories/users'

export async function hasAdminAccess(userId: string | null | undefined) {
  if (!userId) return false
  return isUserAdmin(userId)
}
