import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Users, BookOpen, Clock, Search, Trash2, Edit } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function ClassDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classRes = await API.classes.getById(id);
                if (classRes.success) {
                    setClassData(classRes.data);
                    setSubjects(classRes.data.subjects || []);

                    // Fetch all students for this class
                    const studentsRes = await API.students.getAll({ class_id: id, all: 'true' });
                    if (studentsRes.success) {
                        const allStudents = studentsRes.data.data || studentsRes.data;
                        // Client-side filter as backup in case backend ignores param or if using cached 'all' response logic
                        setStudents(allStudents.filter(s => s.class_id == id));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch class details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guardian_contact?.includes(searchQuery)
    );

    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.user_id).filter(id => id));
        }
    };

    const toggleSelect = (userId) => {
        if (selectedStudents.includes(userId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== userId));
        } else {
            setSelectedStudents([...selectedStudents, userId]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`)) return;

        try {
            // Using Promise.all to delete multiple students
            await Promise.all(selectedStudents.map(id => API.admin.deleteUser(id)));

            // Refresh local data
            const remaining = students.filter(s => !selectedStudents.includes(s.user_id));
            setStudents(remaining);
            setSelectedStudents([]);
        } catch (error) {
            console.error("Failed to delete students", error);
            alert("Failed to delete some students. Please try again.");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading class details...</div>;
    if (!classData) return <div className="p-10 text-center text-red-500">Class not found</div>;

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Classes', onClick: () => navigate('/classes') },
        { label: classData.class_name, active: true }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <PageHeader
                title="Class Details"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/classes')}
                actions={
                    <button
                        onClick={() => navigate(`/classes/${id}/edit`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 transform hover:-translate-y-0.5"
                    >
                        <Edit size={18} />
                        Edit Class
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Class Info */}
                <div className="space-y-6">
                    <Card className="p-8 flex flex-col items-center border-slate-200/60 shadow-lg shadow-slate-200/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-purple-600"></div>
                        <div className="relative z-10 p-4 bg-white rounded-2xl shadow-sm mb-4">
                            <Layers className="text-purple-600 w-16 h-16" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">{classData.class_name}</h2>
                        <span className="text-slate-500 font-medium text-sm mt-1">{classData.academic_level || 'Academic Level'}</span>
                    </Card>

                    <Card className="p-6 border-slate-200/60 shadow-md">
                        <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm"><Users size={18} /></div>
                                    <span className="text-sm font-bold text-slate-700">Students</span>
                                </div>
                                <span className="text-xl font-extrabold text-slate-900">{students.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm"><BookOpen size={18} /></div>
                                    <span className="text-sm font-bold text-slate-700">Subjects</span>
                                </div>
                                <span className="text-xl font-extrabold text-slate-900">{subjects.length}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Lists */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Subjects List */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen className="text-purple-600" size={20} />
                            <span>Curriculum</span>
                        </h3>
                        {subjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subjects.map(sub => (
                                    <div key={sub.subject_id} onClick={() => navigate(`/subjects/${sub.subject_id}`)} className="cursor-pointer group bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800 group-hover:text-purple-700">{sub.subject_name}</h4>
                                            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">LKR {parseFloat(sub.monthly_fee).toFixed(2)}</span>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                                            <span>Tutor: {sub.tutor?.full_name || 'Unassigned'}</span>
                                            <span className="flex items-center gap-1 font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                                <Users size={10} /> {sub.students_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No subjects defined for this class.</p>
                        )}
                    </div>

                    {/* Students List */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="text-purple-600" size={20} />
                                <span>Enrolled Students</span>
                            </h3>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {selectedStudents.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold animate-in fade-in slide-in-from-right-4"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete ({selectedStudents.length})</span>
                                    </button>
                                )}

                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                            <div className="overflow-x-auto">
                                {filteredStudents.length > 0 ? (
                                    <table className="w-full text-left min-w-[600px]">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Parent Contact</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredStudents.map(std => (
                                                <tr
                                                    key={std.student_id}
                                                    onClick={() => navigate(`/students/${std.student_id}`)}
                                                    className={`hover:bg-purple-50/30 cursor-pointer transition-colors ${selectedStudents.includes(std.user_id) ? 'bg-purple-50/20' : ''}`}
                                                >
                                                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                            checked={selectedStudents.includes(std.user_id)}
                                                            onChange={() => toggleSelect(std.user_id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-slate-900 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                                                {std.full_name?.charAt(0)}
                                                            </div>
                                                            {std.full_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 text-sm">{std.guardian_contact}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className="text-xs font-bold text-purple-600 hover:underline">View</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-10 text-center text-slate-500 italic">
                                        {searchQuery ? 'No students match your search.' : 'No students enrolled in this class.'}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
