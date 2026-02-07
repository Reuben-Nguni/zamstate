import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { messageService, userService } from '../utils/api';
import { timeAgo } from '../utils/time';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RealTimeMessages: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [presence, setPresence] = useState<Record<string, { online: boolean; lastSeen?: string }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  // Socket instance
  const socket = useRef<any>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    
    socket.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    // Connection event
    socket.current.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      if (user) {
        socket.current.emit('join-conversation', selectedConversation?._id, user.id);
      }
    });

    // Presence updates
    socket.current.on('user-online', ({ userId }: any) => {
      setPresence((p) => ({ ...p, [userId]: { ...(p[userId] || {}), online: true } }));
    });

    socket.current.on('user-offline', ({ userId, lastSeen }: any) => {
      setPresence((p) => ({ ...p, [userId]: { ...(p[userId] || {}), online: false, lastSeen } }));
    });

    // Receive real-time messages
    socket.current.on('receive-message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    // User typing indicators
    socket.current.on('user-typing', () => {
      setUserTyping(true);
    });

    socket.current.on('user-stop-typing', () => {
      setUserTyping(false);
    });

    // Booking notifications
    socket.current.on('booking-request', (bookingData: any) => {
      toast.success(`New booking request for ${bookingData.property?.title}!`);
    });

    // Error handling
    socket.current.on('connect_error', (error: any) => {
      console.warn('WebSocket connection error:', error);
    });

    // Fetch conversations on load
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await messageService.getConversations();
        // server returns an array — handle both array and wrapped responses
        const convs = Array.isArray(response) ? response : (response.conversations || response.data || []);
        setConversations(convs as any[]);
      } catch (error) {
        console.warn('Failed to fetch conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();

    // Fetch initial presence for all users so UI can show online/offline immediately
    const fetchPresence = async () => {
      try {
        const res = await userService.getPresence();
        const users = res.users || res.data || (Array.isArray(res) ? res : []);
        const mapping: Record<string, { online: boolean; lastSeen?: string }> = {};
        (Array.isArray(users) ? users : []).forEach((u: any) => {
          mapping[u._id] = { online: !!u.online, lastSeen: u.lastSeen };
        });
        setPresence(mapping);
      } catch (err) {
        console.warn('Failed to fetch presence:', err);
      }
    };
    fetchPresence();

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user]);

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversation) {
      // Join the conversation room
      if (socket.current && user) {
        socket.current.emit('join-conversation', selectedConversation._id, user.id);
      }

      // Fetch existing messages
      const fetchMessages = async () => {
        try {
          const response = await messageService.getMessages(selectedConversation._id);
          const msgs = Array.isArray(response) ? response : (response.messages || response.data || []);
          setMessages(msgs as any[]);
        } catch (error) {
          console.warn('Failed to fetch messages:', error);
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      // Determine recipient (other participant)
      const other = selectedConversation.participants?.find((p: any) => p._id !== user?.id);
      const payload: any = {
        recipientId: other?._id,
        propertyId: selectedConversation.property?._id,
        content: newMessage,
      };

      // Send via API to persist
      const response = await messageService.sendMessage(payload);

      // response.data contains the saved message
      const saved = response.data || response;

      // Emit via Socket.IO for real-time delivery
      socket.current.emit('send-message', {
        conversationId: selectedConversation._id,
        message: {
          ...saved,
          sender: user,
        },
      });

      setNewMessage('');
      toast.success('Message sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing indicator
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Emit typing event
    if (socket.current && selectedConversation) {
      socket.current.emit('typing', {
        conversationId: selectedConversation._id,
        userId: user?.id,
      });
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.current && selectedConversation) {
        socket.current.emit('stop-typing', {
          conversationId: selectedConversation._id,
          userId: user?.id,
        });
      }
    }, 2000);
  };

  return (
    <div className="realtime-messages-page">
      <div className="container-fluid py-4">
        <div className="row h-100">
          {/* Conversations Sidebar */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-comments me-2 text-zambia-green"></i>
                  Conversations
                </h5>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-zambia-green" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-inbox fa-2x mb-3"></i>
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {conversations.map((conv: any) => (
                      <motion.button
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`list-group-item list-group-item-action text-start border-0 ${
                          selectedConversation?._id === conv._id ? 'active bg-zambia-green text-white' : ''
                        }`}
                        whileHover={{ backgroundColor: selectedConversation?._id === conv._id ? '' : '#f8f9fa' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="me-2" style={{ width: 48, height: 48 }}>
                            {(() => {
                              const others = conv.participants?.filter((p: any) => p._id !== user?.id) || [];
                              const primary = others[0];
                              return primary?.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={primary.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                              ) : (
                                <div className="bg-zambia-green rounded" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fas fa-user text-white" />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              {(() => {
                                const others = conv.participants?.filter((p: any) => p._id !== user?.id) || [];
                                const name = others.map((p: any) => p.firstName || p.name).join(', ') || 'Unknown';
                                const primary = others[0];
                                const pr = primary ? presence[primary._id] : undefined;
                                return (
                                  <>
                                    {name}
                                    {pr && (
                                              <span className={`ms-2 badge ${pr.online ? 'bg-success' : 'bg-secondary'}`}>
                                                {pr.online ? 'Online' : timeAgo(pr.lastSeen)}
                                              </span>
                                            )}
                                  </>
                                );
                              })()}
                            </h6>
                            <small className="text-truncate d-block">
                              {conv.lastMessage?.content || 'Start a conversation...'}
                            </small>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="badge bg-danger ms-2">{conv.unreadCount}</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-lg-9">
            {selectedConversation ? (
              <div className="card border-0 shadow-sm h-100 d-flex flex-column">
                {/* Chat Header */}
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {selectedConversation.participants
                          ?.filter((p: any) => p._id !== user?.id)
                          .map((p: any) => p.firstName || p.name)
                          .join(', ')}
                      </h5>
                      {userTyping && <small className="text-muted">typing...</small>}
                      {!userTyping && (
                        <small className="text-muted">
                        {(() => {
                            const other = selectedConversation.participants?.find((p: any) => p._id !== user?.id);
                            if (!other) return '';
                            const pr = presence[other._id];
                            if (pr?.online) return 'Online';
                            if (pr?.lastSeen) return `Last seen ${timeAgo(pr.lastSeen)}`;
                            return '';
                          })()}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div
                  className="card-body flex-grow-1 overflow-auto"
                  style={{ minHeight: '400px', maxHeight: '600px' }}
                >
                  <AnimatePresence>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <i className="fas fa-comments fa-2x mb-3"></i>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg: any, index: number) => {
                        const isOwn = msg.sender?._id === user?.id || msg.sender?.id === user?.id;
                        return (
                          <motion.div
                            key={msg._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-3 d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            {!isOwn && (
                              <div className="me-2" style={{ width: 40, height: 40 }}>
                                {msg.sender?.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={msg.sender.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                ) : (
                                  <div className="bg-zambia-green rounded" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-user text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-zambia-green text-white'
                                  : 'bg-light text-dark'
                              }`}
                              style={{ maxWidth: '70%' }}
                            >
                              <p className="mb-1">{msg.content}</p>
                              <small className={isOwn ? 'text-white-50' : 'text-muted'}>
                                {msg.sender?.firstName && !isOwn && `${msg.sender.firstName} • `}
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </small>
                            </div>
                            {isOwn && (
                              <div className="ms-2" style={{ width: 40, height: 40 }}>
                                {user?.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={user.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                ) : (
                                  <div className="bg-zambia-green rounded" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-user text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="card-footer bg-white border-top">
                  <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <textarea
                        className="form-control"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleMessageInputChange}
                        disabled={sendingMessage}
                        rows={1}
                        style={{ resize: 'none', maxHeight: '100px' }}
                      />
                      <button
                        className="btn btn-zambia-green"
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                      >
                        <i className={`fas ${sendingMessage ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <i className="fas fa-comments fa-3x mb-3"></i>
                  <h5>Select a conversation to start messaging</h5>
                  <p>Choose from your conversations on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMessages;
