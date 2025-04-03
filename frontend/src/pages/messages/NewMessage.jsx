import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function NewMessage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch potential recipients
  useEffect(() => {
    const fetchRecipients = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/available');
        setRecipients(response.data);
      } catch (error) {
        console.error('Error fetching recipients:', error);
        alert('Could not load recipients');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipients();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedRecipient || !messageContent.trim()) {
      alert('Please select a recipient and write a message');
      return;
    }
    
    setSending(true);
    try {
      api.post('/messages', {
        receiverId: selectedRecipient,
        content: messageContent,
      })
      .then(() => {
        alert('Message sent successfully');
        navigate(`/messages/${selectedRecipient}`);
      })
      .catch(error => {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      })
      .finally(() => {
        setSending(false);
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSending(false);
    }
  };

  // Filter recipients based on search term
  const filteredRecipients = recipients.filter(
    recipient => recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header-row">
        <button 
          onClick={() => navigate('/messages')} 
          className="btn btn-outline"
        >
          Back to Messages
        </button>
        <h2>New Message</h2>
      </div>
      
      <div className="card">
        {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="search">Search Recipients</label>
            <input
              id="search"
              type="text"
              className="form-input"
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="recipient">Select Recipient</label>
            <select
              id="recipient"
              className="form-select"
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              required
            >
              <option value="">Choose who to message</option>
              {filteredRecipients.map(recipient => (
                <option key={recipient._id} value={recipient._id}>
                  {recipient.name} ({recipient.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              className="form-textarea"
              placeholder="Type your message here..."
              rows="5"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewMessage;