import { redirect } from 'next/navigation'

export default function AdminQuestionsRedirectPage() {
  redirect('/admin?tab=questions')
}
