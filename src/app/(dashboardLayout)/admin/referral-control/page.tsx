"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Save,
  X,
  Plus
} from "lucide-react";
import { userService, User, UpdateUserData } from "@/services/api/admin.service";
import toast from "react-hot-toast";

export default function ReferralControlPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newReferralCode, setNewReferralCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers({
                page: currentPage,
                limit: 10,
                search: searchQuery
            });
            if (response?.success) {
                setUsers(response.data.data || response.data);
                if (response.meta) {
                    setTotalPages(Math.ceil(response.meta.total / 10));
                }
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, currentPage]);

    const handleUpdateReferral = async () => {
        if (!selectedUser || !newReferralCode) return;
        try {
            setIsSubmitting(true);
            const res = await userService.updateUser(selectedUser._id, { referralCode: newReferralCode });
            if (res?.success) {
                toast.success("Referral code updated!");
                setIsEditModalOpen(false);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateRandomCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setNewReferralCode(code);
    };

    return (
        <div className="p-6 bg-black">
            <div className="flex flex-col  md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Referral Control</h1>
                    <p className="text-gray-400 mt-1">Manage user referral codes and tracking</p>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-900/50 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            <div className="bg-[#1E1D2A] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Current Code</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8 bg-white/2"></td>
                                    </tr>
                                ))
                            ) : users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold">{user.name}</div>
                                                <div className="text-gray-500 text-xs">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-yellow-500 font-mono font-bold tracking-wider">
                                            {user.referralCode || 'NO_CODE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            user.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500' : 
                                            user.role === 'ADMIN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewReferralCode(user.referralCode || "");
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-white/2 flex items-center justify-between">
                    <div className="text-gray-500 text-xs font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 rounded-lg transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 rounded-lg transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#1E1D2A] rounded-2xl border border-white/5 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Edit Referral Code</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Target User</label>
                                <div className="p-3 bg-white/5 rounded-xl text-white font-semibold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">
                                        {selectedUser?.name.charAt(0)}
                                    </div>
                                    {selectedUser?.name}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">New Referral Code</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newReferralCode}
                                        onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                                        className="flex-1 bg-gray-900 border border-white/5 rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button 
                                        onClick={generateRandomCode}
                                        className="px-4 bg-white/5 text-yellow-500 hover:bg-white/10 rounded-xl transition-all"
                                        title="Generate Random"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleUpdateReferral}
                                disabled={isSubmitting || !newReferralCode}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
