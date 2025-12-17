import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Download, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export function PaymentsScreen() {
  const { t } = useLanguage();

  const paymentStats = [
    { name: t("Paid", "Đã thanh toán"), value: 920, color: "#10b981" },
    { name: t("Pending", "Đang chờ"), value: 60, color: "#f59e0b" },
    { name: t("Overdue", "Quá hạn"), value: 20, color: "#ef4444" },
  ];

  const transactions = [
    {
      id: 1,
      studentName: "Nguyen Van A",
      class: "Grade 3A",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "paid",
      date: "2025-10-15",
      method: "Bank Transfer",
    },
    {
      id: 2,
      studentName: "Tran Thi B",
      class: "Grade 3A",
      type: t("Lunch Fee", "Phí ăn trưa"),
      amount: "$120",
      status: "paid",
      date: "2025-10-14",
      method: "Credit Card",
    },
    {
      id: 3,
      studentName: "Le Van C",
      class: "Grade 4B",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "pending",
      date: "2025-10-20",
      method: "-",
    },
    {
      id: 4,
      studentName: "Pham Thi D",
      class: "Grade 4B",
      type: t("Activity Fee", "Phí hoạt động"),
      amount: "$80",
      status: "overdue",
      date: "2025-10-01",
      method: "-",
    },
    {
      id: 5,
      studentName: "Hoang Van E",
      class: "Grade 5A",
      type: t("Tuition Fee", "Học phí"),
      amount: "$500",
      status: "paid",
      date: "2025-10-18",
      method: "Bank Transfer",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {t("Paid", "Đã thanh toán")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {t("Pending", "Đang chờ")}
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">{t("Overdue", "Quá hạn")}</Badge>;
      default:
        return null;
    }
  };

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
            {t(
              "Track fee collection and payment status",
              "Theo dõi thu phí và trạng thái thanh toán"
            )}
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          {t("Export Report", "Xuất báo cáo")}
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-green-50 dark:bg-green-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t("Total Revenue", "Tổng doanh thu")}
              </p>
              <p className="text-gray-900 dark:text-white">${totalRevenue}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("This month", "Tháng này")}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t("Pending Payments", "Chưa thanh toán")}
              </p>
              <p className="text-gray-900 dark:text-white">${pendingAmount}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {transactions.filter((t) => t.status === "pending").length}{" "}
                {t("transactions", "giao dịch")}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t("Overdue", "Quá hạn")}
              </p>
              <p className="text-gray-900 dark:text-white">${overdueAmount}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {transactions.filter((t) => t.status === "overdue").length}{" "}
                {t("transactions", "giao dịch")}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">
            {t("Payment Distribution", "Phân bổ thanh toán")}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
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
        </Card>

        {/* Transaction List */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white">
              {t("Recent Transactions", "Giao dịch gần đây")}
            </h3>
            <Button variant="outline" size="sm">
              {t("View All", "Xem tất cả")}
            </Button>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Student", "Học sinh")}</TableHead>
                  <TableHead>{t("Class", "Lớp")}</TableHead>
                  <TableHead>{t("Type", "Loại")}</TableHead>
                  <TableHead>{t("Amount", "Số tiền")}</TableHead>
                  <TableHead>{t("Status", "Trạng thái")}</TableHead>
                  <TableHead>{t("Date", "Ngày")}</TableHead>
                  <TableHead>{t("Actions", "Thao tác")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-gray-900 dark:text-white">
                      {transaction.studentName}
                    </TableCell>
                    <TableCell>{transaction.class}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {transaction.amount}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      {transaction.status !== "paid" && (
                        <Button variant="outline" size="sm">
                          {t("Send Reminder", "Gửi nhắc nhở")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Integration Zone */}
      <Card className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <h3 className="text-gray-900 dark:text-white mb-2">
            {t("Payment Integrations", "Tích hợp thanh toán")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t(
              "Connect with payment providers for automated processing",
              "Kết nối với nhà cung cấp thanh toán để xử lý tự động"
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              Stripe {t("(Coming Soon)", "(Sắp ra mắt)")}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              PayPal {t("(Coming Soon)", "(Sắp ra mắt)")}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              VNPay {t("(Coming Soon)", "(Sắp ra mắt)")}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
