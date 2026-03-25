"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Eye,
  Gift,
  Calendar,
  FileText,
  Wallet,
  Copy
} from "lucide-react";
import { depositRequestService, DepositRequest } from "@/services/api/depositRequest.service";
import BackButton from "@/components/ui/BackButton";

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function DepositHistoryPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await depositRequestService.getUserRequests(params);
      if (response?.success) {
        setRequests(response.data.data || []);
        setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
        setTotalRequests(response.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch deposit history:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-600/20',
          text: 'text-yellow-400',
          border: 'border-yellow-600/30',
          icon: <Clock className="w-3 h-3" />,
          label: 'Pending'
        };
      case 'APPROVED':
        return {
          bg: 'bg-green-600/20',
          text: 'text-green-400',
          border: 'border-green-600/30',
          icon: <CheckCircle className="w-3 h-3" />,
          label: 'Approved'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-600/20',
          text: 'text-red-400',
          border: 'border-red-600/30',
          icon: <XCircle className="w-3 h-3" />,
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-gray-600/20',
          text: 'text-gray-400',
          border: 'border-gray-600/30',
          icon: <AlertCircle className="w-3 h-3" />,
          label: status
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
  const approvedTotal = requests
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount + (r.bonusAmount || 0), 0);

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-[#1E1D2A] text-white">
        <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
          <Suspense fallback={<div>Loading...</div>}>
            <BackButton />
          </Suspense>
          <h1 className="text-xl font-bold flex-1 text-center">Deposit History</h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-10">
      {/* Header */}
      <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
          <Suspense fallback={<div>Loading...</div>}>
      <BackButton />
    </Suspense>
        <h1 className="text-xl font-bold flex-1 text-center">Deposit History</h1>
        <button
          onClick={fetchRequests}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#252334] rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-white">{totalRequests}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-[#252334] rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
          <div className="bg-[#252334] rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-green-400">{approvedCount}</div>
            <div className="text-xs text-gray-400">Approved</div>
          </div>
          <div className="bg-[#252334] rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-red-400">{rejectedCount}</div>
            <div className="text-xs text-gray-400">Rejected</div>
          </div>
        </div>
        {approvedTotal > 0 && (
          <div className="mt-2 bg-green-900/20 rounded-lg p-2 text-center">
            <span className="text-xs text-gray-400">Total Approved: </span>
            <span className="text-sm font-bold text-green-400">৳{approvedTotal}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter === status
                  ? status === 'all'
                    ? 'bg-blue-600 text-white'
                    : getStatusBadge(status).bg + ' ' + getStatusBadge(status).text
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No deposit requests found</p>
          </div>
        ) : (
          requests.map((request) => {
            const status = getStatusBadge(request.status);
            return (
              <div
                key={request._id}
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetails(true);
                }}
                className="bg-[#252334] rounded-xl p-4 border border-gray-800 cursor-pointer hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">৳{request.amount}</span>
                      {(request.bonusAmount ?? 0) > 0 && (
                        <span className="text-xs bg-pink-600/30 text-pink-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          +৳{request.bonusAmount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {request.paymentMethod} • {request.depositType}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.bg} ${status.text} border ${status.border}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(request.createdAt)}
                  </div>
                  <Eye className="w-4 h-4 text-gray-600" />
                </div>

                {request.adminNote && request.status !== 'PENDING' && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
                    <span className="text-gray-500">Note: </span>
                    <span className="text-gray-400">{request.adminNote}</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-800 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-800 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-[#252334] rounded-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Deposit Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${getStatusBadge(selectedRequest.status).bg
                  } ${getStatusBadge(selectedRequest.status).text}`}>
                  {getStatusBadge(selectedRequest.status).icon}
                  {getStatusBadge(selectedRequest.status).label}
                </span>
              </div>

              {/* Amount */}
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">Deposit Amount</div>
                <div className="text-3xl font-bold text-white">৳{selectedRequest.amount}</div>
                {(selectedRequest.bonusAmount ?? 0) > 0 && (
                  <>
                    <div className="text-sm text-gray-400 mt-2 mb-1">Bonus</div>
                    <div className="text-xl font-bold text-green-400">+ ৳{selectedRequest.bonusAmount}</div>
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total</span>
                        <span className="text-white font-bold">৳{selectedRequest.amount + (selectedRequest.bonusAmount ?? 0)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white">{selectedRequest.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{selectedRequest.depositType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{formatDate(selectedRequest.createdAt)}</span>
                </div>
                {selectedRequest.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transaction ID:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm">{selectedRequest.transactionId.substring(0, 10)}...</span>
                      <button
                        onClick={() => copyToClipboard(selectedRequest.transactionId!)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedRequest.senderNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sender Number:</span>
                    <span className="text-white">{selectedRequest.senderNumber}</span>
                  </div>
                )}
              </div>

              {/* Promotion Details */}
              {selectedRequest.promotionName && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Promotion Applied</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Promotion:</span>
                      <span className="text-pink-400">{selectedRequest.promotionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Value:</span>
                      <span className="text-white">
                        {selectedRequest.promotionType === 'PERCENT'
                          ? `${selectedRequest.promotionValue}%`
                          : `৳${selectedRequest.promotionValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bonus Received:</span>
                      <span className="text-green-400">৳{selectedRequest.bonusAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {selectedRequest.adminNote && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Admin Note:</div>
                  <p className="text-white text-sm">{selectedRequest.adminNote}</p>
                </div>
              )}

              {/* Screenshot */}
              {selectedRequest.screenshot && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Screenshot:</div>
                  <img
                    src={selectedRequest.screenshot}
                    alt="Deposit proof"
                    className="w-full rounded-lg border border-gray-700"
                  />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}