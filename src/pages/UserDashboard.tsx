
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { TicketCard } from '../components/TicketCard';
import {
  PlusCircle,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets } = useTickets();

  // Get user's tickets
  const userTickets = tickets.filter((t) => t.createdBy === user?.id);
  const recentTickets = tickets.slice(0, 5); // Show recent for demo

  // Calculate stats
  const stats = {
    total: userTickets.length,
    open: userTickets.filter((t) => t.status === 'open').length,
    inProgress: userTickets.filter((t) => t.status === 'in_progress').length,
    resolved: userTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="user-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section animate-slide-down">
        <div className="welcome-content">
          <h2 className="heading-2">
            Welcome back, <span className="text-gradient">{user?.name}</span>
          </h2>
          <p className="welcome-subtitle">
            Need help with something? Submit a ticket and we'll get right on it.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/new-ticket')}
          className="btn btn-primary btn-lg"
        >
          <PlusCircle size={20} />
          New Ticket
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid animate-slide-up">
        <div className="stat-card card">
          <div className="stat-icon total">
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon open">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon progress">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="recent-section animate-slide-up">
        <div className="section-header">
          <h3 className="heading-4">Recent Tickets</h3>
          <button
            onClick={() => navigate('/dashboard/my-tickets')}
            className="btn btn-ghost"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="tickets-list">
          {recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="empty-state card">
              <Ticket size={48} className="empty-icon" />
              <h4>No tickets yet</h4>
              <p>Submit your first support request to get started.</p>
              <button
                onClick={() => navigate('/dashboard/new-ticket')}
                className="btn btn-primary"
              >
                <PlusCircle size={18} />
                Create Ticket
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .user-dashboard {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-8);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1));
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl);
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          margin-top: var(--space-2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-xl);
        }

        .stat-icon.total {
          background: rgba(6, 182, 212, 0.15);
          color: var(--primary-400);
        }

        .stat-icon.open {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning-400);
        }

        .stat-icon.progress {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info-400);
        }

        .stat-icon.resolved {
          background: rgba(34, 197, 94, 0.15);
          color: var(--success-400);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }

        .recent-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-12);
          gap: var(--space-4);
        }

        .empty-icon {
          color: var(--text-tertiary);
        }

        .empty-state h4 {
          font-size: var(--text-lg);
          color: var(--text-primary);
        }

        .empty-state p {
          color: var(--text-tertiary);
          font-size: var(--text-sm);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
