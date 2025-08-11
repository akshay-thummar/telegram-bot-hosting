export async function runMigrations(env) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, email TEXT UNIQUE, api_key TEXT, points INTEGER DEFAULT 100000, created_at TEXT);`,
    `CREATE TABLE IF NOT EXISTS bots (bot_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, token TEXT UNIQUE, name TEXT, status TEXT, default_script TEXT, config TEXT, created_at TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id));`,
    `CREATE TABLE IF NOT EXISTS commands (command_id INTEGER PRIMARY KEY AUTOINCREMENT, bot_id INTEGER, command_name TEXT, script TEXT, aliases TEXT, schedule TEXT, version INTEGER DEFAULT 1, execution_limit INTEGER DEFAULT 0, last_executed TEXT, created_at TEXT, FOREIGN KEY (bot_id) REFERENCES bots(bot_id));`,
    `CREATE INDEX IF NOT EXISTS idx_command_name ON commands (bot_id, command_name);`,
    `CREATE TABLE IF NOT EXISTS data_storage (data_id INTEGER PRIMARY KEY AUTOINCREMENT, bot_id INTEGER, user_id INTEGER, name TEXT, value BLOB, updated_at TEXT, FOREIGN KEY (bot_id) REFERENCES bots(bot_id), FOREIGN KEY (user_id) REFERENCES users(user_id));`,
    `CREATE TABLE IF NOT EXISTS resources (resource_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT, user_id INTEGER, value INTEGER, updated_at TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id));`,
    `CREATE TABLE IF NOT EXISTS logs (log_id INTEGER PRIMARY KEY AUTOINCREMENT, bot_id INTEGER, command_id INTEGER, user_id INTEGER, action TEXT, details TEXT, points_deducted INTEGER, timestamp TEXT, FOREIGN KEY (bot_id) REFERENCES bots(bot_id), FOREIGN KEY (command_id) REFERENCES commands(command_id), FOREIGN KEY (user_id) REFERENCES users(user_id));`
  ];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await env.DB.exec(statement);
      console.log(`Successfully executed statement ${i + 1}: ${statement.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Error executing statement ${i + 1}: ${statement}\nError: ${error.message}`);
      throw new Error(`Migration failed at statement ${i + 1}: ${error.message}`);
    }
  }
  return "All migrations completed successfully.";
}
