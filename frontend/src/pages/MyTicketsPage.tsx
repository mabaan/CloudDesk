import React from "react";
import { useTickets } from "../contexts/TicketContext";
import { TicketCard } from "../components/TicketCard";
import { Ticket, Search, Loader2 } from "lucide-react";

export function MyTicketsPage() {
  const { tickets, isLoading } = useTickets();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTickets = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((t) => {
      const subject = (t.subject || "").toLowerCase();
      const id = (t.id || "").toLowerCase();
      return subject.includes(q) || id.includes(q);
    });
  }, [tickets, searchQuery]);

  return (
    <div className="my-tickets-page">
      <div className="page-header">
        <h2 className="heading-3">My Tickets</h2>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search your tickets."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="tickets-list">
        {isLoading ? (
          <div className="empty-state card">
            <Loader2 size={40} className="empty-icon animate-spin" />
            <h4>Loading tickets</h4>
            <p>Please wait.</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="empty-state card">
            <Ticket size={48} className="empty-icon" />
            <h4>No tickets found</h4>
            <p>
              {searchQuery.trim()
                ? "Try adjusting your search query"
                : "You have not submitted any tickets yet."}
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
          gap: var(--space-3);
          padding: var(--space-10);
        }

        .empty-icon {
          color: var(--text-tertiary);
        }

        .empty-state h4 {
          margin: 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        @media (max-width: 520px) {
          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
