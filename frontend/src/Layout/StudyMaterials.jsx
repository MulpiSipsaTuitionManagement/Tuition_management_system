import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, Filter, X } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [options, setOptions] = useState({ classes: [], subjects: [], tutors: [] });
  const [filters, setFilters] = useState({
    class_id: '',
    subject_id: '',
    tutor_id: '',
    search: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOptions();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchOptions = async () => {
    try {
      const result = await API.materials.getOptions();
      console.log('Study Materials Options Response:', result);
      if (result.success) {
        console.log('Classes:', result.data.classes);
        console.log('Subjects:', result.data.subjects);
        setOptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const result = await API.materials.getAll(filters);
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const blob = await API.materials.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download material');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const result = await API.materials.delete(id);
        if (result.success) {
          fetchMaterials();
        }
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material');
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      class_id: '',
      subject_id: '',
      tutor_id: '',
      search: ''
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { color: 'bg-red-100 text-red-600', icon: FileText };
    if (ext === 'doc' || ext === 'docx') return { color: 'bg-blue-100 text-blue-600', icon: FileText };
    return { color: 'bg-purple-100 text-purple-600', icon: FileText };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
            Study Materials
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {user.role === 'student' ? 'Access and download course materials' : 'Manage and share study materials'}
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'tutor') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 font-bold"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white/50 backdrop-blur-sm border-purple-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
          </div>

          <div className="h-8 w-px bg-purple-100 hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-3 flex-1">
            <select
              value={filters.class_id}
              onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
              className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Classes</option>
              {options?.classes?.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
            </select>

            <select
              value={filters.subject_id}
              onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
              className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Subjects</option>
              {options?.subjects?.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>

            {user.role === 'admin' && (
              <select
                value={filters.tutor_id}
                onChange={(e) => setFilters({ ...filters, tutor_id: e.target.value })}
                className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Tutors</option>
                {options?.tutors?.map(t => <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>)}
              </select>
            )}

            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />

            {(filters.class_id || filters.subject_id || filters.tutor_id || filters.search) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <X size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <Card className="p-20 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No study materials found</p>
          <p className="text-slate-400 text-sm mt-2">
            {user.role === 'tutor' ? 'Upload your first material to get started' : 'Check back later for new materials'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const fileInfo = getFileIcon(material.file_path);
            const IconComponent = fileInfo.icon;

            return (
              <Card key={material.material_id} className="p-6 hover:shadow-xl transition-all border-slate-100 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fileInfo.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {(user.role === 'admin' || (user.role === 'tutor' && material.uploaded_by === user.tutor_id)) && (
                    <button
                      onClick={() => handleDelete(material.material_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {material.title}
                </h3>

                {material.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{material.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Subject:</span>
                    <span className="text-slate-700 font-bold">{material.subject?.subject_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Class:</span>
                    <span className="text-slate-700 font-bold">{material.subject?.school_class?.class_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Uploaded by:</span>
                    <span className="text-slate-700 font-bold">{material.uploader?.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Size:</span>
                    <span className="text-slate-700 font-bold">{material.file_size}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(material.material_id, material.title)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {showUploadModal && (
        <UploadMaterialModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchMaterials();
          }}
          subjects={options.subjects}
        />
      )}
    </div>
  );
}

// Upload Material Modal Component
function UploadMaterialModal({ onClose, onSuccess, subjects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Get unique classes from subjects
  const classes = subjects?.reduce((acc, subject) => {
    if (subject.school_class && !acc.find(c => c.class_id === subject.class_id)) {
      acc.push({
        class_id: subject.class_id,
        class_name: subject.school_class.class_name
      });
    }
    return acc;
  }, []) || [];

  console.log('Modal - Subjects received:', subjects);
  console.log('Modal - Classes extracted:', classes);

  // Filter subjects based on selected class
  const filteredSubjects = formData.class_id
    ? subjects?.filter(s => s.class_id == formData.class_id) || []
    : [];

  const handleClassChange = (classId) => {
    setFormData({
      ...formData,
      class_id: classId,
      subject_id: '' // Reset subject when class changes
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and Word documents are allowed');
        e.target.value = '';
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }

      setError('');
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject_id', formData.subject_id);
      data.append('file', formData.file);

      const result = await API.materials.upload(data);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Failed to upload material');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Upload Study Material</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Chapter 5 - Algebra Notes"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Class / Grade *
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                value={formData.class_id}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Subject *
              </label>
              <select
                required
                disabled={!formData.class_id}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              >
                <option value="">
                  {formData.class_id ? 'Select Subject' : 'Please select a class first'}
                </option>
                {filteredSubjects.map(s => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
              {formData.class_id && filteredSubjects.length === 0 && (
                <p className="text-xs text-amber-600 ml-1">No subjects available for this class</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Brief description of the material..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                File (PDF or Word) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-xs text-slate-500 ml-1">Maximum file size: 10MB. Allowed formats: PDF, DOC, DOCX</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Material
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}