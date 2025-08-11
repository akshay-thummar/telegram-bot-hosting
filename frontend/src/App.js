import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev'; // Replace with your Worker URL

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // For future; currently unused, as we use API key
  const [apiKey, setApiKey] = useState('');
  const [isRegister, setIsRegister] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        // Register and get API key
        const res = await axios.post(`${API_URL}/register`, { username: email.split('@')[0], email }); // Simple username from email
        const key = res.data.api_key;
        localStorage.setItem('apiKey', key);
        navigate('/dashboard');
      } else {
        // Login: Verify API key
        const res = await axios.get(`${API_URL}/validate-key`, { headers: { Authorization: apiKey } });
        if (res.data.valid) {
          localStorage.setItem('apiKey', apiKey);
          navigate('/dashboard');
        } else {
          setError('Invalid API key');
        }
      }
    } catch (err) {
      setError(err.response?.data || (isRegister ? 'Registration failed' : 'Login failed'));
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>{isRegister ? 'Register' : 'Login'}</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      />
      {!isRegister && (
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ display: 'block', margin: '10px 0' }}
        />
      )}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
      </button>
      <button onClick={() => setIsRegister(!isRegister)} style={{ marginLeft: '10px' }}>
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
