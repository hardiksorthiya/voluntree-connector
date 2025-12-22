import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendIcon, BotIcon, UserIcon, TrashIcon, PlusIcon, HistoryIcon } from '../components/Icons';
import '../css/Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load conversations from localStorage
    loadConversations();
  }, [navigate]);

  useEffect(() => {
    // Load messages for current conversation
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        setMessages(conversation.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [currentConversationId, conversations]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const loadConversations = () => {
    const savedConversations = localStorage.getItem('chatConversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        // Set the most recent conversation as current
        if (parsed.length > 0) {
          const mostRecent = parsed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
          setCurrentConversationId(mostRecent.id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  };

  const saveConversations = (updatedConversations) => {
    try {
      localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newConversation, ...conversations];
    saveConversations(updated);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
  };

  const selectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
  };

  const deleteConversation = (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      const updated = conversations.filter(c => c.id !== conversationId);
      saveConversations(updated);
      if (conversationId === currentConversationId) {
        if (updated.length > 0) {
          setCurrentConversationId(updated[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    // Create new conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConversation = {
        id: Date.now(),
        title: inputMessage.trim().substring(0, 30) + (inputMessage.trim().length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversationId = newConversation.id;
      const updated = [newConversation, ...conversations];
      saveConversations(updated);
      setCurrentConversationId(conversationId);
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Update conversation title from first user message if needed
    const currentConversation = conversations.find(c => c.id === conversationId);
    let conversationTitle = currentConversation?.title || 'New Conversation';
    if (currentConversation && currentConversation.messages.length === 0) {
      conversationTitle = inputMessage.trim().substring(0, 30) + (inputMessage.trim().length > 30 ? '...' : '');
    }

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    // Update conversation immediately with user message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          title: conversationTitle,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });
    saveConversations(updatedConversations);

    // TODO: Replace with actual OpenAI API call
    // For now, simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: generateMockResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Update conversation with AI response
      const finalConversations = updatedConversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: finalMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });
      saveConversations(finalConversations);
      setLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userInput) => {
    // Mock responses until OpenAI integration
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm your AI assistant for Volunteer Connect. How can I help you today?";
    } else if (lowerInput.includes('volunteer') || lowerInput.includes('activity')) {
      return "I can help you find volunteer opportunities, manage your activities, and answer questions about volunteering. What would you like to know?";
    } else if (lowerInput.includes('help')) {
      return "I'm here to help! You can ask me about:\n- Finding volunteer opportunities\n- Managing your activities\n- Getting information about events\n- Answering questions about the platform\n\nWhat would you like help with?";
    } else if (lowerInput.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return "I understand you're asking about: \"" + userInput + "\". Once OpenAI integration is complete, I'll be able to provide more detailed and accurate responses. For now, feel free to ask me about volunteer activities, events, or how to use the platform!";
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
      localStorage.removeItem('chatConversations');
    }
  };

  const getConversationPreview = (conversation) => {
    if (conversation.messages.length === 0) return 'New conversation';
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-layout">
        {/* History Sidebar - 30% */}
        <div className="chat-history-sidebar">
          <div className="history-header">
            <HistoryIcon className="history-header-icon" />
            <h3 className="history-title">Chat History</h3>
            <button 
              onClick={createNewConversation}
              className="new-chat-btn"
              title="New Conversation"
            >
              <PlusIcon className="new-chat-icon" />
            </button>
          </div>
          
          <div className="history-list">
            {conversations.length === 0 ? (
              <div className="history-empty">
                <p>No conversations yet</p>
                <p className="history-empty-hint">Start a new chat to begin!</p>
              </div>
            ) : (
              conversations
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`history-item ${currentConversationId === conversation.id ? 'active' : ''}`}
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <div className="history-item-content">
                      <div className="history-item-title">{conversation.title}</div>
                      <div className="history-item-preview">{getConversationPreview(conversation)}</div>
                      <div className="history-item-time">{formatTime(conversation.updatedAt)}</div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="history-item-delete"
                      title="Delete conversation"
                    >
                      <TrashIcon className="delete-icon" />
                    </button>
                  </div>
                ))
            )}
          </div>

          {conversations.length > 0 && (
            <div className="history-footer">
              <button 
                onClick={handleClearAllHistory}
                className="clear-all-btn"
                title="Clear all history"
              >
                <TrashIcon className="clear-icon" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Chat Area - 70% */}
        <div className="chat-main-area">
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-header-info">
                <BotIcon className="chat-header-icon" />
                <div>
                  <h2 className="chat-title">AI Assistant</h2>
                  <p className="chat-subtitle">Your volunteer support assistant</p>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
          <div className="chat-welcome">
            <BotIcon className="welcome-icon" />
            <h3>Welcome to AI Chat!</h3>
            <p>I'm here to help you with:</p>
            <ul className="welcome-list">
              <li>Finding volunteer opportunities</li>
              <li>Managing your activities</li>
              <li>Answering questions about events</li>
              <li>Providing platform guidance</li>
            </ul>
              <p className="welcome-note">Start a conversation by typing a message below!</p>
            </div>
            ) : (
              messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-ai'}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? (
                  <UserIcon className="avatar-icon" />
                ) : (
                  <BotIcon className="avatar-icon" />
                )}
              </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
              ))
            )}
                {loading && (
              <div className="message message-ai">
                <div className="message-avatar">
                  <BotIcon className="avatar-icon" />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="chat-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!inputMessage.trim() || loading}
              >
                <SendIcon className="send-icon" />
              </button>
            </div>
            <p className="chat-footer-note">
              AI responses are simulated. OpenAI integration will be added soon.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
