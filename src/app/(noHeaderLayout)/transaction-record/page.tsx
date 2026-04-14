"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Minus,
  Gift,
  Box,
  ChevronDown,
  RefreshCw,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  XCircle,
  ClipboardCopy,
  CalendarDays,
  ReceiptText,
  BadgeInfo,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { depositRequestService, DepositRequest } from "@/services/api/depositRequest.service";
import { withdrawRequestService, WithdrawRequest } from "@/services/api/withdrawRequest.service";

type TransactionFilter = "all" | "deposit" | "withdraw" | "bonus";
type DateFilter = "all" | "today" | "yesterday" | "7d" | "30d";
type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type CombinedTransaction = {
  id: string;
  type: TransactionFilter;
  title: string;
  subtitle: string;
  amount: number;
  changeAmount: number;
  status: TransactionStatus;
  statusLabel: string;
  paymentMethod: string;
  createdAt: string;
  referenceId?: string;
  note?: string;
  extraLines: Array<{ label: string; value: string }>;
};

const filterTabs = [
  { id: "all" as const, label: "All Records", icon: Box },
  { id: "deposit" as const, label: "Deposit", icon: Plus },
  { id: "withdraw" as const, label: "Withdraw", icon: Minus },
  { id: "bonus" as const, label: "Bonus", icon: Gift },
];

const dateFilters: Array<{ id: DateFilter; label: string }> = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const statusMeta: Record<TransactionStatus, { label: string; className: string; icon: React.JSX.Element }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/25",
    icon: <BadgeInfo className="h-3.5 w-3.5" />,
  },
};

function parseApiList<T>(response: any): T[] {
  return response?.data?.data || response?.data || [];
}

function formatMoney(amount: number) {
  return `৳${currencyFormatter.format(amount)}`;
}

function getStatusLabel(status: TransactionStatus) {
  return statusMeta[status]?.label || status;
}

function getStatusClass(status: TransactionStatus) {
  return statusMeta[status]?.className || "bg-slate-500/15 text-slate-300 border-slate-500/25";
}

function getChangeLabel(transaction: CombinedTransaction) {
  const signedAmount = transaction.changeAmount >= 0 ? `+${formatMoney(transaction.changeAmount)}` : `-${formatMoney(Math.abs(transaction.changeAmount))}`;

  if (transaction.status === "PENDING") {
    return "Pending";
  }

  if (transaction.status === "REJECTED" || transaction.status === "CANCELLED") {
    return "No change";
  }

  return signedAmount;
}

function isWithinFilter(dateString: string, filter: DateFilter) {
  if (filter === "all") return true;

  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return date >= startOfToday;
  }

  if (filter === "yesterday") {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    return date >= startOfYesterday && date < startOfToday;
  }

  const days = filter === "7d" ? 7 : 30;
  const threshold = new Date(startOfToday);
  threshold.setDate(threshold.getDate() - (days - 1));
  return date >= threshold;
}

