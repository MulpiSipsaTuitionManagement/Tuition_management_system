import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, DollarSign, ArrowLeft, History,
    TrendingUp, Wallet, ShieldCheck, FileText,
    ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function TutorSalaryHistory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tutorData, setTutorData] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [stats, setStats] = useState({
        totalEarned: 0,
        average: 0,
        payments: 0
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch tutor details first
            const tRes = await API.tutors.getById(id);
            if (tRes.success) setTutorData(tRes.data);

            // Fetch salary history
            // We can use the existing getAll with tutor_id filter if the backend supports it
            const sRes = await API.salaries.getAll({ tutor_id: id });
            if (sRes.success) {
                const data = sRes.data;
                setSalaries(data);

                const paid = data.filter(s => s.status === 'Paid');
                const total = paid.reduce((acc, curr) => acc + parseFloat(curr.net_salary), 0);

                setStats({
                    totalEarned: total,
                    average: paid.length > 0 ? total / paid.length : 0,
                    payments: paid.length
                });
            }
        } catch (err) {
            console.error("Failed to fetch salary intelligence history.", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold tracking-tight">Accessing Salary History...</p>
        </div>
    );

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Payroll', onClick: () => navigate('/salaries') },
        { label: 'Payment Records', active: true }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in">
            <PageHeader
                title="Payment Records"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/salaries')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Faculty Spotlight */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50">
                        <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 p-1 bg-white rounded-3xl shadow-xl">
                                <div className="w-24 h-24 rounded-[1.25rem] bg-purple-50 flex items-center justify-center text-purple-600 text-3xl font-bold overflow-hidden">
                                    {tutorData?.profile_photo ? (
                                        <img
                                            src={getFileUrl(tutorData.profile_photo)}
                                            alt={tutorData.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        tutorData?.full_name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-8 mt-12 text-center">
                            <h3 className="text-xl font-black text-slate-900 mt-4 tracking-tight">{tutorData?.full_name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6 italic">Faculty Ledger #{id}</p>

                            <div className="space-y-4 pt-6 mt-6 border-t border-slate-50 text-left">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Earned</p>
                                    <p className="text-xl font-black text-emerald-700 tracking-tighter">LKR {stats.totalEarned.toLocaleString()}</p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Average Disbursement</p>
                                    <p className="text-xl font-black text-purple-700 tracking-tighter">LKR {stats.average.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Payroll Ledger */}
                <div className="lg:col-span-3">
                    <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50 bg-white">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
                                    <History size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Payment Records</h4>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-purple-500" />
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest">Remittance Month</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-right">Base Pay</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-right">Adjustments</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-right">Net Value</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-center">Payment Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {salaries.map((salary) => {
                                        const adj = parseFloat(salary.allowances) + parseFloat(salary.bonus || 0) - parseFloat(salary.deductions);
                                        return (
                                            <tr key={salary.salary_id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                            {salary.month.split('-')[1]}
                                                        </div>
                                                        <span className="text-sm font-black text-slate-700 tracking-tight">{salary.month}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-slate-500">{parseFloat(salary.base_amount).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className={`text-xs font-black inline-flex items-center gap-1 ${adj >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {adj >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {Math.abs(adj).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-slate-900">LKR {parseFloat(salary.net_salary).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${salary.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        salary.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-purple-50 text-purple-700 border-purple-100'
                                                        }`}>
                                                        {salary.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {salary.payment_date ? new Date(salary.payment_date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {salaries.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-sm font-bold text-slate-400 italic">No historical payroll found for this faculty member.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
