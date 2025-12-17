import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Search, Send, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "../../ui/avatar";

export function MessagesScreen() {
  const { t } = useLanguage();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const messages = [
    {
      id: 1,
      from: "Ms. Nguyen",
      subject: t("Grade 3 Field Trip Permission", "Phép đi thực tế lớp 3"),
      preview: t(
        "Dear parents, we're planning a field trip next week...",
        "Kính gửi phụ huynh, chúng tôi dự kiến tổ chức chuyến đi thực tế tuần sau..."
      ),
      body: t(
        "Dear parents, we're planning a field trip to the Science Museum next week on Friday. Please sign and return the permission slip by Wednesday. The trip will cost $15 per student and includes transportation and museum entry. Students should bring their lunch and wear comfortable walking shoes.",
        "Kính gửi phụ huynh, chúng tôi dự kiến tổ chức chuyến đi thực tế đến Bảo tàng Khoa học vào thứ Sáu tuần sau. Vui lòng ký và trả lại giấy phép trước thứ Tư. Chuyến đi có chi phí $15/học sinh bao gồm phương tiện và vé vào cửa. Học sinh cần mang theo bữa trưa và đi giày thoải mái."
      ),
      date: "2025-10-24",
      time: "09:30",
      unread: true,
      priority: "high",
    },
    {
      id: 2,
      from: "Mr. Tran",
      subject: t("Math Competition Results", "Kết quả thi toán"),
      preview: t(
        "Congratulations! Your child performed excellently in...",
        "Chúc mừng! Con em bạn đã thể hiện xuất sắc trong..."
      ),
      body: t(
        "Congratulations! Your child performed excellently in the recent math competition, securing second place in their grade level. They demonstrated strong problem-solving skills and creativity. We're very proud of their achievement!",
        "Chúc mừng! Con em bạn đã thể hiện xuất sắc trong kỳ thi toán gần đây, giành vị trí thứ hai ở cấp độ lớp học. Các em đã thể hiện kỹ năng giải quyết vấn đề và sáng tạo tốt. Chúng tôi rất tự hào về thành tích của các em!"
      ),
      date: "2025-10-23",
      time: "14:15",
      unread: true,
      priority: "normal",
    },
    {
      id: 3,
      from: "School Administration",
      subject: t("Holiday Schedule Update", "Cập nhật lịch nghỉ"),
      preview: t(
        "Please note the updated holiday schedule for November...",
        "Vui lòng lưu ý lịch nghỉ lễ cập nhật cho tháng 11..."
      ),
      body: t(
        "Please note the updated holiday schedule for November. The school will be closed on November 1st for National Day. Regular classes will resume on November 2nd. Thank you for your attention.",
        "Vui lòng lưu ý lịch nghỉ lễ cập nhật cho tháng 11. Trường sẽ nghỉ ngày 1 tháng 11 nhân Ngày Quốc khánh. Lớp học thường qui sẽ tiếp tục vào ngày 2 tháng 11. Cảm ơn sự quan tâm của quý vị."
      ),
      date: "2025-10-22",
      time: "10:00",
      unread: false,
      priority: "normal",
    },
    {
      id: 4,
      from: "Ms. Pham",
      subject: t("Art Exhibition Invitation", "Mời triển lãm nghệ thuật"),
      preview: t(
        "You're invited to our annual student art exhibition...",
        "Quý vị được mời tham dự triển lãm nghệ thuật học sinh thường niên..."
      ),
      body: t(
        "You're invited to our annual student art exhibition on October 30th from 2-5 PM in the school auditorium. Your child's artwork will be on display along with pieces from other talented students. Refreshments will be served. We hope to see you there!",
        "Quý vị được mời tham dự triển lãm nghệ thuật học sinh thường niên vào ngày 30 tháng 10 từ 2-5 giờ chiều tại hội trường trường. Tác phẩm của con em quý vị sẽ được trưng bày cùng với các tác phẩm từ các học sinh tài năng khác. Chúng tôi sẽ phục vụ đồ ăn nhẹ. Hy vọng được gặp quý vị!"
      ),
      date: "2025-10-21",
      time: "11:45",
      unread: false,
      priority: "normal",
    },
  ];

  const [tabValue, setTabValue] = useState("inbox");

  const filteredMessages = messages.filter((msg) => {
    if (tabValue === "unread") return msg.unread;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Messages", "Tin nhắn")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              "Communicate with teachers and staff",
              "Giao tiếp với giáo viên và nhân viên"
            )}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setComposeOpen(true)}>
          <Plus className="w-4 h-4" />
          {t("Compose", "Soạn tin")}
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search messages...", "Tìm kiếm tin nhắn...")}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <Card className="p-6 lg:col-span-1">
          <Tabs value={tabValue} onValueChange={setTabValue} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">{t("Inbox", "Hộp thư")}</TabsTrigger>
              <TabsTrigger value="sent">{t("Sent", "Đã gửi")}</TabsTrigger>
              <TabsTrigger value="unread">
                {t("Unread", "Chưa đọc")}
                {messages.filter((m) => m.unread).length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {messages.filter((m) => m.unread).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                    : message.unread
                      ? "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.from.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-gray-900 dark:text-white">
                      {message.from}
                    </p>
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <p className="text-gray-900 dark:text-white mb-1">
                  {message.subject}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {message.preview}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-500">
                    {message.date} • {message.time}
                  </p>
                  {message.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      {t("High Priority", "Ưu tiên cao")}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Message Preview */}
        <Card className="p-6 lg:col-span-2">
          {selectedMessage ? (
            <div>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {selectedMessage.from.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {selectedMessage.from}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedMessage.date} • {selectedMessage.time}
                    </p>
                  </div>
                </div>
                {selectedMessage.priority === "high" && (
                  <Badge variant="destructive">
                    {t("High Priority", "Ưu tiên cao")}
                  </Badge>
                )}
              </div>

              <h2 className="text-gray-900 dark:text-white mb-4">
                {selectedMessage.subject}
              </h2>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedMessage.body}
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  {t("Reply", "Trả lời")}
                </Button>
                <Button variant="outline">{t("Forward", "Chuyển tiếp")}</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{t("Select a message to view", "Chọn tin nhắn để xem")}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Compose Message", "Soạn tin nhắn")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-700 dark:text-gray-300">
                {t("To:", "Đến:")}
              </label>
              <Input
                placeholder={t(
                  "Select recipient...",
                  "Chọn người nhận..."
                )}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">
                {t("Subject:", "Chủ đề:")}
              </label>
              <Input
                placeholder={t("Enter subject...", "Nhập chủ đề...")}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">
                {t("Message:", "Nội dung:")}
              </label>
              <Textarea
                placeholder={t("Type your message...", "Nhập tin nhắn...")}
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                {t("Send", "Gửi")}
              </Button>
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                {t("Cancel", "Hủy")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
