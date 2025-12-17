import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  // State for managing todos list
  const [todos, setTodos] = useState([]);
  
  // State for input field
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [recurring, setRecurring] = useState('none');
  
  // State for editing mode
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editCategory, setEditCategory] = useState('Personal');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editRecurring, setEditRecurring] = useState('none');
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Theme state
  const [theme, setTheme] = useState('light');
  
  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Subtasks state for editing
  const [editingSubtasks, setEditingSubtasks] = useState({});

  // Update daily streak
  const updateStreak = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedDates = todos
      .filter(todo => todo.completed && todo.completedAt)
      .map(todo => {
        const date = new Date(todo.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
    
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => b - a);
    
    if (uniqueDates.length === 0) {
      localStorage.setItem('streak', '0');
      localStorage.setItem('lastStreakDate', '');
      return;
    }
    
    const todayTime = today.getTime();
    let streak = 0;
    let currentDate = todayTime;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateTime = uniqueDates[i];
      const diff = currentDate - dateTime;
      
      if (diff === 0 || diff === 86400000) {
        streak++;
        currentDate = dateTime;
      } else if (diff > 86400000) {
        break;
      }
    }
    
    const lastStreakDate = uniqueDates[0] ? new Date(uniqueDates[0]).toDateString() : '';
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastStreakDate', lastStreakDate);
  }, [todos]);

  // Check for due/overdue todos and send notifications
  const checkDueTodos = useCallback(() => {
    if (!notificationsEnabled || notificationPermission !== 'granted') return;
    
    const now = new Date();
    const notifiedTodos = JSON.parse(localStorage.getItem('notifiedTodos') || '[]');
    const newNotifiedTodos = [...notifiedTodos];
    
    todos.forEach(todo => {
      if (!todo.dueDate || todo.completed) return;
      
      // Check if already notified for this todo
      const alreadyNotified = notifiedTodos.includes(todo.id);
      
      // Calculate due date/time
      const due = new Date(todo.dueDate);
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':');
        due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        due.setHours(23, 59, 59, 999);
      }
      
      // Check if due time has been reached (within 1 minute tolerance)
      const timeDiff = now.getTime() - due.getTime();
      const isDue = timeDiff >= 0 && timeDiff <= 60000; // Within 1 minute after due time
      const isOverdue = timeDiff > 60000; // More than 1 minute past due time
      
      // Send notification for overdue todos
      if (isOverdue && !alreadyNotified) {
        const timeStr = todo.dueTime ? ` at ${todo.dueTime}` : '';
        new Notification(`⚠️ Overdue: ${todo.text}`, {
          body: `Due: ${todo.dueDate}${timeStr}`,
          icon: '/favicon.ico',
          tag: `overdue-${todo.id}`,
          requireInteraction: false
        });
        newNotifiedTodos.push(todo.id);
      }
      
      // Send notification when due time is reached
      if (isDue && !alreadyNotified && !isOverdue) {
        const timeStr = todo.dueTime ? ` at ${todo.dueTime}` : '';
        new Notification(`⏰ Due Now: ${todo.text}`, {
          body: `Due: ${todo.dueDate}${timeStr}`,
          icon: '/favicon.ico',
          tag: `due-${todo.id}`,
          requireInteraction: false
        });
        newNotifiedTodos.push(todo.id);
      }
    });
    
    // Clean up notified todos that are no longer due or have been completed
    const activeNotifiedTodos = newNotifiedTodos.filter(id => {
      const todo = todos.find(t => t.id === id);
      if (!todo || todo.completed) return false;
      if (!todo.dueDate) return false;
      
      const due = new Date(todo.dueDate);
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':');
        due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      // Keep if still due or overdue
      return due <= now;
    });
    
    localStorage.setItem('notifiedTodos', JSON.stringify(activeNotifiedTodos));
  }, [todos, notificationsEnabled, notificationPermission]);

  // Load todos and preferences from localStorage when component mounts
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        const migratedTodos = parsedTodos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt || todo.id,
          dueDate: todo.dueDate || null,
          dueTime: todo.dueTime || null,
          category: todo.category || 'Personal',
          priority: todo.priority || 'Medium',
          subtasks: todo.subtasks || [],
          recurring: todo.recurring || 'none',
          parentId: todo.parentId || null
        }));
        setTodos(migratedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    if (savedNotifications === 'true') {
      setNotificationsEnabled(true);
    }
    
    // Request notification permission on app load (only once)
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setNotificationPermission(currentPermission);
      
      if (currentPermission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
      } else if (currentPermission === 'default') {
        // Ask for permission only once on first load
        const permissionAsked = localStorage.getItem('notificationPermissionAsked');
        if (!permissionAsked) {
          Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
            if (permission === 'granted') {
              setNotificationsEnabled(true);
              localStorage.setItem('notificationsEnabled', 'true');
            }
            localStorage.setItem('notificationPermissionAsked', 'true');
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (todos.length > 0 || localStorage.getItem('todos')) {
      updateStreak();
      checkDueTodos();
    }
  }, [todos, updateStreak, checkDueTodos]);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]);

  // Check for due todos every minute to catch exact due times
  useEffect(() => {
    if (!notificationsEnabled || notificationPermission !== 'granted') return;
    
    // Check immediately
    checkDueTodos();
    
    // Then check every minute
    const interval = setInterval(() => {
      checkDueTodos();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkDueTodos, notificationsEnabled, notificationPermission]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Calculate accuracy
  const calculateAccuracy = (period) => {
    const now = new Date();
    let startDate;
    
    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const periodTodos = todos.filter(todo => {
      const createdDate = new Date(todo.createdAt);
      return createdDate >= startDate;
    });
    
    if (periodTodos.length === 0) return 0;
    
    const completed = periodTodos.filter(todo => todo.completed).length;
    return Math.round((completed / periodTodos.length) * 100);
  };

  const getStreak = () => {
    const streak = localStorage.getItem('streak');
    return streak ? parseInt(streak) : 0;
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return;
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
      }
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('notificationsEnabled', 'true');
    } else {
      alert('Notification permission was denied. Please enable it in your browser settings.');
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      localStorage.setItem('notificationsEnabled', newState.toString());
      
      // Clear notified todos when disabling notifications
      if (!newState) {
        localStorage.removeItem('notifiedTodos');
      }
    }
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const now = new Date();
    const due = new Date(todo.dueDate);
    if (todo.dueTime) {
      const [hours, minutes] = todo.dueTime.split(':');
      due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      due.setHours(23, 59, 59, 999);
    }
    return due < now;
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    if (timeString) {
      return `${dateStr} ${timeString}`;
    }
    return dateStr;
  };

  // Handle recurring todos
  const handleRecurringTodo = (todo) => {
    if (todo.recurring === 'none' || !todo.completed) return;
    
    const nextDate = new Date();
    if (todo.recurring === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (todo.recurring === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (todo.recurring === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    const newTodo = {
      id: Date.now(),
      text: todo.text,
      completed: false,
      createdAt: Date.now(),
      dueDate: todo.dueDate ? nextDate.toISOString().split('T')[0] : null,
      dueTime: todo.dueTime || null,
      category: todo.category,
      priority: todo.priority,
      subtasks: todo.subtasks ? todo.subtasks.map(st => ({ ...st, completed: false })) : [],
      recurring: todo.recurring,
      parentId: todo.id
    };
    
    setTodos(prev => [...prev, newTodo]);
  };

  const addTodo = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      alert('Please enter a todo item');
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: trimmedValue,
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      category: category,
      priority: priority,
      subtasks: [],
      recurring: recurring,
      parentId: null
    };

    setTodos([...todos, newTodo]);
    setInputValue('');
    setDueDate('');
    setDueTime('');
    setCategory('Personal');
    setPriority('Medium');
    setRecurring('none');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id && todo.parentId !== id));
    
    if (editingId === id) {
      setEditingId(null);
      setEditValue('');
      setEditDueDate('');
      setEditDueTime('');
    }
  };

  const editTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingId(id);
      setEditValue(todo.text);
      setEditDueDate(todo.dueDate || '');
      setEditDueTime(todo.dueTime || '');
      setEditCategory(todo.category || 'Personal');
      setEditPriority(todo.priority || 'Medium');
      setEditRecurring(todo.recurring || 'none');
      setEditingSubtasks({ ...todo.subtasks || [] });
    }
  };

  const saveEdit = (id) => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      alert('Todo item cannot be empty');
      return;
    }

    setTodos(todos.map(todo =>
      todo.id === id ? {
        ...todo,
        text: trimmedValue,
        dueDate: editDueDate || null,
        dueTime: editDueTime || null,
        category: editCategory,
        priority: editPriority,
        recurring: editRecurring,
        subtasks: Object.values(editingSubtasks)
      } : todo
    ));
    
    setEditingId(null);
    setEditValue('');
    setEditDueDate('');
    setEditDueTime('');
    setEditingSubtasks({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditDueDate('');
    setEditDueTime('');
    setEditingSubtasks({});
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updated = {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? Date.now() : null
        };
        
        if (updated.completed) {
          handleRecurringTodo(updated);
        }
        
        return updated;
      }
      return todo;
    }));
  };

  const toggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        const updatedSubtasks = (todo.subtasks || []).map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...todo, subtasks: updatedSubtasks };
      }
      return todo;
    }));
  };

  // Filter and sort todos
  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || todo.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateA = new Date(a.dueDate + (a.dueTime ? ` ${a.dueTime}` : ''));
        const dateB = new Date(b.dueDate + (b.dueTime ? ` ${b.dueTime}` : ''));
        return dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (sortBy === 'completed') {
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      }
      return 0;
    });

  // Export todos
  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import todos
  const importTodos = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setTodos(imported);
          alert('Todos imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing todos: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const dailyAccuracy = calculateAccuracy('daily');
  const weeklyAccuracy = calculateAccuracy('weekly');
  const monthlyAccuracy = calculateAccuracy('monthly');
  const currentStreak = getStreak();

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <div className={`app theme-${theme}`}>
      <div className="container">
        <div className="header">
          <div className="header-title-section">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Todo List Logo" className="app-logo" />
            <h1>My Todo List</h1>
          </div>
          <div className="header-controls">
            <select
              className="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              title="Select Theme"
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
              <option value="blue">🔵 Blue</option>
              <option value="green">🟢 Green</option>
            </select>
            <button
              className={`btn btn-notifications ${notificationsEnabled ? 'active' : ''}`}
              onClick={toggleNotifications}
              title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            >
              {notificationsEnabled ? '🔔' : '🔕'}
            </button>
            <Link to="/report" className="btn btn-report">
              📊 Report
            </Link>
          </div>
        </div>

        <div className="stats-section">
          <div className="streak-display">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">{currentStreak}-day streak</span>
          </div>
          
          <div className="accuracy-section">
            <h3>Completion Accuracy</h3>
            <div className="accuracy-grid">
              <div className="accuracy-item">
                <div className="accuracy-label">Daily</div>
                <div className="accuracy-value">{dailyAccuracy}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${dailyAccuracy}%` }}></div>
                </div>
              </div>
              <div className="accuracy-item">
                <div className="accuracy-label">Weekly</div>
                <div className="accuracy-value">{weeklyAccuracy}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${weeklyAccuracy}%` }}></div>
                </div>
              </div>
              <div className="accuracy-item">
                <div className="accuracy-label">Monthly</div>
                <div className="accuracy-value">{monthlyAccuracy}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${monthlyAccuracy}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{todos.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value completed">{completedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">{pendingCount}</span>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>
            
            <select
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="completed">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="add-todo-form">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new todo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <input
            type="date"
            className="date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            title="Due Date"
          />
          <input
            type="time"
            className="time-input"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            title="Due Time"
          />
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
          </select>
          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            className="recurring-select"
            value={recurring}
            onChange={(e) => setRecurring(e.target.value)}
          >
            <option value="none">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button className="btn btn-add" onClick={addTodo}>
            Add
          </button>
        </div>

        <div className="import-export">
          <label className="btn btn-import">
            📥 Import
            <input type="file" accept=".json" onChange={importTodos} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-export" onClick={exportTodos}>
            📤 Export
          </button>
        </div>

        <div className="todo-list">
          {filteredAndSortedTodos.length === 0 ? (
            <p className="empty-message">No todos found. Add one above!</p>
          ) : (
            filteredAndSortedTodos.map(todo => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue(todo) ? 'overdue' : ''} priority-${todo.priority?.toLowerCase() || 'medium'}`}
              >
                {editingId === todo.id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      className="edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <div className="edit-fields">
                      <input
                        type="date"
                        className="edit-date-input"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                      <input
                        type="time"
                        className="edit-time-input"
                        value={editDueTime}
                        onChange={(e) => setEditDueTime(e.target.value)}
                      />
                      <select
                        className="edit-category-select"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      >
                        <option value="Work">Work</option>
                        <option value="Study">Study</option>
                        <option value="Personal">Personal</option>
                      </select>
                      <select
                        className="edit-priority-select"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <select
                        className="edit-recurring-select"
                        value={editRecurring}
                        onChange={(e) => setEditRecurring(e.target.value)}
                      >
                        <option value="none">No Recurrence</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="subtasks-edit">
                      <div className="subtasks-header">Subtasks:</div>
                      {Object.values(editingSubtasks).map(st => (
                        <div key={st.id} className="subtask-edit-item">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => {
                              setEditingSubtasks({
                                ...editingSubtasks,
                                [st.id]: { ...st, completed: !st.completed }
                              });
                            }}
                          />
                          <input
                            type="text"
                            value={st.text}
                            onChange={(e) => {
                              setEditingSubtasks({
                                ...editingSubtasks,
                                [st.id]: { ...st, text: e.target.value }
                              });
                            }}
                          />
                          <button
                            className="btn btn-small btn-delete"
                            onClick={() => {
                              const newSubtasks = { ...editingSubtasks };
                              delete newSubtasks[st.id];
                              setEditingSubtasks(newSubtasks);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn btn-small btn-add-subtask"
                        onClick={() => {
                          const newId = Date.now();
                          setEditingSubtasks({
                            ...editingSubtasks,
                            [newId]: { id: newId, text: '', completed: false }
                          });
                        }}
                      >
                        + Add Subtask
                      </button>
                    </div>
                    <div className="edit-buttons">
                      <button className="btn btn-save" onClick={() => saveEdit(todo.id)}>
                        Save
                      </button>
                      <button className="btn btn-cancel" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-content">
                    <div className="todo-left">
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                      />
                      <div className="todo-text-wrapper">
                        <div className="todo-header">
                          <span className="todo-text">{todo.text}</span>
                          <span className={`priority-badge priority-${todo.priority?.toLowerCase() || 'medium'}`}>
                            {todo.priority}
                          </span>
                          <span className="category-badge">{todo.category}</span>
                          {todo.recurring !== 'none' && (
                            <span className="recurring-badge">🔁 {todo.recurring}</span>
                          )}
                        </div>
                        {todo.dueDate && (
                          <span className={`todo-due-date ${isOverdue(todo) ? 'overdue' : ''}`}>
                            ⏰ {formatDateTime(todo.dueDate, todo.dueTime)}
                            {isOverdue(todo) && ' (Overdue)'}
                          </span>
                        )}
                        {todo.subtasks && todo.subtasks.length > 0 && (
                          <div className="subtasks-display">
                            <div className="subtasks-progress">
                              {todo.subtasks.filter(st => st.completed).length} / {todo.subtasks.length} subtasks completed
                            </div>
                            {todo.subtasks.map(st => (
                              <div key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => toggleSubtask(todo.id, st.id)}
                                />
                                <span>{st.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => editTodo(todo.id)}
                        disabled={todo.completed}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
