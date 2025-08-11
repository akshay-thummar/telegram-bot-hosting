import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev'; // Replace with your Worker URL

function App() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/register`, { username, email });
      const key = res.data.api_key;
      localStorage.setItem('apiKey', key);
      setApiKey(key);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    // For simplicity, "login" by entering existing API key
    localStorage.setItem('apiKey', apiKey);
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>Telegram Bot Hosting</h1>
      {!apiKey ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
          <button onClick={handleRegister} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p>Already have an API key? Enter it below to login:</p>
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <p>Logged in! Redirecting to dashboard...</p>
      )}
    </div>
  );
}

export default App;
