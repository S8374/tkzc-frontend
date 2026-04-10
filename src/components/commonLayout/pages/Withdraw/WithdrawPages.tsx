"use client"
import BackButton from "@/components/ui/BackButton";
import {
  Calendar,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react";
import { depositService, PaymentMethod } from "@/services/api/deposit.service";
import {
  WithdrawEligibility,
  WithdrawRequest,
  WithdrawStatus,
  withdrawRequestService,
} from "@/services/api/withdrawRequest.service";
import { walletService, Wallet } from "@/services/api/wallet.api";
import { Lock, Check } from "lucide-react";

const isBanglaText = (value: string) => /[\u0980-\u09FF]/.test(value);

const canonicalMethodKey = (method: PaymentMethod) => {
  const raw = (method.slug || method.name || "").toLowerCase().trim();
  if (raw.includes("নগদ") || raw.includes("nagad") || raw.includes("nogod")) return "nagad";
  if (raw.includes("বিকাশ") || raw.includes("bkash")) return "bkash";
  if (raw.includes("রকেট") || raw.includes("rocket")) return "rocket";
  return raw.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
};

const dedupePaymentMethods = (methods: PaymentMethod[]) => {
  const map = new Map<string, PaymentMethod>();

  methods.forEach((method) => {
    const key = canonicalMethodKey(method);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, method);
      return;
    }

    // Prefer Bangla label if both represent the same payment method.
    if (!isBanglaText(existing.name) && isBanglaText(method.name)) {
      map.set(key, method);
    }
  });

  return Array.from(map.values());
};

