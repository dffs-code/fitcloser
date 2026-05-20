import { Navigation } from "./Navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full grid grid-rows-[auto_1fr] grid-cols-1 xl:grid-rows-1 xl:grid-cols-[18rem_1fr] xl:gap-6 xl:px-6 xl:py-8">
        <Navigation />
        <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-10 xl:px-0 xl:py-0">
          {children}
        </div>
      </div>
    </div>
  );
}
