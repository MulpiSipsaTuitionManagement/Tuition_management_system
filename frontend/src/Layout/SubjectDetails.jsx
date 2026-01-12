import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, User, DollarSign, Layers, Calendar, Clock } from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function SubjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const res = await API.subjects.getById(id);
                if (res.success) {
                    setSubject(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch subject details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading subject details...</div>;
    if (!subject) return <div className="p-10 text-center text-red-500">Subject not found</div>;

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Subjects', onClick: () => navigate('/subjects') },
        { label: subject.subject_name, active: true }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <PageHeader
                title="Subject Overview"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/subjects')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Subject Identity */}
                <div className="space-y-6">
                    <Card className="p-8 flex flex-col items-center border-slate-200/60 shadow-lg shadow-slate-200/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        <div className="relative z-10 p-4 bg-white rounded-2xl shadow-sm mb-4 text-pink-500">
                            <BookOpen size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 text-center">{subject.subject_name}</h2>

                        <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                            <Layers size={14} className="text-slate-400" />
                            <span className="text-slate-600 font-bold text-xs uppercase">{subject.grade || 'General'}</span>
                        </div>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Monthly Fee</span>
                                <span className="font-extrabold text-slate-900 text-lg">LKR {parseFloat(subject.monthly_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Subject ID</span>
                                <span className="font-bold text-slate-900">#{subject.subject_id}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-slate-200/60 shadow-md">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="text-indigo-600" size={18} />
                            <span>Assigned Faculty</span>
                        </h3>
                        {subject.tutor ? (
                            <div onClick={() => navigate(`/tutors/${subject.tutor.tutor_id}`)} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-400 font-bold border border-slate-200 shadow-sm overflow-hidden">
                                    {subject.tutor.profile_photo ? (
                                        <img src={getFileUrl(subject.tutor.profile_photo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        subject.tutor.full_name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{subject.tutor.full_name}</p>
                                    <p className="text-xs text-slate-500 font-medium">View Profile</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
                                No tutor assigned
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Schedule & Students */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 border-slate-200/60 shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Calendar size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Class Schedule</h3>
                        </div>

                        <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium text-sm">Schedule information not available in this view.</p>
                            <button onClick={() => navigate('/schedules')} className="mt-3 text-indigo-600 font-bold text-xs hover:underline">Go to Schedules</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
