export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] text-[#e6edf3] px-4">
      <div className="text-center max-w-lg">
        <div className="mb-6">
          <span className="inline-block text-xs font-mono tracking-widest text-[#58a6ff] uppercase border border-[#21262d] rounded-full px-4 py-1.5">
            In Development
          </span>
        </div>

        <h1 className="text-4xl font-mono font-bold text-[#e6edf3] mb-4 tracking-tight">
          Platform
        </h1>

        <p className="text-[#8b949e] text-base mb-10 leading-relaxed">
          An AI-powered software-building platform.
          <br />
          Coming Soon.
        </p>

        <div className="w-12 h-px bg-[#21262d] mx-auto" />
      </div>
    </div>
  );
}
