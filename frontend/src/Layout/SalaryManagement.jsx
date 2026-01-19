import { useState, useEffect } from 'react';
import {
    DollarSign, Calendar, Search, Filter, CheckCircle,
    XCircle, Clock, ArrowRight, Download, Plus, Wand2,
    MoreHorizontal, ShieldCheck, TrendingUp, Wallet,
    Edit, History, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../Cards/Card';
import PageHeader from '../Components/PageHeader';
import { API, getFileUrl } from '../api/api';

export default function SalaryManagement() {
    const navigate = useNavigate();
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        totalAmount: 0
    });

    useEffect(() => {
        fetchSalaries();
    }, [monthFilter, statusFilter]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const params = {};
            if (monthFilter) params.month = monthFilter;
            if (statusFilter) params.status = statusFilter;

            const res = await API.salaries.getAll(params);
            if (res.success) {
                const data = res.data;
                setSalaries(data);

                // Calculate stats
                const paid = data.filter(s => s.status === 'Paid').length;
                const pending = data.filter(s => s.status === 'Pending').length;
                const totalAmount = data.reduce((acc, curr) => acc + parseFloat(curr.net_salary), 0);

                setStats({
                    total: data.length,
                    paid,
                    pending,
                    totalAmount
                });
            }
        } catch (error) {
            console.error("Failed to fetch salaries", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!confirm(`Generate salaries for ${monthFilter}?`)) return;
        setGenerating(true);
        try {
            const res = await API.salaries.generate({ month: monthFilter });
            if (res.success) {
                alert(res.message);
                fetchSalaries();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to generate salaries");
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkPaid = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await API.salaries.markPaid(id);
            if (res.success) {
                fetchSalaries();
            }
        } catch (error) {
            console.error("Failed to mark paid", error);
        }
    };

    const filteredSalaries = salaries.filter(s =>
        s.tutor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Partially Paid': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Adjusted': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'On Hold': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Salary Management</h2>
                    <p className="text-sm text-gray-600 mt-1 font-medium">Manage tutor salaries and payments</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-medium shadow-md shadow-green-500/20"
                >
                    {generating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Wand2 size={18} />
                    )}
                    <span>New Payroll Batch</span>
                </button>

            </div>



            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-purple-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <Wallet size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Exposure</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">LKR {stats.totalAmount.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Current Liability</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-emerald-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleared</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.paid}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Settled Vouchers</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-amber-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Clock size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Queue</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.pending}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Awaiting Approval</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-indigo-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.total}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Payroll Count</p>
                </Card>
            </div>

            {/* List Section */}
            <Card className="mt-8 p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50">
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex-1 flex gap-3 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filter by faculty intelligence..."
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-500" />
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 hover:border-purple-200 transition-all">
                                <input
                                    type="month"
                                    className="text-sm font-bold text-slate-700 outline-none bg-transparent"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                />
                                {monthFilter && (
                                    <button
                                        onClick={() => setMonthFilter('')}
                                        className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Clear month filter"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-purple-500/10 cursor-pointer hover:border-purple-200 transition-all appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                        >
                            <option value="">All records</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Adjusted">Adjusted</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 ">
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest">Tutor Name</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-center">Payroll Date</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-right">Basic Salary</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-right">Adjustments</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-right">Net Salary</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-center">Status</th>
                                <th className="px-4 py-4 text-xs font-semibold text-purple-800 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSalaries.map((salary) => {
                                const adjustments = parseFloat(salary.allowances) + parseFloat(salary.bonus || 0) - parseFloat(salary.deductions);
                                return (
                                    <tr
                                        key={salary.salary_id}
                                        className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/salaries/${salary.salary_id}/edit`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-black text-sm border border-purple-100 overflow-hidden shadow-sm">
                                                    {salary.tutor?.profile_photo ? (
                                                        <img
                                                            src={getFileUrl(salary.tutor.profile_photo)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        salary.tutor?.full_name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight">{salary.tutor?.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Identity #{salary.tutor_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1  text-sm font-semibold text-slate-600 uppercase tracking-tighter">
                                                <Calendar size={12} className="text-purple-400" />
                                                {salary.month}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {parseFloat(salary.base_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-center text-sm font-semibold px-2 py-0.5 rounded-md ${adjustments >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                                {adjustments >= 0 ? '+' : ''}{adjustments.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-black text-slate-900 tracking-tighter">LKR {parseFloat(salary.net_salary).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(salary.status)}`}>
                                                {salary.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1  transition-all">
                                                <button
                                                    onClick={() => navigate(`/salaries/${salary.salary_id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                    title="Adjust Record"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/tutors/${salary.tutor_id}/salaries`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Historical Ledger"
                                                >
                                                    <History size={16} />
                                                </button>
                                                {salary.status === 'Pending' && (
                                                    <button
                                                        onClick={(e) => handleMarkPaid(salary.salary_id, e)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Finalize Disbursement"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredSalaries.length === 0 && (
                    <div className="py-24 text-center bg-white border-t border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                            <DollarSign size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Zero Remittance Results</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto font-medium italic">We couldn't identify any payroll records matching your current filter intelligence.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
