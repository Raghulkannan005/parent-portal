import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  Book as BookIcon,
  ErrorOutline as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Homework = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [filteredHomework, setFilteredHomework] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if we're in demo mode
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setIsDemoMode(token.startsWith('demo-token-'));
    
    // Set default class filter based on user role and students
    if (user?.role === 'parent') {
      // For parents, try to get their child's class
      fetchUserStudents();
    } else {
      // For teachers/admins, default to class 10-A
      setClassFilter('10');
      setSectionFilter('A');
    }
  }, [user]);

  // Fetch user's students if parent
  const fetchUserStudents = async () => {
    try {
      const response = await api.get('/students');
      if (response.data && response.data.length > 0) {
        // Use the first student's class and section as default
        setClassFilter(response.data[0].class || '10');
        setSectionFilter(response.data[0].section || 'A');
      } else {
        // Fallback
        setClassFilter('10');
        setSectionFilter('A');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback
      setClassFilter('10');
      setSectionFilter('A');
    }
  };

  // Fetch homework when filters change
  useEffect(() => {
    // Don't fetch if no class/section is selected
    if (!classFilter || !sectionFilter) return;
    
    const fetchHomework = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/homework', {
          params: { class: classFilter, section: sectionFilter }
        });
        
        if (Array.isArray(response.data)) {
          setHomework(response.data);
          setFilteredHomework(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching homework:', error);
        setError('Failed to load homework assignments');
        
        // In demo mode, provide sample data
        if (isDemoMode) {
          const demoData = [
            {
              _id: "hw1",
              title: "Math Assignment",
              description: "Complete problems 1-20 from Chapter 5. Focus on algebraic equations and show all your work.",
              class: classFilter,
              section: sectionFilter,
              subject: "Mathematics",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              uploadedBy: { name: "Mary Teacher" },
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: "hw2",
              title: "Science Project",
              description: "Prepare a presentation on renewable energy sources. Include at least 3 different types and explain their benefits and drawbacks.",
              class: classFilter,
              section: sectionFilter,
              subject: "Science",
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              uploadedBy: { name: "Mary Teacher" },
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: "hw3",
              title: "History Essay",
              description: "Write a 500-word essay on the Industrial Revolution and its impact on society.",
              class: classFilter,
              section: sectionFilter,
              subject: "History",
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              uploadedBy: { name: "Mary Teacher" },
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setHomework(demoData);
          setFilteredHomework(demoData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomework();
  }, [classFilter, sectionFilter, isDemoMode]);

  // Filter homework when search term or subject filter changes
  useEffect(() => {
    if (!homework.length) return;
    
    let filtered = [...homework];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        hw => 
          hw.title?.toLowerCase().includes(search) || 
          hw.description?.toLowerCase().includes(search) ||
          hw.subject?.toLowerCase().includes(search)
      );
    }
    
    if (subjectFilter) {
      filtered = filtered.filter(hw => hw.subject === subjectFilter);
    }
    
    setFilteredHomework(filtered);
  }, [homework, searchTerm, subjectFilter]);

  const handleClassChange = (e) => {
    setClassFilter(e.target.value);
  };

  const handleSectionChange = (e) => {
    setSectionFilter(e.target.value);
  };

  const handleSubjectFilter = (e) => {
    setSubjectFilter(e.target.value);
  };

  const handleRefresh = () => {
    if (classFilter && sectionFilter) {
      setIsLoading(true);
      setError(null);
      
      api.get('/homework', {
        params: { class: classFilter, section: sectionFilter }
      })
        .then(response => {
          if (Array.isArray(response.data)) {
            setHomework(response.data);
            setFilteredHomework(response.data);
            toast.success('Homework assignments refreshed');
          }
        })
        .catch(error => {
          console.error('Error refreshing homework:', error);
          toast.error('Failed to refresh homework assignments');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderHomeworkStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
          Overdue
        </span>
      );
    } else if (daysRemaining <= 2) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
          Due soon ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          {daysRemaining} days left
        </span>
      );
    }
  };

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(homework.map(hw => hw.subject).filter(Boolean))];

  // Display loading skeleton if user data not loaded
  if (!user) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-primary-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Refresh homework"
          >
            <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          {/* Only show add button for teachers */}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link to="/homework/create" className="btn-primary inline-flex items-center">
              <AddIcon className="mr-2" />
              Assign Homework
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search homework..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border
               rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2 items-center">
            <FilterIcon className="text-gray-400" />
            <select
              id="classFilter"
              value={classFilter}
              onChange={handleClassChange}
              className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Class</option>
              {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((classNum) => (
                <option key={classNum} value={classNum}>
                  Class {classNum}
                </option>
              ))}
            </select>
            
            <select
              id="sectionFilter"
              value={sectionFilter}
              onChange={handleSectionChange}
              className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Section</option>
              {['A', 'B', 'C', 'D', 'E'].map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subject filter */}
          <div>
            <select
              id="subjectFilter"
              value={subjectFilter}
              onChange={handleSubjectFilter}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading || uniqueSubjects.length === 0}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Homework List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start">
                <div className="rounded-full bg-gray-200 h-12 w-12 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <ErrorIcon className="text-red-500 text-4xl mb-2" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
          {isDemoMode && (
            <p className="mt-4 text-sm text-orange-500">
              You're in demo mode. Sample data will be shown.
            </p>
          )}
        </div>
      ) : filteredHomework.length > 0 ? (
        <div className="space-y-4">
          {filteredHomework.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4 flex-shrink-0">
                  <AssignmentIcon />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {assignment.title}
                    </h3>
                    {renderHomeworkStatus(assignment.dueDate)}
                  </div>
                  
                  <p className="mt-2 text-gray-600">
                    {assignment.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    {assignment.subject && (
                      <div className="flex items-center">
                        <BookIcon className="h-4 w-4 mr-1" />
                        {assignment.subject}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <CalendarTodayIcon className="h-4 w-4 mr-1" />
                      Due: {formatDate(assignment.dueDate)}
                    </div>
                    
                    {assignment.uploadedBy?.name && (
                      <div className="text-xs text-gray-500">
                        Assigned by: {assignment.uploadedBy.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500">
            <AssignmentIcon className="text-gray-300 text-4xl mx-auto mb-2" />
            <p className="mb-1">No homework assignments found.</p>
            <p className="text-sm text-gray-400">
              {searchTerm || subjectFilter
                ? "Try adjusting your search or filters."
                : `No homework assigned for Class ${classFilter}-${sectionFilter}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;