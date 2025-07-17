
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/chat": "AI Chat",
  "/tasks": "Tasks",
  "/analytics": "Analytics",
  "/workflows": "Workflows",
  "/settings": "Settings",
  "/login": "Sign In"
};

const getRouteParts = (pathname: string): Array<{ path: string; label: string }> => {
  if (pathname === "/") {
    return [{ path: "/", label: "Home" }];
  }

  const parts = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ path: string; label: string }> = [
    { path: "/", label: "Home" }
  ];

  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const label = routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
    breadcrumbs.push({ path: currentPath, label });
  });

  return breadcrumbs;
};

export const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  const breadcrumbs = getRouteParts(location.pathname);

  // Don't show breadcrumbs on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="text-foreground font-medium">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  asChild
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Link to={crumb.path} aria-label={`Navigate to ${crumb.label}`}>
                    {index === 0 ? (
                      <div className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        <span>{crumb.label}</span>
                      </div>
                    ) : (
                      crumb.label
                    )}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
