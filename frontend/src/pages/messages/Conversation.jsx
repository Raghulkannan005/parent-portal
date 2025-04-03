import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function Conversation() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/messages/conversation/${userId}`);
        setMessages(response.data);

        if (response.data.length > 0) {
          const msg = response.data[0];
          const other = msg.sender._id === user.id ? msg.receiver : msg.sender;
          setOtherUser(other);
        } else {
          const userResponse = await api.get(`/users/${userId}`);
          setOtherUser(userResponse.data);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        alert('Could not load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [user.id, userId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const response = await api.post('/messages', {
        receiverId: userId,
        content: messageInput,
      });
      setMessages([...messages, response.data]);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <button onClick={() => navigate('/messages')} className="btn btn-outline">
          Back to Messages
        </button>
        {otherUser && <h2>{otherUser.name}</h2>}
      </div>

      <div className="conversation-box" ref={scrollAreaRef}>
        {loading ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === user.id;
            return (
              <div
                key={message._id}
                className={`message ${isOwnMessage ? 'own-message' : ''}`}
              >
                <p>{message.content}</p>
                <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
              </div>
            );
          })
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}

export default Conversation;