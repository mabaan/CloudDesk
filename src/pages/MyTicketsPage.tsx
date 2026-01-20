import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { TicketCard } from '../components/TicketCard';
import { Ticket, Search } from 'lucide-react';

export function MyTicketsPage() {
    const { user } = useAuth();
    const { tickets } = useTickets();
    const [searchQuery, setSearchQuery] = React.useState('');

    // Get user's tickets
    const userTickets = tickets
        .filter((t) => t.createdBy === user?.id)
        .filter(
            (t) =>
                searchQuery === '' ||
                t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="my-tickets-page">
            <div className="page-header">
                <h2 className="heading-3">My Tickets</h2>
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search your tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-list">
                {userTickets.length > 0 ? (
                    userTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
                ) : (
                    <div className="empty-state card">
                        <Ticket size={48} className="empty-icon" />
                        <h4>No tickets found</h4>
                        <p>
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : "You haven't submitted any tickets yet."}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
        .my-tickets-page {
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
