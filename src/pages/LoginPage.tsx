import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Cloud, User, Headphones, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState<'user' | 'agent'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password, role);
            navigate(role === 'user' ? '/dashboard' : '/agent');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <AnimatedBackground />

            <div className="login-container">
                {/* Logo Section */}
                <div className="login-header animate-slide-down">
                    <div className="logo">
                        <div className="logo-icon">
                            <Cloud size={32} />
                        </div>
                        <div className="logo-text">
                            <span className="text-gradient">CloudDesk</span>
                        </div>
                    </div>
                    <p className="login-subtitle">IT Support Platform</p>
                </div>

                {/* Login Card */}
                <div className="login-card glass-card animate-scale-in">
                    {/* Role Toggle */}
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-option ${role === 'user' ? 'active' : ''}`}
                            onClick={() => setRole('user')}
                        >
                            <User size={18} />
                            <span>Employee</span>
                        </button>
                        <button
                            type="button"
                            className={`role-option ${role === 'agent' ? 'active' : ''}`}
                            onClick={() => setRole('agent')}
                        >
                            <Headphones size={18} />
                            <span>Support Agent</span>
                        </button>
                        <div className={`role-slider ${role === 'agent' ? 'right' : ''}`} />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email" className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    className="input input-with-icon"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password" className="input-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    id="password"
                                    type="password"
                                    className="input input-with-icon"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message animate-slide-up">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>
                            {role === 'user'
                                ? 'Need help? Contact IT Support'
                                : 'Access the support agent portal'}
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="login-info animate-slide-up">
                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-icon">
                                <Cloud size={24} />
                            </div>
                            <div className="info-content">
                                <h4>Cloud-Native</h4>
                                <p>Serverless architecture for reliability</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">
                                <Lock size={24} />
                            </div>
                            <div className="info-content">
                                <h4>Secure</h4>
                                <p>Enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .login-header {
          text-align: center;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
          border-radius: var(--radius-xl);
          color: white;
          box-shadow: var(--shadow-glow-md);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: 700;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .login-card {
          padding: var(--space-8);
        }

        .role-toggle {
          position: relative;
          display: flex;
          background: var(--surface-1);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          margin-bottom: var(--space-6);
        }

        .role-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-tertiary);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          z-index: 1;
        }

        .role-option.active {
          color: var(--text-primary);
        }

        .role-slider {
          position: absolute;
          top: var(--space-1);
          left: var(--space-1);
          width: calc(50% - var(--space-1));
          height: calc(100% - var(--space-2));
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          border-radius: var(--radius-md);
          transition: transform var(--transition-base);
        }

        .role-slider.right {
          transform: translateX(100%);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .input-with-icon {
          padding-left: 48px;
        }

        .error-message {
          padding: var(--space-3) var(--space-4);
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--error-400);
          font-size: var(--text-sm);
        }

        .login-btn {
          width: 100%;
          margin-top: var(--space-2);
        }

        .login-footer {
          margin-top: var(--space-6);
          text-align: center;
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
        }

        .login-footer p {
          color: var(--text-tertiary);
          font-size: var(--text-sm);
        }

        .login-info {
          display: flex;
          justify-content: center;
        }

        .info-cards {
          display: flex;
          gap: var(--space-6);
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--surface-2);
          border-radius: var(--radius-lg);
          color: var(--primary-400);
        }

        .info-content h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .info-content p {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        @media (max-width: 480px) {
          .login-page {
            padding: var(--space-4);
          }

          .login-card {
            padding: var(--space-6);
          }

          .info-cards {
            flex-direction: column;
            gap: var(--space-4);
          }
        }
      `}</style>
        </div>
    );
}
