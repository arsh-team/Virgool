"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  CreditCard,
  History,
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Plus,
  Shield,
  Banknote,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import CustomSelect from "../../components/CustomSelect";
export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  useEffect(() => {
    fetchWalletData();
  }, []);
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const walletResponse = await fetch("/api/user/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWallet(walletData.wallet);
        setTransactions(walletData.wallet?.transactions || []);
      }
      const paymentsResponse = await fetch("/api/user/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setError("خطا در بارگذاری اطلاعات کیف پول");
    } finally {
      setLoading(false);
    }
  };
  const handleMakePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/user/payments/${paymentId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSuccess("پرداخت با موفقیت انجام شد");
        setShowPaymentModal(null);
        fetchWalletData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در پرداخت");
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const handleAddFunds = async (amount) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuccess(`${amount.toLocaleString()} تومان به کیف پول شما اضافه شد`);
        setShowAddFundsModal(false);
        fetchWalletData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن موجودی");
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const calculateNextPaymentDate = (payment) => {
    if (!payment.dueDate) return null;
    const dueDate = new Date(payment.dueDate);
    const now = new Date();
    if (dueDate > now) {
      return dueDate;
    }
    const paymentPeriod = payment.service?.paymentSettings?.defaultPeriod || 30;
    const nextDate = new Date(payment.dueDate);
    nextDate.setDate(nextDate.getDate() + paymentPeriod);
    return nextDate;
  };
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    isCurrency = false,
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 border border-white/20 shadow-2xl text-white`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm mb-2 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mb-1">
            {isCurrency
              ? value.toLocaleString() + " تومان"
              : value.toLocaleString()}
          </p>
          {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/20 text-white">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
  const OverviewTab = () => (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="💰 موجودی کیف پول"
          value={wallet?.balance || 0}
          icon={Wallet}
          color="from-blue-400 to-blue-600"
          subtitle="قابل برداشت و پرداخت"
          isCurrency={true}
        />
        <StatCard
          title="💳 تراکنش‌ها"
          value={transactions.length}
          icon={Receipt}
          color="from-purple-500 to-pink-600"
          subtitle="تعداد کل"
        />
      </div>
      {}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-xl">
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
          <Banknote className="w-5 h-5" />
          عملیات سریع
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddFundsModal(true)}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl hover:shadow-lg transition-all"
          >
            <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full text-white mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">افزایش موجودی</span>
            <span className="text-sm text-gray-600 mt-1">شارژ کیف پول</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-lg transition-all"
          >
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">دریافت QR</span>
            <span className="text-sm text-gray-600 mt-1">دریافت وجه</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("payments")}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl hover:shadow-lg transition-all"
          >
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">پرداخت قسط</span>
            <span className="text-sm text-gray-600 mt-1">پرداخت‌های معوقه</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("transactions")}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-lg transition-all"
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white mb-3">
              <History className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">تاریخچه</span>
            <span className="text-sm text-gray-600 mt-1">مشاهده تراکنش‌ها</span>
          </motion.button>
        </div>
      </div>
      {}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            آخرین تراکنش‌ها
          </h3>
          <button
            onClick={() => setActiveTab("transactions")}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
          >
            مشاهده همه
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-semibold text-gray-400 mb-2">
              هیچ تراکنشی یافت نشد
            </h4>
            <p className="text-sm">هنوز تراکنشی انجام نداده‌اید</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((transaction) => (
                <motion.div
                  key={
                    transaction._id ||
                    `transaction-${Date.now()}-${Math.random()}`
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : transaction.type === "withdrawal"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.type === "income"
                          ? "واریز"
                          : transaction.type === "withdrawal"
                            ? "برداشت"
                            : "بازپرداخت"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.description || "بدون توضیح"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : transaction.type === "withdrawal"
                            ? "text-blue-600"
                            : "text-purple-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.amount?.toLocaleString()} تومان
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
  const PaymentsTab = () => {
    const pendingPayments = payments.filter((p) => p.status === "pending");
    const paidPayments = payments.filter((p) => p.status === "paid");
    const overduePayments = pendingPayments.filter(
      (p) => new Date(p.dueDate) < new Date(),
    );
    return (
      <div className="space-y-6">
        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  پرداخت‌های در انتظار
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pendingPayments.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">نیاز به اقدام شما</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  پرداخت‌های موفق
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {paidPayments.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">تکمیل شده</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  پرداخت‌های معوقه
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {overduePayments.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">نیاز به توجه فوری</p>
          </div>
        </div>
        {}
        {overduePayments.length > 0 && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-red-200 shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              پرداخت‌های معوقه
            </h3>
            <div className="space-y-4">
              {overduePayments.map((payment) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {payment.service?.title || "پرداخت دوره"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            قسط {payment.installmentNumber || 1}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">مبلغ</p>
                          <p className="text-sm font-bold text-gray-800">
                            {payment.amount?.toLocaleString()} تومان
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            تاریخ سررسید گذشته
                          </p>
                          <p className="text-sm font-medium text-red-600">
                            {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShowPaymentModal(payment)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold"
                      >
                        پرداخت معوقه
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-xl">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            تمام پرداخت‌ها
          </h3>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-400 mb-2">
                هیچ پرداختی یافت نشد
              </h4>
              <p className="text-sm">هنوز پرداختی ثبت نشده است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      خدمت
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      مبلغ
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      تاریخ سررسید
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      وضعیت
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map((payment) => {
                      const nextPaymentDate = calculateNextPaymentDate(payment);
                      const isOverdue =
                        payment.status === "pending" &&
                        new Date(payment.dueDate) < new Date();
                      return (
                        <tr
                          key={payment._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm">
                            {payment.service?.title || "بدون عنوان"}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {payment.amount?.toLocaleString()} تومان
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === "paid"
                                  ? "bg-green-100 text-green-600"
                                  : isOverdue
                                    ? "bg-red-100 text-red-600"
                                    : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {payment.status === "paid"
                                ? "پرداخت شده"
                                : isOverdue
                                  ? "معوقه"
                                  : "در انتظار"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {payment.status === "pending" && (
                              <button
                                onClick={() => setShowPaymentModal(payment)}
                                className={`text-sm px-3 py-1 rounded-lg font-medium ${
                                  isOverdue
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:bg-blue-600"
                                }`}
                              >
                                {isOverdue ? "پرداخت" : "پرداخت"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
  const TransactionsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            تاریخچه تراکنش‌ها
          </h3>
          <div className="flex items-center gap-3">
            <CustomSelect className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">همه تراکنش‌ها</option>
              <option value="income">واریزها</option>
              <option value="withdrawal">برداشت‌ها</option>
              <option value="refund">بازپرداخت‌ها</option>
            </CustomSelect>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Download className="w-4 h-4" />
              خروجی
            </button>
          </div>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              هیچ تراکنشی یافت نشد
            </h3>
            <p className="text-gray-600 mb-4">هنوز تراکنشی انجام نداده‌اید</p>
            <button
              onClick={() => setShowAddFundsModal(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              اولین تراکنش را انجام دهید
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    نوع
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    مبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    توضیحات
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    خدمت مرتبط
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    تاریخ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((transaction, index) => (
                    <tr
                      key={transaction._id || `transaction-${index}`}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "withdrawal"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "واریز"
                            : transaction.type === "withdrawal"
                              ? "برداشت"
                              : "بازپرداخت"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p
                          className={`font-bold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : transaction.type === "withdrawal"
                                ? "text-blue-600"
                                : "text-purple-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {transaction.amount?.toLocaleString()} تومان
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {transaction.description || "بدون توضیح"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {transaction.service?.title || "بدون خدمت"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDateTime(transaction.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.status === "completed"
                            ? "تکمیل شده"
                            : transaction.status === "pending"
                              ? "در حال بررسی"
                              : "ناموفق"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  const PaymentModal = () => {
    if (!showPaymentModal) return null;
    const payment = showPaymentModal;
    const isOverdue =
      payment.status === "pending" && new Date(payment.dueDate) < new Date();
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">پرداخت شهریه</h3>
            <button
              onClick={() => setShowPaymentModal(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">
                {payment.service?.title}
              </h4>
              <p className="text-sm text-gray-600">
                قسط {payment.installmentNumber || 1}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">مبلغ قابل پرداخت:</span>
                <span className="text-lg font-bold text-gray-800">
                  {payment.amount?.toLocaleString()} تومان
                </span>
              </div>
              {isOverdue && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">این پرداخت معوقه شده است</span>
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span>تاریخ سررسید:</span>
                  <span className="font-medium">
                    {formatDate(payment.dueDate)}
                  </span>
                </div>
                {payment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span>آخرین تلاش:</span>
                    <span className="font-medium">
                      {formatDateTime(payment.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => handleMakePayment(payment._id)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
            >
              پرداخت از کیف پول
            </button>
            <button
              onClick={() => handleMakePayment(payment._id)}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
            >
              پرداخت آنلاین
            </button>
            <button
              onClick={() => setShowPaymentModal(null)}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              انصراف
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  const AddFundsModal = () => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const presetAmounts = [100000, 250000, 500000, 1000000, 2500000];
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!amount || isNaN(amount) || amount <= 0) {
        setError("لطفا مبلغ معتبر وارد کنید");
        return;
      }
      if (Number(amount) > 100000000) {
        setError("مبلغ وارد شده بیش از حد مجاز است");
        return;
      }
      setLoading(true);
      try {
        await handleAddFunds(parseInt(amount));
      } catch (error) {
        console.error("Error adding funds:", error);
      } finally {
        setLoading(false);
      }
    };
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              افزایش موجودی کیف پول
            </h3>
            <button
              onClick={() => setShowAddFundsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مبلغ افزایش موجودی (تومان)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`p-3 text-center rounded-lg border transition-all ${
                      amount === preset.toString()
                        ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500"
                        : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مبلغ مورد نظر را وارد کنید"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                step="1000"
              />
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">موجودی فعلی:</span>
                <span className="font-bold text-gray-800">
                  {(wallet?.balance || 0).toLocaleString()} تومان
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">موجودی جدید:</span>
                <span className="font-bold text-green-600">
                  {(
                    (wallet?.balance || 0) + (parseInt(amount) || 0)
                  ).toLocaleString()}{" "}
                  تومان
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddFundsModal(false)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    افزایش موجودی
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="flex items-center justify-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">
                در حال بارگذاری اطلاعات کیف پول...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          {}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-700 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-green-700 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/mypanel"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">
                  کیف پول و پرداخت‌ها
                </h1>
              </div>
              <p className="text-gray-600">
                مدیریت موجودی و تراکنش‌های مالی شما
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddFundsModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              افزایش موجودی
            </motion.button>
          </div>
          {}
          <div className="flex gap-1 rounded-2xl p-2 mb-8 overflow-x-auto bg-white border border-gray-200 shadow-lg">
            {[
              { id: "overview", label: "نمای کلی", icon: Wallet },
              { id: "payments", label: "پرداخت‌ها", icon: CreditCard },
              { id: "transactions", label: "تراکنش‌ها", icon: History },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
          {}
          <div>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "payments" && <PaymentsTab />}
            {activeTab === "transactions" && <TransactionsTab />}
          </div>
        </div>
      </div>
      {}
      <AnimatePresence>
        {showPaymentModal && <PaymentModal />}
        {showAddFundsModal && <AddFundsModal />}
      </AnimatePresence>
    </>
  );
}
