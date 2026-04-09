import { ReactNode } from "react";
import TopBar from "./TopBar";
import DesktopSidebar from "./DesktopSidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const AppLayout = ({ children, hideNav = false }: AppLayoutProps) => {
  if (hideNav) return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
