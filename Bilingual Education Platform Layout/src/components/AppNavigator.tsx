import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AppNavigatorProps {
  onNavigate: (screen: "splash" | "login" | "dashboard" | "investor" | "school" | "mobile") => void;
}

export function AppNavigator({ onNavigate }: AppNavigatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 bg-white dark:bg-gray-800 shadow-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Navigation</p>
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
    </div>
  );
}