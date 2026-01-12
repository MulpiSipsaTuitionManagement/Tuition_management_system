import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Layers, Users } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

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
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-900 text-white px-5 py-3 rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Class</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map((cls, index) => (
                    <div key={cls.class_id} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <Card
                            onClick={() => navigate(`/classes/${cls.class_id}`)}
                            className="h-full relative overflow-hidden border border-slate/50 bg-white backdrop-blur-xl hover:bg-white/80 transition-all cursor-pointer"
                        >

                            {/* Decorative Background Icon */}
                            <Layers className="absolute -right-6 -bottom-6 w-32 h-32 text-purple-900/5 rotate-12" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                                    <Layers size={24} />
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedClass(cls); setShowDeleteModal(true); }} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
                                {cls.class_name}
                            </h3>

                            {cls.academic_level && (
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 mb-4">
                                    {cls.academic_level}
                                </span>
                            )}

                            <div className="mt-4 pt-4 border-t border-purple-100/50 flex items-center justify-between text-gray-600">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Users size={16} className="text-purple-400" />
                                    <span>{cls.total_students} Students</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${cls.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
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
