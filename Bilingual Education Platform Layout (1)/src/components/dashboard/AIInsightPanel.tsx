import { Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface AIInsightPanelProps {
  title: string;
  insights: string[];
  comingSoon?: boolean;
}

export function AIInsightPanel({
  title,
  insights,
  comingSoon = false,
}: AIInsightPanelProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#6366F1]" />
        <h3 className="text-gray-900 dark:text-white">{title}</h3>
        {comingSoon && (
          <Badge variant="secondary" className="ml-auto">
            Coming Soon
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0" />
            <p>{insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
