import { GraduationCap, Calendar, Users, Clock, DollarSign, BookOpen, CheckCircle, Settings, LogOut, Library, Layers, ChevronRight, Megaphone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = {
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: Calendar },
    { path: '/classes', label: 'Classes', icon: Layers },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/tutors', label: 'Tutors', icon: GraduationCap },

    { path: '/attendance', label: 'Attendance', icon: CheckCircle },
    { path: '/fees', label: 'Fees', icon: DollarSign },
    { path: '/salaries', label: 'Salaries', icon: DollarSign },
    { path: '/schedules', label: 'Schedules', icon: Clock },
    { path: '/materials', label: 'Study Materials', icon: BookOpen },
    { path: '/announcements', label: 'Announcements', icon: Megaphone }
  ],
  tutor: [
    { path: '/dashboard', label: 'Dashboard', icon: Calendar },
    { path: '/attendance', label: 'Mark Attendance', icon: CheckCircle },
    { path: '/schedules', label: 'My Classes', icon: Clock },
    { path: '/materials', label: 'Study Materials', icon: BookOpen },
    { path: '/salary', label: 'Salary History', icon: DollarSign },
    { path: '/announcements', label: 'Announcements', icon: Megaphone }
  ],
  student: [
    { path: '/dashboard', label: 'Dashboard', icon: Calendar },
    { path: '/attendance', label: 'My Attendance', icon: CheckCircle },
    { path: '/fees', label: 'Fee History', icon: DollarSign },
    { path: '/schedules', label: 'Class Schedule', icon: Clock },
    { path: '/materials', label: 'Study Materials', icon: BookOpen },
    { path: '/announcements', label: 'Announcements', icon: Megaphone }
  ]
};

export default function Sidebar({ userRole, onLogout }) {
  const items = menuItems[userRole] || menuItems.admin;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 flex flex-col transition-all duration-300">

      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">MulpiSipsa</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Admin System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">


        {items.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `w-full group relative flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="tracking-tight text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-l-full"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
