import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  SentimentDissatisfiedOutlined as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import axios from 'axios';

// Demo users info for fallback
const demoUsers = {
  user1: { _id: 'user1', name: 'John Parent', role: 'parent' },
  user2: { _id: 'user2', name: 'Mary Teacher', role: 'teacher' },
  user3: { _id: 'user3', name: 'Admin User', role: 'admin' }
};

const Conversation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Check if we're in demo mode
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setIsDemoMode(token.startsWith('demo-token-'));
  }, []);

  // Set the other user info for demo mode
  useEffect(() => {
    if (isDemoMode && userId && !otherUser) {
      // Find the demo user
      if (demoUsers[userId]) {
        setOtherUser(demoUsers[userId]);
      } else {
        // For custom IDs, use a generic user
        setOtherUser({
          _id: userId,
          name: userId === 'user1' ? 'John Parent' : 
                userId === 'user2' ? 'Mary Teacher' : 
                userId === 'user3' ? 'Admin User' : 'Demo User',
          role: 'user'
        });
      }
    }
  }, [isDemoMode, userId, otherUser]);

  // Fetch conversation and clean up on unmount
  useEffect(() => {
    const fetchConversation = async () => {
      // Don't make API calls if user or userId is not available
      if (!user || !user._id || !userId) {
        setIsLoading(false);
        return;
      }
      
      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setLoadingError(null);
      
      try {
        const response = await api.get(`/messages/conversation/${userId}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (Array.isArray(response.data)) {
          setMessages(response.data);

          // Find other user info from first message or from demo users
          if (response.data.length > 0) {
            const firstMessage = response.data[0];
            
            // Check if the message has valid sender and receiver objects
            if (firstMessage.sender && firstMessage.receiver) {
              const senderId = firstMessage.sender._id || firstMessage.sender.id;
              const receiverId = firstMessage.receiver._id || firstMessage.receiver.id;
              const currentUserId = user._id || user.id;
              
              // Determine which user is the other party
              const otherUserInfo = senderId === currentUserId 
                ? firstMessage.receiver 
                : firstMessage.sender;
              
              setOtherUser(otherUserInfo);
            }
          } else if (isDemoMode) {
            // If no messages but in demo mode, use demo user info
            const demoUser = demoUsers[userId] || { _id: userId, name: 'Demo User', role: 'user' };
            setOtherUser(demoUser);
          } else {
            // Try to fetch user info directly
            try {
              const userResponse = await api.get(`/users/${userId}`);
              if (userResponse.data) {
                setOtherUser(userResponse.data);
              }
            } catch (userError) {
              console.error('Could not fetch user info:', userError);
            }
          }
          
          // Mark all messages as read (if not in demo mode)
          if (!isDemoMode) {
            const unreadMessages = response.data.filter(msg => {
              const receiverId = msg.receiver._id || msg.receiver.id;
              const currentUserId = user._id || user.id;
              return receiverId === currentUserId && !msg.isRead;
            });
            
            if (unreadMessages.length > 0) {
              // Mark each unread message as read
              try {
                await Promise.all(unreadMessages.map(msg => 
                  api.put(`/messages/${msg._id}/read`)
                ));
              } catch (err) {
                console.error('Error marking messages as read:', err);
              }
            }
          }
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching conversation:', error);
          setLoadingError('Failed to load conversation');
          
          // Set empty messages instead of breaking the UI
          setMessages([]);
          
          // If in demo mode, still set other user
          if (isDemoMode) {
            const demoUser = demoUsers[userId] || { _id: userId, name: 'Demo User', role: 'user' };
            setOtherUser(demoUser);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userId) {
      fetchConversation();
    }
    
    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId, user, isDemoMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !userId) return;
    
    setIsSending(true);
    try {
      const response = await api.post('/messages', {
        receiverId: userId,
        content: newMessage.trim()
      });
      
      if (response.data) {
        // Ensure we have all the necessary fields for a message object
        const newMsg = {
          ...response.data,
          sender: response.data.sender || { 
            _id: user._id || user.id, 
            name: user.name,
            role: user.role 
          },
          receiver: response.data.receiver || otherUser,
          createdAt: response.data.createdAt || new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Ensure scroll to bottom after sending
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group messages by date
  const groupedMessages = () => {
    const groups = {};
    
    messages.forEach(message => {
      // Skip invalid messages
      if (!message || !message.createdAt) return;
      
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      formattedDate: formatMessageDate(date),
      messages
    }));
  };

  // Show loading indicator while user data loads
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-t-xl px-6 py-4 flex items-center">
        <button 
          onClick={() => navigate('/messages')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to messages"
        >
          <ArrowBackIcon />
        </button>
        
        {isLoading ? (
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
              {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '?'}
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {otherUser?.name || 'Unknown User'}
            </h1>
            {otherUser?.role && (
              <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Message List */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-primary-500">Loading messages...</div>
          </div>
        ) : loadingError ? (
          <div className="text-center py-8 text-red-500">
            <ErrorIcon className="mx-auto mb-2 text-4xl" />
            <p>{loadingError}</p>
            <button 
              onClick={() => {
                setIsLoading(true);
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No messages yet. Start the conversation!</p>
            <p className="text-xs text-gray-400">Messages you send will appear here</p>
          </div>
        ) : (
          groupedMessages().map((group) => (
            <div key={group.date} className="mb-6">
              <div className="text-center mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {group.formattedDate}
                </span>
              </div>
              
              <div className="space-y-3">
                {group.messages.map((message) => {
                  // Skip invalid messages
                  if (!message.sender || (!message.sender._id && !message.sender.id)) {
                    return null;
                  }
                  
                  const senderId = message.sender._id || message.sender.id;
                  const currentUserId = user._id || user.id;
                  const isFromUser = senderId === currentUserId;
                  
                  return (
                    <div 
                      key={message._id} 
                      className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          isFromUser 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm break-words">{message.content}</div>
                        <div 
                          className={`text-xs mt-1 ${
                            isFromUser ? 'text-primary-50' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                          {isDemoMode && isFromUser && 
                            <span className="ml-1">(demo)</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {/* This div allows scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 bg-white border-t rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1 mr-4"
            disabled={isLoading || isSending}
            maxLength={1000}
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700 transition-colors"
            disabled={!newMessage.trim() || isLoading || isSending}
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;