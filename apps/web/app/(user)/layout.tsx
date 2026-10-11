export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
