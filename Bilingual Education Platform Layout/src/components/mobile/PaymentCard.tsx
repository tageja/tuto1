import { Badge } from "../ui/badge";
import { DollarSign } from "lucide-react";

interface PaymentCardProps {
  studentName: string;
  className: string;
  type: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  method?: string;
}

export function PaymentCard({
  studentName,
  className: paymentClass,
  type,
  amount,
  status,
  date,
  method,
}: PaymentCardProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "paid":
        return {
          badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          label: "Paid / Đã thanh toán",
          icon: "bg-green-100 dark:bg-green-900/30",
          iconColor: "text-green-600",
        };
      case "pending":
        return {
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          label: "Pending / Đang chờ",
          icon: "bg-yellow-100 dark:bg-yellow-900/30",
          iconColor: "text-yellow-600",
        };
      case "overdue":
        return {
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          label: "Overdue / Quá hạn",
          icon: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-600",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800",
          label: "Unknown",
          icon: "bg-gray-100",
          iconColor: "text-gray-600",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.icon}`}>
            <DollarSign className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white">{studentName}</p>
            <p className="text-gray-600 dark:text-gray-400">{paymentClass}</p>
          </div>
        </div>
        <Badge className={config.badge}>{config.label.split(" / ")[0]}</Badge>
      </div>

      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2">
        <span>{type}</span>
        <span className="text-gray-900 dark:text-white">{amount}</span>
      </div>

      <div className="flex items-center justify-between text-gray-500">
        <span>{date}</span>
        {method && method !== "-" && <span>{method}</span>}
      </div>
    </div>
  );
}
