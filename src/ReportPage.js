import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ReportPage.css';

function ReportPage() {
  const [todos, setTodos] = useState([]);
  const reportContainerRef = useRef(null);

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
          subtasks: todo.subtasks || []
        }));
        setTodos(migratedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
  }, []);

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

  // Category stats
  const getCategoryStats = () => {
    const categories = ['Work', 'Study', 'Personal'];
    return categories.map(cat => {
      const categoryTodos = todos.filter(t => t.category === cat);
      const completed = categoryTodos.filter(t => t.completed).length;
      return {
        category: cat,
        total: categoryTodos.length,
        completed: completed
      };
    });
  };

  // Priority stats
  const getPriorityStats = () => {
    const priorities = ['High', 'Medium', 'Low'];
    return priorities.map(pri => {
      const priorityTodos = todos.filter(t => t.priority === pri);
      const completed = priorityTodos.filter(t => t.completed).length;
      return {
        priority: pri,
        total: priorityTodos.length,
        completed: completed
      };
    });
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalTodos: todos.length,
      completedTodos: todos.filter(t => t.completed).length,
      pendingTodos: todos.filter(t => !t.completed).length,
      dailyAccuracy: calculateAccuracy('daily'),
      weeklyAccuracy: calculateAccuracy('weekly'),
      monthlyAccuracy: calculateAccuracy('monthly'),
      currentStreak: getStreak(),
      categoryStats: getCategoryStats(),
      priorityStats: getPriorityStats(),
      todos: todos
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    if (!reportContainerRef.current) return;
    
    try {
      const canvas = await html2canvas(reportContainerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      const yPosition = (pdfHeight - imgScaledHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', 0, yPosition, imgScaledWidth, imgScaledHeight);
      pdf.save(`todo-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const dailyAccuracy = calculateAccuracy('daily');
  const weeklyAccuracy = calculateAccuracy('weekly');
  const monthlyAccuracy = calculateAccuracy('monthly');
  const currentStreak = getStreak();
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;
  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();

  const theme = localStorage.getItem('theme') || 'light';

  return (
    <div className={`report-page theme-${theme}`}>
      <div className="report-container" ref={reportContainerRef}>
        <div className="report-header">
          <h1>📊 Todo List App - Report</h1>
          <Link to="/" className="btn btn-back">
            ← Back to Todos
          </Link>
        </div>

        <div className="report-section">
          <h2>📊 Total Todos: {todos.length}</h2>
          <div className="stats-row">
            <div className="stat-box completed">
              <span className="stat-icon">✔</span>
              <span className="stat-label">Completed:</span>
              <span className="stat-number">{completedCount}</span>
            </div>
            <div className="stat-box pending">
              <span className="stat-icon">❌</span>
              <span className="stat-label">Pending:</span>
              <span className="stat-number">{pendingCount}</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>📅 Accuracy</h2>
          <div className="accuracy-display">
            <div className="accuracy-item">
              <div className="accuracy-header">
                <span className="accuracy-label">Daily:</span>
                <span className="accuracy-value">{dailyAccuracy}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${dailyAccuracy}%` }}></div>
              </div>
            </div>
            <div className="accuracy-item">
              <div className="accuracy-header">
                <span className="accuracy-label">Weekly:</span>
                <span className="accuracy-value">{weeklyAccuracy}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${weeklyAccuracy}%` }}></div>
              </div>
            </div>
            <div className="accuracy-item">
              <div className="accuracy-header">
                <span className="accuracy-label">Monthly:</span>
                <span className="accuracy-value">{monthlyAccuracy}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${monthlyAccuracy}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>🔥 Current Streak: {currentStreak} days</h2>
        </div>

        <div className="report-section">
          <h2>📂 Category Stats</h2>
          <div className="category-stats">
            {categoryStats.map(stat => (
              <div key={stat.category} className="category-item">
                <div className="category-header">
                  <span className="category-name">{stat.category}:</span>
                  <span className="category-count">
                    {stat.completed}/{stat.total} completed
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h2>🚦 Priority Stats</h2>
          <div className="priority-stats">
            {priorityStats.map(stat => (
              <div key={stat.priority} className={`priority-item priority-${stat.priority.toLowerCase()}`}>
                <div className="priority-header">
                  <span className="priority-name">{stat.priority}:</span>
                  <span className="priority-count">
                    {stat.completed}/{stat.total} completed
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-actions">
          <button className="btn btn-export-report" onClick={exportReport}>
            📥 Export Report
          </button>
          <button className="btn btn-export-pdf" onClick={exportToPDF}>
            📄 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;

