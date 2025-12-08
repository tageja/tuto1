import { useState } from "react";
import { MobileDashboardLayout } from "./MobileDashboardLayout";
import { MobileSchoolDashboardScreen } from "./screens/MobileSchoolDashboardScreen";
import { MobileAnnouncementsScreen } from "./screens/MobileAnnouncementsScreen";
import { MobileAttendanceScreen } from "./screens/MobileAttendanceScreen";
import { MobileHomeworkScreen } from "./screens/MobileHomeworkScreen";
import { MobileMessagesScreen } from "./screens/MobileMessagesScreen";
import { MobilePaymentsScreen } from "./screens/MobilePaymentsScreen";
import { MobileSettingsScreen } from "./screens/MobileSettingsScreen";
import { MobileComingSoonScreen } from "./screens/MobileComingSoonScreen";
import {
  Calendar,
  Image,
  Users,
  GraduationCap,
  TrendingUp,
  CalendarDays,
  Heart,
  Trophy,
} from "lucide-react";

export function MobileSchoolDashboard() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "parent">("admin");

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <MobileSchoolDashboardScreen />;
      case "announcements":
        return <MobileAnnouncementsScreen />;
      case "messages":
        return <MobileMessagesScreen />;
      case "attendance":
        return <MobileAttendanceScreen />;
      case "homework":
        return <MobileHomeworkScreen />;
      case "payments":
        return <MobilePaymentsScreen />;
      case "settings":
        return <MobileSettingsScreen />;
      
      // Coming Soon Screens
      case "activities":
        return (
          <MobileComingSoonScreen
            title="Daily Activities"
            description="Track daily classroom activities, schedules, and routines. Coming soon!"
            icon={Calendar}
          />
        );
      case "albums":
        return (
          <MobileComingSoonScreen
            title="Photo Albums"
            description="Browse and share classroom photos and memories. Coming soon!"
            icon={Image}
          />
        );
      case "classes":
        return (
          <MobileComingSoonScreen
            title="Classes"
            description="Manage classes, rosters, and class information. Coming soon!"
            icon={Users}
          />
        );
      case "teachers":
        return (
          <MobileComingSoonScreen
            title="Teachers"
            description="View teacher profiles, schedules, and contact information. Coming soon!"
            icon={GraduationCap}
          />
        );
      case "progress":
        return (
          <MobileComingSoonScreen
            title="Progress Reports"
            description="Track student academic progress with detailed reports and analytics. Coming soon!"
            icon={TrendingUp}
          />
        );
      case "events":
        return (
          <MobileComingSoonScreen
            title="Events"
            description="Manage school events, field trips, and special activities. Coming soon!"
            icon={CalendarDays}
          />
        );
      case "health":
        return (
          <MobileComingSoonScreen
            title="Health Records"
            description="Access student health information, vaccination records, and medical notes. Coming soon!"
            icon={Heart}
          />
        );
      case "extracurricular":
        return (
          <MobileComingSoonScreen
            title="Extracurricular"
            description="Explore clubs, sports, and after-school activities. Coming soon!"
            icon={Trophy}
          />
        );
      default:
        return <MobileSchoolDashboardScreen />;
    }
  };

  return (
    <MobileDashboardLayout
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      userRole={userRole}
    >
      {renderScreen()}
    </MobileDashboardLayout>
  );
}
