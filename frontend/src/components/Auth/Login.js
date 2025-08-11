import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../Common/Input';
import Button from '../Common/Button';
import '../../styles/global.css'
import '../../styles/components.css'

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      console.log("response of login :: -> ", res)

      if (res.data.valid) {
        setApiKey(res.data.apiKey);
        console.log("apikey --> ",apiKey)
        localStorage.setItem('apiKey', res.data.apiKey);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError('Invalid API key');
      }
      
    } catch (err) {
      setError(err.response?.data || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login to Bot Hosting</h2>
        <p className="auth-subtitle">Enter your credentials to access your dashboard</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {/* <Input label="API Key" type="text" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required /> */}
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          {error && <div className="auth-error">{error}</div>}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="auth-switch">
            Don't have an account? <a href="/register">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;