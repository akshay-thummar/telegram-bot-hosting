import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BotList from './BotList';
// import BotDetails from './BotDetails';
import CommandEditor from './CommandEditor';
import Logs from './Logs';
import Modal from '../Common/Modal';
import Input from '../Common/Input';
import Button from '../Common/Button';
import '../../styles/global.css'
import '../../styles/components.css'

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

const Dashboard = () => {
  const [bots, setBots] = useState([]);
  const [points, setPoints] = useState(0);
  const [selectedBot, setSelectedBot] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [botName, setBotName] = useState('');
  const [activeTab, setActiveTab] = useState('bots');
  
  const apiKey = localStorage.getItem('apiKey');
  const headers = { Authorization: apiKey };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const botsRes = await axios.get(`${API_URL}/get-bots`, { headers });
      setBots(botsRes.data);
      
      const pointsRes = await axios.get(`${API_URL}/get-points`, { headers });
      setPoints(pointsRes.data[0].points);
      
      const logsRes = await axios.get(`${API_URL}/get-logs`, { headers });
      console.log(logsRes)
      setLogs(logsRes.data);
    } catch (err) {
      setError('Failed to load data: ' + (err.response?.data || err.message));
    }
    setLoading(false);
  };

  const handleHostBot = async () => {
    setError('');
    try {
      await axios.post(`${API_URL}/host-bot`, { token: botToken, name: botName }, { headers });
      setBotToken('');
      setBotName('');
      setShowHostModal(false);
      fetchDashboardData();
    } catch (err) {
      setError('Hosting failed: ' + (err.response?.data || err.message));
    }
  };

  const handleBotSelect = (bot) => {
    setSelectedBot(bot);
    setActiveTab('commands');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <div className="points-badge">
            <span className="points-icon"></span>
            <span>{points} Points</span>
          </div>
        </div>
        <Button onClick={() => setShowHostModal(true)}>Host New Bot</Button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'bots' ? 'active' : ''}`}
          onClick={() => setActiveTab('bots')}
        >
          My Bots
        </button>
        <button 
          className={`tab-button ${activeTab === 'commands' ? 'active' : ''}`}
          onClick={() => selectedBot && setActiveTab('commands')}
          disabled={!selectedBot}
        >
          Commands
        </button>
        <button 
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'bots' && (
              <BotList 
                bots={bots} 
                onBotSelect={handleBotSelect} 
                selectedBot={selectedBot}
                refreshData={fetchDashboardData}
              />
            )}
            
            {activeTab === 'commands' && selectedBot && (
              <CommandEditor 
                bot={selectedBot} 
                refreshData={fetchDashboardData}
              />
            )}
            
            {activeTab === 'logs' && <Logs logs={logs} />}
          </>
        )}
      </div>

      <Modal 
        isOpen={showHostModal} 
        onClose={() => setShowHostModal(false)}
        title="Host New Bot"
      >
        <div className="host-bot-form">
          <Input
            label="Bot Name"
            placeholder="Enter a name for your bot"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            required
          />
          <Input
            label="Bot Token"
            placeholder="Enter your Telegram bot token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            required
          />
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowHostModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleHostBot}>
              Host Bot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;