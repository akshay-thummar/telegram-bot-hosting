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

  const handleUpdateBot = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.put(`${API_URL}/update-bot`, { 
        bot_id: bot.bot_id, 
        name: botName 
      }, { headers });
      
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
      await axios.delete(`${API_URL}/delete-bot`, { 
        data: { bot_id: bot.bot_id },
        headers 
      });
      
      refreshData();
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data || err.message));
    }
    
    setLoading(false);
  };

  return (
    <div className="bot-details">
      <h3>Bot Details</h3>
      
      <div className="details-grid">
        <div className="detail-item">
          <div className="detail-label">Bot Name</div>
          <div className="detail-value">{bot.name}</div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Bot ID</div>
          <div className="detail-value">{bot.bot_id}</div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            <span className={`status-badge ${bot.status.toLowerCase()}`}>
              {bot.status}
            </span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Created</div>
          <div className="detail-value">{new Date(bot.created_at).toLocaleString()}</div>
        </div>
      </div>
      
      <div className="bot-actions">
        <Button variant="outline" onClick={() => setShowEditModal(true)}>
          Edit Bot
        </Button>
        <Button variant="danger" onClick={handleDeleteBot} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete Bot'}
        </Button>
      </div>
      
      {error && <div className="bot-error">{error}</div>}
      
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Bot"
      >
        <div className="edit-bot-form">
          <Input
            label="Bot Name"
            placeholder="Enter a new name for your bot"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            required
          />
          
          {error && <div className="modal-error">{error}</div>}
          
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBot} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BotDetails;