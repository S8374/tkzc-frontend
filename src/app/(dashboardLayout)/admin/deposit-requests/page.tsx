"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  Gift,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  FileText,
  Copy,
  Wallet
} from "lucide-react";
import { depositRequestService, DepositRequest } from "@/services/api/depositRequest.service";

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';
type TypeFilter = 'all' | 'manual' | 'auto' | 'crypto';

export default function AdminDepositRequests() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch requests
  useEffect(() => {
    fetchRequests();
  }, [debouncedSearch, currentPage, statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.depositType = typeFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await depositRequestService.getAllRequests(params);
      if (response?.success) {
        setRequests(response.data.data || []);
        setStats(response.data.stats || []);
        setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
        setTotalRequests(response.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch deposit requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingId(selectedRequest._id);
      await depositRequestService.approveRequest(selectedRequest._id, adminNote);
      setShowApproveModal(false);
      setAdminNote("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingId(selectedRequest._id);
      await depositRequestService.rejectRequest(selectedRequest._id, adminNote);
      setShowRejectModal(false);
      setAdminNote("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
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

  const getStats = () => {
    const pending = stats.find(s => s._id === 'PENDING') || { count: 0, totalAmount: 0, totalBonus: 0 };
    const approved = stats.find(s => s._id === 'APPROVED') || { count: 0, totalAmount: 0, totalBonus: 0 };
    const rejected = stats.find(s => s._id === 'REJECTED') || { count: 0, totalAmount: 0, totalBonus: 0 };

    return { pending, approved, rejected };
  };

  const s = getStats();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-6">Deposit Requests</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white mt-1">{totalRequests}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{s.pending.count}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Amount: ৳{s.pending.totalAmount}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{s.approved.count}</p>
              </div>
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Amount: ৳{s.approved.totalAmount}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{s.rejected.count}</p>
              </div>
              <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Amount: ৳{s.rejected.totalAmount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, email, transaction ID..."
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
              <option value="crypto">Crypto</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500"></div>
              <p className="text-gray-400 mt-2">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No deposit requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {requests.map((request) => {
                    const status = getStatusBadge(request.status);
                    return (
                      <tr key={request._id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {request.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{request.userName}</p>
                              <p className="text-xs text-gray-400">{request.userEmail || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold">৳{request.amount}</div>
                          {request.bonusAmount > 0 && (
                            <div className="text-xs text-green-400 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              +৳{request.bonusAmount}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{request.paymentMethod}</div>
                          <div className="text-xs text-gray-400 capitalize">{request.depositType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.bg} ${status.text} border ${status.border}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetails(true);
                              }}
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowApproveModal(true);
                                  }}
                                  disabled={processingId === request._id}
                                  className="p-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectModal(true);
                                  }}
                                  disabled={processingId === request._id}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Deposit Request Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* User Info */}
              <div className="bg-gray-700 rounded-lg p-4 col-span-2">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">User Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Name:</span>
                    <span className="text-white">{selectedRequest.userName}</span>
                  </div>
                  {selectedRequest.userEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Email:</span>
                      <span className="text-white">{selectedRequest.userEmail}</span>
                    </div>
                  )}
                  {selectedRequest.user?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Phone:</span>
                      <span className="text-white">{selectedRequest.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deposit Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Deposit Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white font-bold">৳{selectedRequest.amount}</span>
                  </div>
                  {selectedRequest.bonusAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Bonus:</span>
                      <span className="text-green-400">+ ৳{selectedRequest.bonusAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white font-bold">
                      ৳{selectedRequest.amount + (selectedRequest.bonusAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Method:</span>
                    <span className="text-white">{selectedRequest.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Type:</span>
                    <span className="text-white capitalize">{selectedRequest.depositType}</span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      getStatusBadge(selectedRequest.status).bg
                    } ${getStatusBadge(selectedRequest.status).text}`}>
                      {getStatusBadge(selectedRequest.status).icon}
                      {getStatusBadge(selectedRequest.status).label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Date:</span>
                    <span className="text-white text-sm">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                  {selectedRequest.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Processed:</span>
                      <span className="text-white text-sm">{formatDate(selectedRequest.processedAt)}</span>
                    </div>
                  )}
                  {selectedRequest.processedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">By:</span>
                      <span className="text-white">{selectedRequest.processedBy.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              {(selectedRequest.transactionId || selectedRequest.senderNumber || selectedRequest.walletAddress) && (
                <div className="bg-gray-700 rounded-lg p-4 col-span-2">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Transaction Details</h4>
                  <div className="space-y-2">
                    {selectedRequest.transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Transaction ID:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white text-sm">{selectedRequest.transactionId}</span>
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
                        <span className="text-gray-300">Sender Number:</span>
                        <span className="text-white">{selectedRequest.senderNumber}</span>
                      </div>
                    )}
                    {selectedRequest.walletAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Wallet Address:</span>
                        <span className="text-white text-sm">{selectedRequest.walletAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Promotion Details - No maxBonus field */}
              {selectedRequest.promotionName && (
                <div className="bg-gray-700 rounded-lg p-4 col-span-2">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Promotion Applied</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Promotion:</span>
                      <span className="text-pink-400">{selectedRequest.promotionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Value:</span>
                      <span className="text-white">
                        {selectedRequest.promotionType === 'PERCENT' 
                          ? `${selectedRequest.promotionValue}%` 
                          : `৳${selectedRequest.promotionValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Bonus Given:</span>
                      <span className="text-green-400">৳{selectedRequest.bonusAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {selectedRequest.adminNote && (
                <div className="bg-gray-700 rounded-lg p-4 col-span-2">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Admin Note</h4>
                  <p className="text-white">{selectedRequest.adminNote}</p>
                </div>
              )}

              {/* Screenshot */}
              {selectedRequest.screenshot && (
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Screenshot</h4>
                  <img
                    src={selectedRequest.screenshot}
                    alt="Deposit proof"
                    className="w-full rounded-lg border border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons for Pending Requests */}
            {selectedRequest.status === 'PENDING' && (
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

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Approve Deposit Request</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to approve this deposit of <span className="font-bold text-green-400">৳{selectedRequest.amount}</span>?
              {selectedRequest.bonusAmount > 0 && (
                <> Bonus of <span className="font-bold text-green-400">৳{selectedRequest.bonusAmount}</span> will be added to the user's wallet.</>
              )}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Admin Note (Optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Add a note for the user..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setAdminNote("");
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processingId === selectedRequest._id}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === selectedRequest._id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Reject Deposit Request</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to reject this deposit of <span className="font-bold text-red-400">৳{selectedRequest.amount}</span>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Explain why this request is being rejected..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setAdminNote("");
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedRequest._id}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === selectedRequest._id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}