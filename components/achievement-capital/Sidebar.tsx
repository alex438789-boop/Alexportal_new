export type AlexOsView = "cards" | "activity" | "reset";

const navItems: Array<{ id: AlexOsView; label: string }> = [
  { id: "cards", label: "Cards" },
  { id: "activity", label: "Activity + Milestone" },
  { id: "reset", label: "Reset + Perspective" },
];

export function Sidebar({
  activeView,
  collapsed,
  onViewChange,
  onToggleCollapsed,
}: {
  activeView: AlexOsView;
  collapsed: boolean;
  onViewChange: (view: AlexOsView) => void;
  onToggleCollapsed: () => void;
}) {
  return (
    <aside
      className={`hidden h-screen shrink-0 border-r border-slate-200 bg-white px-4 py-7 transition-all duration-300 md:block ${
        collapsed ? "w-[92px]" : "w-[270px]"
      }`}
    >
      <div className="mb-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!collapsed && (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                ALEX Career OS
              </h1>
              <p className="mt-2 text-sm text-slate-500">Turn scattered work into visible career capital.</p>
            </>
          )}
        </div>
        <button
          onClick={onToggleCollapsed}
          className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "展開" : "收合"}
        </button>
      </div>

      <nav className={`space-y-3 ${collapsed ? "hidden" : ""}`}>
        {navItems.map((item) => {
          const active = item.id === activeView;

          return (
            <button
              key={item.label}
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center rounded-2xl px-4 py-3.5 text-left font-medium transition ${
                active
                  ? "bg-violet-100/80 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              } text-sm`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`absolute bottom-0 left-0 border-t border-slate-200 bg-white p-5 ${collapsed ? "hidden" : "w-[270px]"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            A
          </div>
          {!collapsed && (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-950">Alex</p>
                <p className="text-xs text-slate-500">View Profile</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
