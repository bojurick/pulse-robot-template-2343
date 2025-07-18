
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  tooltip?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = "/",
  className = "",
  variant = "ghost",
  size = "default",
  tooltip = "Back to previous page"
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's navigation history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to specified path or home
      navigate(fallbackPath);
    }
  };

  // Don't show back button on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleBack}
          variant={variant}
          size={size}
          className={`text-[#E20074] hover:text-[#E20074]/80 hover:bg-[#E20074]/10 transition-colors ${className}`}
          aria-label={tooltip}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};
