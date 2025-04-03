import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    homework: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const studentsResponse = await api.get('/students');
        const homeworkResponse = await api.get('/homework');
        const messagesResponse = await api.get('/messages');

        setStats({
          students: studentsResponse.data.length,
          homework: homeworkResponse.data.length,
          messages: messagesResponse.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat-card">
          <h3>Students</h3>
          <p>{loading ? 'Loading...' : stats.students}</p>
          <Link to="/students">View Students</Link>
        </div>
        <div className="stat-card">
          <h3>Homework</h3>
          <p>{loading ? 'Loading...' : stats.homework}</p>
          <Link to="/homework">View Homework</Link>
        </div>
        <div className="stat-card">
          <h3>Messages</h3>
          <p>{loading ? 'Loading...' : stats.messages}</p>
          <Link to="/messages">View Messages</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;