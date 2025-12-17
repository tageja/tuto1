import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  User,
  Bell,
  Globe,
  Database,
  Moon,
  Sun,
  CheckCircle2,
} from "lucide-react";

export function SettingsScreen() {
  const { t, language, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    announcements: true,
    messages: true,
    payments: true,
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">
          {t("Settings", "Cài đặt")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t(
            "Manage your account and preferences",
            "Quản lý tài khoản và tùy chỉnh"
          )}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            {t("Profile", "Hồ sơ")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            {t("Notifications", "Thông báo")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Moon className="w-4 h-4" />
            {t("Appearance", "Giao diện")}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="w-4 h-4" />
            {t("Integrations", "Tích hợp")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-6">
              {t("Profile Information", "Thông tin hồ sơ")}
            </h3>
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl">AD</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" className="mb-2">
                  {t("Change Photo", "Đổi ảnh")}
                </Button>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    "JPG, PNG or GIF. Max size 2MB",
                    "JPG, PNG hoặc GIF. Tối đa 2MB"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {t("Full Name", "Họ và tên")}
                  </Label>
                  <Input id="name" defaultValue="Admin User" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="admin@tuto.edu"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">
                    {t("Phone Number", "Số điện thoại")}
                  </Label>
                  <Input
                    id="phone"
                    defaultValue="+84 123 456 789"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role">{t("Role", "Vai trò")}</Label>
                  <Input
                    id="role"
                    defaultValue={t("School Administrator", "Quản trị viên")}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="school">
                  {t("Linked School", "Trường liên kết")}
                </Label>
                <Input
                  id="school"
                  defaultValue={t(
                    "Sunrise International School",
                    "Trường Quốc tế Sunrise"
                  )}
                  disabled
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button>{t("Save Changes", "Lưu thay đổi")}</Button>
                <Button variant="outline">{t("Cancel", "Hủy")}</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-6">
              {t("Notification Preferences", "Tùy chỉnh thông báo")}
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-gray-900 dark:text-white mb-4">
                  {t("Notification Channels", "Kênh thông báo")}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif">
                        {t("Email Notifications", "Thông báo qua Email")}
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          "Receive notifications via email",
                          "Nhận thông báo qua email"
                        )}
                      </p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notif">
                        {t("Push Notifications", "Thông báo đẩy")}
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          "Receive push notifications in browser",
                          "Nhận thông báo đẩy trên trình duyệt"
                        )}
                      </p>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notif">
                        {t("SMS Notifications", "Thông báo SMS")}
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          "Receive important alerts via SMS",
                          "Nhận cảnh báo quan trọng qua SMS"
                        )}
                      </p>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, sms: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 dark:text-white mb-4">
                  {t("Notification Types", "Loại thông báo")}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="announcements-notif">
                      {t("Announcements", "Thông báo")}
                    </Label>
                    <Switch
                      id="announcements-notif"
                      checked={notifications.announcements}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          announcements: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="messages-notif">
                      {t("Messages", "Tin nhắn")}
                    </Label>
                    <Switch
                      id="messages-notif"
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, messages: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="payments-notif">
                      {t("Payments & Finance", "Thanh toán")}
                    </Label>
                    <Switch
                      id="payments-notif"
                      checked={notifications.payments}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, payments: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button>{t("Save Preferences", "Lưu tùy chỉnh")}</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-6">
              {t("Appearance Settings", "Cài đặt giao diện")}
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-gray-900 dark:text-white mb-4">
                  {t("Theme", "Chủ đề")}
                </h4>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === "light" ? (
                      <Sun className="w-5 h-5 text-[#0B5FFF]" />
                    ) : (
                      <Moon className="w-5 h-5 text-[#0B5FFF]" />
                    )}
                    <div>
                      <Label>
                        {theme === "light"
                          ? t("Light Mode", "Chế độ sáng")
                          : t("Dark Mode", "Chế độ tối")}
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          "Switch between light and dark theme",
                          "Chuyển đổi giữa chế độ sáng và tối"
                        )}
                      </p>
                    </div>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 dark:text-white mb-4">
                  {t("Language", "Ngôn ngữ")}
                </h4>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#0B5FFF]" />
                    <div>
                      <Label>
                        {language === "en" ? "English" : "Tiếng Việt"}
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          "Select your preferred language",
                          "Chọn ngôn ngữ ưa thích"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button onClick={toggleLanguage} variant="outline">
                    {language === "en"
                      ? t("Switch to Vietnamese", "Chuyển sang Tiếng Việt")
                      : t("Switch to English", "Chuyển sang English")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-6">
              {t("Connected Integrations", "Tích hợp đã kết nối")}
            </h3>

            <div className="space-y-4">
              {/* Airtable Integration - Active */}
              <div className="flex items-center justify-between p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Airtable</Label>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t("Active", "Đang hoạt động")}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("Synced 2 minutes ago", "Đã đồng bộ 2 phút trước")}
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  {t("Configure", "Cấu hình")}
                </Button>
              </div>

              {/* Coming Soon Integrations */}
              <div className="space-y-4 pt-4">
                <h4 className="text-gray-900 dark:text-white">
                  {t("Available Integrations", "Tích hợp có sẵn")}
                </h4>

                {[
                  {
                    name: "Google Classroom",
                    description: t(
                      "Sync classes and assignments",
                      "Đồng bộ lớp học và bài tập"
                    ),
                  },
                  {
                    name: "Stripe",
                    description: t(
                      "Payment processing",
                      "Xử lý thanh toán"
                    ),
                  },
                  {
                    name: "Twilio",
                    description: t(
                      "SMS and voice notifications",
                      "Thông báo SMS và thoại"
                    ),
                  },
                  {
                    name: "Firebase",
                    description: t(
                      "Real-time data synchronization",
                      "Đồng bộ dữ liệu thời gian thực"
                    ),
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>{integration.name}</Label>
                        <Badge variant="secondary">
                          {t("Coming Soon", "Sắp ra mắt")}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      {t("Connect", "Kết nối")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
