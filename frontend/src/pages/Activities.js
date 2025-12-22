import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { CalendarIcon, MapPinIcon, UsersIcon, CheckIcon, ClockIcon, SearchIcon, FilterIcon, ActivitiesIcon, PlusIcon } from '../components/Icons';
import '../css/Activities.css';

const Activities = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, ongoing, completed, upcoming
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    organization: '',
    status: 'upcoming'
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock data - replace with API calls
  const [activities, setActivities] = useState([
    { 
      id: 1, 
      title: 'Community Cleanup', 
      description: 'Join us for a community cleanup event in Central Park. We\'ll be collecting trash and planting trees.',
      progress: 75, 
      date: '2024-01-15', 
      status: 'ongoing',
      location: 'Central Park, New York',
      volunteers: 45,
      maxVolunteers: 60,
      category: 'Environment',
      organization: 'Green Earth Initiative'
    },
    { 
      id: 2, 
      title: 'Food Drive Campaign', 
      description: 'Help collect and distribute food to families in need. Multiple drop-off locations available.',
      progress: 100, 
      date: '2024-01-10', 
      status: 'completed',
      location: 'Multiple Locations',
      volunteers: 120,
      maxVolunteers: 120,
      category: 'Social Service',
      organization: 'Community Food Bank'
    },
    { 
      id: 3, 
      title: 'Education Workshop', 
      description: 'Teach basic computer skills to underprivileged children. Materials and training provided.',
      progress: 45, 
      date: '2024-01-20', 
      status: 'ongoing',
      location: 'Community Center, Brooklyn',
      volunteers: 18,
      maxVolunteers: 40,
      category: 'Education',
      organization: 'Youth Education Foundation'
    },
    { 
      id: 4, 
      title: 'Health Check-up Drive', 
      description: 'Free health check-ups for the elderly. Medical professionals needed.',
      progress: 30, 
      date: '2024-01-25', 
      status: 'upcoming',
      location: 'Senior Center, Queens',
      volunteers: 8,
      maxVolunteers: 25,
      category: 'Healthcare',
      organization: 'Health for All'
    },
    { 
      id: 5, 
      title: 'Beach Cleanup', 
      description: 'Clean up the beach and raise awareness about ocean pollution.',
      progress: 0, 
      date: '2024-02-05', 
      status: 'upcoming',
      location: 'Coney Island Beach',
      volunteers: 0,
      maxVolunteers: 50,
      category: 'Environment',
      organization: 'Ocean Guardians'
    },
    { 
      id: 6, 
      title: 'Reading Program', 
      description: 'Read books to children at the local library. Help promote literacy.',
      progress: 100, 
      date: '2024-01-05', 
      status: 'completed',
      location: 'Public Library, Manhattan',
      volunteers: 30,
      maxVolunteers: 30,
      category: 'Education',
      organization: 'Literacy Foundation'
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUser();
    // TODO: Fetch activities from API
    // fetchActivities();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return '#2563eb';
      case 'completed':
        return '#10b981';
      case 'upcoming':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.organization.trim()) {
      errors.organization = 'Organization is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create new activity
    const newActivity = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      location: formData.location,
      volunteers: 0,
      maxVolunteers: 50, // Default value
      category: formData.category,
      organization: formData.organization,
      status: formData.status,
      progress: formData.status === 'upcoming' ? 0 : formData.status === 'ongoing' ? 10 : 100
    };

    // Add to activities list
    setActivities([newActivity, ...activities]);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      category: '',
      organization: '',
      status: 'upcoming'
    });
    setFormErrors({});
    setShowAddForm(false);

    // TODO: Replace with API call
    // await api.post('/activities', newActivity);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      category: '',
      organization: '',
      status: 'upcoming'
    });
    setFormErrors({});
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || activity.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="activities-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="activities-container">
      <div className="activities-header">
        <div>
          <h1>My Activities</h1>
          <p>View and manage all your volunteer activities</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-activity-btn"
        >
          <PlusIcon className="add-icon" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="activities-controls">
        <div className="search-box">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <FilterIcon className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="activities-grid">
        {filteredActivities.length === 0 ? (
          <div className="activities-empty">
            <ActivitiesIcon className="empty-icon" />
            <h3>No activities found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-card"
              onClick={() => navigate(`/activities/${activity.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="activity-card-header">
                <div className="activity-title-section">
                  <h3 className="activity-title">{activity.title}</h3>
                  <span 
                    className="activity-status-badge"
                    style={{ backgroundColor: getStatusColor(activity.status) + '20', color: getStatusColor(activity.status) }}
                  >
                    {getStatusLabel(activity.status)}
                  </span>
                </div>
                <span className="activity-category">{activity.category}</span>
              </div>

              <p className="activity-description">{activity.description}</p>

              <div className="activity-details">
                <div className="activity-detail-item">
                  <CalendarIcon className="detail-icon" />
                  <span>{new Date(activity.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="activity-detail-item">
                  <MapPinIcon className="detail-icon" />
                  <span>{activity.location}</span>
                </div>

                <div className="activity-detail-item">
                  <UsersIcon className="detail-icon" />
                  <span>{activity.volunteers} / {activity.maxVolunteers} volunteers</span>
                </div>

                <div className="activity-detail-item">
                  <span className="activity-org">{activity.organization}</span>
                </div>
              </div>

              {activity.status !== 'completed' && activity.status !== 'upcoming' && (
                <div className="activity-progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{activity.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${activity.progress}%`, backgroundColor: getStatusColor(activity.status) }}
                    ></div>
                  </div>
                </div>
              )}

              {activity.status === 'upcoming' && (
                <div className="activity-upcoming-badge">
                  <ClockIcon className="clock-icon" />
                  <span>Starts {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {activity.status === 'completed' && (
                <div className="activity-completed-badge">
                  <CheckIcon className="check-icon" />
                  <span>Completed on {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Activity</h2>
              <button className="modal-close-btn" onClick={handleCloseForm}>
                <span>&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="activity-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Activity Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Community Cleanup"
                    className={formErrors.title ? 'input-error' : ''}
                  />
                  {formErrors.title && <span className="error-message">{formErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Environment"
                    className={formErrors.category ? 'input-error' : ''}
                  />
                  {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the activity..."
                  rows="4"
                  className={formErrors.description ? 'input-error' : ''}
                />
                {formErrors.description && <span className="error-message">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={formErrors.date ? 'input-error' : ''}
                  />
                  {formErrors.date && <span className="error-message">{formErrors.date}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Central Park, New York"
                  className={formErrors.location ? 'input-error' : ''}
                />
                {formErrors.location && <span className="error-message">{formErrors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization *</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="e.g., Green Earth Initiative"
                  className={formErrors.organization ? 'input-error' : ''}
                />
                {formErrors.organization && <span className="error-message">{formErrors.organization}</span>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
