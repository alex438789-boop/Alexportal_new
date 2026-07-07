const navItems = [
  { label: "Home", icon: "⌂" },
  { label: "Achievement Capital", icon: "▣" },
  { label: "Career Value Map", icon: "◎" },
  { label: "Resume Export", icon: "▤" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white/88 px-4 py-8 backdrop-blur-xl">
      <div className="px-3">
        <div className="mb-4 h-6 w-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500" />
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">
          ALEX Career OS
        </h1>
        <p className="mt-2 text-sm text-slate-500">Your career operating system</p>
      </div>

      <nav className="mt-14 space-y-3">
        {navItems.map((item) => {
          const active = item.label === "Achievement Capital";

          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                active
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-slate-200 pt-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Alex</p>
          <p className="text-xs text-slate-500">View Profile</p>
        </div>
        <span className="ml-auto text-slate-400">›</span>
      </div>
    </aside>
  );
}
