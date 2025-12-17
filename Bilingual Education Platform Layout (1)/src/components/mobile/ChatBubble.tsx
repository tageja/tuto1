interface ChatBubbleProps {
  message: string;
  timestamp: string;
  sender?: string;
  isOutgoing: boolean;
  showSender?: boolean;
}

export function ChatBubble({
  message,
  timestamp,
  sender,
  isOutgoing,
  showSender = false,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[75%] ${
          isOutgoing ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {showSender && sender && !isOutgoing && (
          <p className="text-gray-600 dark:text-gray-400 mb-1 px-1">
            {sender}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOutgoing
              ? "bg-[#0B5FFF] text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
        <p
          className={`text-xs text-gray-500 mt-1 px-1 ${
            isOutgoing ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}
