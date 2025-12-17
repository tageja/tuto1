interface ChatDateSeparatorProps {
  date: string;
}

export function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
        <p className="text-xs text-gray-600 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}
