import { requireSession } from "@/lib/dal";
import { NavBar } from "@/components/nav-bar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar email={session.account.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
