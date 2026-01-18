import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Search, DollarSign, Filter, Calendar, Users, Layers, Wand2 } from 'lucide-react';
import Card from '../Cards/Card';
import { API, getFileUrl } from '../api/api'; // Kept in case of emergency manual adjustments
import RecordPaymentModal from '../Modals/RecordPaymentModal';

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stats, setStats] = useState({ collected: 0, pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, [month, filterClass, searchTerm]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const result = await API.fees.getAll({
        month: month,
        class_id: filterClass,
        search: searchTerm
      });
      if (result.success) {
        const data = result.data; // Already filtered by backend hopefully
        setFees(data);

        // Calculate Stats based on current view
        const collected = data.filter(f => f.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const pending = data.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        setStats({ collected, pending });
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await API.classes.getAll();
      if (result.success) {
        setClasses(result.data.data || result.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const generateFees = async () => {
    if (confirm(`Generate fee records for all active students for ${month}?`)) {
      try {
        const res = await API.fees.generate({ month });
        if (res.success) {
          alert(res.message);
          fetchFees();
        }
      } catch (e) {
        alert(e.response?.data?.message || 'Error generating fees');
      }
    }
  };

  const markAsPaid = async (id) => {
    if (confirm('Mark this fee as PAID?')) {
      try {
        const res = await API.fees.markPaid(id);
        if (res.success) {
          fetchFees();
        }
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Fee Management</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">Automatic billing and tracking for {month}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/50 px-5 py-2.5  rounded-xl border border-purple-100 items-center">
            <Calendar size={18} className="mx-3 text-purple-500" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 pr-3"
            />
          </div>
          <button
            onClick={generateFees}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-medium shadow-md shadow-green-500/20"
          >
            <Wand2 className="w-5 h-5" />
            <span>Generate for {month}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 flex items-center gap-5 border-l-4 border-green-500 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="bg-green-100 p-4 rounded-full shadow-inner"><CheckCircle className="w-8 h-8 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collected for {month}</p>
            <p className="text-3xl font-bold text-gray-800">{stats.collected.toLocaleString()} <span className="text-sm text-gray-500 font-normal">LKR</span></p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-5 border-l-4 border-yellow-500 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="bg-yellow-100 p-4 rounded-full shadow-inner"><Clock className="w-8 h-8 text-yellow-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending for {month}</p>
            <p className="text-3xl font-bold text-gray-800">{stats.pending.toLocaleString()} <span className="text-sm text-gray-500 font-normal">LKR</span></p>
          </div>
        </Card>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder-purple-300 text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={16} />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-bold text-gray-700 cursor-pointer hover:bg-white/80 transition-colors appearance-none"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <Card className="overflow-hidden border border-white/60 shadow-sm bg-white/70 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50/50 border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Student & Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Month & Context</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.map((fee, index) => (
                <tr key={fee.fee_id || fee.id} className="hover:bg-purple-50/50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/students/${fee.student_id}/fees`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors overflow-hidden">
                        {fee.student?.profile_photo ? (
                          <img src={getFileUrl(fee.student.profile_photo)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          fee.student?.full_name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{fee.student?.full_name}</div>
                        <div className="text-[10px] text-purple-500 font-bold uppercase tracking-tight">{fee.student?.school_class?.class_name || 'Individual'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 font-medium">{fee.remarks || 'Monthly Tuition'}</div>
                    <div className="text-xs text-gray-400 italic">Bill Date: {new Date(fee.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-x border-gray-50">
                    <div className="flex items-center text-purple-700">
                      <DollarSign size={14} className="mr-1" />
                      {parseFloat(fee.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${fee.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                      fee.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {fee.status !== 'paid' ? (
                      <button
                        onClick={() => markAsPaid(fee.fee_id || fee.id)}
                        className="px-4 py-1.5 bg-white border border-green-200 text-green-700 text-xs font-bold rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm transform active:scale-95"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <div className="flex items-center justify-center text-green-600 gap-1.5 text-xs font-bold bg-green-50 w-fit mx-auto px-3 py-1 rounded-lg">
                        <CheckCircle size={14} />
                        Settled
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {fees.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No fee records for {month} in this category.</p>
                    <p className="text-sm mt-1">Try generating fees or changing filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Modal could be used for more complex records, but markAsPaid is faster for simple status flips */}
      {showPaymentModal && <RecordPaymentModal fee={selectedFee} onClose={() => setShowPaymentModal(false)} onSuccess={fetchFees} />}
    </div>
  );
};
