import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardOverview } from "@/components/dashboard/overview"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <DashboardOverview user={session.user} />
}
