// backend/src/telegram.js
export class TelegramBot {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.telegram.org';
  }

  async sendMessage(chat_id, text, options = {}) {
    return await this._makeRequest('sendMessage', {
      chat_id,
      text,
      ...options
    });
  }

  async forwardMessage(chat_id, from_chat_id, message_id, options = {}) {
    return await this._makeRequest('forwardMessage', {
      chat_id,
      from_chat_id,
      message_id,
      ...options
    });
  }

  async sendPhoto(chat_id, photo, options = {}) {
    return await this._makeRequest('sendPhoto', {
      chat_id,
      photo,
      ...options
    });
  }

  async sendAudio(chat_id, audio, options = {}) {
    return await this._makeRequest('sendAudio', {
      chat_id,
      audio,
      ...options
    });
  }

  async sendDocument(chat_id, document, options = {}) {
    return await this._makeRequest('sendDocument', {
      chat_id,
      document,
      ...options
    });
  }

  async sendSticker(chat_id, sticker, options = {}) {
    return await this._makeRequest('sendSticker', {
      chat_id,
      sticker,
      ...options
    });
  }

  async sendVideo(chat_id, video, options = {}) {
    return await this._makeRequest('sendVideo', {
      chat_id,
      video,
      ...options
    });
  }

  async sendVoice(chat_id, voice, options = {}) {
    return await this._makeRequest('sendVoice', {
      chat_id,
      voice,
      ...options
    });
  }

  async sendAnimation(chat_id, animation, options = {}) {
    return await this._makeRequest('sendAnimation', {
      chat_id,
      animation,
      ...options
    });
  }

  async sendLocation(chat_id, latitude, longitude, options = {}) {
    return await this._makeRequest('sendLocation', {
      chat_id,
      latitude,
      longitude,
      ...options
    });
  }

  async sendContact(chat_id, phone_number, first_name, options = {}) {
    return await this._makeRequest('sendContact', {
      chat_id,
      phone_number,
      first_name,
      ...options
    });
  }

  async editMessageText(text, options = {}) {
    return await this._makeRequest('editMessageText', {
      text,
      ...options
    });
  }

  async deleteMessage(chat_id, message_id) {
    return await this._makeRequest('deleteMessage', {
      chat_id,
      message_id
    });
  }

  async _makeRequest(method, data) {
    const response = await fetch(`${this.baseURL}/bot${this.token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API Error: ${result.description || 'Unknown error'}`);
    }
    return result;
  }
}
