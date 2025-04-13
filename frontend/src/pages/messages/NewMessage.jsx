import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// Demo recipients for when API isn't available
const demoRecipients = [
  { _id: 'user2', name: 'Mary Teacher', role: 'teacher' },
  { _id: 'user3', name: 'Admin User', role: 'admin' },
  { _id: 'user1', name: 'John Parent', role: 'parent' }
];

function NewMessage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if we're in demo mode
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setIsDemoMode(token.startsWith('demo-token-'));
  }, []);

  // Fetch potential recipients
  useEffect(() => {
    // Don't make API calls if user is not available
    if (!user || !user._id) {
      return;
    }

    const fetchRecipients = async () => {
      setLoading(true);
      setFetchError(null);
      
      try {
        // If in demo mode, use predefined recipients
        if (isDemoMode) {
          // Filter out current user from demo recipients
          const currentUserId = user._id || user.id;
          const filteredRecipients = demoRecipients.filter(
            recipient => recipient._id !== currentUserId
          );
          setRecipients(filteredRecipients);
          setLoading(false);
          return;
        }

        const response = await api.get('/users/available');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setRecipients(response.data);
        } else {
          console.warn('No recipients returned from API, using demo data');
          
          // Filter out current user from demo recipients
          const currentUserId = user._id || user.id;
          const filteredRecipients = demoRecipients.filter(
            recipient => recipient._id !== currentUserId
          );
          setRecipients(filteredRecipients);
        }
      } catch (error) {
        console.error('Error fetching recipients:', error);
        setFetchError('Could not load recipients');
        
        // Use demo recipients as fallback, filtered to remove current user
        const currentUserId = user._id || user.id;
        const filteredRecipients = demoRecipients.filter(
          recipient => recipient._id !== currentUserId
        );
        setRecipients(filteredRecipients);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipients();
  }, [user, isDemoMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user._id) {
      toast.error('You must be logged in to send messages');
      return;
    }
    
    if (!selectedRecipient) {
      toast.error('Please select a recipient');
      return;
    }
    
    if (!messageContent.trim()) {
      toast.error('Please write a message');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('/messages', {
        receiverId: selectedRecipient,
        content: messageContent.trim(),
      });
      
      if (response.data) {
        toast.success('Message sent successfully');
        
        // Small delay to make sure the message is registered in the mock data
        setTimeout(() => {
          navigate(`/messages/${selectedRecipient}`);
        }, 500);
      } else {
        throw new Error('No response data received');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Reset any errors when search term changes
  useEffect(() => {
    setFetchError(null);
  }, [searchTerm]);

  // Filter recipients based on search term
  const filteredRecipients = recipients.filter(
    recipient => recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading skeleton
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/messages')} 
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to messages"
        >
          <ArrowBackIcon />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Message</h1>
      </div>
      
      <div className="card relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg">
            <div className="spinner"></div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {recipients.length > 0 && (
            <div className="form-group">
              <label htmlFor="search" className="form-label">
                Search Recipients
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="recipient" className="form-label">
              Select Recipient
            </label>
            <select
              id="recipient"
              className="form-select"
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              required
              disabled={loading || sending}
            >
              <option value="">Choose who to message</option>
              {filteredRecipients.map(recipient => (
                <option key={recipient._id} value={recipient._id}>
                  {recipient.name} ({recipient.role})
                </option>
              ))}
            </select>
            {filteredRecipients.length === 0 && !loading && (
              <p className="mt-1 text-sm text-red-500">
                {fetchError ? fetchError : 
                  searchTerm ? 'No recipients match your search' : 'No recipients available'}
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea
              id="message"
              className="input-field min-h-[120px] resize-y"
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
              disabled={loading || sending}
              maxLength={1000}
            ></textarea>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                {messageContent.length > 0 && `${messageContent.length}/1000 characters`}
              </p>
              {isDemoMode && (
                <p className="text-xs text-orange-500">
                  Demo mode: Sending to demo recipients
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="btn-outline mr-3"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={sending || !selectedRecipient || !messageContent.trim()}
            >
              {sending ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </span>
              ) : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewMessage;