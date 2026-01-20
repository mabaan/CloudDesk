import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { TicketCard } from '../components/TicketCard';
import type { TicketStatus } from '../types';
import {
  Ticket,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Users,
} from 'lucide-react';

type FilterType = 'all' | TicketStatus;

export function AgentDashboard() {
  const { user } = useAuth();
  const { tickets, updateTicketStatus, assignTicket } = useTickets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tickets
  const filteredTickets = tickets
    .filter((t) => filter === 'all' || t.status === filter)
    .filter(
      (t) =>
        searchQuery === '' ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.createdByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    myAssigned: tickets.filter((t) => t.assignedTo === user?.id).length,
  };

  const handleAssignToMe = async (ticketId: string) => {
    if (user) {
      await assignTicket(ticketId, user.id, user.name);
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await updateTicketStatus(ticketId, status);
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All Tickets', count: stats.total },
    { key: 'open', label: 'Open', count: stats.open },
    { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
  ];

  return (
    <div className="agent-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid animate-slide-down">
        <div className="stat-card card card-glow">
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
          <div className="stat-icon assigned">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.myAssigned}</span>
            <span className="stat-label">Assigned to Me</span>
          </div>
        </div>
      </div>

      {/* Ticket Queue */}
      <div className="queue-section animate-slide-up">
        <div className="queue-header">
          <h3 className="heading-4">Ticket Queue</h3>
          <div className="queue-actions">
            {/* Search */}
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <span>{f.label}</span>
              <span className="filter-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="tickets-list">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isAgent
                onAssign={() => handleAssignToMe(ticket.id)}
                onStatusChange={(status) => handleStatusChange(ticket.id, status)}
              />
            ))
          ) : (
            <div className="empty-state card">
              <Filter size={48} className="empty-icon" />
              <h4>No tickets found</h4>
              <p>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No tickets match the current filter'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .agent-dashboard {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
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

        .stat-icon.assigned {
          background: rgba(168, 85, 247, 0.15);
          color: var(--accent-400);
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

        .queue-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .queue-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .search-box {
          position: relative;
          width: 280px;
        }

        .search-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          padding-left: 44px;
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          color: var(--text-primary);
          background: var(--surface-1);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
        }

        .filter-tabs {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-1);
          background: var(--surface-1);
          border-radius: var(--radius-lg);
          width: fit-content;
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .filter-tab:hover {
          color: var(--text-primary);
          background: var(--surface-2);
        }

        .filter-tab.active {
          color: var(--text-primary);
          background: var(--surface-3);
        }

        .filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          font-size: var(--text-xs);
          font-weight: 600;
          background: var(--surface-2);
          border-radius: var(--radius-full);
        }

        .filter-tab.active .filter-count {
          background: var(--primary-500);
          color: var(--text-inverse);
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
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .search-box {
            width: 100%;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
