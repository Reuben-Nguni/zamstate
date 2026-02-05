import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - replace with API call
  const conversations = [
    {
      id: '1',
      participant: {
        name: 'John Doe',
        avatar: '/api/placeholder/40/40',
        role: 'tenant',
        online: true,
      },
      property: {
        title: 'Modern 3BR Apartment in Kabulonga',
        id: '1',
      },
      lastMessage: {
        content: 'Thank you for showing me the apartment. When can I move in?',
        timestamp: '2024-01-24T14:30:00Z',
        isFromUser: false,
      },
      unreadCount: 2,
    },
    {
      id: '2',
      participant: {
        name: 'Jane Smith',
        avatar: '/api/placeholder/40/40',
        role: 'agent',
        online: false,
      },
      property: {
        title: 'Spacious Family Home in Roma',
        id: '2',
      },
      lastMessage: {
        content: 'The property inspection is scheduled for tomorrow.',
        timestamp: '2024-01-24T10:15:00Z',
        isFromUser: true,
      },
      unreadCount: 0,
    },
    {
      id: '3',
      participant: {
        name: 'Mike Johnson',
        avatar: '/api/placeholder/40/40',
        role: 'owner',
        online: true,
      },
      property: {
        title: 'Commercial Office Space CBD',
        id: '3',
      },
      lastMessage: {
        content: 'Rent payment received. Thank you!',
        timestamp: '2024-01-23T16:45:00Z',
        isFromUser: false,
      },
      unreadCount: 1,
    },
  ];

  const messages = [
    {
      id: '1',
      content: 'Hi, I\'m interested in viewing the Modern 3BR Apartment in Kabulonga.',
      timestamp: '2024-01-24T10:00:00Z',
      isFromUser: false,
      sender: 'John Doe',
    },
    {
      id: '2',
      content: 'Hello John! I\'d be happy to show you the apartment. What day works best for you?',
      timestamp: '2024-01-24T10:05:00Z',
      isFromUser: true,
      sender: 'You',
    },
    {
      id: '3',
      content: 'How about tomorrow afternoon around 2 PM?',
      timestamp: '2024-01-24T10:10:00Z',
      isFromUser: false,
      sender: 'John Doe',
    },
    {
      id: '4',
      content: 'Perfect! I\'ll meet you at the property. Please bring your ID and proof of income.',
      timestamp: '2024-01-24T10:15:00Z',
      isFromUser: true,
      sender: 'You',
    },
    {
      id: '5',
      content: 'Thank you for showing me the apartment. When can I move in?',
      timestamp: '2024-01-24T14:30:00Z',
      isFromUser: false,
      sender: 'John Doe',
    },
  ];

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Implement send message API call
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-ZM', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-ZM', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="messages-page">
      <div className="container-fluid py-4">
        {/* Header */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1">Messages</h1>
                <p className="text-muted mb-0">
                  Communicate with tenants, owners, and agents.
                </p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-plus me-2"></i>
                  New Conversation
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row">
          {/* Conversations List */}
          <motion.div
            className="col-lg-4 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">Conversations</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`list-group-item list-group-item-action p-3 text-start ${
                        selectedConversation === conversation.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="d-flex align-items-start">
                        <div className="position-relative me-3">
                          <img
                            src={conversation.participant.avatar}
                            alt={conversation.participant.name}
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px' }}
                          />
                          {conversation.participant.online && (
                            <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                                  style={{ width: '12px', height: '12px' }}></span>
                          )}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 text-truncate">
                              {conversation.participant.name}
                            </h6>
                            <small className="text-muted">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </small>
                          </div>
                          <p className="mb-1 text-muted small text-truncate">
                            {conversation.property.title}
                          </p>
                          <p className="mb-0 small text-truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="badge bg-zambia-green rounded-pill ms-2">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            className="col-lg-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {selectedConversation && selectedConv ? (
              <div className="card h-100 d-flex flex-column">
                {/* Chat Header */}
                <div className="card-header">
                  <div className="d-flex align-items-center">
                    <img
                      src={selectedConv.participant.avatar}
                      alt={selectedConv.participant.name}
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div>
                      <h5 className="mb-0">{selectedConv.participant.name}</h5>
                      <small className="text-muted">
                        {selectedConv.property.title}
                      </small>
                    </div>
                    <div className="ms-auto">
                      <span className={`badge ${selectedConv.participant.online ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedConv.participant.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="card-body flex-grow-1 overflow-auto" style={{ maxHeight: '400px' }}>
                  <div className="d-flex flex-column gap-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`d-flex ${message.isFromUser ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div
                          className={`message-bubble p-3 rounded ${
                            message.isFromUser
                              ? 'bg-zambia-green text-white align-self-end'
                              : 'bg-light align-self-start'
                          }`}
                          style={{ maxWidth: '70%' }}
                        >
                          <p className="mb-1">{message.content}</p>
                          <small className={`d-block ${
                            message.isFromUser ? 'text-white-50' : 'text-muted'
                          }`}>
                            {formatTime(message.timestamp)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="card-footer">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      className="btn btn-zambia-green"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">Select a conversation</h4>
                  <p className="text-muted">Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="row mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Message Statistics</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-primary mb-1">{conversations.length}</h3>
                      <small className="text-muted">Total Conversations</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-warning mb-1">
                        {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                      </h3>
                      <small className="text-muted">Unread Messages</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-success mb-1">
                        {conversations.filter(conv => conv.participant.online).length}
                      </h3>
                      <small className="text-muted">Online Contacts</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-info mb-1">24</h3>
                      <small className="text-muted">Messages Today</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;
