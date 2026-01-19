import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Layers, Users, UserPlus, Venus, Mars, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../Cards/Card';
import { API, getFileUrl } from '../api/api';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import Pagination from '../Components/Pagination';


export default function StudentsList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    female: 0,
    male: 0
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filterClass]);

  useEffect(() => {
    fetchClasses();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await API.students.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterClass) {
        params.class_id = filterClass;
      }

      const result = await API.students.getAll(params);
      if (result.success) {
        // Backend pagination response structure
        const paginator = result.data;
        setStudents(paginator.data || []);
        setTotalPages(paginator.last_page || 1);

        // Reset selection if page changes significantly or data empties
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedStudent?.user_id) return;
      const result = await API.admin.deleteUser(selectedStudent.user_id);
      if (result.success) {
        fetchStudents();
        fetchStats();
        setShowDeleteModal(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
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

  // Removed client-side filteredStudents logic

  const handleToggleSelectAll = () => {
    if (selectedIds.length === students.length && students.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.user_id).filter(id => id));
    }
  };

  const handleToggleSelect = (userId, e) => {
    e.stopPropagation();
    if (selectedIds.includes(userId)) {
      setSelectedIds(selectedIds.filter(id => id !== userId));
    } else {
      setSelectedIds([...selectedIds, userId]);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedIds.map(id => API.admin.deleteUser(id));
      await Promise.all(promises);
      fetchStudents();
      fetchStats();
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const confirmDelete = () => {
    if (selectedIds.length > 0 && !selectedStudent) {
      handleBulkDelete();
    } else if (selectedStudent) {
      handleDelete();
    }
  };

  const genderChartData = [
    { name: 'Male Students', value: stats.male },
    { name: 'Female Students', value: stats.female },
  ].filter(d => d.value > 0);

  const CHART_COLORS = ['#7c3aed', '#db2777'];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header section - Unchanged */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 font-display">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Command center for student lifecycle management</p>
        </div>
        <div className="flex gap-3">

          <button
            onClick={() => navigate('/students/add')}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all transform hover:-translate-y-1 active:scale-95 font-bold"
          >
            <Plus size={20} />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-purple-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Total Students</p>
          </Card>

          <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-emerald-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <UserPlus size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <TrendingUp size={10} />
                <span>Active</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.thisMonth}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Monthly Intake</p>
          </Card>

          <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Mars size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.male}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Male Students</p>
          </Card>

          <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-pink-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-pink-50 rounded-2xl text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Venus size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.female}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Female Students</p>
          </Card>
        </div>

        {/* Visual Analytics */}
        <Card className="p-4 border-slate-100 shadow-sm bg-white flex flex-col items-center justify-center">
          <div className="w-full h-40">
            {genderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '800' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 italic text-xs">No gender data</div>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gender Distribution</p>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="p-0 overflow-hidden border-slate-200/60 shadow-lg shadow-purple-50">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex-1 flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by student name..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
              <select
                value={filterClass}
                onChange={(e) => {
                  setFilterClass(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on filter
                }}
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold text-slate-700 cursor-pointer hover:border-purple-200 transition-all appearance-none"
              >
                <option value="">All Academic Grades</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchStudents}
              className="p-3 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all border border-slate-200"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all" onClick={handleToggleSelectAll}>
              <input
                type="checkbox"
                className="rounded border-slate-100 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                checked={students.length > 0 && selectedIds.length === students.length}
                onChange={handleToggleSelectAll}
              />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Select All</span>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-100">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={() => { setSelectedStudent(null); setShowDeleteModal(true); }}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl hover:bg-red-100 transition-all font-bold shadow-sm border border-red-100 text-[10px] uppercase tracking-widest"
                >
                  <Trash2 size={14} />
                  <span>Delete Selection</span>
                </button>
              </div>
            )}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {students.length} Students in view
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <div
                key={student.student_id}
                onClick={() => navigate(`/students/${student.student_id}`)}
                className={`relative p-5 rounded-[0.5rem] border transition-all cursor-pointer flex items-center gap-5  group ${selectedIds.includes(student.user_id)
                  ? 'bg-purple-50 border-purple-200 shadow-lg shadow-purple-100/50'
                  : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-slate-200/50'
                  }`}
              >
                {/* Checkbox for selection */}
                <div
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500/20 w-5 h-5 cursor-pointer transition-all shadow-inner"
                    checked={selectedIds.includes(student.user_id)}
                    onChange={(e) => handleToggleSelect(student.user_id, e)}
                  />
                </div>

                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full flex items-center justify-center text-purple-600 font-extrabold border border-slate-100 text-xl overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {student.profile_photo ? (
                    <img src={getFileUrl(student.profile_photo)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-indigo-600">
                      {student.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-purple-600 transition-colors">
                    {student.full_name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold truncate mt-1">
                    @{student.user?.username || 'no-id'}
                  </p>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-900 px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-100 shadow-sm">
                      {student.grade}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/students/${student.student_id}/edit`); }}
                    className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-slate-50"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-slate-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {students.length === 0 && (
          <div className="py-24 text-center bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Zero matches found</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto font-medium">We couldn't find any students matching your current search parameters or active filters.</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Confirmation Overlay */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={selectedIds.length > 0 && !selectedStudent ? "Critical Action: Bulk Removal" : "Critical Action: Individual Removal"}
          message={
            selectedIds.length > 0 && !selectedStudent
              ? `You are about to permanently purge ${selectedIds.length} student profiles from the ecosystem. Database counts for assigned classes and subjects will be decremented. Do you wish to proceed?`
              : `Confirm permanent removal of ${selectedStudent?.full_name}? This will revoke system access and decrement class metrics.`
          }
          onConfirm={confirmDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedStudent(null); }}
        />
      )}
    </div>
  );
}