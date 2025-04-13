import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Add as AddIcon,
  SearchRounded as SearchIcon,
  MailOutline as MailIcon,
  ErrorOutline as ErrorIcon,
  RefreshRounded as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if we're in demo mode
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setIsDemoMode(token.startsWith('demo-token-'));
  }, []);

  useEffect(() => {
    // Don't fetch if no user
    if (!user || !user._id) {
      setIsLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const response = await api.get('/messages');
        
        // Check if data is array before processing
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        // Process messages to create conversations
        const messagesByUser = {};
        
        response.data.forEach(message => {
          // Validate message format
          if (!message || !message.sender || !message.receiver) {
            return;
          }
          
          // Get IDs (handle both id and _id properties)
          const senderId = message.sender._id || message.sender.id;
          const receiverId = message.receiver._id || message.receiver.id;
          const currentUserId = user._id || user.id;
          
          if (!senderId || !receiverId) {
            return;
          }
          
          // Determine the other party in conversation
          const isUserSender = senderId === currentUserId;
          const otherUserId = isUserSender ? receiverId : senderId;
          const otherUser = isUserSender ? message.receiver : message.sender;
          
          if (!messagesByUser[otherUserId]) {
            messagesByUser[otherUserId] = {
              id: otherUserId,
              name: otherUser.name || 'Unknown User',
              role: otherUser.role || 'user',
              lastMessage: message,
              unreadCount: !isUserSender && !message.isRead ? 1 : 0
            };
          } else {
            // Update last message if newer
            const currentDate = new Date(messagesByUser[otherUserId].lastMessage.createdAt);
            const newDate = new Date(message.createdAt);
            if (newDate > currentDate) {
              messagesByUser[otherUserId].lastMessage = message;
            }
            
            // Count unread messages
            if (!isUserSender && !message.isRead) {
              messagesByUser[otherUserId].unreadCount++;
            }
          }
        });
        
        // Convert to array and sort by most recent
        const sortedConversations = Object.values(messagesByUser).sort((a, b) => {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });
        
        setConversations(sortedConversations);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoadError('Unable to load messages');
        
        // In demo mode, we can provide some sample conversations
        if (isDemoMode) {
          setConversations([
            {
              id: 'user2',
              name: 'Mary Teacher',
              role: 'teacher',
              lastMessage: {
                content: 'Hello! This is about your child\'s progress in Math class.',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                sender: { _id: 'user2', name: 'Mary Teacher' }
              },
              unreadCount: 0
            },
            {
              id: 'user3',
              name: 'Admin User',
              role: 'admin',
              lastMessage: {
                content: 'Please check the updated school calendar.',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                isRead: false,
                sender: { _id: 'user3', name: 'Admin User' }
              },
              unreadCount: 1
            }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user, isDemoMode]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate text with ellipsis
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };
  
  // Filter conversations by search term
  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle refresh
  const handleRefresh = () => {
    if (user && user._id) {
      setIsLoading(true);
      setLoadError(null);
      
      api.get('/messages')
        .then(response => {
          if (Array.isArray(response.data)) {
            // Process conversations same as in useEffect
            const messagesByUser = {};
            const currentUserId = user._id || user.id;
            
            response.data.forEach(message => {
              if (!message || !message.sender || !message.receiver) return;
              
              const senderId = message.sender._id || message.sender.id;
              const receiverId = message.receiver._id || message.receiver.id;
              
              if (!senderId || !receiverId) return;
              
              const isUserSender = senderId === currentUserId;
              const otherUserId = isUserSender ? receiverId : senderId;
              const otherUser = isUserSender ? message.receiver : message.sender;
              
              if (!messagesByUser[otherUserId]) {
                messagesByUser[otherUserId] = {
                  id: otherUserId,
                  name: otherUser.name || 'Unknown User',
                  role: otherUser.role || 'user',
                  lastMessage: message,
                  unreadCount: !isUserSender && !message.isRead ? 1 : 0
                };
              } else {
                // Update last message if newer
                const currentDate = new Date(messagesByUser[otherUserId].lastMessage.createdAt);
                const newDate = new Date(message.createdAt);
                if (newDate > currentDate) {
                  messagesByUser[otherUserId].lastMessage = message;
                }
                
                // Count unread messages
                if (!isUserSender && !message.isRead) {
                  messagesByUser[otherUserId].unreadCount++;
                }
              }
            });
            
            // Sort by most recent
            const sortedConversations = Object.values(messagesByUser).sort((a, b) => {
              return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
            });
            
            setConversations(sortedConversations);
            toast.success('Messages refreshed');
          }
        })
        .catch(error => {
          console.error('Error refreshing messages:', error);
          setLoadError('Failed to refresh messages');
          toast.error('Could not refresh messages');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Refresh messages"
          >
            <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link 
            to="/messages/new" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <AddIcon className="mr-2" fontSize="small" />
            New Message
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Search box */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Conversations list */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 h-12 w-12 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading messages</h3>
            <p className="mt-1 text-sm text-gray-500">{loadError}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 text-center">
            <MailIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No conversations match your search.' 
                : 'Start a conversation by clicking the New Message button.'}
            </p>
            {isDemoMode && (
              <p className="mt-1 text-xs text-orange-500">
                Demo mode: Click "New Message" to create a demo conversation
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1 divide-y divide-gray-100">
            {filteredConversations.map(conversation => (
              <Link 
                key={conversation.id}
                to={`/messages/${conversation.id}`} 
                className="block hover:bg-gray-50 transition-colors p-3 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* User avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {conversation.name.charAt(0)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Message preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900 truncate mr-2">
                          {conversation.name}
                        </p>
                        {conversation.role && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {conversation.role}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${conversation.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'} truncate`}>
                        {(conversation.lastMessage.sender._id === user._id || conversation.lastMessage.sender.id === user._id) ? 'You: ' : ''}
                        {truncateText(conversation.lastMessage.content)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Date and unread count */}
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs text-gray-500">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="mt-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;