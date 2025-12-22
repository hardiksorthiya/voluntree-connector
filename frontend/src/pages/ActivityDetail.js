import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import { 
  CalendarIcon, MapPinIcon, UsersIcon, CheckIcon, ClockIcon, 
  PlusIcon, ArrowLeftIcon, EditIcon, TargetIcon, FileIcon 
} from '../components/Icons';
import '../css/ActivityDetail.css';

const ActivityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    totalHours: '',
    status: 'pending'
  });
  const [editTaskData, setEditTaskData] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    totalHours: '',
    status: 'pending'
  });
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(0);

  // Mock data - replace with API calls
  const mockActivities = [
    { 
      id: 1, 
      title: 'Community Cleanup', 
      description: 'Join us for a community cleanup event in Central Park. We\'ll be collecting trash and planting trees. This is a great opportunity to make a positive impact on our environment and connect with like-minded volunteers.',
      progress: 75, 
      date: '2024-01-15', 
      status: 'ongoing',
      location: 'Central Park, New York',
      volunteers: 45,
      maxVolunteers: 60,
      category: 'Environment',
      organization: 'Green Earth Initiative',
      createdAt: '2024-01-01',
      reports: [
        { id: 1, title: 'Week 1 Progress Report', date: '2024-01-08', content: 'Successfully recruited 30 volunteers. Initial cleanup areas identified.' },
        { id: 2, title: 'Week 2 Progress Report', date: '2024-01-15', content: 'Completed cleanup of northern section. 15 new volunteers joined.' }
      ]
    },
    { 
      id: 2, 
      title: 'Food Drive Campaign', 
      description: 'Help collect and distribute food to families in need.',
      progress: 100, 
      date: '2024-01-10', 
      status: 'completed',
      location: 'Multiple Locations',
      volunteers: 120,
      maxVolunteers: 120,
      category: 'Social Service',
      organization: 'Community Food Bank',
      createdAt: '2023-12-20',
      reports: []
    },
    { 
      id: 3, 
      title: 'Education Workshop', 
      description: 'Teach basic computer skills to underprivileged children.',
      progress: 45, 
      date: '2024-01-20', 
      status: 'ongoing',
      location: 'Community Center, Brooklyn',
      volunteers: 18,
      maxVolunteers: 40,
      category: 'Education',
      organization: 'Youth Education Foundation',
      createdAt: '2024-01-05',
      reports: []
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadActivity();
  }, [id, navigate]);

  const loadActivity = () => {
    // TODO: Replace with API call
    // const response = await api.get(`/activities/${id}`);
    const foundActivity = mockActivities.find(a => a.id === parseInt(id));
    
    if (foundActivity) {
      setActivity(foundActivity);
      setProgress(foundActivity.progress);
      // Load tasks for this activity
      const savedTasks = localStorage.getItem(`activity_${id}_tasks`);
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (error) {
          console.error('Error loading tasks:', error);
        }
      } else {
        // Default tasks
        setTasks([
          { 
            id: 1, 
            title: 'Coordinate volunteer schedules', 
            description: 'Schedule and coordinate all volunteer shifts for the event',
            startDate: '2024-01-10',
            dueDate: '2024-01-12',
            totalHours: '8',
            status: 'in-progress',
            completed: false 
          },
          { 
            id: 2, 
            title: 'Prepare event materials', 
            description: 'Gather and prepare all necessary materials and supplies',
            startDate: '2024-01-08',
            dueDate: '2024-01-10',
            totalHours: '6',
            status: 'completed',
            completed: true 
          },
          { 
            id: 3, 
            title: 'Contact local partners', 
            description: 'Reach out to local organizations for collaboration',
            startDate: '2024-01-12',
            dueDate: '2024-01-14',
            totalHours: '4',
            status: 'pending',
            completed: false 
          },
        ]);
      }
    } else {
      navigate('/activities');
    }
    setLoading(false);
  };

  const saveTasks = (updatedTasks) => {
    localStorage.setItem(`activity_${id}_tasks`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: taskFormData.title.trim(),
      description: taskFormData.description.trim(),
      startDate: taskFormData.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskFormData.dueDate || '',
      totalHours: taskFormData.totalHours || '',
      status: taskFormData.status,
      completed: taskFormData.status === 'completed'
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setTaskFormData({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      totalHours: '',
      status: 'pending'
    });
    setShowAddTask(false);
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTaskId(taskId);
      setEditTaskData({
        title: task.title,
        description: task.description || '',
        startDate: task.startDate || '',
        dueDate: task.dueDate || '',
        totalHours: task.totalHours || '',
        status: task.status
      });
    }
  };

  const handleEditTaskInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData({
      ...editTaskData,
      [name]: value
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTaskData.title.trim()) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTaskId) {
        return {
          ...task,
          title: editTaskData.title.trim(),
          description: editTaskData.description.trim(),
          startDate: editTaskData.startDate || '',
          dueDate: editTaskData.dueDate || '',
          totalHours: editTaskData.totalHours || '',
          status: editTaskData.status,
          completed: editTaskData.status === 'completed'
        };
      }
      return task;
    });

    saveTasks(updatedTasks);
    setEditingTaskId(null);
    setEditTaskData({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      totalHours: '',
      status: 'pending'
    });

    // Update progress based on completed tasks
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;
    
    if (activity && activity.status === 'ongoing') {
      updateProgress(newProgress);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskData({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      totalHours: '',
      status: 'pending'
    });
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        return { 
          ...task, 
          completed: newCompleted,
          status: newCompleted ? 'completed' : (task.status === 'completed' ? 'pending' : task.status)
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
    
    // Update progress based on completed tasks
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;
    
    if (activity && activity.status === 'ongoing') {
      updateProgress(newProgress);
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { 
        ...task, 
        status: newStatus,
        completed: newStatus === 'completed'
      } : task
    );
    saveTasks(updatedTasks);
    
    // Update progress based on completed tasks
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;
    
    if (activity && activity.status === 'ongoing') {
      updateProgress(newProgress);
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#2563eb';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    
    // Update progress
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;
    
    if (activity && activity.status === 'ongoing') {
      updateProgress(newProgress);
    }
  };

  const updateProgress = (newProgressValue) => {
    setProgress(newProgressValue);
    // TODO: Update via API
    // await api.put(`/activities/${id}`, { progress: newProgressValue });
    
    // Update local activity
    setActivity({
      ...activity,
      progress: newProgressValue
    });
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    if (newProgress >= 0 && newProgress <= 100) {
      updateProgress(newProgress);
      setShowProgressModal(false);
      setNewProgress(progress);
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

  if (loading) {
    return (
      <div className="activity-detail-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="activity-detail-container">
        <div className="error-message">Activity not found</div>
      </div>
    );
  }

  return (
    <div className="activity-detail-container">
      {/* Header */}
      <div className="activity-detail-header">
        <button onClick={() => navigate('/activities')} className="back-btn">
          <ArrowLeftIcon className="back-icon" />
          <span>Back to Activities</span>
        </button>
        <div className="header-actions">
          {activity.status === 'ongoing' && (
            <button 
              onClick={() => {
                setNewProgress(progress);
                setShowProgressModal(true);
              }}
              className="progress-btn"
            >
              <TargetIcon className="progress-icon" />
              <span>Update Progress</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Info Card */}
      <div className="activity-info-card">
        <div className="activity-info-header">
          <div>
            <h1>{activity.title}</h1>
            <div className="activity-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(activity.status) + '20', color: getStatusColor(activity.status) }}
              >
                {getStatusLabel(activity.status)}
              </span>
              <span className="category-badge">{activity.category}</span>
            </div>
          </div>
        </div>

        <p className="activity-description">{activity.description}</p>

        <div className="activity-info-grid">
          <div className="info-item">
            <CalendarIcon className="info-icon" />
            <div>
              <span className="info-label">Date</span>
              <span className="info-value">
                {new Date(activity.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="info-item">
            <MapPinIcon className="info-icon" />
            <div>
              <span className="info-label">Location</span>
              <span className="info-value">{activity.location}</span>
            </div>
          </div>

          <div className="info-item">
            <UsersIcon className="info-icon" />
            <div>
              <span className="info-label">Volunteers</span>
              <span className="info-value">{activity.volunteers} / {activity.maxVolunteers}</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-label">Organization</span>
            <span className="info-value">{activity.organization}</span>
          </div>
        </div>

        {activity.status === 'ongoing' && (
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%`, backgroundColor: getStatusColor(activity.status) }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      {activity.status === 'ongoing' && (
        <div className="tasks-section">
          <div className="section-header">
            <h2>Tasks</h2>
            <button 
              onClick={() => setShowAddTask(true)}
              className="add-task-btn"
            >
              <PlusIcon className="add-icon" />
              <span>Add Task</span>
            </button>
          </div>

          {showAddTask && (
            <form onSubmit={handleAddTask} className="add-task-form">
              <div className="form-group">
                <label htmlFor="task-title">Task Title *</label>
                <input
                  type="text"
                  id="task-title"
                  name="title"
                  placeholder="Enter task title..."
                  value={taskFormData.title}
                  onChange={handleTaskInputChange}
                  className="task-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Enter task description..."
                  value={taskFormData.description}
                  onChange={handleTaskInputChange}
                  className="task-textarea"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-start-date">Start Date</label>
                  <input
                    type="date"
                    id="task-start-date"
                    name="startDate"
                    value={taskFormData.startDate}
                    onChange={handleTaskInputChange}
                    className="task-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-due-date">Due Date</label>
                  <input
                    type="date"
                    id="task-due-date"
                    name="dueDate"
                    value={taskFormData.dueDate}
                    onChange={handleTaskInputChange}
                    className="task-input"
                    min={taskFormData.startDate || ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-total-hours">Total Working Hours</label>
                  <input
                    type="number"
                    id="task-total-hours"
                    name="totalHours"
                    value={taskFormData.totalHours}
                    onChange={handleTaskInputChange}
                    className="task-input"
                    placeholder="e.g., 8"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-status">Status *</label>
                  <select
                    id="task-status"
                    name="status"
                    value={taskFormData.status}
                    onChange={handleTaskInputChange}
                    className="task-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="task-form-actions">
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowAddTask(false); 
                    setTaskFormData({
                      title: '',
                      description: '',
                      startDate: '',
                      dueDate: '',
                      totalHours: '',
                      status: 'pending'
                    });
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Add Task</button>
              </div>
            </form>
          )}

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-tasks">
                <p>No tasks yet. Add your first task to get started!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-item">
                  {editingTaskId === task.id ? (
                    <form onSubmit={handleSaveEdit} className="edit-task-form">
                      <div className="form-group">
                        <label htmlFor={`edit-title-${task.id}`}>Task Title *</label>
                        <input
                          type="text"
                          id={`edit-title-${task.id}`}
                          name="title"
                          value={editTaskData.title}
                          onChange={handleEditTaskInputChange}
                          className="task-input"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`edit-description-${task.id}`}>Description</label>
                        <textarea
                          id={`edit-description-${task.id}`}
                          name="description"
                          value={editTaskData.description}
                          onChange={handleEditTaskInputChange}
                          className="task-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`edit-start-date-${task.id}`}>Start Date</label>
                          <input
                            type="date"
                            id={`edit-start-date-${task.id}`}
                            name="startDate"
                            value={editTaskData.startDate}
                            onChange={handleEditTaskInputChange}
                            className="task-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`edit-due-date-${task.id}`}>Due Date</label>
                          <input
                            type="date"
                            id={`edit-due-date-${task.id}`}
                            name="dueDate"
                            value={editTaskData.dueDate}
                            onChange={handleEditTaskInputChange}
                            className="task-input"
                            min={editTaskData.startDate || ''}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`edit-total-hours-${task.id}`}>Total Working Hours</label>
                          <input
                            type="number"
                            id={`edit-total-hours-${task.id}`}
                            name="totalHours"
                            value={editTaskData.totalHours}
                            onChange={handleEditTaskInputChange}
                            className="task-input"
                            placeholder="e.g., 8"
                            min="0"
                            step="0.5"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`edit-status-${task.id}`}>Status *</label>
                          <select
                            id={`edit-status-${task.id}`}
                            name="status"
                            value={editTaskData.status}
                            onChange={handleEditTaskInputChange}
                            className="task-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="task-form-actions">
                        <button 
                          type="button" 
                          onClick={handleCancelEdit}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="submit-btn">Save Changes</button>
                      </div>
                    </form>
                  ) : (
                    <div className="task-main-content">
                      <div className="task-header-row">
                        <div className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={() => toggleTask(task.id)}>
                          {task.completed && <CheckIcon className="check-icon" />}
                        </div>
                        <div className="task-title-section">
                          <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>
                            {task.title}
                          </h4>
                        </div>
                        <div className="task-actions">
                          <button 
                            onClick={() => handleEditTask(task.id)}
                            className="edit-task-btn"
                            title="Edit task"
                          >
                            <EditIcon className="edit-task-icon" />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="delete-task-btn"
                            title="Delete task"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      
                      <div className="task-footer">
                        <div className="task-info-container">
                          <div className="task-dates-container">
                            {task.startDate && (
                              <div className="task-date-item">
                                <CalendarIcon className="task-date-icon" />
                                <div className="task-date-content">
                                  <span className="task-date-label">START</span>
                                  <span className="task-date-value">
                                    {new Date(task.startDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="task-date-item">
                                <CalendarIcon className="task-date-icon" />
                                <div className="task-date-content">
                                  <span className="task-date-label">DUE</span>
                                  <span className="task-date-value">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          {task.totalHours && (
                            <div className="task-hours-item">
                              <ClockIcon className="task-hours-icon" />
                              <div className="task-hours-content">
                                <span className="task-hours-label">HOURS</span>
                                <span className="task-hours-value">{task.totalHours} hrs</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="task-status-container">
                          <label className="task-status-label">Status</label>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="task-status-select"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              borderColor: getTaskStatusColor(task.status),
                              backgroundColor: getTaskStatusColor(task.status) + '10'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reports Section */}
      <div className="reports-section">
        <div className="section-header">
          <h2>Reports</h2>
          <FileIcon className="section-icon" />
        </div>

        {activity.reports && activity.reports.length > 0 ? (
          <div className="reports-list">
            {activity.reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <h3>{report.title}</h3>
                  <span className="report-date">
                    {new Date(report.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <p className="report-content">{report.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-reports">
            <FileIcon className="empty-icon" />
            <p>No reports available yet</p>
          </div>
        )}
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Progress</h2>
              <button className="modal-close-btn" onClick={() => setShowProgressModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleProgressSubmit} className="progress-form">
              <div className="form-group">
                <label htmlFor="progress">Progress Percentage</label>
                <input
                  type="number"
                  id="progress"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
                  className="progress-input"
                />
                <div className="progress-preview">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${newProgress}%`, backgroundColor: getStatusColor(activity.status) }}
                    ></div>
                  </div>
                  <span className="progress-text">{newProgress}%</span>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowProgressModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetail;
