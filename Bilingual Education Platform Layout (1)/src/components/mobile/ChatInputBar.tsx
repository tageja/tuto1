import { useState } from "react";
import { Button } from "../ui/button";
import { Paperclip, Send } from "lucide-react";

interface ChatInputBarProps {
  onSend: (message: string) => void;
  placeholder?: string;
  showAttachment?: boolean;
}

export function ChatInputBar({
  onSend,
  placeholder = "Type a message...",
  showAttachment = true,
}: ChatInputBarProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shadow-lg">
      <div className="flex items-end gap-2">
        {showAttachment && (
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </Button>
        )}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] max-h-32 overflow-y-auto"
            style={{
              minHeight: "40px",
              maxHeight: "120px",
            }}
          />
        </div>
        <Button
          onClick={handleSend}
          size="icon"
          className="bg-[#0B5FFF] hover:bg-[#0949CC] rounded-full flex-shrink-0"
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
