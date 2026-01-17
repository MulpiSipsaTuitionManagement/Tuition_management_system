import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Layers, Users } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

const ACADEMIC_IMAGES = [
    'photo-1497633762265-9d179a990aa6', // Books/Library
    'photo-1503676260728-1c00da094a0b', // Modern Classroom
    'photo-1523050854058-8df90110c9f1', // Graduation/Academic
    'photo-1509062522246-3755977927d7', // Blackboard/Teaching
    'photo-1516321318423-f06f85e504b3', // Digital Learning
    'photo-1434030216411-0b793f4b4173', // Writing/Study
    'photo-1524995997946-a1c2e315a42f', // Library Hall
    'photo-1580582932707-520aed937b7b', // Student Desk
];

const getAcademicImage = (id) => {
    const index = id % ACADEMIC_IMAGES.length;
    return `https://images.unsplash.com/${ACADEMIC_IMAGES[index]}?q=80&w=800&auto=format&fit=crop`;
};

export default function ClassesList() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const result = await API.classes.getAll();
            if (result.success) {
                setClasses(result.data.data || result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedClass) return;
        try {
            await API.classes.delete(selectedClass.class_id);
            fetchClasses();
            setShowDeleteModal(false);
            setSelectedClass(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900">Classes</h2>
                    <p className="text-sm text-gray-600 mt-1 font-medium">Structure your academic levels</p>
                </div>
                <button
                    onClick={() => navigate('/classes/add')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-900 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Class</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {classes.map((cls, index) => (
                    <div key={cls.class_id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card
                            onClick={() => navigate(`/classes/${cls.class_id}`)}
                            noPadding
                            className="h-full overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 cursor-pointer flex flex-col"
                        >
                            {/* Card Image and Status Overlay */}
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                <img
                                    src={getAcademicImage(cls.class_id)}
                                    alt={cls.class_name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = classroom;
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                                {/* Status Badge Overlay */}
                                <div className="absolute bottom-4 left-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg backdrop-blur-md ${cls.status === 'active'
                                        ? 'bg-green-500/90 text-white'
                                        : 'bg-gray-500/90 text-white'
                                        }`}>
                                        {cls.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Delete Button overlay */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClass(cls);
                                        setShowDeleteModal(true);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-red-500 backdrop-blur-md text-white rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span>{cls.academic_level || 'General'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{cls.total_students} Students</span>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
                                    {cls.class_name}
                                </h3>



                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between group/footer">
                                    <span className="text-xs font-bold text-purple-600 tracking-tight">View Detail</span>
                                    <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                                        <Plus className="w-3.5 h-3.5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}

                {classes.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white/30 rounded-2xl border border-dashed border-gray-300">
                        <Layers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No grades defined yet. Start by adding one.</p>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <DeleteConfirmModal
                    title="Delete Class"
                    message={`Are you sure you want to delete ${selectedClass?.class_name}? This will affect all subjects and students assigned to this class.`}
                    onConfirm={handleDelete}
                    onClose={() => { setShowDeleteModal(false); setSelectedClass(null); }}
                />
            )}
        </div>
    );
}
