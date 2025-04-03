import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get('/messages');
        setMessages(response.data);

        const convMap = new Map();
        response.data.forEach((msg) => {
          const otherId = msg.sender._id === user.id ? msg.receiver._id : msg.sender._id;
          const otherName = msg.sender._id === user.id ? msg.receiver.name : msg.sender.name;

          if (!convMap.has(otherId)) {
            convMap.set(otherId, {
              id: otherId,
              name: otherName,
              lastMessage: msg,
              unreadCount: msg.sender._id !== user.id && !msg.isRead ? 1 : 0,
            });
          } else {
            const conv = convMap.get(otherId);
            if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
              conv.lastMessage = msg;
            }
            if (msg.sender._id !== user.id && !msg.isRead) {
              conv.unreadCount += 1;
            }
          }
        });

        setConversations(
          Array.from(convMap.values()).sort(
            (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
          )
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user.id]);

  const filteredConversations = conversations.filter(
    (conv) =>
      searchTerm === '' || conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header-row">
        <h2>Messages</h2>
        <Link to="/messages/new" className="btn btn-primary">
          New Message
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredConversations.length === 0 ? (
        <p>No conversations found. Start a new message to begin.</p>
      ) : (
        <ul className="conversation-list">
          {filteredConversations.map((conversation) => (
            <li key={conversation.id} className="conversation-card">
              <Link to={`/messages/${conversation.id}`}>
                <div className="conversation-header">
                  <div className="conversation-avatar">
                    {conversation.name.charAt(0)}
                  </div>
                  <div className="conversation-info">
                    <h3>{conversation.name}</h3>
                    <p>
                      {conversation.lastMessage.sender._id === user.id ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
                <div className="conversation-meta">
                  <span>
                    {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="badge">{conversation.unreadCount} new</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Messages;