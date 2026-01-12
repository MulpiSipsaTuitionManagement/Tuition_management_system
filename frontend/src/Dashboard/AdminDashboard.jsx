import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, BookOpen, UserPlus, FileBarChart, Calendar } from 'lucide-react';
import Card from '../Cards/Card';
import StatCard from '../Cards/StatCard';
import { API } from '../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [feeStats, setFeeStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, classesRes, analyticsRes, notifRes] = await Promise.all([
        API.admin.getDashboardStats(),
        API.schedules.getAll({ range: 'week' }),
        API.attendance.getAnalytics(),
        API.notifications.getAll(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (classesRes.success) setUpcomingClasses(classesRes.data);
      if (analyticsRes.success) setWeeklyAttendance(analyticsRes.data.weekly_overview);
      if (notifRes.success) setNotifications(notifRes.data.data || notifRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationBadge = (type) => {
    const badges = {
      fees: { color: 'bg-orange-100 text-orange-700', label: 'Fees' },
      success: { color: 'bg-green-100 text-green-700', label: 'Success' },
      update: { color: 'bg-purple-100 text-purple-700', label: 'Update' },
    };
    return badges[type] || badges.update;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard value={stats?.total_students?.toLocaleString() || '0'} label="Total Students" change="+3.2%" changeType="positive" icon={<Users className="w-6 h-6 text-purple-600" />} loading={loading} />
        <StatCard value={stats?.total_tutors || '0'} label="Total Tutors" change="+1.1%" changeType="positive" icon={<GraduationCap className="w-6 h-6 text-purple-600" />} loading={loading} />
        <StatCard value={`Rs ${stats?.pending_fees?.toLocaleString() || '0'}`} label="Pending Fees" change="-0.8%" changeType="negative" icon={<DollarSign className="w-6 h-6 text-purple-600" />} loading={loading} />
        <StatCard value={stats?.classes_today || '0'} label="Classes Today" change="+0.5%" changeType="positive" icon={<BookOpen className="w-6 h-6 text-purple-600" />} loading={loading} />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Overview</h3>
          {weeklyAttendance.length > 0 ? (
            <div className="space-y-4">
              {Array.isArray(weeklyAttendance) && weeklyAttendance.map((day, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{day.day}</span>
                    <span className="text-gray-600 font-bold">{day.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No attendance data available</p>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection Overview</h3>
          {feeStats ? (
            <div className="space-y-4">
              <div className="relative h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-900">{feeStats.collection_rate}%</p>
                  <p className="text-sm text-gray-600 mt-2">Collection Rate</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Collected</span>
                  <span className="text-sm font-bold text-green-600">Rs {feeStats.collected?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-sm font-bold text-red-600">Rs {feeStats.pending?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Loading fee stats...</p>
            </div>
          )}
        </Card>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
          <button onClick={fetchDashboardData} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Refresh
          </button>
        </div>
        {upcomingClasses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-purple-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-purple-700">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-purple-700">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-purple-700">Tutor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-purple-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(upcomingClasses) && upcomingClasses.slice(0, 5).map((cls) => (
                  <tr key={cls.schedule_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm">{cls.schedule_date}</td>
                    <td className="py-4 px-4 text-sm">{cls.start_time.slice(0, 5)}</td>
                    <td className="py-4 px-4 text-sm font-medium">{cls.subject?.subject_name}</td>
                    <td className="py-4 px-4 text-sm">{cls.tutor?.full_name || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${cls.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {cls.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No upcoming classes scheduled
          </div>
        )}
      </Card>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <p className="text-sm text-gray-600">Last updates</p>
          </div>
          <div className="space-y-4">
            {Array.isArray(notifications) && notifications.map((notification) => {
              const badge = getNotificationBadge(notification.type);
              return (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-500">{getTimeAgo(notification.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Shortcuts</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add New Student</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Create Class Schedule</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Record Fee Payment</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileBarChart className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        v2.3.1 • © 2025 Mulpi-Sipsa Institute
      </div>
    </div>
  );
}