import { useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../contexts/TicketContext';
import type { TicketFormData, TicketPriority, TicketCategory } from '../types';
import {
  Send,
  Monitor,
  Wifi,
  Key,
  HelpCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export function NewTicketPage() {
  const navigate = useNavigate();
  const { createTicket } = useTickets();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'software',
  });

  const categories: { value: TicketCategory; label: string; icon: ReactNode }[] = [
    { value: 'hardware', label: 'Hardware', icon: <Monitor size={20} /> },
    { value: 'software', label: 'Software', icon: <Monitor size={20} /> },
    { value: 'network', label: 'Network', icon: <Wifi size={20} /> },
    { value: 'access', label: 'Access', icon: <Key size={20} /> },
    { value: 'other', label: 'Other', icon: <HelpCircle size={20} /> },
  ];

  const priorities: { value: TicketPriority; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Minor issue, no urgency' },
    { value: 'medium', label: 'Medium', description: 'Moderate impact on work' },
    { value: 'high', label: 'High', description: 'Significant impact, needs attention' },
    { value: 'critical', label: 'Critical', description: 'Work is blocked, urgent' },
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createTicket({
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="success-page">
        <div className="success-card card animate-scale-in">
          <div className="success-icon">
            <CheckCircle2 size={64} />
          </div>
          <h2>Ticket Submitted!</h2>
          <p>Your support request has been submitted successfully. Our team will review it shortly.</p>
          <p className="redirect-text">Redirecting to dashboard.</p>
        </div>

        <style>{`
          .success-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }

          .success-card {
            text-align: center;
            max-width: 400px;
            padding: var(--space-10);
          }

          .success-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            background: rgba(34, 197, 94, 0.15);
            border-radius: 50%;
            color: var(--success-400);
            margin-bottom: var(--space-6);
          }

          .success-card h2 {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            color: var(--text-primary);
            margin-bottom: var(--space-3);
          }

          .success-card p {
            color: var(--text-secondary);
            font-size: var(--text-sm);
          }

          .redirect-text {
            margin-top: var(--space-4);
            color: var(--text-tertiary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="new-ticket-page">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="back-btn btn btn-ghost"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="form-container animate-slide-up">
        <div className="form-header">
          <h2 className="heading-3">Submit a Support Request</h2>
          <p>Fill out the form below to get help from our IT support team.</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form card">
          <div className="form-section">
            <label className="section-label">Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-option ${formData.category === cat.value ? 'active' : ''}`}
                  onClick={() => {
                    setError('');
                    setFormData((prev) => ({ ...prev, category: cat.value }));
                  }}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="subject" className="input-label">
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              className="input"
              placeholder="Brief summary of your issue"
              value={formData.subject}
              onChange={(e) => {
                setError('');
                setFormData((prev) => ({ ...prev, subject: e.target.value }));
              }}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="description" className="input-label">
              Description *
            </label>
            <textarea
              id="description"
              className="input textarea"
              placeholder="Please provide as much detail as possible about your issue."
              value={formData.description}
              onChange={(e) => {
                setError('');
                setFormData((prev) => ({ ...prev, description: e.target.value }));
              }}
              required
              rows={5}
            />
          </div>

          <div className="form-section">
            <label className="section-label">Priority</label>
            <div className="priority-options">
              {priorities.map((pri) => (
                <label
                  key={pri.value}
                  className={`priority-option ${formData.priority === pri.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={pri.value}
                    checked={formData.priority === pri.value}
                    onChange={(e) => {
                      setError('');
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target.value as TicketPriority,
                      }));
                    }}
                  />
                  <div className="priority-content">
                    <span className={`priority-indicator ${pri.value}`} />
                    <div className="priority-text">
                      <span className="priority-label">{pri.label}</span>
                      <span className="priority-desc">{pri.description}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={
                isSubmitting ||
                formData.subject.trim().length < 3 ||
                formData.description.trim().length < 5
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting.
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .new-ticket-page {
          max-width: 700px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--space-6);
        }

        .form-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .form-header h2 {
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .form-header p {
          color: var(--text-secondary);
        }

        .ticket-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .section-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
        }

        .category-option {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          background: var(--surface-1);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .category-option:hover {
          transform: translateY(-1px);
          border-color: var(--border-strong);
        }

        .category-option.active {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.12);
          color: var(--text-primary);
        }

        .priority-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }

        .priority-option {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          background: var(--surface-1);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .priority-option.active {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.12);
        }

        .priority-option input {
          margin-top: 4px;
        }

        .priority-content {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          flex: 1;
        }

        .priority-indicator {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          margin-top: 6px;
          background: var(--text-tertiary);
        }

        .priority-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .priority-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--text-sm);
        }

        .priority-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .error-banner {
          padding: var(--space-3) var(--space-4);
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--error-400);
          font-size: var(--text-sm);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          align-items: center;
        }

        .textarea {
          min-height: 120px;
          resize: vertical;
        }

        @media (max-width: 520px) {
          .category-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
