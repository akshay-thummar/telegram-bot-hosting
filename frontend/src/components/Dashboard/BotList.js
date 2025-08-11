import React from 'react';
import Button from '../Common/Button';
import BotDetails from './BotDetails';

const BotList = ({ bots, onBotSelect, selectedBot, refreshData }) => {
  if (bots.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon bot-icon" />
        <h3>You haven't hosted any bots yet. Click "Host New Bot" to get started.</h3>
      </div>
    );
  }

  return (
    <div className="bot-list-container">
      <div className="bot-grid">
        {bots.map((bot) => {
          let username = '', firstName = '';
          // Parse config for Telegram details
          if (bot.config) {
            try {
              const cfg = JSON.parse(bot.config);
              username = cfg.username || '';
              firstName = cfg.first_name || '';
            } catch (e) { /* ignore parse error */ }
          }

          return (
            <div
              className={`bot-card${selectedBot && selectedBot.bot_id === bot.bot_id ? ' selected' : ''}`}
              key={bot.bot_id}
              onClick={() => onBotSelect(bot)}
            >
              <div className="bot-header">
                <span className="bot-name">{bot.name}</span>
                <span className={`bot-status ${bot.status}`}></span>
              </div>
              <div className="bot-info">
                <div className="bot-id">Bot ID: {bot.bot_id}</div>
                <div className="bot-status-text">Status: {bot.status}</div>
                {username && (
                  <div className="bot-username">
                    Username: <span style={{ fontFamily: 'monospace' }}>@{username}</span>
                  </div>
                )}
                {firstName && (
                  <div className="bot-firstname">
                    Name: {firstName}
                  </div>
                )}
              </div>
              <div className="bot-actions">
                <Button variant="outline" onClick={() => onBotSelect(bot)}>
                  Manage
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Optionally show details */}
      {selectedBot && (
        <BotDetails bot={selectedBot} refreshData={refreshData} />
      )}
    </div>
  );
};

export default BotList;
