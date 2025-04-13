import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Add as AddIcon, 
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/students');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
        
        // Set default data in case of error
        setStudents([
          {
            _id: '1',
            name: 'Alex Smith',
            rollNumber: '101',
            class: '10',
            section: 'A',
            attendance: { present: 42, absent: 3, total: 45 }
          },
          {
            _id: '2',
            name: 'Emma Smith',
            rollNumber: '102',
            class: '8',
            section: 'B',
            attendance: { present: 40, absent: 5, total: 45 }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/students/add"
            className="btn-primary inline-flex items-center"
          >
            <AddIcon className="mr-2" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, roll number, class, or section..."
          className="input-field pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-primary-500">Loading students...</div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">Roll No: {student.rollNumber}</div>
                  <div className="mt-1 text-sm text-gray-500">Class: {student.class} {student.section}</div>
                  
                  <div className="mt-3 flex items-center">
                    <div className="text-xs font-medium text-gray-600">
                      Attendance: {student.attendance.present}/{student.attendance.total} days
                    </div>
                    <div className="ml-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(student.attendance.present / (student.attendance.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <Link 
                  to={`/students/${student._id}`}
                  className="p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors duration-200"
                >
                  <ArrowForwardIcon />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No students found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Students;