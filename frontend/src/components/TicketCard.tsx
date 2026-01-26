import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket, TicketStatus, TicketPriority } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  isAgent?: boolean;
  onAssign?: () => void;
  onStatusChange?: (status: TicketStatus, note?: string) => void;
}

const statusConfig: Record<TicketStatus, { label: string; class: string; icon: ReactNode }> = {
  open: { label: 'Open', class: 'badge-warning', icon: <Circle size={12} /> },
  in_progress: { label: 'In Progress', class: 'badge-info', icon: <PlayCircle size={12} /> },
  resolved: { label: 'Resolved', class: 'badge-success', icon: <CheckCircle2 size={12} /> },
  closed: { label: 'Closed', class: 'badge-neutral', icon: <XCircle size={12} /> },
};

const priorityConfig: Record<TicketPriority, { label: string; class: string }> = {
  low: { label: 'Low', class: 'priority-low' },
  medium: { label: 'Medium', class: 'priority-medium' },
  high: { label: 'High', class: 'priority-high' },
  critical: { label: 'Critical', class: 'priority-critical' },
};

const categoryLabels: Record<string, string> = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Network',
  access: 'Access',
  other: 'Other',
};

export function TicketCard({ ticket, isAgent, onAssign, onStatusChange }: TicketCardProps) {
  useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showResolutionNote, setShowResolutionNote] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (isAgent && newStatus === 'resolved') {
      setPendingStatus('resolved');
      setShowStatusMenu(false);
      setShowResolutionNote(true);
      return;
    }

    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowStatusMenu(false);
  };

  const handleSubmitResolution = () => {
    if (pendingStatus && onStatusChange) {
      const note = resolutionNote.trim();
      onStatusChange(pendingStatus, note);
    }
    setShowResolutionNote(false);
    setPendingStatus(null);
    setResolutionNote('');
  };

  const handleCancelResolution = () => {
    setShowResolutionNote(false);
    setPendingStatus(null);
    setResolutionNote('');
  };

  return (
    <div className={`ticket-card card card-hover ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="ticket-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ticket-main">
          <div className="ticket-id-row">
            <span className="ticket-id">{ticket.id}</span>
            <span className={`priority-dot ${priority.class}`} title={priority.label} />
            <span className={`badge ${status.class}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <h4 className="ticket-subject">{ticket.subject}</h4>
          <div className="ticket-meta">
            <span className="meta-item">
              <User size={14} />
              {ticket.createdByName}
            </span>
            <span className="meta-item">
              <Clock size={14} />
              {formatDate(ticket.createdAt)}
            </span>
            <span className="meta-item">
              <Tag size={14} />
              {categoryLabels[ticket.category]}
            </span>
            {ticket.comments.length > 0 && (
              <span className="meta-item">
                <MessageSquare size={14} />
                {ticket.comments.length}
              </span>
            )}
          </div>
        </div>
        <div className="ticket-actions-row">
          <button className="expand-btn">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="ticket-body animate-slide-down">
          <div className="ticket-description">
            <h5>Description</h5>
            <p>{ticket.description}</p>
          </div>

          <div className="ticket-details">
            <div className="detail-item">
              <span className="detail-label">Priority</span>
              <span className={`detail-value priority-tag ${priority.class}`}>{priority.label}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{categoryLabels[ticket.category]}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span className="detail-value">
                {ticket.assignedToName || 'Unassigned'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Comments */}
          {ticket.comments.length > 0 && (
            <div className="ticket-comments">
              <h5>Comments ({ticket.comments.length})</h5>
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.authorName}</span>
                    <span className="comment-role">
                      {comment.authorRole === 'agent' ? 'Support' : 'User'}
                    </span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Agent Actions */}
          {isAgent && (
            <div className="ticket-actions">
              {!ticket.assignedTo && (
                <button onClick={onAssign} className="btn btn-primary">
                  <UserPlus size={18} />
                  Assign to Me
                </button>
              )}
              <div className="status-dropdown">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                >
                  Update Status
                  <ChevronDown size={16} />
                </button>
                {showStatusMenu && (
                  <div className="status-menu">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        className={`status-option ${ticket.status === key ? 'active' : ''}`}
                        onClick={() => handleStatusChange(key as TicketStatus)}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {showResolutionNote && (
                <div className="resolution-note card card-hover animate-slide-up">
                  <div className="resolution-note-header">
                    <h5>Resolution note</h5>
                    <span className="resolution-hint">Share what fixed the issue</span>
                  </div>
                  <textarea
                    className="input textarea"
                    rows={4}
                    placeholder="Add a short paragraph so the requester and other agents know what was done..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                  <div className="resolution-actions">
                    <button className="btn btn-ghost" onClick={handleCancelResolution}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={resolutionNote.trim().length < 10}
                      onClick={handleSubmitResolution}
                    >
                      Save and Resolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .ticket-card {
          position: relative;
          z-index: 0;
          overflow: visible;
          transition: all var(--transition-base);
        }

        .ticket-card.expanded {
          border-color: var(--border-strong);
          z-index: var(--z-dropdown);
        }

        .ticket-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-4);
          cursor: pointer;
        }

        .ticket-main {
          flex: 1;
          min-width: 0;
        }

        .ticket-id-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .ticket-id {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--primary-400);
          background: rgba(6, 182, 212, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }

        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .priority-low { background: var(--success-500); }
        .priority-medium { background: var(--warning-500); }
        .priority-high { background: var(--error-500); }
        .priority-critical { 
          background: var(--error-600);
          box-shadow: 0 0 8px var(--error-500);
        }

        .priority-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 8px 12px;
          border-radius: var(--radius-full);
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.01em;
          border: 1px solid transparent;
          background: var(--surface-2);
        }

        .priority-tag.priority-low {
          color: var(--success-400);
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.35);
        }

        .priority-tag.priority-medium {
          color: var(--warning-400);
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
        }

        .priority-tag.priority-high {
          color: white;
          background: rgba(239, 68, 68, 0.9);
          border-color: rgba(239, 68, 68, 0.45);
        }

        .priority-tag.priority-critical {
          color: white;
          background: linear-gradient(135deg, #ef4444, #db2777);
          border-color: rgba(219, 39, 119, 0.5);
          box-shadow: 0 0 10px rgba(219, 39, 119, 0.4);
        }

        .ticket-subject {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .ticket-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .expand-btn:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }

        .ticket-body {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .ticket-description h5,
        .ticket-comments h5 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
        }

        .ticket-description p {
          color: var(--text-primary);
          font-size: var(--text-sm);
          line-height: 1.6;
        }

        .ticket-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--surface-1);
          border-radius: var(--radius-lg);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .detail-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .ticket-comments {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .comment {
          padding: var(--space-4);
          background: var(--surface-1);
          border-radius: var(--radius-lg);
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .comment-author {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .comment-role {
          font-size: var(--text-xs);
          padding: 2px 8px;
          background: var(--surface-2);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .comment-date {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-left: auto;
        }

        .comment-content {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .ticket-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-subtle);
          position: relative;
          z-index: var(--z-dropdown);
        }

        .status-dropdown {
          position: relative;
          z-index: var(--z-dropdown);
          align-self: flex-start;
        }

        .status-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: var(--space-2);
          min-width: 200px;
          padding: var(--space-2);
          background: rgba(6, 10, 20, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown);
        }

        .resolution-note {
          width: 100%;
          padding: var(--space-5);
          border: 1px solid var(--border-default);
          background: rgba(6, 10, 20, 0.92);
          box-shadow: var(--shadow-lg);
        }

        .resolution-note-header {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .resolution-note-header h5 {
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .resolution-hint {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .resolution-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }

        .status-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
        }

        .status-option:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }

        .status-option.active {
          background: var(--primary-500);
          color: white;
        }

        @media (max-width: 768px) {
          .ticket-details {
            grid-template-columns: 1fr 1fr;
          }

          .ticket-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
