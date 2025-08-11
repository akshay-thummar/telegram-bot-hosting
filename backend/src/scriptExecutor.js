// backend/src/scriptExecutor.js
import { TelegramBot } from './telegram.js';

export class ScriptExecutor {
  constructor(token, message) {
    this.bot = new TelegramBot(token);
    this.message = message;
    this.chat_id = message.chat.id;
    this.user_id = message.from.id;
    this.username = message.from.username;
    this.first_name = message.from.first_name;
    this.last_name = message.from.last_name;
    this.executedCommands = [];
  }

  async executeScript(script) {
    try {
      const context = this.createExecutionContext();
      const result = await this.parseAndExecuteScript(script, context);
      return { success: true, result, executedCommands: this.executedCommands };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  createExecutionContext() {
    const self = this;
    return {
      message: this.message,
      chat_id: this.chat_id,
      user_id: this.user_id,
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      
      sendMessage: async (text, options = {}) => {
        const result = await self.bot.sendMessage(self.chat_id, text, options);
        self.executedCommands.push(`sendMessage: ${text}`);
        return result;
      },
      
      forwardMessage: async (from_chat_id, message_id, options = {}) => {
        const result = await self.bot.forwardMessage(self.chat_id, from_chat_id, message_id, options);
        self.executedCommands.push(`forwardMessage: ${from_chat_id}/${message_id}`);
        return result;
      },
      
      sendPhoto: async (photo, options = {}) => {
        const result = await self.bot.sendPhoto(self.chat_id, photo, options);
        self.executedCommands.push(`sendPhoto: ${photo}`);
        return result;
      },
      
      // Add other methods similarly...
      bot: this.bot
    };
  }

  async parseAndExecuteScript(script, context) {
    // Clean and normalize the script
    let cleanScript = script.trim();
    
    // Fix common syntax issues
    cleanScript = this.fixCommonSyntaxErrors(cleanScript);
    
    // Split script into lines for parsing
    const lines = cleanScript.split('\n').map(line => line.trim()).filter(line => line);
    
    let results = [];
    
    for (let line of lines) {
      const result = await this.executeLine(line, context);
      if (result) results.push(result);
    }
    
    return results.join('\n') || 'Script executed';
  }

  fixCommonSyntaxErrors(script) {
    // Fix C-style for loops to JavaScript
    script = script.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 
                          'for(let $1=$2; $1<$3; $1++)');
    
    // Fix other common issues
    script = script.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*(\w+)\s*\+\+\s*\)/g, 
                          'for(let $1=$2; $1<$3; $1++)');
    
    return script;
  }

  async executeLine(line, context) {
    try {
      // Handle different types of statements
      
      // 1. Simple sendMessage calls
      const sendMessageMatch = line.match(/sendMessage\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/);
      if (sendMessageMatch) {
        await context.sendMessage(sendMessageMatch[1]);
        return sendMessageMatch[1];
      }
      
      // 2. For loops with sendMessage
      const forLoopMatch = line.match(/for\s*\(\s*let\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{?\s*$/);
      if (forLoopMatch) {
        const [, varName, start, end] = forLoopMatch;
        // This line starts a for loop - we need to look ahead for the body
        return null; // Will be handled by block parsing
      }
      
      // 3. Return statements
      const returnMatch = line.match(/return\s+["'`]([^"'`]+)["'`]/);
      if (returnMatch) {
        await context.sendMessage(returnMatch[1]);
        return returnMatch[1];
      }
      
      return null;
    } catch (error) {
      throw new Error(`Error executing line "${line}": ${error.message}`);
    }
  }

  async parseAndExecuteScript(script, context) {
    let cleanScript = script.trim();
    cleanScript = this.fixCommonSyntaxErrors(cleanScript);
    
    // Handle block parsing for loops and complex structures
    const result = await this.parseBlocks(cleanScript, context);
    return result || 'Script executed successfully';
  }

  async parseBlocks(script, context) {
    const lines = script.split('\n').map(line => line.trim()).filter(line => line);
    let i = 0;
    let results = [];
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Handle for loops
      const forLoopMatch = line.match(/for\s*\(\s*let\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{?/);
      if (forLoopMatch) {
        const [, varName, start, end] = forLoopMatch;
        const startNum = parseInt(start);
        const endNum = parseInt(end);
        
        // Find the body of the loop
        let loopBody = [];
        i++; // Move to next line after for loop
        
        // Collect loop body lines until we hit a closing brace or end
        while (i < lines.length && !lines[i].includes('}')) {
          if (lines[i].trim()) {
            loopBody.push(lines[i]);
          }
          i++;
        }
        
        // Execute the loop
        for (let loopVar = startNum; loopVar < endNum; loopVar++) {
          for (let bodyLine of loopBody) {
            const result = await this.executeLine(bodyLine, context);
            if (result) results.push(result);
          }
        }
        
        i++; // Skip closing brace
        continue;
      }
      
      // Handle single line statements
      const result = await this.executeLine(line, context);
      if (result) results.push(result);
      
      i++;
    }
    
    return results.length > 0 ? results.join('\n') : 'Script executed';
  }
}
