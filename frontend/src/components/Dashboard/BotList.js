import React from 'react';
import Button from '../Common/Button';
import BotDetails from './BotDetails';

const BotList = ({ bots, onBotSelect, selectedBot, refreshData }) => {
  if (bots.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon bot-icon"></div>
        <h3>No Bots Found</h3>
        <p>You haven't hosted any bots yet. Click "Host New Bot" to get started.</p>
      </div>
    );
  }

  return (
    <div className="bot-list-container">
      <div className="bot-grid">
        {bots.map((bot) => (
          <div 
            key={bot.bot_id} 
            className={`bot-card ${selectedBot?.bot_id === bot.bot_id ? 'selected' : ''}`}
            onClick={() => onBotSelect(bot)}
          >
            <div className="bot-header">
              <div className="bot-name">{bot.name}</div>
              <div className={`bot-status ${bot.status.toLowerCase()}`}></div>
            </div>
            <div className="bot-info">
              <div className="bot-id">ID: {bot.bot_id}</div>
              <div className="bot-status-text">Status: {bot.status}</div>
            </div>
            <div className="bot-actions">
              <Button 
                variant="outline" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onBotSelect(bot);
                }}
              >
                Manage
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedBot && (
        <div className="bot-details-container">
          <BotDetails bot={selectedBot} refreshData={refreshData} />
        </div>
      )}
    </div>
  );
};

export default BotList;