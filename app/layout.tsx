import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dairy Management System",
  description: "Manage suppliers, milk entries, and daily totals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                Dairy Management System
              </p>
              <h1 className="mt-1 text-lg font-semibold text-zinc-900">
                Suppliers, milk collection, and daily records
              </h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm font-medium">
              <Link
                href="/"
                className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                Dashboard
              </Link>
              <Link
                href="/suppliers"
                className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                Suppliers
              </Link>
              <Link
                href="/entries"
                className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                Entries
              </Link>
            </nav>
          </header>
          <main className="flex-1 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
