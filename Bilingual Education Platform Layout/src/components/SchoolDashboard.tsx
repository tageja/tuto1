import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { SchoolDashboardScreen } from "./dashboard/screens/SchoolDashboardScreen";
import { AnnouncementsScreen } from "./dashboard/screens/AnnouncementsScreen";
import { MessagesScreen } from "./dashboard/screens/MessagesScreen";
import { AttendanceScreen } from "./dashboard/screens/AttendanceScreen";
import { HomeworkScreen } from "./dashboard/screens/HomeworkScreen";
import { PaymentsScreen } from "./dashboard/screens/PaymentsScreen";
import { SettingsScreen } from "./dashboard/screens/SettingsScreen";
import { ComingSoonScreen } from "./dashboard/screens/ComingSoonScreen";

export function SchoolDashboard() {
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "parent">("admin");

  const toggleRole = () => {
    setUserRole((prev) => (prev === "admin" ? "parent" : "admin"));
    setCurrentScreen("dashboard"); // Reset to dashboard when switching roles
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <SchoolDashboardScreen />;
      case "announcements":
        return <AnnouncementsScreen />;
      case "messages":
        return <MessagesScreen />;
      case "attendance":
        return <AttendanceScreen />;
      case "homework":
        return <HomeworkScreen />;
      case "payments":
        return <PaymentsScreen />;
      case "settings":
        return <SettingsScreen />;
      case "activities":
        return (
          <ComingSoonScreen
            title={t("Daily Activities", "Hoạt động hàng ngày")}
            description={t(
              "View and manage daily school activities timeline",
              "Xem và quản lý dòng thời gian hoạt động hàng ngày"
            )}
            features={[
              t("Real-time activity updates", "Cập nhật hoạt động thời gian thực"),
              t("Filter by class and date", "Lọc theo lớp và ngày"),
              t("Teacher notes and comments", "Ghi chú và nhận xét của giáo viên"),
            ]}
          />
        );
      case "albums":
        return (
          <ComingSoonScreen
            title={t("Photo Albums", "Album ảnh")}
            description={t(
              "Browse school photos and event galleries",
              "Duyệt ảnh trường và thư viện sự kiện"
            )}
            features={[
              t("Private and public albums", "Album riêng tư và công khai"),
              t("Class and event galleries", "Thư viện lớp và sự kiện"),
              t("Download and share photos", "Tải xuống và chia sẻ ảnh"),
            ]}
          />
        );
      case "classes":
        return (
          <ComingSoonScreen
            title={t("Classes", "Lớp học")}
            description={t(
              "Manage class rosters and schedules",
              "Quản lý danh sách lớp và lịch học"
            )}
            features={[
              t("Class roster management", "Quản lý danh sách lớp"),
              t("Schedule and timetable", "Lịch học và thời khóa biểu"),
              t("Assign teachers and subjects", "Phân công giáo viên và môn học"),
            ]}
          />
        );
      case "teachers":
        return (
          <ComingSoonScreen
            title={t("Teachers", "Giáo viên")}
            description={t(
              "View teacher profiles and assignments",
              "Xem hồ sơ và phân công giáo viên"
            )}
            features={[
              t("Teacher profiles with experience", "Hồ sơ giáo viên với kinh nghiệm"),
              t("Subject specializations", "Chuyên môn giảng dạy"),
              t("Performance ratings and reviews", "Đánh giá và nhận xét"),
            ]}
          />
        );
      case "progress":
        return (
          <ComingSoonScreen
            title={t("Progress Reports", "Báo cáo tiến độ")}
            description={t(
              "Track student academic progress and performance",
              "Theo dõi tiến độ và kết quả học tập"
            )}
            features={[
              t("Subject-wise performance trends", "Xu hướng kết quả theo môn"),
              t("AI-powered performance insights", "Phân tích kết quả bằng AI"),
              t("Export PDF reports", "Xuất báo cáo PDF"),
            ]}
          />
        );
      case "events":
        return (
          <ComingSoonScreen
            title={t("Events", "Sự kiện")}
            description={t(
              "Manage school events and activities",
              "Quản lý sự kiện và hoạt động nhà trường"
            )}
            features={[
              t("School-wide event calendar", "Lịch sự kiện toàn trường"),
              t("Event registration and tracking", "Đăng ký và theo dõi sự kiện"),
              t("Competitions and workshops", "Cuộc thi và hội thảo"),
            ]}
          />
        );
      case "health":
        return (
          <ComingSoonScreen
            title={t("Health & Medicine", "Sức khỏe & Y tế")}
            description={t(
              "Track student health records and medications",
              "Theo dõi hồ sơ sức khỏe và thuốc men"
            )}
            features={[
              t("Health record management", "Quản lý hồ sơ sức khỏe"),
              t("Medicine reminders and dosage", "Nhắc nhở thuốc và liều lượng"),
              t("Medical appointment tracking", "Theo dõi lịch khám"),
            ]}
          />
        );
      case "extracurricular":
        return (
          <ComingSoonScreen
            title={t("Extracurricular Activities", "Hoạt động ngoại khóa")}
            description={t(
              "Manage sports, clubs, and after-school programs",
              "Quản lý thể thao, câu lạc bộ và chương trình ngoại khóa"
            )}
            features={[
              t("Activity enrollment and schedules", "Đăng ký và lịch hoạt động"),
              t("Sports teams and competitions", "Đội thể thao và thi đấu"),
              t("Club membership tracking", "Theo dõi thành viên câu lạc bộ"),
            ]}
          />
        );
      default:
        return <SchoolDashboardScreen />;
    }
  };

  return (
    <DashboardLayout
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      userRole={userRole}
      onRoleSwitch={toggleRole}
    >
      {renderScreen()}
    </DashboardLayout>
  );
}
