import { useState, useEffect } from 'react';
import Card from '../Cards/Card';
import { API } from '../api/api';


export default function StudentSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const result = await API.classes.getStudentClasses();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-purple-900">Class Schedule</h2>
        <p className="text-sm text-gray-600 mt-1">View your upcoming classes</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Tutor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 text-sm">{cls.schedule_date}</td>
                  <td className="px-6 py-4 text-sm">{cls.start_time} - {cls.end_time}</td>
                  <td className="px-6 py-4 text-sm">{cls.subject}</td>
                  <td className="px-6 py-4 text-sm">{cls.tutor?.full_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {cls.status}
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