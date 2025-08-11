import React, { useState } from 'react';
import axios from 'axios';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import Input from '../Common/Input';

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

const BotDetails = ({ bot, refreshData }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [botName, setBotName] = useState(bot.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('apiKey');
  const headers = { Authorization: apiKey };

  // Parse config for Telegram details
  let username = '', firstName = '';
  if (bot.config) {
    try {
      const cfg = JSON.parse(bot.config);
      username = cfg.username || '';
      firstName = cfg.first_name || '';
    } catch (e) { /* ignore parse error */ }
  }

  const handleUpdateBot = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/update-bot`, { bot_id: bot.bot_id, name: botName }, { headers });
      setShowEditModal(false);
      refreshData();
    } catch (err) {
      setError('Update failed: ' + (err.response?.data || err.message));
    }
    setLoading(false);
  };

  const handleDeleteBot = async () => {
    if (!window.confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/delete-bot`, { data: { bot_id: bot.bot_id }, headers });
      refreshData();
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="bot-details">
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Bot Name</span>
          <span className="detail-value">{bot.name}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className={`status-badge ${bot.status}`}>
            {bot.status === 'active' ? 'Running' : 'Stopped'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Bot ID</span>
          <span className="detail-value">{bot.bot_id}</span>
        </div>
        {username && (
          <div className="detail-item">
            <span className="detail-label">Telegram Username</span>
            <span className="detail-value" style={{ fontFamily: 'monospace' }}>@{username}</span>
          </div>
        )}
        {firstName && (
          <div className="detail-item">
            <span className="detail-label">Telegram Name</span>
            <span className="detail-value">{firstName}</span>
          </div>
        )}
      </div>
      <div className="bot-actions">
        <Button variant="primary" onClick={() => setShowEditModal(true)}>Edit Name</Button>
        <Button variant="danger" onClick={handleDeleteBot}>Delete Bot</Button>
      </div>
      {error && <div className="bot-error">{error}</div>}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Bot Name">
        <Input
          label="Bot Name"
          value={botName}
          onChange={e => setBotName(e.target.value)}
        />
        <Button variant="primary" onClick={handleUpdateBot} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Modal>
    </div>
  );
};

export default BotDetails;
