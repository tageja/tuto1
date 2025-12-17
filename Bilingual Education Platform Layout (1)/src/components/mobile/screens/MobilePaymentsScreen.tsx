import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { PaymentCard } from "../PaymentCard";
import { MobileStatsCard } from "../MobileStatsCard";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../ui/sheet";
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  Download,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "../../ui/badge";

export function MobilePaymentsScreen() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  const paymentStats = [
    { name: t("Paid", "Đã thanh toán"), value: 920, color: "#10b981" },
    { name: t("Pending", "Đang chờ"), value: 60, color: "#f59e0b" },
    { name: t("Overdue", "Quá hạn"), value: 20, color: "#ef4444" },
  ];

  const transactions = [
    {
      id: 1,
      studentName: "Nguyen Van A",
      className: "Grade 3A",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "paid" as const,
      date: "2025-10-15",
      method: "Bank Transfer",
    },
    {
      id: 2,
      studentName: "Tran Thi B",
      className: "Grade 3A",
      type: t("Lunch Fee", "Phí ăn trưa"),
      amount: "$120",
      status: "paid" as const,
      date: "2025-10-14",
      method: "Credit Card",
    },
    {
      id: 3,
      studentName: "Le Van C",
      className: "Grade 4B",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "pending" as const,
      date: "2025-10-20",
      method: "-",
    },
    {
      id: 4,
      studentName: "Pham Thi D",
      className: "Grade 4B",
      type: t("Activity Fee", "Phí hoạt động"),
      amount: "$80",
      status: "overdue" as const,
      date: "2025-10-01",
      method: "-",
    },
    {
      id: 5,
      studentName: "Hoang Van E",
      className: "Grade 5A",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "paid" as const,
      date: "2025-10-18",
      method: "Bank Transfer",
    },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesClass = selectedClass === "all" || t.className === selectedClass;
    return matchesStatus && matchesClass;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);

  const overdueAmount = transactions
    .filter((t) => t.status === "overdue")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Payments & Finance", "Thanh toán & Tài chính")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Track fee collection", "Theo dõi thu phí")}
          </p>
        </div>
        <Button variant="outline" size="icon">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        <MobileStatsCard
          title={t("Total Revenue", "Tổng doanh thu")}
          value={`$${totalRevenue}`}
          icon={DollarSign}
          subtitle={t("This month", "Tháng này")}
          className="bg-green-50 dark:bg-green-950/30"
        />
        <div className="grid grid-cols-2 gap-4">
          <MobileStatsCard
            title={t("Pending", "Chưa thanh toán")}
            value={`$${pendingAmount}`}
            icon={CreditCard}
            className="bg-yellow-50 dark:bg-yellow-950/30"
          />
          <MobileStatsCard
            title={t("Overdue", "Quá hạn")}
            value={`$${overdueAmount}`}
            icon={AlertCircle}
            className="bg-red-50 dark:bg-red-950/30"
          />
        </div>
      </div>

      {/* Payment Distribution Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#0B5FFF]" />
          <h3 className="text-gray-900 dark:text-white">
            {t("Payment Distribution", "Phân bổ thanh toán")}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={paymentStats}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {/* Status Filter */}
        <div className="flex-1">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t("All", "Tất cả")}</TabsTrigger>
              <TabsTrigger value="paid">{t("Paid", "Đã TT")}</TabsTrigger>
              <TabsTrigger value="pending">
                {t("Pending", "Chờ")}
              </TabsTrigger>
              <TabsTrigger value="overdue">
                {t("Overdue", "Quá hạn")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Class Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[300px]">
            <SheetHeader>
              <SheetTitle>{t("Filter by Class", "Lọc theo lớp")}</SheetTitle>
              <SheetDescription>
                {t("Select a class to filter payments", "Chọn lớp để lọc thanh toán")}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {["all", "Grade 3A", "Grade 4B", "Grade 5A"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedClass === cls
                      ? "bg-[#0B5FFF] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {cls === "all" ? t("All Classes", "Tất cả lớp") : cls}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Transaction List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white">
            {t("Recent Transactions", "Giao dịch gần đây")}
          </h3>
          <span className="text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} {t("items", "mục")}
          </span>
        </div>
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <PaymentCard
              key={transaction.id}
              studentName={transaction.studentName}
              className={transaction.className}
              type={transaction.type}
              amount={transaction.amount}
              status={transaction.status}
              date={transaction.date}
              method={transaction.method}
            />
          ))}
        </div>
      </div>

      {/* Payment Integration CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-gray-900 dark:text-white mb-2">
          {t("Payment Integrations", "Tích hợp thanh toán")}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          {t(
            "Connect with payment providers for automated processing",
            "Kết nối với nhà cung cấp thanh toán để xử lý tự động"
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Stripe {t("(Coming Soon)", "(Sắp ra mắt)")}</Badge>
          <Badge variant="secondary">PayPal {t("(Coming Soon)", "(Sắp ra mắt)")}</Badge>
          <Badge variant="secondary">VNPay {t("(Coming Soon)", "(Sắp ra mắt)")}</Badge>
        </div>
      </div>
    </div>
  );
}