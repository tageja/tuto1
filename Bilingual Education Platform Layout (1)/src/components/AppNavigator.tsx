import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface AppNavigatorProps {
  onNavigate: (screen: "splash" | "login" | "dashboard" | "investor" | "school" | "mobile") => void;
}

export function AppNavigator({ onNavigate }: AppNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="p-4 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Quick Navigation</p>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onNavigate("splash")}
              variant="outline"
              size="sm"
            >
              Splash Screen
            </Button>
            <Button
              onClick={() => onNavigate("login")}
              variant="outline"
              size="sm"
            >
              Login/Register
            </Button>
            <Button
              onClick={() => onNavigate("dashboard")}
              variant="outline"
              size="sm"
            >
              Original Dashboard
            </Button>
            <Button
              onClick={() => onNavigate("investor")}
              variant="outline"
              size="sm"
            >
              Investor Page
            </Button>
            <Button
              onClick={() => onNavigate("school")}
              variant="outline"
              size="sm"
            >
              School Dashboard (Desktop)
            </Button>
            <Button
              onClick={() => onNavigate("mobile")}
              variant="default"
              size="sm"
            >
              📱 Mobile Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
          size="sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}