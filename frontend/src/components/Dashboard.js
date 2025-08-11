import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bot-hosting-worker.iimroad.workers.dev';

function Dashboard() {
    const [bots, setBots] = useState([]);
    const [points, setPoints] = useState(0);
    const [botToken, setBotToken] = useState('');
    const [botName, setBotName] = useState('');
    const [selectedBotId, setSelectedBotId] = useState(null);
    const [commandName, setCommandName] = useState('');
    const [script, setScript] = useState('');
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            setPoints(pointsRes.points);
            const logsRes = await axios.get(`${API_URL}/get-logs`, { headers });
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
            fetchDashboardData();
        } catch (err) {
            setError('Hosting failed: ' + (err.response?.data || err.message));
        }
    };

    const handleAddCommand = async () => {
        if (!selectedBotId) return setError('Select a bot first');
        setError('');
        try {
            // await axios.post(`${API_URL}/command`, { bot_id: selectedBotId, command_name, script }, { headers });
            fetchDashboardData();
        } catch (err) {
            setError('Command addition failed: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Points: {points}</p>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Your Bots</h2>
            <ul>
                {bots.map((bot) => (
                    <li key={bot.bot_id} onClick={() => setSelectedBotId(bot.bot_id)}>
                        {bot.name} ({bot.status}) - Click to edit commands
                    </li>
                ))}
            </ul>

            <h2>Host New Bot</h2>
            <input placeholder="Bot Name" value={botName} onChange={(e) => setBotName(e.target.value)} />
            <input placeholder="Bot Token" value={botToken} onChange={(e) => setBotToken(e.target.value)} />
            <button onClick={handleHostBot}>Host</button>

            {selectedBotId && (
                <h2>Add/Edit Command for Bot {selectedBotId}</h2>
            )}
            {selectedBotId && (
                <>
                    <input placeholder="Command Name (e.g., /start)" value={commandName} onChange={(e) => setCommandName(e.target.value)} />
                    <textarea
                        placeholder="Script (e.g., return 'Hello ' + message.from.first_name;)"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={5}
                        style={{ width: '100%' }}
                    />
                    <button onClick={handleAddCommand}>Save Command</button>
                </>
            )}

            <h2>Recent Logs</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log.action} at {log.timestamp}: {log.details}</li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
