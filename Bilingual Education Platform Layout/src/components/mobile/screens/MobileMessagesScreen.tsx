import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MessagesListItem } from "../MessagesListItem";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../ui/sheet";
import {
  ArrowLeft,
  Send,
  Plus,
  Search,
  MessageSquare,
} from "lucide-react";

export function MobileMessagesScreen() {
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
      priority: "high" as const,
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
      priority: "normal" as const,
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
      priority: "normal" as const,
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
      priority: "normal" as const,
    },
  ];

  const unreadCount = messages.filter((m) => m.unread).length;

  // Message List View
  if (!selectedMessage) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white mb-2">
              {t("Messages", "Tin nhắn")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount} {t("unread messages", "tin nhắn chưa đọc")}
            </p>
          </div>
          <Button
            size="icon"
            className="rounded-full"
            onClick={() => setComposeOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search messages...", "Tìm kiếm tin nhắn...")}
            className="pl-10"
          />
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {messages.map((message) => (
            <MessagesListItem
              key={message.id}
              from={message.from}
              subject={message.subject}
              preview={message.preview}
              date={message.date}
              time={message.time}
              unread={message.unread}
              priority={message.priority}
              onClick={() => setSelectedMessage(message)}
            />
          ))}
        </div>

        {/* Compose Sheet */}
        <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>{t("Compose Message", "Soạn tin nhắn")}</SheetTitle>
              <SheetDescription>
                {t("Send a message to teachers or staff", "Gửi tin nhắn cho giáo viên hoặc nhân viên")}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("To:", "Đến:")}
                </label>
                <Input
                  placeholder={t("Select recipient...", "Chọn người nhận...")}
                />
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("Subject:", "Chủ đề:")}
                </label>
                <Input placeholder={t("Enter subject...", "Nhập chủ đề...")} />
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("Message:", "Nội dung:")}
                </label>
                <Textarea
                  placeholder={t("Type your message...", "Nhập tin nhắn...")}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Send className="w-4 h-4" />
                  {t("Send", "Gửi")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setComposeOpen(false)}
                >
                  {t("Cancel", "Hủy")}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Message Thread View
  return (
    <div className="space-y-4">
      {/* Thread Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedMessage(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-gray-900 dark:text-white">
            {selectedMessage.subject}
          </h2>
        </div>
      </div>

      {/* Message Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-[#0B5FFF]">
              {selectedMessage.from.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <p className="text-gray-900 dark:text-white">
                {selectedMessage.from}
              </p>
              {selectedMessage.priority === "high" && (
                <Badge variant="destructive">
                  {t("High Priority", "Ưu tiên cao")}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedMessage.date} • {selectedMessage.time}
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {selectedMessage.body}
          </p>
        </div>
      </div>

      {/* Reply Box */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-[#0B5FFF]" />
          <h4 className="text-gray-900 dark:text-white">
            {t("Reply", "Trả lời")}
          </h4>
        </div>
        <Textarea
          placeholder={t("Type your reply...", "Nhập câu trả lời...")}
          rows={4}
          className="mb-3"
        />
        <div className="flex gap-2">
          <Button className="flex-1 gap-2">
            <Send className="w-4 h-4" />
            {t("Send Reply", "Gửi trả lời")}
          </Button>
          <Button variant="outline">
            {t("Forward", "Chuyển tiếp")}
          </Button>
        </div>
      </div>
    </div>
  );
}