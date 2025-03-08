import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toZonedTime, format } from 'date-fns-tz';
import '../index.css';

// List component
function List() {
  // State variables
  const [newTask, setNewTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [priority, setPriority] = useState('Low');
  const [editedPriority, setEditedPriority] = useState('Low');
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('updatedAt-desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Constants 
  const uri = 'https://dwm-todolist-api.vercel.app'; // Backend URI
  const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch tasks from the server (GET)
  const fetchData = async () => {
    setError(''); // Reset error message
    try {
      const response = await axios.get(`${uri}/tasks`, { timeout: 5000 });
      const sortedTaskList = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const formattedTaskList = sortedTaskList.map(task => ({
        ...task,
        updatedAt: format(toZonedTime(new Date(task.updatedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz'),
        createdAt: format(toZonedTime(new Date(task.createdAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz'),
        dueDate: task.dueDate ? format(toZonedTime(new Date(task.dueDate), clientTimeZone), 'MMMM d, yyyy') : null,
        completedAt: task.completedAt ? format(toZonedTime(new Date(task.completedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
      }));
      setTaskList(formattedTaskList);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Cannot reach database');
      } else {
        setError('Failed to fetch tasks');
      }
    }
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Add task function
  const addTask = async () => {
    if (!newTask || !dueDate) {
      setError('Please enter a task and due date');
      return;
    }
    if (new Date(dueDate) < new Date()) {
      setError('Due date cannot be in the past');
      return;
    }
    try {
      const response = await axios.post(`${uri}/tasks`, {
        title: newTask,
        dueDate,
        priority,
      }, { timeout: 5000 });
      const formattedTask = {
        ...response.data,
        updatedAt: response.data.updatedAt ? format(toZonedTime(new Date(response.data.updatedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
        createdAt: response.data.createdAt ? format(toZonedTime(new Date(response.data.createdAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
        dueDate: response.data.dueDate ? format(toZonedTime(new Date(response.data.dueDate), clientTimeZone), 'MMMM d, yyyy') : null,
        priority: response.data.priority || 'Low',
        completedAt: response.data.completedAt ? format(toZonedTime(new Date(response.data.completedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
      };
      const updatedTaskList = [formattedTask, ...taskList].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setTaskList(updatedTaskList);
      setNewTask('');
      setDueDate('');
      setPriority('Low');
      setError('');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Cannot reach database');
      } else {
        setError('Failed to add task');
      }
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditedTask(task.title);
    setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
    setEditedPriority(task.priority);
  };

  // Update Task (PUT)
  const updateTask = async (taskId) => {
    setError(''); // Reset error message
    if (!editedTask.trim()) {
      setError('Task title cannot be empty.');
      return;
    }
    if (editedDueDate && new Date(editedDueDate) < new Date()) {
      setError('Please choose a future date and time.');
      return;
    }
    try {
      const response = await axios.put(`${uri}/tasks/${taskId}`, {
        title: editedTask,
        dueDate: editedDueDate,
        priority: editedPriority
      }, { timeout: 5000 });
      const updatedTaskList = taskList.map(task => 
        task._id === taskId ? {
          ...response.data,
          updatedAt: response.data.updatedAt ? format(toZonedTime(new Date(response.data.updatedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
          createdAt: response.data.createdAt ? format(toZonedTime(new Date(response.data.createdAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
          dueDate: response.data.dueDate ? format(toZonedTime(new Date(response.data.dueDate), clientTimeZone), 'MMMM d, yyyy') : null,
          completedAt: response.data.completedAt ? format(toZonedTime(new Date(response.data.completedAt), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null,
        } : task
      );
      setTaskList(updatedTaskList);
      setEditingId(null);
      setEditedTask('');
      setEditedDueDate('');
      setEditedPriority('Low');
      setError('');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Cannot reach database');
      } else {
        handleError(error);
      }
    }
  };

  // Toggle completion status (PATCH)
  const toggleTaskCompletion = async (taskId, completed) => {
    setError(''); // Reset error message
    const completedAtTimestamp = !completed ? format(toZonedTime(new Date(), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') : null;
    try {
      await axios.patch(`${uri}/tasks/${taskId}`, { completed: !completed, completedAt: completedAtTimestamp }, { timeout: 5000 });
      const updatedTaskList = taskList.map((task) => {
        if (task._id === taskId) {
          return { 
            ...task, 
            completed: !completed, 
            completedAt: completedAtTimestamp,
            updatedAt: format(toZonedTime(new Date(), clientTimeZone), 'MMMM d, yyyy h:mm a zzz') 
          };
        }
        return task;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setTaskList(updatedTaskList);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Cannot reach database');
      } else {
        handleError(error);
      }
    }
  };

  // Remove task (DELETE)
  const removeTask = async (taskId) => {
    setError(''); // Reset error message
    try {
      await axios.delete(`${uri}/tasks/${taskId}`, { timeout: 5000 });
      setTaskList(taskList.filter(task => task._id !== taskId));
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Cannot reach database');
      } else {
        handleError(error);
      }
    }
  };

  // Function to fetch client IP
  const fetchClientIp = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Failed to fetch client IP:', error);
      return 'Unknown IP';
    }
  };

  // Function to fetch geolocation
  const getGeolocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.error('Error getting geolocation: Permission denied');
                break;
              case error.POSITION_UNAVAILABLE:
                console.error('Error getting geolocation: Position unavailable');
                break;
              case error.TIMEOUT:
                console.error('Error getting geolocation: Timeout');
                break;
              default:
                console.error('Error getting geolocation:', error);
            }
            resolve({ latitude: 0, longitude: 0 });
          },
          { timeout: 10000 } // Increase timeout duration if needed
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        resolve({ latitude: 'Unknown', longitude: 'Unknown' });
      }
    });
  };

  // Handle errors
  const handleError = (error) => {
    if (error.message === 'Invalid time value') {
      setError('Pick a Due Date');
    } else if (error.response) {
      setError(`Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      setError("Network error: No response received from server");
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const formattedTime = toZonedTime(now, clientTimeZone, 'MMMM d, yyyy h:mm a zzz');
    return formattedTime;
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    const sorted = [...taskList].sort((a, b) => {
      const [key, direction] = order.split('-');
      if (key === 'title') {
        return direction === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
      } else if (key === 'priority') {
        const priorityOrder = { Low: 1, Medium: 2, High: 3 };
        return direction === 'asc' ? priorityOrder[a[key]] - priorityOrder[b[key]] : priorityOrder[b[key]] - priorityOrder[a[key]];
      } else {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    setTaskList(sorted);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Filter tasks based on completion status
  const filteredTasks = taskList.filter(task => {
    if (filterStatus === 'completed') {
      return task.completed;
    } else if (filterStatus === 'incomplete') {
      return !task.completed;
    } else {
      return true;
    }
  });

  // Separate tasks into incomplete and completed
  const incompleteTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  // Return JSX
  return (
    <React.StrictMode>
      <div id='container' onClick={() => setEditingId(null)}>
        {error && <div className="error">{error}</div>}
        <div className="inputContainer addContainer">
          <input
            autoFocus
            className="newTask"
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task"
          />
          <input
            className="newTask"
            type="date"
            value={dueDate ? new Date(dueDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            min={new Date().toISOString().slice(0, 10)}
            placeholder="Due Date"
          />
          <select 
            className="newTask"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Priority"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button className="addButton" onClick={addTask}>Add Task</button>
        </div>
        <div className="sortSection">
          <label className="label" htmlFor="sortTasks">Sort by: </label>
          <select id="sortTasks" value={sortOrder} onChange={handleSortChange}>
            <option className="sortOption" value="createdAt-asc">Created Date Ascending</option>
            <option className="sortOption" value="createdAt-desc">Created Date Descending</option>
            <option className="sortOption" value="completedAt-asc">Completed Date Ascending</option>
            <option className="sortOption" value="completedAt-desc">Completed Date Descending</option>
            <option className="sortOption" value="dueDate-asc">Due Date Ascending</option>
            <option className="sortOption" value="dueDate-desc">Due Date Descending</option>
            <option className="sortOption" value="priority-asc">Priority Ascending</option>
            <option className="sortOption" value="priority-desc">Priority Descending</option>
            <option className="sortOption" value="title-asc">Title Ascending</option>
            <option className="sortOption" value="title-desc">Title Descending</option>
            <option className="sortOption" value="updatedAt-asc">Updated Date Ascending</option>
            <option className="sortOption" value="updatedAt-desc">Updated Date Descending</option>
          </select>
          <label className="label" htmlFor="filterTasks">Filter by: </label>
          <select id="filterTasks" value={filterStatus} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {taskList.length > 0 ? (
          <div className="todo-container">
            <div className="incompleteTaskList" onClick={() => setEditingId(null)}>
              <h2 onClick={() => handleFilterChange({ target: { value: filterStatus === 'incomplete' ? 'all' : 'incomplete' } })}>Incomplete Tasks</h2>
              <ul className="taskList" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}>
                {incompleteTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <li
                      className={`listItem ${task.completed ? 'completedTask' : ''} ${isOverdue && !task.completed ? 'overdueIncompleteTask' : ''}`}
                      key={task._id}
                    >
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id, task.completed)}
                        onClick={(e) => { e.stopPropagation(); }}
                      />
                      {editingId === task._id && !task.completed ? (
                        <div className="editDiv">
                          <div className="editContainer">
                            <label className="editLabel">Edit Task:</label>
                            <input
                              className='editTask'
                              autoFocus
                              type="text"
                              value={editedTask}
                              onChange={(e) => setEditedTask(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                            />
                          </div>
                          {editedDueDate && (
                            <div className="editContainer">
                              <label className="editLabel">Edit Due Date:</label>
                              <input
                                className='editTask'
                                type="date"
                                value={editedDueDate ? new Date(editedDueDate).toISOString().slice(0, 10) : ''}
                                onChange={(e) => setEditedDueDate(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                                min={new Date().toISOString().slice(0, 10)}
                              />
                            </div>
                          )}
                          <div className="editContainer">
                            <label className="editLabel">Edit Priority:</label>
                            <select 
                              className="editTask"
                              value={editedPriority}
                              onChange={(e) => setEditedPriority(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <button
                            className="saveButton"
                            onClick={() => updateTask(task._id)}
                            onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                          >Save</button>
                        </div>
                      ) : (
                        <div className={`taskItem ${isOverdue ? 'overdueTaskItem' : ''} ${editingId === task._id ? 'editing' : ''}`}>
                          <div className="titleDiv"><span className="taskTitle">{task.title}</span></div>
                          <div className="timestampContainer">
                            {task.dueDate && <span className={`timestamp ${isOverdue ? 'overdue' : 'due'}`}>Due: {task.dueDate}</span>}
                            <span className="timestamp created">Created: {task.createdAt}</span>
                            <span className="timestamp updated">Updated: {task.updatedAt}</span>
                            <span className="timestamp priority">Priority: {task.priority}</span>
                            {task.completed && <span className="timestamp completed">Completed: {task.completedAt}</span>}
                          </div>
                        </div>
                      )}
                      <div className="taskActions">
                        {editingId !== task._id && (
                          <>
                            <button
                              className="editButton"
                              onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                              aria-label={`Edit task "${task.title}"`}
                            >Edit</button>
                            <button
                              className="removeButton"
                              onClick={(e) => { e.stopPropagation(); removeTask(task._id); }}
                              aria-label={`Remove task "${task.title}"`}
                            >Remove</button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="completedTaskList" onClick={() => setEditingId(null)}>
              <h2 onClick={() => handleFilterChange({ target: { value: filterStatus === 'completed' ? 'all' : 'completed' } })}>Completed Tasks</h2>
              <ul className="taskList" onClick={(e) => e.stopPropagation()}>
                {completedTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <li
                      className={`listItem ${task.completed ? 'completedTask' : ''} ${isOverdue && !task.completed ? 'overdueIncompleteTask' : ''}`}
                      key={task._id}
                    >
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id, task.completed)}
                        onClick={(e) => { e.stopPropagation(); }}
                      />
                      {editingId === task._id && !task.completed ? (
                        <div className="editDiv">
                          <div className="editContainer">
                            <label className="editLabel">Edit Task:</label>
                            <input
                              className='editTask'
                              autoFocus
                              type="text"
                              value={editedTask}
                              onChange={(e) => setEditedTask(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                            />
                          </div>
                          <div className="editContainer">
                            <label className="editLabel">Edit Due Date:</label>
                            <input
                              className='editTask'
                              type="datetime-local"
                              value={editedDueDate}
                              onChange={(e) => setEditedDueDate(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                              min={getCurrentDateTime()}
                            />
                          </div>
                          <div className="editContainer">
                            <label className="editLabel">Edit Priority:</label>
                            <select 
                              className="editTask"
                              value={editedPriority}
                              onChange={(e) => setEditedPriority(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <button
                            className="saveButton"
                            onClick={() => updateTask(task._id)}
                            onKeyDown={(e) => e.key === 'Enter' && updateTask(task._id)}
                          >Save</button>
                        </div>
                      ) : (
                        <div className={`taskItem ${isOverdue ? 'overdueTaskItem' : ''} ${editingId === task._id ? 'editing' : ''}`}>
                          <div className="titleDiv"><span className="taskTitle">{task.title}</span></div>
                          <div className="timestampContainer">
                            {task.dueDate && <span className={`timestamp ${isOverdue ? 'overdue' : ''}`}>Due: {task.dueDate}</span>}
                            <span className="timestamp created">Created: {task.createdAt}</span>
                            <span className="timestamp updated">Updated: {task.updatedAt}</span>
                            <span className="timestamp priority">Priority: {task.priority}</span>
                            {task.completed && <span className="timestamp completed">Completed: {task.completedAt}</span>}
                          </div>
                        </div>
                      )}
                      <div className="taskActions">
                        {editingId !== task._id && (
                          <>
                            <button
                              className="removeButton"
                              onClick={(e) => { e.stopPropagation(); removeTask(task._id); }}
                              aria-label={`Remove task "${task.title}"`}
                            >Remove</button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", fontSize: "24px", fontStyle: "bold", margin: "1.5rem",  }} className="noTasksMessage">
            {error === 'Cannot reach database' ? 'Unable to reach database' : 'Wait while tasks load...'}
          </div>
        )}
      </div>
    </React.StrictMode>
  );
}

export default List;
