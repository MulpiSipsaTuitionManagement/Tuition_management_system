import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, DollarSign, History,
    CheckCircle, AlertCircle, Clock, FileText,
    TrendingUp, Wallet, ShieldCheck,
    ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StudentFeeHistory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [fees, setFees] = useState([]);
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPending: 0,
        paymentsCount: 0
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch student details
            const sRes = await API.students.getById(id);
            if (sRes.success) setStudentData(sRes.data);

            // Fetch fee history
            const fRes = await API.fees.getAll({ student_id: id, sort: 'asc' });
            if (fRes.success) {
                const data = fRes.data;
                setFees(data);

                const paid = data.filter(f => f.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                const pending = data.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

                setStats({
                    totalPaid: paid,
                    totalPending: pending,
                    paymentsCount: data.filter(f => f.status === 'paid').length
                });
            }
        } catch (err) {
            console.error("Failed to fetch fee history.", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (feeId) => {
        if (confirm('Mark this fee as PAID?')) {
            try {
                const res = await API.fees.markPaid(feeId);
                if (res.success) {
                    fetchData();
                }
            } catch (e) {
                console.error(e);
                alert('Failed to record payment');
            }
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(126, 34, 206); // Purple-700
        doc.text("Student Fee History Report", 14, 20);

        // Add Student Info
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(`Student: ${studentData?.full_name}`, 14, 32);
        doc.text(`Student ID: #${id}`, 14, 38);
        doc.text(`Class: ${studentData?.school_class?.class_name || 'Individual'}`, 14, 44);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 50);

        // Add Financial Summary
        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85); // Slate-800
        doc.text("Financial Summary", 14, 62);
        doc.setFontSize(11);
        doc.text(`Total Paid: LKR ${stats.totalPaid.toLocaleString()}`, 14, 70);
        doc.text(`Pending Dues: LKR ${stats.totalPending.toLocaleString()}`, 80, 70);
        doc.text(`Total Commitment: LKR ${(stats.totalPaid + stats.totalPending).toLocaleString()}`, 140, 70);

        // Add Table
        const tableColumn = ["Billing Month", "Remarks", "Amount (LKR)", "Status", "Date / Due Date"];
        const tableRows = [];

        fees.forEach(fee => {
            const feeData = [
                new Date(fee.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                fee.remarks || 'Monthly Fee',
                parseFloat(fee.amount).toLocaleString(),
                fee.status.toUpperCase(),
                fee.status === 'paid'
                    ? (fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : 'N/A')
                    : `Due: ${new Date(fee.due_date).toLocaleDateString()}`
            ];
            tableRows.push(feeData);
        });

        autoTable(doc, {
            startY: 80,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [126, 34, 206] }, // Purple-700
            styles: { fontSize: 9 }
        });

        doc.save(`FeeHistory_${studentData?.full_name.replace(/\s+/g, '_')}_${id}.pdf`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold tracking-tight">Accessing Fee History...</p>
        </div>
    );

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Fees', onClick: () => navigate('/fees') },
        { label: 'Student Ledger', active: true }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in">
            <PageHeader
                title="Student Fee History"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/fees')}
                actions={
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 transform hover:-translate-y-0.5"
                    >
                        <Download size={18} />
                        Download Report
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Student Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50">

                        <div className="px-6 py-8 -mt-12 text-center">
                            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-white p-1 border-4 border-white shadow-xl flex items-center justify-center text-purple-600 text-3xl font-bold mb-4 overflow-hidden">
                                {studentData?.profile_photo ? (
                                    <img
                                        src={getFileUrl(studentData.profile_photo)}
                                        alt={studentData.full_name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    studentData?.full_name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{studentData?.full_name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-2 italic">Student ID #{id}</p>
                            <p className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                                {studentData?.school_class?.class_name || 'Individual'}
                            </p>

                            <div className="space-y-4 pt-6 mt-6 border-t border-slate-50 text-left">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Paid</p>
                                    <p className="text-xl font-black text-emerald-700 tracking-tighter">LKR {stats.totalPaid.toLocaleString()}</p>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pending Dues</p>
                                    <p className="text-xl font-black text-amber-700 tracking-tighter">LKR {stats.totalPending.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Fee Ledger */}
                <div className="lg:col-span-3">
                    <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50 bg-white">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
                                    <History size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Financial Records Ledger</h4>
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
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest">Billing Month</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest">Remarks</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-center">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold text-purple-600 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fees.map((fee) => (
                                        <tr key={fee.fee_id || fee.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                        {new Date(fee.due_date).toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 tracking-tight">
                                                        {new Date(fee.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-500">{fee.remarks || 'Monthly Fee'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-slate-900">LKR {parseFloat(fee.amount).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    fee.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {fee.status === 'paid' ? (fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : 'N/A') : `Due: ${new Date(fee.due_date).toLocaleDateString()}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {fee.status !== 'paid' ? (
                                                    <button
                                                        onClick={() => markAsPaid(fee.fee_id || fee.id)}
                                                        className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm transform active:scale-95"
                                                    >
                                                        Record Payment
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center text-emerald-600 gap-1 text-[10px] font-black bg-emerald-50/50 w-fit mx-auto px-2 py-1 rounded-lg border border-emerald-100">
                                                        <CheckCircle size={12} />
                                                        CLEARED
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {fees.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-sm font-bold text-slate-400 italic">No financial ledger entries found for this student.</p>
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
