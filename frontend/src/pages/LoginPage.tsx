import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Cloud, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AnimatedBackground />

      <div className="login-container">
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

        <div className="login-card glass-card animate-scale-in">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
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
              <label htmlFor="password" className="input-label">
                Password
              </label>
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

            {error && <div className="error-message animate-slide-up">{error}</div>}

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

          <div className="login-footer">
            <p>Secure access powered by AWS Cognito</p>
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
      `}</style>
    </div>
  );
}
