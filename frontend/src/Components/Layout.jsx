import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }) {
  return (
    <div className="flex bg-purple-100 min-h-screen font-sans text-slate-800">
      <Sidebar userRole={user.role} onLogout={onLogout} />

      <div className="flex-1 ml-64 transition-all duration-300">
        <Header user={user} onLogout={onLogout} />

        <main className="p-8 max-w-7xl mx-auto animate-fade-in relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}