import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { ChatBubble } from "../ChatBubble";
import { ChatDateSeparator } from "../ChatDateSeparator";
import { ChatInputBar } from "../ChatInputBar";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface MobileMessagesChatScreenProps {
  threadId?: number;
  onBack?: () => void;
  userRole?: "admin" | "parent";
}

export function MobileMessagesChatScreen({
  threadId = 1,
  onBack,
  userRole = "parent",
}: MobileMessagesChatScreenProps) {
  const { t } = useLanguage();

  // Mock conversation data based on web screenshot
  const conversationData = {
    1: {
      name: "Taran Tegtse",
      role: "Parent",
      avatarColor: "#6366F1",
      messages: [
        {
          id: 1,
          date: "Wed, 19 Nov 2025",
          messages: [
            {
              id: 1,
              sender: "Taran Tegtse",
              text: "hello",
              timestamp: "10:21",
              isOutgoing: false,
            },
            {
              id: 2,
              sender: "We are Berena Republic",
              text: "hello",
              timestamp: "10:21",
              isOutgoing: true,
            },
            {
              id: 3,
              sender: "Taran Tegtse",
              text: "how are you today sir?",
              timestamp: "10:23",
              isOutgoing: false,
            },
            {
              id: 4,
              sender: "We are Berena Republic",
              text: "yes, I am there thnx",
              timestamp: "11:13",
              isOutgoing: true,
            },
            {
              id: 5,
              sender: "Taran Tegtse",
              text: "I am well thnx u, what is this regarding?",
              timestamp: "11:13",
              isOutgoing: false,
            },
            {
              id: 6,
              sender: "We are Berena Republic",
              text: "this is regarding the fee for this month sir, could you please check and pay the fee, thanks so much",
              timestamp: "11:18",
              isOutgoing: true,
            },
            {
              id: 7,
              sender: "Taran Tegtse",
              text: "I understand, I will pay the fee tomorrow, thnks",
              timestamp: "11:18",
              isOutgoing: false,
            },
            {
              id: 8,
              sender: "We are Berena Republic",
              text: "thanks so much, sir!",
              timestamp: "11:21",
              isOutgoing: true,
            },
          ],
        },
        {
          id: 2,
          date: "Fri, 5 Dec 2025",
          messages: [
            {
              id: 9,
              sender: "Taran Tegtse",
              text: "hello sir",
              timestamp: "09:27",
              isOutgoing: false,
            },
            {
              id: 10,
              sender: "We are Berena Republic",
              text: "yes",
              timestamp: "09:27",
              isOutgoing: true,
            },
            {
              id: 11,
              sender: "Taran Tegtse",
              text: "off",
              timestamp: "10:48",
              isOutgoing: false,
            },
            {
              id: 12,
              sender: "We are Berena Republic",
              text: "off",
              timestamp: "11:03",
              isOutgoing: true,
            },
          ],
        },
      ],
    },
    2: {
      name: "Ms. Nguyen",
      role: "Teacher - Class 2A",
      avatarColor: "#0B5FFF",
      messages: [
        {
          id: 1,
          date: "Today",
          messages: [
            {
              id: 1,
              sender: "Ms. Nguyen",
              text: "Good afternoon! I wanted to let you know that your child did wonderfully in today's art class.",
              timestamp: "2:30 PM",
              isOutgoing: false,
            },
            {
              id: 2,
              sender: "You",
              text: "Thank you so much for letting me know! I'm so happy to hear that.",
              timestamp: "2:35 PM",
              isOutgoing: true,
            },
            {
              id: 3,
              sender: "Ms. Nguyen",
              text: "They showed great creativity and attention to detail. I'll be displaying their artwork in the classroom!",
              timestamp: "2:36 PM",
              isOutgoing: false,
            },
          ],
        },
      ],
    },
  };

  const conversation =
    conversationData[threadId as keyof typeof conversationData] ||
    conversationData[1];

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // Handle message sending
  };

  return (
    <div className="flex flex-col bg-[#F9FAFC] dark:bg-gray-900" style={{ height: "calc(100vh - 96px)" }}>
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback
              className="text-white"
              style={{ backgroundColor: conversation.avatarColor }}
            >
              {conversation.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white truncate">
              {conversation.name}
            </p>
            <p className="text-gray-500 truncate">{conversation.role}</p>
          </div>

          <div className="flex items-center gap-1">
            {userRole === "admin" && (
              <>
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {t("View Profile", "Xem hồ sơ")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("Mute Notifications", "Tắt thông báo")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("Search in Conversation", "Tìm kiếm")}
                </DropdownMenuItem>
                {userRole === "admin" && (
                  <>
                    <DropdownMenuItem>
                      {t("Archive", "Lưu trữ")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      {t("Delete Conversation", "Xóa cuộc trò chuyện")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {conversation.messages.map((dateGroup) => (
          <div key={dateGroup.id}>
            <ChatDateSeparator date={dateGroup.date} />
            {dateGroup.messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                timestamp={msg.timestamp}
                sender={msg.sender}
                isOutgoing={msg.isOutgoing}
                showSender={false}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <ChatInputBar
        onSend={handleSendMessage}
        placeholder={t("Type a message...", "Nhập tin nhắn...")}
        showAttachment={userRole === "admin"}
      />
    </div>
  );
}