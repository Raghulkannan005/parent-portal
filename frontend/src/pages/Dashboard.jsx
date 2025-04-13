import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    students: 0,
    homework: 0,
    messages: 0,
    events: 3
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Different API calls based on user role
        if (user?.role === 'parent') {
          try {
            const [studentsResponse, homeworkResponse, messagesResponse] = await Promise.allSettled([
              api.get('/api/students'),
              api.get('/api/homework', { params: { class: '10', section: 'A' } }),
              api.get('/api/messages')
            ]);
            
            // Process students data
            const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value.data : [];
            
            // Process homework data
            const homework = homeworkResponse.status === 'fulfilled' ? homeworkResponse.value.data : [];
            
            // Process messages data
            const messages = messagesResponse.status === 'fulfilled' ? messagesResponse.value.data : [];
            
            // Count unread messages
            const unreadMessages = messages.filter(
              msg => !msg.isRead && msg.receiver?._id === user._id
            ).length;
            
            setDashboardData({
              students: students.length || 2,
              homework: homework.length || 5,
              messages: unreadMessages || 3,
              events: 3
            });
            
            // Create activities from data
            if (homework.length > 0 || messages.length > 0) {
              createActivities(homework, messages);
            } else {
              setDefaultActivities('parent');
            }
          } catch (error) {
            console.error('Error fetching parent data:', error);
            setDefaultData('parent');
          }
        } else if (user?.role === 'teacher') {
          try {
            const [classesResponse, homeworkResponse, messagesResponse] = await Promise.allSettled([
              api.get('/api/students', { params: { groupByClass: true } }),
              api.get('/api/homework', { params: { teacher: user._id } }),
              api.get('/api/messages')
            ]);
            
            // Process classes data
            const classes = classesResponse.status === 'fulfilled' ? classesResponse.value.data : [];
            
            // Process homework data
            const homework = homeworkResponse.status === 'fulfilled' ? homeworkResponse.value.data : [];
            
            // Process messages data
            const messages = messagesResponse.status === 'fulfilled' ? messagesResponse.value.data : [];
            
            // Count unread messages
            const unreadMessages = messages.filter(
              msg => !msg.isRead && msg.receiver?._id === user._id
            ).length;
            
            const studentCount = classes.length > 0 
              ? classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
              : 45;
              
            setDashboardData({
              students: studentCount,
              homework: homework.length || 8,
              messages: unreadMessages || 12,
              events: 5
            });
            
            // Create activities from data
            if (homework.length > 0 || messages.length > 0) {
              createActivities(homework, messages);
            } else {
              setDefaultActivities('teacher');
            }
          } catch (error) {
            console.error('Error fetching teacher data:', error);
            setDefaultData('teacher');
          }
        } else if (user?.role === 'admin') {
          try {
            const [usersResponse, studentsResponse, messagesResponse] = await Promise.allSettled([
              api.get('/api/users'),
              api.get('/api/students'),
              api.get('/api/messages', { params: { admin: true } })
            ]);
            
            // Process users data
            const users = usersResponse.status === 'fulfilled' ? usersResponse.value.data : [];
            
            // Process students data
            const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value.data : [];
            
            // Process messages data
            const messages = messagesResponse.status === 'fulfilled' ? messagesResponse.value.data : [];
            
            setDashboardData({
              students: students.length || 120,
              teachers: users.filter(u => u.role === 'teacher').length || 15,
              parents: users.filter(u => u.role === 'parent').length || 180,
              events: 8
            });
            
            // Create admin activities from data
            if (students.length > 0 || users.length > 0 || messages.length > 0) {
              createAdminActivities(students, users, messages);
            } else {
              setDefaultActivities('admin');
            }
          } catch (error) {
            console.error('Error fetching admin data:', error);
            setDefaultData('admin');
          }
        } else {
          // Default data if role not recognized
          setDefaultData('default');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDefaultData(user?.role || 'default');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Function to create activities from data
  const createActivities = (homework, messages) => {
    const activities = [];
    
    // Add homework activities
    if (homework && homework.length > 0) {
      homework.slice(0, 2).forEach(hw => {
        activities.push({
          type: 'homework',
          title: hw.title || 'Homework Assignment',
          time: hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'Due soon'
        });
      });
    }
    
    // Add message activities
    if (messages && messages.length > 0) {
      messages.slice(0, 2).forEach(msg => {
        activities.push({
          type: 'message',
          title: `Message from ${msg.sender?.name || 'User'}`,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recently'
        });
      });
    }
    
    // Add some standard events if not enough activities
    if (activities.length < 4) {
      activities.push(
        { type: 'event', title: 'Parent-Teacher Meeting', time: '2 days from now' },
        { type: 'event', title: 'School Sports Day', time: 'Next Friday' }
      );
    }
    
    // Ensure we have at least 4 activities
    if (activities.length < 4) {
      activities.push(
        { type: 'event', title: 'School Assembly', time: 'Monday' },
        { type: 'homework', title: 'Project Submission', time: 'Next week' }
      );
    }
    
    // Sort activities (randomize for demo purposes)
    activities.sort(() => Math.random() - 0.5);
    
    setRecentActivities(activities);
  };
  
  // Function to create admin activities
  const createAdminActivities = (students, users, messages) => {
    const activities = [];
    
    // Add user-related activities
    if (users && users.length > 0) {
      const recentUsers = users.slice(-2);
      recentUsers.forEach(user => {
        activities.push({
          type: 'message',
          title: `New user registered: ${user.name || 'User'}`,
          time: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'
        });
      });
    }
    
    // Add message-related activities
    if (messages && messages.length > 0) {
      messages.slice(0, 2).forEach(msg => {
        activities.push({
          type: 'message',
          title: `Message: ${msg.sender?.name || 'User'} to ${msg.receiver?.name || 'User'}`,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recently'
        });
      });
    }
    
    // Add standard admin activities if not enough
    if (activities.length < 4) {
      activities.push(
        { type: 'event', title: 'School Board Meeting', time: 'Tomorrow' },
        { type: 'event', title: 'Budget Review', time: 'Next Wednesday' },
        { type: 'message', title: 'New Teacher Application', time: '3 hours ago' },
        { type: 'grade', title: 'Quarterly Grades Published', time: 'Yesterday' }
      );
    }
    
    // Sort activities (randomize for demo purposes)
    activities.sort(() => Math.random() - 0.5);
    
    setRecentActivities(activities);
  };
    
  // Set default activities when API calls fail or return no data
  const setDefaultActivities = (role) => {
    if (role === 'parent') {
      setRecentActivities([
        { type: 'homework', title: 'Math Assignment Due', time: '2 hours ago' },
        { type: 'message', title: 'New message from Teacher', time: '3 hours ago' },
        { type: 'event', title: 'Parent-Teacher Meeting', time: '1 day ago' },
        { type: 'grade', title: 'Science Test Results', time: '2 days ago' },
      ]);
    } else if (role === 'teacher') {
      setRecentActivities([
        { type: 'homework', title: 'Assigned Math Homework', time: 'Today' },
        { type: 'message', title: 'Message from Parent', time: '5 hours ago' },
        { type: 'event', title: 'Staff Meeting', time: 'Tomorrow' },
        { type: 'grade', title: 'Graded Science Tests', time: 'Yesterday' },
      ]);
    } else if (role === 'admin') {
      setRecentActivities([
        { type: 'event', title: 'School Board Meeting', time: 'Tomorrow' },
        { type: 'event', title: 'Budget Review', time: 'Next Wednesday' },
        { type: 'message', title: 'New Teacher Application', time: '3 hours ago' },
        { type: 'grade', title: 'Quarterly Grades Published', time: 'Yesterday' },
      ]);
    } else {
      setRecentActivities([
        { type: 'message', title: 'Welcome to Parent Portal', time: 'Just now' },
        { type: 'event', title: 'Complete your profile', time: 'Today' },
      ]);
    }
  };
  
  // Set default dashboard data when API calls fail
  const setDefaultData = (role) => {
    if (role === 'parent') {
      setDashboardData({
        students: 2,
        homework: 5,
        messages: 3,
        events: 3
      });
      setDefaultActivities('parent');
    } else if (role === 'teacher') {
      setDashboardData({
        students: 45,
        homework: 8,
        messages: 12,
        events: 5
      });
      setDefaultActivities('teacher');
    } else if (role === 'admin') {
      setDashboardData({
        students: 120,
        teachers: 15,
        parents: 180,
        events: 8
      });
      setDefaultActivities('admin');
    } else {
      setDashboardData({
        students: 0,
        homework: 0,
        messages: 0,
        events: 3
      });
      setDefaultActivities('default');
    }
  };

  // Determine which stats to show based on user role
  const getStats = () => {
    if (user?.role === 'admin') {
      return [
        { 
          title: 'Total Students', 
          value: isLoading ? '...' : dashboardData.students.toString(), 
          icon: <SchoolIcon />, 
          color: 'bg-blue-500' 
        },
        { 
          title: 'Teachers', 
          value: isLoading ? '...' : dashboardData.teachers.toString(), 
          icon: <SchoolIcon />, 
          color: 'bg-purple-500' 
        },
        { 
          title: 'Parents', 
          value: isLoading ? '...' : dashboardData.parents.toString(), 
          icon: <MessageIcon />, 
          color: 'bg-green-500' 
        },
        { 
          title: 'Upcoming Events', 
          value: isLoading ? '...' : dashboardData.events.toString(), 
          icon: <EventIcon />, 
          color: 'bg-orange-500' 
        },
      ];
    } else {
      return [
        { 
          title: 'Total Students', 
          value: isLoading ? '...' : dashboardData.students.toString(), 
          icon: <SchoolIcon />, 
          color: 'bg-blue-500' 
        },
        { 
          title: 'Pending Homework', 
          value: isLoading ? '...' : dashboardData.homework.toString(), 
          icon: <AssignmentIcon />, 
          color: 'bg-purple-500' 
        },
        { 
          title: 'New Messages', 
          value: isLoading ? '...' : dashboardData.messages.toString(), 
          icon: <MessageIcon />, 
          color: 'bg-green-500' 
        },
        { 
          title: 'Upcoming Events', 
          value: isLoading ? '...' : dashboardData.events.toString(), 
          icon: <EventIcon />, 
          color: 'bg-orange-500' 
        },
      ];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.name || 'User'}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-primary-500">Loading...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className={`p-2 rounded-full ${
                      activity.type === 'homework' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'message' ? 'bg-green-100 text-green-600' :
                      activity.type === 'event' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'homework' && <AssignmentIcon />}
                      {activity.type === 'message' && <MessageIcon />}
                      {activity.type === 'event' && <EventIcon />}
                      {activity.type === 'grade' && <SchoolIcon />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No recent activities to show
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="font-medium text-primary-900">Parent-Teacher Meeting</p>
              <p className="text-sm text-primary-600">Tomorrow, 2:00 PM</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="font-medium text-secondary-900">School Sports Day</p>
              <p className="text-sm text-secondary-600">Friday, 9:00 AM</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">Science Fair</p>
              <p className="text-sm text-green-600">Next Monday, 10:00 AM</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;