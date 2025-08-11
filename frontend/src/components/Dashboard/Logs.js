import React from 'react';

const Logs = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon logs-icon"></div>
        <h3>No Logs Found</h3>
        <p>There are no logs to display yet.</p>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <h3>Recent Activity Logs</h3>
      <div className="logs-list">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <div className="log-header">
              <div className="log-action">{log.action}</div>
              <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
            <div className="log-details">{log.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;