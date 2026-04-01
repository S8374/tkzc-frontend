"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import {
  withdrawRequestService,
  WithdrawRequest,
  WithdrawStatus,
} from "@/services/api/withdrawRequest.service";

type StatusFilter = "all" | WithdrawStatus;

const parseListPayload = (payload: any) => {
  const body = payload?.data ?? payload;
  const list = body?.data ?? body?.requests ?? [];
  const meta = body?.meta ?? { total: Array.isArray(list) ? list.length : 0, page: 1, limit: 10 };
  const stats = body?.stats ?? [];
  return { list, meta, stats };
};

export default function AdminWithdrawRequestsPage() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [adminNote, setAdminNote] = useState("");
  const [adminSenderNumber, setAdminSenderNumber] = useState("");
  const [adminTransactionId, setAdminTransactionId] = useState("");

  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, debouncedSearch]);

  const resetProcessFields = () => {
    setAdminNote("");
    setAdminSenderNumber("");
    setAdminTransactionId("");
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page: currentPage, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await withdrawRequestService.getAllWithdrawRequests(params);
      if (response?.success) {
        const parsed = parseListPayload(response);
        setRequests(parsed.list || []);
        setStats(parsed.stats || []);
        setTotalRequests(parsed.meta?.total || 0);
        setTotalPages(Math.max(1, Math.ceil((parsed.meta?.total || 0) / (parsed.meta?.limit || 10))));
      }
    } catch (error) {
      console.error("Failed to fetch withdraw requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: WithdrawStatus) => {
    if (status === "APPROVED") return "bg-green-600/20 text-green-400 border-green-600/30";
    if (status === "REJECTED") return "bg-red-600/20 text-red-400 border-red-600/30";
    if (status === "CANCELLED") return "bg-gray-600/20 text-gray-300 border-gray-600/30";
    return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
  };

  const statCount = (key: WithdrawStatus) => stats.find((s) => s._id === key)?.count || 0;

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setProcessingId(selectedRequest._id);
      await withdrawRequestService.approveWithdrawRequest(selectedRequest._id, {
        adminNote: adminNote || undefined,
        adminSenderNumber: adminSenderNumber || undefined,
        adminTransactionId: adminTransactionId || undefined,
      });
      setShowApproveModal(false);
      setShowDetails(false);
      setSelectedRequest(null);
      resetProcessFields();
      fetchRequests();
    } catch (error) {
      console.error("Approve failed:", error);
      alert("Failed to approve withdraw request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      setProcessingId(selectedRequest._id);
      await withdrawRequestService.rejectWithdrawRequest(selectedRequest._id, {
        adminNote: adminNote || undefined,
        adminSenderNumber: adminSenderNumber || undefined,
        adminTransactionId: adminTransactionId || undefined,
      });
      setShowRejectModal(false);
      setShowDetails(false);
      setSelectedRequest(null);
      resetProcessFields();
      fetchRequests();
    } catch (error) {
      console.error("Reject failed:", error);
      alert("Failed to reject withdraw request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Withdraw Requests</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl text-white font-bold">{totalRequests}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl text-yellow-400 font-bold">{statCount("PENDING")}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Approved</p>
            <p className="text-2xl text-green-400 font-bold">{statCount("APPROVED")}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="text-2xl text-red-400 font-bold">{statCount("REJECTED")}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Cancelled</p>
            <p className="text-2xl text-gray-300 font-bold">{statCount("CANCELLED")}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, method, account..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={fetchRequests}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading withdraw requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">No withdraw requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">User</th>
                    <th className="px-4 py-3 text-left text-xs">Method</th>
                    <th className="px-4 py-3 text-left text-xs">Account</th>
                    <th className="px-4 py-3 text-left text-xs">Amount</th>
                    <th className="px-4 py-3 text-left text-xs">Status</th>
                    <th className="px-4 py-3 text-left text-xs">Created</th>
                    <th className="px-4 py-3 text-right text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{request.userName}</p>
                        <p className="text-xs text-gray-400">{request.userEmail || "No email"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{request.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm">{request.accountNumber}</td>
                      <td className="px-4 py-3 text-sm font-semibold">৳{request.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(request.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetails(true);
                          }}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 rounded text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 p-4 z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-white font-bold">Withdraw Request Details</h3>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">User</span><p className="text-white mt-1">{selectedRequest.userName}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Email</span><p className="text-white mt-1">{selectedRequest.userEmail || "-"}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Payment Method</span><p className="text-white mt-1">{selectedRequest.paymentMethod}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Account Number</span><p className="text-white mt-1">{selectedRequest.accountNumber}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Amount</span><p className="text-white mt-1 font-semibold">৳{selectedRequest.amount}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Status</span><p className="text-white mt-1">{selectedRequest.status}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Created At</span><p className="text-white mt-1">{formatDate(selectedRequest.createdAt)}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Processed At</span><p className="text-white mt-1">{formatDate(selectedRequest.processedAt)}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Admin Sender Number</span><p className="text-white mt-1">{selectedRequest.adminSenderNumber || "-"}</p></div>
                <div className="bg-gray-700 rounded-lg p-3"><span className="text-gray-400">Admin Transaction ID</span><p className="text-white mt-1 break-all">{selectedRequest.adminTransactionId || "-"}</p></div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <span className="text-gray-400">Admin Note</span>
                <p className="text-white mt-1">{selectedRequest.adminNote || "-"}</p>
              </div>
            </div>

            {selectedRequest.status === "PENDING" && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowApproveModal(true);
                    resetProcessFields();
                  }}
                  className="py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(true);
                    resetProcessFields();
                  }}
                  className="py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {(showApproveModal || showRejectModal) && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 p-4 z-50 flex items-center justify-center">
          <div className="w-full max-w-lg bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-3">
              {showApproveModal ? "Approve Withdraw" : "Reject Withdraw"}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Request amount: <span className="text-white font-semibold">৳{selectedRequest.amount}</span>
            </p>

            <div className="space-y-3">
              <input
                value={adminSenderNumber}
                onChange={(e) => setAdminSenderNumber(e.target.value)}
                placeholder="Admin Sender Number (optional)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              <input
                value={adminTransactionId}
                onChange={(e) => setAdminTransactionId(e.target.value)}
                placeholder="Admin Transaction ID (optional)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder={showApproveModal ? "Approval note (optional)" : "Rejection reason (optional)"}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setShowRejectModal(false);
                }}
                className="py-2.5 rounded-lg bg-gray-700 text-white"
              >
                Cancel
              </button>
              {showApproveModal ? (
                <button
                  onClick={handleApprove}
                  disabled={processingId === selectedRequest._id}
                  className="py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {processingId === selectedRequest._id ? "Processing..." : "Approve"}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={processingId === selectedRequest._id}
                  className="py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {processingId === selectedRequest._id ? "Processing..." : "Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
