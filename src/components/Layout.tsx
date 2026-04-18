import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Users, 
  LogOut,
  Menu,
  X,
  Settings,
  Calendar,
  Bell,
  Archive
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function Layout() {
  const { profile, signOut, switchMockRole } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['applicant', 'student', 'lecturer', 'admin'] },
    { name: 'Application', path: '/apply', icon: FileText, roles: ['applicant'] },
    { name: 'Timetable', path: '/timetable', icon: Calendar, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, roles: ['student', 'admin'] },
    { name: 'Past Papers', path: '/past-papers', icon: Archive, roles: ['student', 'admin'] },
    { name: 'Results', path: '/results', icon: GraduationCap, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Lecturers', path: '/lecturers', icon: Users, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Announcements', path: '/announcements', icon: Bell, roles: ['applicant', 'student', 'lecturer', 'admin'] },
    { name: 'Admin Portal', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:block shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-8 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
            <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3 group">
              <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                <GraduationCap className="h-7 w-7" />
              </div>
              USET Portal
            </Link>
          </div>

          <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
            <div className="px-4 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 translate-x-1' 
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-100 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all duration-300 group"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-gray-50/50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-10">
          <div className="flex items-center lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          <div className="hidden lg:block"></div> {/* Spacer for desktop */}
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{profile?.name}</p>
               <p className="text-xs font-medium text-blue-600 capitalize bg-blue-50 inline-block px-2 py-0.5 rounded-md mt-0.5">{profile?.role}</p>
             </div>
             {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm border-2 border-gray-100">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
