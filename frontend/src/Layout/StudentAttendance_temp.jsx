import { useState, useEffect } from 'react';
import Card from '../Cards/Card';
import { API } from '../api/api';


export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentId = user.profile?.id;
      if (studentId) {
        const result = await API.attendance.getStudentAttendance(studentId);
        if (result.success) {
          setAttendance(result.data.attendance || []);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-purple-900">My Attendance</h2>
        <p className="text-sm text-gray-600 mt-1">View your attendance records</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 text-sm">{record.attendance_date}</td>
                  <td className="px-6 py-4 text-sm">{record.class?.class_name}</td>
                  <td className="px-6 py-4 text-sm">{record.class?.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};