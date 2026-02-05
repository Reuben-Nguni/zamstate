import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../utils/api';
import type { Conversation, Message } from '../types';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data || []);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      // Use mock data for demo
      setConversations([
        {
          id: '1',
          participants: [
            {
              id: '2',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phone: '+260 97 1234567',
              role: 'tenant',
              isVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          unreadCount: { '1': 2 },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: {
            id: 'm1',
            conversationId: '1',
            sender: {
              id: '2',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phone: '+260 97 1234567',
              role: 'tenant',
              isVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            content: 'Is this property still available?',
            type: 'text',
            readBy: [],
            createdAt: new Date(Date.now() - 3600000),
          },
        },
        {
          id: '2',
          participants: [
            {
              id: '3',
              email: 'jane@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              phone: '+260 96 7654321',
              role: 'agent',
              isVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          unreadCount: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: {
            id: 'm2',
            conversationId: '2',
            sender: {
              try {
                setLoading(true);
                const response = await messageService.getConversations();
                setConversations(response.data || []);
              } catch (error: any) {
                console.error('Error fetching conversations:', error);
                setConversations([]);
              } finally {
                setLoading(false);
              }
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await messageService.sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage,
        type: 'text',
      });
      
      // Add message to local state
      try {
        const response = await messageService.getMessages(conversationId);
        setMessages(response.data || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading && conversations.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
            <h1 className="h2 mb-1">
              <i className="fas fa-comments me-2"></i>
              Messages
            </h1>
            <p className="text-muted mb-0">
              Communicate with tenants, agents, and property owners.
            </p>
          </div>
        </motion.div>

        {/* Messages Interface */}
        <motion.div
          className="row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Conversations List */}
          <div className="col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Conversations
                </h5>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {conversations.map((conversation) => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const unread = conversation.unreadCount[user?.id || ''] || 0;
                      
                      return (
                        <button
                          key={conversation.id}
                          className={`list-group-item list-group-item-action ${
                            selectedConversation?.id === conversation.id ? 'active' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="d-flex align-items-start">
                            <div className="avatar-container me-3">
                              {otherParticipant.avatar ? (
                                <img
                                  src={otherParticipant.avatar}
                                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                  className="rounded-circle"
                                  width="45"
                                  height="45"
                                />
                              ) : (
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                                    selectedConversation?.id === conversation.id
                                      ? 'bg-white text-primary'
                                      : 'bg-primary text-white'
                                  }`}
                                  style={{ width: '45px', height: '45px' }}
                                >
                                  <i className="fas fa-user"></i>
                                </div>
                              )}
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="mb-0 text-truncate">
                                  {otherParticipant.firstName} {otherParticipant.lastName}
                                </h6>
                                {conversation.lastMessage && (
                                  <small className={selectedConversation?.id === conversation.id ? 'text-white-50' : 'text-muted'}>
                                    {formatTime(conversation.lastMessage.createdAt)}
                                  </small>
                                )}
                              </div>
                              <p className="mb-0 text-truncate small text-muted">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                              {unread > 0 && (
                                <span className="badge bg-danger rounded-pill float-end">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-lg-8">
            <div className="card h-100">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="card-header bg-white">
                    <div className="d-flex align-items-center">
                      {getOtherParticipant(selectedConversation).avatar ? (
                        <img
                          src={getOtherParticipant(selectedConversation).avatar}
                          alt=""
                          className="rounded-circle me-3"
                          width="40"
                          height="40"
                        />
                      ) : (
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <i className="fas fa-user text-white"></i>
                        </div>
                      )}
                      <div>
                        <h5 className="mb-0">
                          {getOtherParticipant(selectedConversation).firstName}{' '}
                          {getOtherParticipant(selectedConversation).lastName}
                        </h5>
                        <small className="text-muted text-capitalize">
                          {getOtherParticipant(selectedConversation).role}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="card-body"
                    style={{ height: '350px', overflowY: 'auto' }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="far fa-comment-dots fa-3x mb-3 opacity-50"></i>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="messages-container">
                        {messages.map((message, index) => {
                          const isFromUser = message.sender.id === user?.id;
                          const showDate =
                            index === 0 ||
                            formatDate(messages[index - 1].createdAt) !==
                              formatDate(message.createdAt);

                          return (
                            <React.Fragment key={message.id}>
                              {showDate && (
                                <div className="text-center my-3">
                                  <span className="badge bg-light text-dark px-3 py-2">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`d-flex mb-2 ${
                                  isFromUser ? 'justify-content-end' : 'justify-content-start'
                                }`}
                              >
                                <div
                                  className={`message-bubble ${
                                    isFromUser
                                      ? 'bg-primary text-white'
                                      : 'bg-light'
                                  }`}
                                  style={{
                                    maxWidth: '70%',
                                    padding: '10px 15px',
                                    borderRadius: '15px',
                                  }}
                                >
                                  <p className="mb-1">{message.content}</p>
                                  <small
                                    className={
                                      isFromUser ? 'text-white-50' : 'text-muted'
                                    }
                                  >
                                    {formatTime(message.createdAt)}
                                  </small>
                                </div>
                              </motion.div>
                            </React.Fragment>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="card-footer bg-white">
                    <form onSubmit={handleSendMessage}>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sending}
                        />
                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                        >
                          {sending ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="fas fa-paper-plane"></i>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="card-body d-flex align-items-center justify-content-center" style={{ height: '450px' }}>
                  <div className="text-center text-muted">
                    <i className="far fa-comment-dots fa-4x mb-3 opacity-50"></i>
                    <h5>Select a conversation</h5>
                    <p>Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;

