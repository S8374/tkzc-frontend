"use client";

import { useEffect, useMemo, useState } from "react";
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
import { depositRequestService, DepositRequest } from "@/services/api/depositRequest.service";

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED";

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

const getStatusBadge = (status: string) => {
  if (status === "APPROVED") return "bg-green-600/20 text-green-400 border-green-600/30";
  if (status === "REJECTED") return "bg-red-600/20 text-red-400 border-red-600/30";
  return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
};

const getCryptoMeta = (request: DepositRequest) => {
  const form = request.formData || {};
  return {
    usdAmount: Number(form.cryptoUsdAmount || 0),
    displayCurrency: String(form.cryptoDisplayCurrency || ""),
    displayConverted: Number(form.cryptoDisplayConverted || 0),
    bdtEquivalent: Number(form.cryptoBdtEquivalent || request.amount || 0),
    proof: (form.cryptoProof || form.__cryptoProof || request.screenshot || "") as string,
  };
};

export default function AdminCryptoDepositRequestsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [adminNote, setAdminNote] = useState("");

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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
        depositType: "crypto",
      };

      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await depositRequestService.getAllRequests(params);

      if (response?.success) {
        const body = response.data || {};
        const list = body.data || [];
        const meta = body.meta || {};
        setRequests(list);
        setTotalRequests(meta.total || 0);
        setTotalPages(Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10))));
      }
    } catch (error) {
      console.error("Failed to fetch crypto deposit requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [requests]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest._id);
      await depositRequestService.approveRequest(selectedRequest._id, adminNote || undefined);

      setShowApproveModal(false);
      setShowDetails(false);
      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve crypto request:", error);
      alert("Failed to approve crypto request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest._id);
      await depositRequestService.rejectRequest(selectedRequest._id, adminNote || undefined);

      setShowRejectModal(false);
      setShowDetails(false);
      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject crypto request:", error);
      alert("Failed to reject crypto request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Crypto Deposit Requests</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl text-white font-bold">{totalRequests}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl text-yellow-400 font-bold">{summary.pending}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Approved</p>
            <p className="text-2xl text-green-400 font-bold">{summary.approved}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="text-2xl text-red-400 font-bold">{summary.rejected}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, transaction..."
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
            <div className="p-10 text-center text-gray-400">Loading crypto requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">No crypto deposit requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">User</th>
                    <th className="px-4 py-3 text-left text-xs">Amount (BDT)</th>
                    <th className="px-4 py-3 text-left text-xs">USD</th>
                    <th className="px-4 py-3 text-left text-xs">Method</th>
                    <th className="px-4 py-3 text-left text-xs">Status</th>
                    <th className="px-4 py-3 text-left text-xs">Created</th>
                    <th className="px-4 py-3 text-right text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {requests.map((request) => {
                    const meta = getCryptoMeta(request);
                    return (
                      <tr key={request._id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{request.userName}</p>
                          <p className="text-xs text-gray-400">{request.userEmail || "No email"}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">৳{request.amount}</td>
                        <td className="px-4 py-3 text-sm">{meta.usdAmount > 0 ? `$${meta.usdAmount}` : "-"}</td>
                        <td className="px-4 py-3 text-sm">{request.paymentMethod}</td>
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
                            className="inline-flex items-center justify-center p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Crypto Deposit Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const meta = getCryptoMeta(selectedRequest);
              const formEntries = Object.entries(selectedRequest.formData || {});

              return (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">User</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">Name: {selectedRequest.userName}</p>
                      <p className="text-white">Email: {selectedRequest.userEmail || "No email"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Request</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">Method: {selectedRequest.paymentMethod}</p>
                      <p className="text-white">Status: {selectedRequest.status}</p>
                      <p className="text-white">Submitted: {formatDate(selectedRequest.createdAt)}</p>
                      <p className="text-white">BDT Credit Equivalent: ৳{meta.bdtEquivalent.toFixed(2)}</p>
                      <p className="text-white">USD Amount: {meta.usdAmount > 0 ? `$${meta.usdAmount}` : "-"}</p>
                      {meta.displayCurrency && meta.displayConverted > 0 && (
                        <p className="text-white">
                          Converted ({meta.displayCurrency}): {meta.displayConverted}
                        </p>
                      )}
                      {(selectedRequest.bonusAmount ?? 0) > 0 && (
                        <p className="text-green-400">Bonus: +৳{selectedRequest.bonusAmount}</p>
                      )}
                      {(selectedRequest.turnoverRequired ?? 0) > 0 && (
                        <p className="text-emerald-400">
                          Turnover Required: ৳{Number(selectedRequest.turnoverRequired || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {meta.proof && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Payment Proof</h4>
                      <img
                        src={meta.proof}
                        alt="crypto-proof"
                        className="max-h-56 rounded-lg border border-gray-600 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(meta.proof, "_blank")}
                      />
                    </div>
                  )}

                  {formEntries.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">All Submitted Fields</h4>
                      <div className="space-y-2">
                        {formEntries.map(([key, value]) => {
                          if (value === null || value === undefined || value === "") return null;
                          if (["cryptoProof", "__cryptoProof"].includes(key)) return null;

                          return (
                            <div key={key} className="flex justify-between gap-3 border-b border-gray-600 pb-2 last:border-0">
                              <span className="text-gray-300 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                              <span className="text-white text-sm text-right break-all">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedRequest.adminNote && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Admin Note</h4>
                      <p className="text-white text-sm">{selectedRequest.adminNote}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {selectedRequest.status === "PENDING" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setShowApproveModal(true);
                  }}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setShowRejectModal(true);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Approve Crypto Deposit</h3>
            <p className="text-gray-300 mb-4">
              Approve this crypto deposit request and add the amount to wallet?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Admin Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Optional note"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processingId === selectedRequest._id}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === selectedRequest._id ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Reject Crypto Deposit</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Rejection Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Optional rejection reason"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedRequest._id}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === selectedRequest._id ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
