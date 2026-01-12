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
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const result = await API.students.getAll({ all: 'true' });
      if (result.success) {
        setStudents(result.data.data || result.data);
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterClass || student.class_id == filterClass;
    return matchesSearch && matchesGrade;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map(s => s.user_id).filter(id => id));
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

  // Stats Calculation
  const stats = {
    total: students.length,
    thisMonth: students.filter(s => {
      if (!s.enrollment_date) return false;
      const enrollmentDate = new Date(s.enrollment_date);
      const now = new Date();
      return enrollmentDate.getMonth() === now.getMonth() && enrollmentDate.getFullYear() === now.getFullYear();
    }).length,
    female: students.filter(s => s.gender?.toLowerCase() === 'female').length,
    male: students.filter(s => s.gender?.toLowerCase() === 'male').length
  };

  const genderChartData = [
    { name: 'Male Students', value: stats.male },
    { name: 'Female Students', value: stats.female },
  ].filter(d => d.value > 0);

  const CHART_COLORS = ['#7c3aed', '#db2777']; // Vivid Purple and Pink

  if (loading) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-bold">Synchronizing student records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 font-display">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Command center for student lifecycle management</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => { setSelectedStudent(null); setShowDeleteModal(true); }}
              className="flex items-center space-x-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl hover:bg-red-100 transition-all font-bold animate-fade-in shadow-sm border border-red-100"
            >
              <Trash2 size={18} />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          )}
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
                placeholder="Search by student name or ID..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest text-center">Registration ID</th>

                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest text-center">Grade</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest">Guardian Details</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest">Date of Birth</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-purple-800 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() => navigate(`/students/${student.student_id}`)}
                  className={`transition-all group cursor-pointer ${selectedIds.includes(student.user_id) ? 'bg-purple-50/30' : 'hover:bg-slate-50/40'}`}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedIds.includes(student.user_id)}
                      onChange={(e) => handleToggleSelect(student.user_id, e)}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center text-purple-600 font-extrabold border border-purple-200 text-sm overflow-hidden shadow-sm">
                        {student.profile_photo ? (
                          <img src={getFileUrl(student.profile_photo)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.full_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-purple-600 transition-colors tracking-tight">{student.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SID #{student.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-700 px-2.5 py-1">
                      {student.user?.username || 'no-uid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-slate-700 font-bold  px-3 py-1 rounded-full">{student.grade}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-xs text-slate-700 font-bold tracking-tight">{student.guardian_name || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">{student.guardian_contact || 'No Contact'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{student.dob || 'TBA'}</span>

                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border shadow-sm ${student.user?.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {student.user?.is_active ? 'Active' : 'Restricted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1  group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/students/${student.student_id}/edit`); }}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                      >
                        <Edit size={16} className='text-slate-400 hover:text-purple-600' />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setShowDeleteModal(true); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedStudents.length === 0 && (
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