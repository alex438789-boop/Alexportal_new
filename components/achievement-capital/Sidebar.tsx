const navItems = [
  { label: "Home", icon: "⌂" },
  { label: "Achievement Capital", icon: "▣" },
  { label: "Career Value Map", icon: "◎" },
  { label: "Resume Export", icon: "▤" },
];

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-[270px] shrink-0 border-r border-slate-200 bg-white px-5 py-7 md:block">
      <div className="mb-12">
        <div className="mb-8 h-8 w-12 rounded-full bg-cyan-400" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          ALEX Career OS
        </h1>
        <p className="mt-2 text-sm text-slate-500">Your career operating system</p>
      </div>

      <nav className="space-y-3">
        {navItems.map((item) => {
          const active = item.label === "Achievement Capital";

          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition ${
                active
                  ? "bg-violet-100/80 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="w-5 text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-[270px] border-t border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Alex</p>
            <p className="text-xs text-slate-500">View Profile</p>
          </div>
          <span className="ml-auto text-slate-400">›</span>
        </div>
      </div>
    </aside>
  );
}
