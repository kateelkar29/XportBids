import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/App';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ items, basePath }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="w-64 bg-[#0F172A] text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold uppercase tracking-wider">B2B Logistics</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === `${basePath}${item.path}`;
          return (
            <Link key={item.path} to={`${basePath}${item.path}`}>
              <div
                data-testid={item.testId}
                className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none border-l-2 ${
                  isActive
                    ? 'text-white bg-white/10 border-[#F97316]'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          data-testid="logout-btn"
          onClick={handleLogout}
          className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 h-10 rounded-none uppercase text-xs font-bold tracking-wider"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;