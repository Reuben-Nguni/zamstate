import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../utils/api';
// Placeholder for socket.io client import
import { io } from 'socket.io-client';

const RealTimeMessages: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Placeholder for socket instance
  const socket = useRef<any>(null);

  useEffect(() => {
    // Connect to Socket.IO server using environment variable
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    socket.current = io(socketUrl);

    socket.current.on('newMessage', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await messageService.getConversations();
        setConversations(response.data || []);
      } catch (error) {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await messageService.getMessages(selectedConversation.id);
          setMessages(response.data || []);
        } catch (error) {
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  // Placeholder for socket.io real-time logic
  // useEffect(() => {
  //   socket.current = io('http://localhost:5000');
  //   socket.current.on('newMessage', (msg) => {
  //     setMessages((prev) => [...prev, msg]);
  //   });
  //   return () => {
  //     socket.current.disconnect();
  //   };
  // }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      // Send message via API
      await messageService.sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage,
      });
      // Emit via socket for real-time update
      socket.current.emit('sendMessage', {
        conversationId: selectedConversation.id,
        content: newMessage,
        sender: user,
        createdAt: new Date(),
      });
      setNewMessage('');
    } catch (error) {}
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editContent, setEditContent] = useState('');

  const handleEditMessage = (msg: any) => {
    setEditingMessage(msg);
    setEditContent(msg.content);
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;
    try {
      // Comment out until backend implements update
      // await messageService.updateMessage?.(editingMessage.id, editContent);
      socket.current.emit('updateMessage', {
        id: editingMessage.id,
        content: editContent,
      });
      setEditingMessage(null);
      setEditContent('');
      // Optionally refetch messages
      if (selectedConversation) {
        const response = await messageService.getMessages(selectedConversation.id);
        setMessages(response.data || []);
      }
    } catch (error) {}
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      // Comment out until backend implements delete
      // await messageService.deleteMessage?.(id);
      socket.current.emit('deleteMessage', { id });
      // Optionally refetch messages
      if (selectedConversation) {
        const response = await messageService.getMessages(selectedConversation.id);
        setMessages(response.data || []);
      }
    } catch (error) {}
  };

  return (
    <div className="realtime-messages-page">
      <div className="sidebar">
        <h3>Conversations</h3>
        {loading ? <div>Loading...</div> : conversations.map((conv: any) => (
          <div key={conv.id} onClick={() => setSelectedConversation(conv)} className={selectedConversation?.id === conv.id ? 'active' : ''}>
            {conv.participants.map((p: any) => p.firstName).join(', ')}
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="messages-list">
              {messages.map((msg: any) => (
                <div key={msg.id} className={msg.sender.id === user?.id ? 'sent' : 'received'} style={{ position: 'relative', marginBottom: '8px' }}>
                  <span>{msg.sender.firstName}: </span>{msg.content}
                  {msg.sender.id === user?.id && (
                    <span style={{ position: 'absolute', right: 0, top: 0 }}>
                      <button style={{ marginRight: 4 }} onClick={() => handleEditMessage(msg)}>Edit</button>
                      <button style={{ color: 'red' }} onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                    </span>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {editingMessage && (
              <form onSubmit={handleUpdateMessage} className="edit-message-form" style={{ marginBottom: 16 }}>
                <input value={editContent} onChange={e => setEditContent(e.target.value)} />
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditingMessage(null)}>Cancel</button>
              </form>
            )}
            <form onSubmit={handleSendMessage} className="send-message-form">
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
              <button type="submit">Send</button>
            </form>
          </>
        ) : <div>Select a conversation to start messaging.</div>}
      </div>
    </div>
  );
};

export default RealTimeMessages;
