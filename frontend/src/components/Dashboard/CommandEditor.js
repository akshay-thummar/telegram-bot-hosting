import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Modal from '../Common/Modal';

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

const CommandEditor = ({ bot, refreshData }) => {
  const [commands, setCommands] = useState([]);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [commandName, setCommandName] = useState('');
  const [script, setScript] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const apiKey = localStorage.getItem('apiKey');
  const headers = { Authorization: apiKey };

  useEffect(() => {
    fetchCommands();
  }, [bot]);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/get-commands?bot_id=${bot.bot_id}`, { headers });
      setCommands(res.data);
    } catch (err) {
      setError('Failed to load commands: ' + (err.response?.data || err.message));
    }
    setLoading(false);
  };

  const handleCreateCommand = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_URL}/command`, { 
        bot_id: bot.bot_id, 
        command_name: commandName, 
        script 
      }, { headers });
      
      setCommandName('');
      setScript('');
      setShowCreateModal(false);
      fetchCommands();
    } catch (err) {
      setError('Command creation failed: ' + (err.response?.data || err.message));
    }
    
    setLoading(false);
  };

  const handleUpdateCommand = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.put(`${API_URL}/update-command`, { 
        bot_id: bot.bot_id, 
        command_id: selectedCommand.command_id,
        command_name: commandName, 
        script 
      }, { headers });
      
      setCommandName('');
      setScript('');
      setShowEditModal(false);
      fetchCommands();
    } catch (err) {
      setError('Command update failed: ' + (err.response?.data || err.message));
    }
    
    setLoading(false);
  };

  const handleDeleteCommand = async (commandId) => {
    if (!window.confirm('Are you sure you want to delete this command?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.delete(`${API_URL}/delete-command`, { 
        data: { 
          bot_id: bot.bot_id, 
          command_id: commandId 
        },
        headers 
      });
      
      fetchCommands();
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data || err.message));
    }
    
    setLoading(false);
  };

  const openEditModal = (command) => {
    setSelectedCommand(command);
    setCommandName(command.command_name);
    setScript(command.script);
    setShowEditModal(true);
  };

  return (
    <div className="command-editor">
      <div className="command-header">
        <h3>Commands for {bot.name}</h3>
        <Button onClick={() => setShowCreateModal(true)}>Add New Command</Button>
      </div>
      
      {error && <div className="command-error">{error}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading commands...</p>
        </div>
      ) : commands.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon command-icon"></div>
          <h3>No Commands Found</h3>
          <p>This bot doesn't have any commands yet. Click "Add New Command" to create one.</p>
        </div>
      ) : (
        <div className="commands-list">
          {commands.map((command) => (
            <div key={command.command_id} className="command-card">
              <div className="command-info">
                <div className="command-name">{command.command_name}</div>
                <div className="command-preview">
                  {command.script.substring(0, 100)}
                  {command.script.length > 100 ? '...' : ''}
                </div>
              </div>
              <div className="command-actions">
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => openEditModal(command)}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => handleDeleteCommand(command.command_id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create New Command"
      >
        <div className="command-form">
          <Input
            label="Command Name"
            placeholder="e.g., /start"
            value={commandName}
            onChange={(e) => setCommandName(e.target.value)}
            required
          />
          
          <div className="input-group">
            <label className="input-label">Script Code</label>
            <textarea
              className="input script-editor"
              placeholder="e.g., return 'Hello ' + message.from.first_name;"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
            ></textarea>
          </div>
          
          {error && <div className="modal-error">{error}</div>}
          
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCommand} disabled={loading}>
              {loading ? 'Creating...' : 'Create Command'}
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Command"
      >
        <div className="command-form">
          <Input
            label="Command Name"
            placeholder="e.g., /start"
            value={commandName}
            onChange={(e) => setCommandName(e.target.value)}
            required
          />
          
          <div className="input-group">
            <label className="input-label">Script Code</label>
            <textarea
              className="input script-editor"
              placeholder="e.g., return 'Hello ' + message.from.first_name;"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
            ></textarea>
          </div>
          
          {error && <div className="modal-error">{error}</div>}
          
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCommand} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommandEditor;