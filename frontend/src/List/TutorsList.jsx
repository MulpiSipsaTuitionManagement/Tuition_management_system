import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Mail, Phone, BookOpen, User, MoreHorizontal, Eye, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Cards/Card';
import { API, getFileUrl } from '../api/api';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

// Animation variants for cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  hover: { y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", transition: { duration: 0.2 } }
};

const TutorCard = ({ tutor, onDelete, onView }) => {
  const salary = tutor.basic_salary ? parseFloat(tutor.basic_salary).toLocaleString() : '0.00';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative"
      onClick={() => onView(tutor)}
    >
      <Card className="h-full overflow-hidden border-slate-200/60 bg-white hover:border-purple-200 transition-colors cursor-pointer flex flex-col p-0">


        <div className="p-1 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xl overflow-hidden shadow-sm">
                {tutor.profile_photo ? (
                  <img
                    src={getFileUrl(tutor.profile_photo)}
                    alt={tutor.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  tutor.full_name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight">
                  {tutor.full_name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-purple-600 px-2 py-0.5 rounded uppercase tracking-widest">Faculty Member</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(tutor); }}
              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Terminate Access"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-50 transition-all">
                <Phone size={14} />
              </div>
              <span className="text-xs font-bold">{tutor.contact_no || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-50 transition-all">
                <Mail size={14} />
              </div>
              <span className="text-xs font-bold truncate max-w-[180px]">{tutor.email || 'N/A'}</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Basic Salary</span>
              <span className="text-sm font-extrabold text-slate-900">LKR {salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${tutor.user?.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                {tutor.user?.is_active ? 'Active' : 'Restricted'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default function TutorsList() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const result = await API.tutors.getAll();
      if (result.success) {
        setTutors(result.data.data || result.data);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTutor) return;
    try {
      const res = await API.admin.deleteUser(selectedTutor.user_id);
      if (res.success) {
        fetchTutors();
        setShowDeleteModal(false);
        setSelectedTutor(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTutorClick = (tutor) => {
    navigate(`/tutors/${tutor.tutor_id}`);
  };

  {/* if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Synchronizing faculty registry...</p>
      </div>
    );
  } */}

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-900 tracking-tight">Faculty Management</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage credentials and professional profiles of your teaching staff</p>
        </div>
        <button
          onClick={() => navigate('/tutors/add')}
          className="flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all transform hover:-translate-y-1 active:scale-95 font-bold"
        >
          <Plus size={20} />
          <span>Register New Faculty</span>
        </button>
      </div>

      {/* Grid Layout of Tutor Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        {tutors.map((tutor) => (
          <TutorCard
            key={tutor.tutor_id}
            tutor={tutor}
            onView={handleTutorClick}
            onDelete={(t) => { setSelectedTutor(t); setShowDeleteModal(true); }}
          />
        ))}

        {tutors.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-6 text-slate-200 shadow-sm border border-slate-100">
              <User size={48} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">Faculty Hub is Empty</p>
            <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">No faculty members found. Click the button above to start building your academic team.</p>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Revoke Faculty Access"
          message={`Are you sure you want to permanently remove ${selectedTutor?.full_name} from the system? This action will disable their login credentials and remove all professional history.`}
          onConfirm={handleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedTutor(null); }}
        />
      )}
    </div>
  );
}