import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import '../css/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        setSuccess('Password reset link has been sent to your email!');
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-primary btn-full" disabled={loading || success}>
            {loading ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-link">
          Remember your password? <Link to="/login">Login</Link>
        </p>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

