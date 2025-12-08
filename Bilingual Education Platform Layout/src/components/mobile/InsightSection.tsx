import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { useState } from "react";

interface InsightSectionProps {
  title: string;
  insights: string[];
  comingSoon?: boolean;
  defaultExpanded?: boolean;
}

export function InsightSection({
  title,
  insights,
  comingSoon = false,
  defaultExpanded = false,
}: InsightSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between active:bg-white/50 dark:active:bg-black/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6366F1]" />
          <h4 className="text-gray-900 dark:text-white">{title}</h4>
          {comingSoon && (
            <Badge variant="secondary">Coming Soon</Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
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
      )}
    </div>
  );
}