const WithdrawPages = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | WithdrawStatus>("all");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawEligibility, setWithdrawEligibility] = useState<WithdrawEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  const parseListPayload = (payload: any) => {
    const body = payload?.data ?? payload;
    return body?.data ?? body?.requests ?? [];
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      const response = await withdrawRequestService.getUserWithdrawRequests(params);
      if (response?.success) {
        setRequests(parseListPayload(response));
      }
    } catch (error) {
      console.error("Failed to fetch withdraw requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await depositService.getActivePaymentMethods();
      if (response?.success && Array.isArray(response.data)) {
        const methods: PaymentMethod[] = response.data
          .filter((method: PaymentMethod) => method.isActive)
          .sort((a: PaymentMethod, b: PaymentMethod) => a.order - b.order);

        const uniqueMethods = dedupePaymentMethods(methods);

        setPaymentMethods(uniqueMethods);
        if (!paymentMethod && uniqueMethods.length > 0) {
          setPaymentMethod(uniqueMethods[0].name);
        } else if (paymentMethod && !uniqueMethods.some((m) => m.name === paymentMethod)) {
          setPaymentMethod(uniqueMethods[0]?.name || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await walletService.getMyWallet();
      if (response?.success) {
        setWallet(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  const fetchWithdrawEligibility = async () => {
    try {
      setEligibilityLoading(true);
      const response = await withdrawRequestService.getWithdrawEligibility();
      if (response?.success) {
        setWithdrawEligibility(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch withdraw eligibility:", error);
    } finally {
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    fetchWallet();
    fetchWithdrawEligibility();
  }, [statusFilter]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [requests]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status: WithdrawStatus) => {
    if (status === "APPROVED") return "bg-green-600/20 text-green-400 border-green-600/30";
    if (status === "REJECTED") return "bg-red-600/20 text-red-400 border-red-600/30";
    if (status === "CANCELLED") return "bg-gray-600/20 text-gray-300 border-gray-600/30";
    return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
  };

  const currentTurnover = withdrawEligibility?.currentTurnover ?? (wallet?.currentTurnover || 0);
  const requiredTurnover = withdrawEligibility?.requiredTurnover ?? (wallet?.requiredTurnover || 0);
  const canWithdrawByTurnover = currentTurnover >= requiredTurnover;
  const remainingTurnover = Math.max(requiredTurnover - currentTurnover, 0);
  const canSubmitWithdraw = !submitting && paymentMethods.length > 0 && !eligibilityLoading && canWithdrawByTurnover;

  const handleSubmit = async () => {
    const amount = Number(withdrawAmount);
    if (!paymentMethod.trim()) {
      alert("Please select payment method");
      return;
    }
    if (!accountNumber.trim()) {
      alert("Please enter account number / wallet address");
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Please enter a valid withdraw amount");
      return;
    }
    if (!canWithdrawByTurnover) {
      alert(
        `Withdrawal is locked. You must play minimum turnover before withdrawing. Remaining turnover: ৳${remainingTurnover.toFixed(
          2
        )}`
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await withdrawRequestService.createWithdrawRequest({
        paymentMethod,
        accountNumber: accountNumber.trim(),
        amount,
      });

      if (response?.success) {
        setWithdrawAmount("");
        fetchMyRequests();
        fetchWallet();
        fetchWithdrawEligibility();
        alert("Withdraw request submitted successfully");
      }
    } catch (error) {
      console.error("Withdraw create failed:", error);
      const message = (error as any)?.response?.data?.message || "Failed to submit withdraw request";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this withdraw request?")) return;
    try {
      await withdrawRequestService.cancelWithdrawRequest(id);
      fetchMyRequests();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel request");
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="w-full overflow-hidden bg-[#1E1D2A] border-t-4 border-gray-800 rounded-xl">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-800">
            <BackButton />
            <h2 className="text-xl font-bold text-white">Withdraw</h2>
            <button
              onClick={() => {
                fetchMyRequests();
                fetchWallet();
                fetchWithdrawEligibility();
              }}
              className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/40"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="p-4 bg-linear-to-r from-gray-900/60 to-black/40 border-b border-gray-800">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-white font-bold">{stats.total}</p>
              </div>
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-yellow-400 font-bold">{stats.pending}</p>
              </div>
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-400">Approved</p>
                <p className="text-green-400 font-bold">{stats.approved}</p>
              </div>
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-400">Rejected</p>
                <p className="text-red-400 font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>

          {/* Turnover Progress */}
          {wallet && (
            <div className="mx-4 mt-6 p-4 bg-linear-to-br from-indigo-900/40 to-black/40 border border-indigo-500/20 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Turnover Requirement</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${canWithdrawByTurnover
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}>
                  {canWithdrawByTurnover ? (
                    <><Check className="w-3 h-3" /> COMPLETED</>
                  ) : (
                    <><Lock className="w-3 h-3 text-yellow-500" /> LOCKED</>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Total Progress</span>
                  <span className="text-white font-bold">
                    ৳{currentTurnover.toFixed(2)} / ৳{requiredTurnover.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                  <div
                    className={`h-full ring-1 ring-white/10 shadow-lg rounded-full transition-all duration-1000 ${canWithdrawByTurnover
                        ? "bg-linear-to-r from-green-600 to-emerald-400"
                        : "bg-linear-to-r from-indigo-600 to-blue-400"
                      }`}
                    style={{
                      width: `${Math.min(100, (currentTurnover / (requiredTurnover || 1)) * 100)}%`
                    }}
                  />
                </div>
                {!canWithdrawByTurnover && (
                  <p className="text-[10px] text-gray-400 italic text-center mt-2">
                    * You must play minimum game turnover to unlock withdrawals.
                  </p>
                )}
                {!canWithdrawByTurnover && (
                  <p className="text-[11px] text-yellow-300 text-center mt-1 font-semibold">
                    Remaining turnover to unlock withdraw: ৳{remainingTurnover.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method._id}
                    type="button"
                    onClick={() => setPaymentMethod(method.name)}
                    className={`rounded-xl py-3 px-2 text-xs flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 ${paymentMethod === method.name
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-300 shadow-lg shadow-yellow-500/20"
                        : "border-gray-800 bg-[#252334] text-gray-400 hover:border-gray-700"
                      }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                      {method.icon ? (
                        <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400 flex items-center justify-center text-gray-800 font-bold text-xs">
                          {method.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="font-bold truncate w-full px-1">{method.name}</span>
                  </button>
                ))}
              </div>
              {paymentMethods.length === 0 && (
                <p className="text-xs text-red-400 mt-2">No active payment methods found.</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Account Number / Wallet Address</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full bg-[#252334] border border-gray-700 rounded-lg py-3 px-3 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Withdraw Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimum withdraw amount: 10"
                  className="w-full bg-[#252334] border border-gray-700 rounded-lg py-3 pl-3 pr-16 text-white"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount("0")}
                  className="absolute inset-y-0 right-0 px-3 py-3 bg-gray-800 text-yellow-400 text-sm font-bold rounded-r-lg"
                >
                  All
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmitWithdraw}
              className="w-full py-3 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
              title={!canWithdrawByTurnover ? "Complete turnover requirement first" : ""}
            >
              {submitting
                ? "Submitting..."
                : canWithdrawByTurnover
                  ? "Withdraw Money"
                  : "Complete Turnover To Withdraw"}
            </button>

            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  My Withdraw Requests
                </h3>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#252334] border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="all">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No withdraw requests found</p>
                ) : (
                  requests.map((req) => (
                    <div key={req._id} className="bg-[#252334] border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-white font-semibold">৳{req.amount}</p>
                          <p className="text-xs text-gray-400">{req.paymentMethod} • {req.accountNumber}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(req.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusChip(req.status)}`}>
                            {req.status}
                          </span>
                          <div className="mt-2 flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Details
                            </button>
                            {req.status === "PENDING" && (
                              <button
                                onClick={() => handleCancel(req._id)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 p-4 z-50 flex items-center justify-center">
          <div className="w-full max-w-md bg-[#1E1D2A] border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-white font-bold">Withdraw Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white font-semibold">৳{selectedRequest.amount}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Payment Method</span><span className="text-white">{selectedRequest.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Account Number</span><span className="text-white">{selectedRequest.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`px-2 py-0.5 rounded border text-xs ${getStatusChip(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Created At</span><span className="text-white">{formatDate(selectedRequest.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Processed At</span><span className="text-white">{formatDate(selectedRequest.processedAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Admin Sender Number</span><span className="text-white">{selectedRequest.adminSenderNumber || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Admin Tx ID</span><span className="text-white break-all">{selectedRequest.adminTransactionId || "-"}</span></div>
              <div className="pt-2 border-t border-gray-700">
                <p className="text-gray-400 mb-1">Admin Note</p>
                <p className="text-white">{selectedRequest.adminNote || "-"}</p>
              </div>
            </div>

            <button
              className="w-full mt-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WithdrawPages