export default function TransactionRecordPage() {
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("yesterday");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CombinedTransaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const [depositResponse, withdrawResponse] = await Promise.all([
        depositRequestService.getUserRequests({ page: 1, limit: 100 }),
        withdrawRequestService.getUserWithdrawRequests({ page: 1, limit: 100 }),
      ]);

      const depositRequests = parseApiList<DepositRequest>(depositResponse);
      const withdrawRequests = parseApiList<WithdrawRequest>(withdrawResponse);

      const mappedDeposits: CombinedTransaction[] = depositRequests.map((request) => {
        const bonusAmount = request.bonusAmount || 0;
        const changeAmount = request.status === "APPROVED" ? request.amount + bonusAmount : 0;

        return {
          id: `deposit-${request._id}`,
          type: bonusAmount > 0 ? "bonus" : "deposit",
          title: `${request.depositType.toUpperCase()} Deposit`,
          subtitle: request.paymentMethod,
          amount: request.amount,
          changeAmount,
          status: request.status,
          statusLabel: getStatusLabel(request.status),
          paymentMethod: request.paymentMethod,
          createdAt: request.createdAt,
          referenceId: request.transactionId || request._id,
          note: request.adminNote || request.promotionName,
          extraLines: [
            { label: "Deposit type", value: request.depositType },
            { label: "Payment method", value: request.paymentMethod },
            ...(request.transactionId ? [{ label: "Transaction ID", value: request.transactionId }] : []),
            ...(request.senderNumber ? [{ label: "Sender number", value: request.senderNumber }] : []),
            ...(request.walletAddress ? [{ label: "Wallet address", value: request.walletAddress }] : []),
            ...(bonusAmount > 0 ? [{ label: "Bonus", value: formatMoney(bonusAmount) }] : []),
          ],
        };
      });

      const mappedWithdrawals: CombinedTransaction[] = withdrawRequests.map((request) => ({
        id: `withdraw-${request._id}`,
        type: "withdraw",
        title: "Withdraw Request",
        subtitle: request.paymentMethod,
        amount: request.amount,
        changeAmount: request.status === "APPROVED" ? -request.amount : 0,
        status: request.status,
        statusLabel: getStatusLabel(request.status),
        paymentMethod: request.paymentMethod,
        createdAt: request.createdAt,
        referenceId: request.adminTransactionId || request._id,
        note: request.adminNote,
        extraLines: [
          { label: "Payment method", value: request.paymentMethod },
          { label: "Account number", value: request.accountNumber },
          ...(request.adminSenderNumber ? [{ label: "Admin sender number", value: request.adminSenderNumber }] : []),
          ...(request.adminTransactionId ? [{ label: "Admin tx ID", value: request.adminTransactionId }] : []),
        ],
      }));

      const combined = [...mappedDeposits, ...mappedWithdrawals].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );

      setTransactions(combined);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
  };

  const visibleTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = activeFilter === "all" || transaction.type === activeFilter || (activeFilter === "bonus" && transaction.type === "bonus");
      const matchesDate = isWithinFilter(transaction.createdAt, dateFilter);
      return matchesType && matchesDate;
    });
  }, [transactions, activeFilter, dateFilter]);

  const summary = useMemo(() => {
    const approvedDeposits = transactions.filter((transaction) => transaction.type !== "withdraw" && transaction.status === "APPROVED");
    const approvedWithdrawals = transactions.filter((transaction) => transaction.type === "withdraw" && transaction.status === "APPROVED");
    const bonusCredits = transactions.filter((transaction) => transaction.type === "bonus" && transaction.status === "APPROVED");

    return {
      total: transactions.length,
      deposits: approvedDeposits.reduce((sum, transaction) => sum + transaction.amount, 0),
      withdrawals: approvedWithdrawals.reduce((sum, transaction) => sum + transaction.amount, 0),
      bonuses: bonusCredits.reduce((sum, transaction) => sum + Math.max(transaction.changeAmount, 0), 0),
    };
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white">
        <div className="relative flex h-16 items-center border-b border-white/10 px-4">
          <Suspense fallback={<div>Loading...</div>}>
            <BackButton fallback="/account" />
          </Suspense>
          <h1 className="flex-1 text-center text-xl font-semibold">Transaction Record</h1>
          <div className="w-10" />
        </div>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-slate-400">Loading payment records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white pb-8">
      <div className="relative overflow-hidden border-b border-white/10 bg-linear-to-b from-[#111a31] to-[#0b1120]">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500" />
        <div className="relative flex h-16 items-center px-4">
          <Suspense fallback={<div>Loading...</div>}>
            <BackButton fallback="/account" />
          </Suspense>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Transaction Record</h1>
            <p className="text-xs text-slate-400">All payment-related activity in one place</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
            aria-label="Refresh transaction history"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400"><ReceiptText className="h-3.5 w-3.5" />Total</div>
            <div className="mt-2 text-lg font-semibold">{summary.total}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-xs text-emerald-200"><ArrowUpRight className="h-3.5 w-3.5" />Deposits</div>
            <div className="mt-2 text-lg font-semibold text-emerald-100">{formatMoney(summary.deposits)}</div>
          </div>
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/10 p-3">
            <div className="flex items-center gap-2 text-xs text-rose-200"><ArrowDownLeft className="h-3.5 w-3.5" />Withdrawals</div>
            <div className="mt-2 text-lg font-semibold text-rose-100">{formatMoney(summary.withdrawals)}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-xs text-amber-200"><Gift className="h-3.5 w-3.5" />Bonus</div>
            <div className="mt-2 text-lg font-semibold text-amber-100">{formatMoney(summary.bonuses)}</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-2 sm:[scrollbar-width:none] sm:[-ms-overflow-style:none] sm:[&::-webkit-scrollbar]:hidden">
          {filterTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`flex min-w-0 w-full items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs leading-tight text-center transition sm:w-auto sm:shrink-0 sm:px-4 sm:text-sm ${
                activeFilter === id
                  ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/10"
                  : "bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 wrap-break-word font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="relative">
          <button
            onClick={() => setIsDateOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {dateFilters.find((item) => item.id === dateFilter)?.label || "Yesterday"}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isDateOpen ? "rotate-180" : ""}`} />
          </button>

          {isDateOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#10192e] shadow-2xl shadow-black/30">
              {dateFilters.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDateFilter(item.id);
                    setIsDateOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                    dateFilter === item.id ? "bg-white/8 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{item.label}</span>
                  {dateFilter === item.id && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-2 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
            <div>Type</div>
            <div className="text-right">Change / Status</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        {visibleTransactions.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/4 px-6 py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400/10 text-amber-300">
              <Wallet className="h-9 w-9" />
            </div>
            <p className="text-lg font-semibold text-white">No payment records found</p>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Switch the filter or check another date range to view completed deposits and withdrawals.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTransactions.map((transaction) => {
              const status = statusMeta[transaction.status];
              const isNegative = transaction.changeAmount < 0;

              return (
                <button
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="w-full rounded-2xl border border-white/8 bg-[#10192e] p-4 text-left transition hover:border-cyan-400/30 hover:bg-[#12213a]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${transaction.type === "withdraw" ? "bg-rose-500/12 text-rose-300" : transaction.type === "bonus" ? "bg-amber-500/12 text-amber-300" : "bg-emerald-500/12 text-emerald-300"}`}>
                        {transaction.type === "withdraw" ? <ArrowDownLeft className="h-5 w-5" /> : transaction.type === "bonus" ? <Gift className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{transaction.title}</div>
                        <div className="mt-1 text-xs text-slate-400">{transaction.subtitle}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                          <span className="rounded-full bg-white/5 px-2.5 py-1">{transaction.paymentMethod}</span>
                          <span className="rounded-full bg-white/5 px-2.5 py-1">
                            {new Date(transaction.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-semibold ${isNegative ? "text-rose-300" : transaction.changeAmount > 0 ? "text-emerald-300" : "text-slate-300"}`}>
                        {getChangeLabel(transaction)}
                      </div>
                      <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(transaction.status)}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ReceiptText className="h-3.5 w-3.5" />
                      {transaction.referenceId ? transaction.referenceId.slice(0, 12) : transaction.id.slice(0, 12)}
                    </span>
                    <span>{transaction.note ? transaction.note : transaction.type === "bonus" ? "Bonus credited" : "Payment record"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Transaction Details</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{selectedTransaction.title}</h2>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="rounded-full bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
              <div className="text-sm text-slate-400">Change amount</div>
              <div className={`mt-1 text-3xl font-semibold ${selectedTransaction.changeAmount < 0 ? "text-rose-300" : selectedTransaction.changeAmount > 0 ? "text-emerald-300" : "text-slate-200"}`}>
                {getChangeLabel(selectedTransaction)}
              </div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedTransaction.status)}`}>
                {statusMeta[selectedTransaction.status].icon}
                {statusMeta[selectedTransaction.status].label}
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Amount</span>
                <span className="text-white">{formatMoney(selectedTransaction.amount)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Payment method</span>
                <span className="text-white">{selectedTransaction.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Date</span>
                <span className="text-white text-right">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
              {selectedTransaction.referenceId && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Reference ID</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="max-w-40 truncate text-white">{selectedTransaction.referenceId}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedTransaction.referenceId!)}
                      className="rounded-full bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                      aria-label="Copy reference ID"
                    >
                      <ClipboardCopy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="text-sm font-medium text-white">Payment details</div>
              <div className="mt-3 space-y-2 text-sm">
                {selectedTransaction.extraLines.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="max-w-56 text-right text-white break-all">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedTransaction.note && (
              <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/10 p-4 text-sm text-cyan-50">
                <div className="font-medium text-cyan-100">Note</div>
                <p className="mt-1 text-cyan-50/90">{selectedTransaction.note}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}