import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DollarSign, Save, ArrowLeft, Info,
    TrendingUp, Calculator, ShieldCheck, Wallet,
    Plus, Minus, Percent, CreditCard
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function EditSalary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [salaryData, setSalaryData] = useState({
        base_amount: 0,
        allowances: 0,
        bonus: 0,
        deductions: 0,
        status: '',
        tutor: null,
        month: ''
    });

    useEffect(() => {
        fetchSalary();
    }, [id]);

    const fetchSalary = async () => {
        try {
            const res = await API.salaries.getById(id);
            if (res.success) {
                setSalaryData({
                    ...res.data,
                    base_amount: parseFloat(res.data.base_amount),
                    allowances: parseFloat(res.data.allowances),
                    bonus: parseFloat(res.data.bonus || 0),
                    deductions: parseFloat(res.data.deductions),
                });
            }
        } catch (err) {
            setError("Failed to fetch salary intelligence.");
        } finally {
            setLoading(false);
        }
    };

    const calculateNet = () => {
        return (
            parseFloat(salaryData.base_amount || 0) +
            parseFloat(salaryData.allowances || 0) +
            parseFloat(salaryData.bonus || 0) -
            parseFloat(salaryData.deductions || 0)
        );
    };

    const validateField = (name, value) => {
        let error = '';
        if (['base_amount', 'allowances', 'bonus', 'deductions'].includes(name)) {
            if (value < 0) error = 'Value cannot be negative';
            else if (value === '' || value === null) error = 'Value is required';
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setSalaryData(prev => ({ ...prev, [name]: value }));
        const errorMsg = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        let errors = {};
        let hasError = false;
        ['base_amount', 'allowances', 'bonus', 'deductions'].forEach(key => {
            const errorMsg = validateField(key, salaryData[key]);
            if (errorMsg) {
                errors[key] = errorMsg;
                hasError = true;
            }
        });

        if (hasError) {
            setFieldErrors(errors);
            return;
        }

        setSaving(true);
        setError('');
        try {
            const res = await API.salaries.update(id, {
                base_amount: salaryData.base_amount,
                allowances: salaryData.allowances,
                bonus: salaryData.bonus,
                deductions: salaryData.deductions,
                status: salaryData.status
            });
            if (res.success) {
                navigate('/salaries');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to finalize salary adjustment.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold tracking-tight">Accessing payroll vault...</p>
        </div>
    );

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Payroll', onClick: () => navigate('/salaries') },
        { label: 'Adjust Record', active: true }
    ];

    const netSalary = calculateNet();

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 animate-fade-in">
            <PageHeader
                title="Payroll Management"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/salaries')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <Info size={18} />
                            {error}
                        </div>
                    )}

                    <Card className="p-8 border-slate-200/50 shadow-xl shadow-purple-50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                <Calculator size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Salary Adjustment</h3>
                                <p className="text-xs text-slate-500 font-medium">Precision tuning for faculty remuneration</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Retainer (LKR)</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="number"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-700 ${fieldErrors.base_amount ? 'border-red-500' : 'border-slate-200'}`}
                                            value={salaryData.base_amount}
                                            onChange={(e) => handleFieldChange('base_amount', e.target.value)}
                                        />
                                        {fieldErrors.base_amount && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.base_amount}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Allowances</label>
                                    <div className="relative">
                                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="number"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-700 ${fieldErrors.allowances ? 'border-red-500' : 'border-slate-200'}`}
                                            value={salaryData.allowances}
                                            onChange={(e) => handleFieldChange('allowances', e.target.value)}
                                        />
                                        {fieldErrors.allowances && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.allowances}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merit Bonus</label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                        <input
                                            type="number"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-700 ${fieldErrors.bonus ? 'border-red-500' : 'border-slate-200'}`}
                                            value={salaryData.bonus}
                                            onChange={(e) => handleFieldChange('bonus', e.target.value)}
                                        />
                                        {fieldErrors.bonus && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.bonus}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statutory Deductions</label>
                                    <div className="relative">
                                        <Minus className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={18} />
                                        <input
                                            type="number"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-bold text-slate-700 ${fieldErrors.deductions ? 'border-red-500' : 'border-slate-200'}`}
                                            value={salaryData.deductions}
                                            onChange={(e) => handleFieldChange('deductions', e.target.value)}
                                        />
                                        {fieldErrors.deductions && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.deductions}</p>}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Processing Status</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-slate-700 appearance-none"
                                        value={salaryData.status}
                                        onChange={(e) => setSalaryData({ ...salaryData, status: e.target.value })}
                                    >
                                        <option value="Pending">Pending Approval</option>
                                        <option value="Paid">Processed (Paid)</option>
                                        <option value="Partially Paid">Partially Disbursed</option>
                                        <option value="Adjusted">Correction Applied</option>
                                        <option value="On Hold">Payment Restricted</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/salaries')}
                                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3"
                                >
                                    {saving ? 'Finalizing...' : 'Apply Adjustments'}
                                    {!saving && <Save size={18} />}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Faculty Brief */}
                    <Card className="p-6 border-slate-200/50 shadow-lg shadow-purple-50 bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-xl border border-purple-100 overflow-hidden">
                                {salaryData.tutor?.profile_photo ? (
                                    <img
                                        src={getFileUrl(salaryData.tutor.profile_photo)}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    salaryData.tutor?.full_name?.charAt(0)
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 tracking-tight">{salaryData.tutor?.full_name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{salaryData.month}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gross Potential</span>
                                <span className="text-sm font-bold text-slate-700">LKR {(parseFloat(salaryData.base_amount || 0) + parseFloat(salaryData.allowances || 0) + parseFloat(salaryData.bonus || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Deductions</span>
                                <span className="text-sm font-bold text-red-500">-LKR {parseFloat(salaryData.deductions || 0).toLocaleString()}</span>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-6">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Final Disbursement</p>
                                <p className="text-2xl font-black text-emerald-700 tracking-tighter">LKR {netSalary.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-2 mb-4 text-purple-300">
                            <ShieldCheck size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Audit Policy</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-300 font-medium italic">
                            All adjustments made here will be logged and attributed to your administrative ID. Final disbursements must be verified before payment execution.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
