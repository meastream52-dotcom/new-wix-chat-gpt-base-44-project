// Auth pages share a clean, centered, full-screen layout.
// No sidebar, no top bar — just a card in the middle of the dark background.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] px-4 py-12">
      {children}
    </div>
  );
}
