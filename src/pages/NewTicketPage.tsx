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
    setIsSubmitting(true);

    try {
      await createTicket(formData);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to create ticket:', error);
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
          <p className="redirect-text">Redirecting to dashboard...</p>
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
          {/* Category Selection */}
          <div className="form-section">
            <label className="section-label">Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-option ${formData.category === cat.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
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
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="input-group">
            <label htmlFor="description" className="input-label">
              Description *
            </label>
            <textarea
              id="description"
              className="input textarea"
              placeholder="Please provide as much detail as possible about your issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
            />
          </div>

          {/* Priority */}
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
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TicketPriority })
                    }
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

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || !formData.subject || !formData.description}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
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
          color: var(--text-secondary);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-3);
        }

        .category-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--surface-1);
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .category-option:hover {
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .category-option.active {
          border-color: var(--primary-500);
          background: rgba(6, 182, 212, 0.1);
          color: var(--primary-400);
        }

        .priority-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .priority-option {
          display: block;
          cursor: pointer;
        }

        .priority-option input {
          display: none;
        }

        .priority-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--surface-1);
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .priority-option:hover .priority-content {
          border-color: var(--border-default);
        }

        .priority-option.active .priority-content {
          border-color: var(--primary-500);
          background: rgba(6, 182, 212, 0.05);
        }

        .priority-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .priority-indicator.low { background: var(--success-500); }
        .priority-indicator.medium { background: var(--warning-500); }
        .priority-indicator.high { background: var(--error-500); }
        .priority-indicator.critical {
          background: var(--error-600);
          box-shadow: 0 0 10px var(--error-500);
        }

        .priority-text {
          display: flex;
          flex-direction: column;
        }

        .priority-label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .priority-desc {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-subtle);
        }

        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 480px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
