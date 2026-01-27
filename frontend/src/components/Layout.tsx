import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedBackground } from './AnimatedBackground';
import {
  Cloud,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  LogOut,
  User,
  Headphones,
  Settings,
  Bell,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAgent = user?.role === 'agent';

  const navItems = isAgent
    ? [
      { path: '/agent', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/agent/tickets', icon: Ticket, label: 'All Tickets' },
    ]
    : [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dashboard/new-ticket', icon: PlusCircle, label: 'New Ticket' },
      { path: '/dashboard/my-tickets', icon: Ticket, label: 'My Tickets' },
    ];

  return (
    <div className="layout">
      <AnimatedBackground />

      {/* Sidebar */}
      <aside className="sidebar glass-strong">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon-sm">
            <Cloud size={24} />
          </div>
          <span className="logo-text-sm text-gradient">CloudDesk</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <div className="nav-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.displayName?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                user?.username?.charAt(0).toUpperCase() ||
                (isAgent ? <Headphones size={18} /> : <User size={18} />)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.displayName || user?.email || user?.username}</span>
              <span className="user-role">
                {isAgent ? 'Support Agent' : 'Employee'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar glass">
          <div className="top-bar-left">
            <h1 className="page-title">
              {navItems.find((item) => item.path === location.pathname)?.label ||
                'Dashboard'}
            </h1>
          </div>
          <div className="top-bar-right">
            <button className="btn btn-ghost btn-icon notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <button className="btn btn-ghost btn-icon">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">{children}</div>
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: var(--space-6);
          z-index: var(--z-sticky);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: var(--space-6);
        }

        .logo-icon-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
          border-radius: var(--radius-lg);
          color: white;
        }

        .logo-text-sm {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: 700;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: var(--surface-2);
        }

        .nav-item.active {
          color: var(--primary-400);
          background: rgba(6, 182, 212, 0.1);
        }

        .nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--primary-500);
          border-radius: 0 var(--radius-full) var(--radius-full) 0;
        }

        .sidebar-footer {
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--surface-2);
          border-radius: var(--radius-full);
          color: var(--primary-400);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .logout-btn {
          width: 100%;
          justify-content: flex-start;
          color: var(--error-400);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-400);
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .top-bar {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-8);
          z-index: var(--z-sticky);
        }

        .page-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .notification-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 10px;
          font-weight: 600;
          line-height: 16px;
          text-align: center;
          color: white;
          background: var(--error-500);
          border-radius: var(--radius-full);
        }

        .page-content {
          flex: 1;
          padding: var(--space-8);
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 80px;
            padding: var(--space-4);
          }

          .sidebar-logo {
            justify-content: center;
          }

          .logo-text-sm {
            display: none;
          }

          .nav-item span {
            display: none;
          }

          .nav-item {
            justify-content: center;
          }

          .user-info {
            display: none;
          }

          .logout-btn span {
            display: none;
          }

          .logout-btn {
            justify-content: center;
          }

          .main-content {
            margin-left: 80px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .main-content {
            margin-left: 0;
          }

          .page-content {
            padding: var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
