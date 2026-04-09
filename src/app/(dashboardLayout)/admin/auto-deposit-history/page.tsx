"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { autoDepositService, AutoDeposit } from "@/services/api/autoDeposit.service";

export default function AdminAutoDepositHistory() {
  const [requests, setRequests] = useState<AutoDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
  }, [debouncedSearch, currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await autoDepositService.getAllRequests(params);
      if (response?.success) {
        setRequests(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalRequests(response.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch auto-deposit history:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-6">Auto-Deposit History (OraclePay)</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Webhook Logs</p>
                <p className="text-2xl font-bold text-white mt-1">{totalRequests}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
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
                placeholder="Search by Invoice, Transaction ID..."
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500"></div>
              <p className="text-gray-400 mt-2">Loading logs...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No auto-deposit callbacks found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Invoice Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Bank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{request.transaction_id}</p>
                        <p className="text-xs text-gray-400">{request.session_code}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{request.invoice_number}</td>
                      <td className="px-4 py-3 text-sm capitalize">{request.bank}</td>
                      <td className="px-4 py-3 text-sm font-bold">৳{request.amount}</td>
                      <td className="px-4 py-3">
                        {request.status.toUpperCase() === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400 border border-green-600/30">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                            <Clock className="w-3 h-3" /> {request.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(request.createdAt)}
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
}
