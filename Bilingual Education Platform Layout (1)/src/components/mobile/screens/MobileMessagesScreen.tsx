import { useState } from "react";
import { MobileMessagesListAdminScreen } from "./MobileMessagesListAdminScreen";
import { MobileMessagesListParentScreen } from "./MobileMessagesListParentScreen";
import { MobileMessagesChatScreen } from "./MobileMessagesChatScreen";

interface MobileMessagesScreenProps {
  userRole?: "admin" | "parent";
}

export function MobileMessagesScreen({ userRole = "parent" }: MobileMessagesScreenProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  // If a thread is selected, show the chat view
  // Chat view needs full height so we render it outside the normal container
  if (selectedThreadId !== null) {
    return (
      <div className="-mx-4 -my-4">
        <MobileMessagesChatScreen
          threadId={selectedThreadId}
          onBack={() => setSelectedThreadId(null)}
          userRole={userRole}
        />
      </div>
    );
  }

  // Otherwise show the list view based on role
  if (userRole === "admin") {
    return (
      <div className="-mx-4 -my-4">
        <MobileMessagesListAdminScreen onSelectThread={setSelectedThreadId} />
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-4">
      <MobileMessagesListParentScreen onSelectThread={setSelectedThreadId} />
    </div>
  );
}