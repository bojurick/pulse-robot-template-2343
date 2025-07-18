
import React from "react";
import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { AppBreadcrumb } from "@/components/navigation/AppBreadcrumb";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import UserMenu from "@/components/UserMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          {!isHomePage && <BackButton />}
          <AppBreadcrumb />
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
