import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../Common/Input';
import Button from '../Common/Button';
import '../../styles/global.css'
import '../../styles/components.css'

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

const Register = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/register`, { 
        username: username || email.split('@')[0], 
        email,
        password 
      });
      
      const key = res.data.api_key;
      setApiKey(key);
      setSuccess(true);
      localStorage.setItem('apiKey', key);
      setIsAuthenticated(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to start hosting your bots</p>
        
        {success ? (
          <div className="auth-success">
            <h3>Registration Successful!</h3>
            <p>Your API Key is:</p>
            <div className="api-key-display">{apiKey}</div>
            <p>Please save this key as it won't be shown again.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Username (optional)" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            
            {error && <div className="auth-error">{error}</div>}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
            
            <div className="auth-switch">
              Already have an account? <a href="/login">Login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;