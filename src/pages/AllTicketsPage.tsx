import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { TicketCard } from '../components/TicketCard';
import type { TicketStatus } from '../types';
import { Search, Filter } from 'lucide-react';

type FilterType = 'all' | TicketStatus;

export function AllTicketsPage() {
  const { user } = useAuth();
  const { tickets, updateTicketStatus, assignTicket, addComment } = useTickets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets
    .filter((t) => filter === 'all' || t.status === filter)
    .filter(
      (t) =>
        searchQuery === '' ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.createdByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAssignToMe = async (ticketId: string) => {
    if (user) {
      await assignTicket(ticketId, user.id, user.name);
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus, note?: string) => {
    await updateTicketStatus(ticketId, status);
    if (note && note.trim()) {
      await addComment(ticketId, note.trim());
    }
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <div className="all-tickets-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="heading-3">All Tickets</h2>
          <span className="ticket-count">{filteredTickets.length} tickets</span>
        </div>
        <div className="header-right">
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

      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="tickets-list">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isAgent
                onAssign={() => handleAssignToMe(ticket.id)}
                onStatusChange={(status, note) => handleStatusChange(ticket.id, status, note)}
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

      <style>{`
        .all-tickets-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .header-left {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
        }

        .ticket-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
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
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: var(--space-2) var(--space-4);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--surface-1);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .filter-tab:hover {
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .filter-tab.active {
          background: var(--primary-500);
          border-color: var(--primary-500);
          color: white;
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

        @media (max-width: 768px) {
          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
