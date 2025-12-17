# Enhanced Todo List App

A comprehensive personal Todo List application built with React. This app includes full CRUD operations, due date tracking, accuracy analytics, daily streaks, browser notifications, and PWA support.

## Features

### Core Features
- ✅ **Add Todo Items** - Create new tasks with optional due dates
- 📋 **View All Items** - See all your todos in a clean, organized list
- ✏️ **Edit Items** - Update existing todo items and their due dates
- 🗑️ **Delete Items** - Remove todos you no longer need
- ✔️ **Mark as Completed** - Check off completed tasks
- 💾 **Persistent Storage** - All data is saved in browser localStorage (survives page refresh)

### New Features

#### 1. Due Date ⏰
- Add a due date when creating a todo using the date picker
- Due dates are stored with each todo item
- Display shows formatted dates (Today, Tomorrow, or actual date)
- **Overdue Highlighting**: Todos past their due date are highlighted in red
- Visual indicators make it easy to spot urgent tasks

#### 2. Dark Mode 🌙
- Toggle between light and dark themes using the sun/moon button
- Theme preference is saved in localStorage
- Automatically loads your preferred theme on app startup
- Smooth transitions between themes
- Dark mode optimized for low-light environments

#### 3. Daily / Weekly / Monthly Accuracy 📊
- Tracks completion accuracy for three time periods:
  - **Daily**: Todos created today
  - **Weekly**: Todos created this week (Sunday to Saturday)
  - **Monthly**: Todos created this month
- Calculation: `(completed todos / total todos) * 100`
- Shows percentage with visual progress bars
- Handles zero tasks gracefully (shows 0%)
- Updates automatically as you complete tasks

#### 4. Accuracy Charts 📈
- Visual progress bars for each time period (Daily, Weekly, Monthly)
- Side-by-side comparison of completion rates
- Color-coded bars for easy understanding
- Updates in real-time as you complete todos

#### 5. Daily Streaks ⏳
- Tracks consecutive days where at least one todo is completed
- Displays current streak count with fire emoji (e.g., "🔥 5-day streak")
- Automatically resets if a day is missed
- Streak data is saved in localStorage
- Motivates consistent daily productivity

#### 6. Browser Notifications 🔔
- Request notification permission politely on first use
- Sends notifications for:
  - **Due Today**: Todos due today (one notification per day)
  - **Overdue**: Todos past their due date (one notification per day)
- Toggle notifications on/off with the bell icon
- Respects browser notification settings
- No spam - maximum one notification per category per day

#### 7. PWA (Progressive Web App) 📱
- Installable on mobile and desktop devices
- Works offline with cached data
- Service worker caches app resources
- Can be added to home screen (mobile) or installed (desktop)
- Provides app-like experience without app store

## How It Works

### State Management
The app uses React's `useState` and `useEffect` hooks to manage:
- **todos**: Array of all todo items with metadata
- **inputValue**: Current text in the add todo input field
- **dueDate**: Selected due date for new todos
- **editingId**: ID of the todo item currently being edited
- **editValue**: Text value for the item being edited
- **editDueDate**: Due date value for the item being edited
- **darkMode**: Current theme (light/dark)
- **notificationsEnabled**: Notification toggle state
- **notificationPermission**: Browser notification permission status

### Data Structure
Each todo item contains:
```javascript
{
  id: number,              // Unique identifier (timestamp)
  text: string,            // Todo description
  completed: boolean,      // Completion status
  createdAt: number,       // Creation timestamp
  dueDate: string | null,  // Due date (YYYY-MM-DD format or null)
  completedAt: number | null // Completion timestamp (if completed)
}
```

### Data Persistence
- Todos are automatically saved to `localStorage` whenever the list changes
- Theme preference saved in `localStorage` as `darkMode`
- Notification preference saved as `notificationsEnabled`
- Streak data saved as `streak` and `lastStreakDate`
- On app load, all data is retrieved from `localStorage` and displayed

### Accuracy Calculation
- **Daily**: Filters todos created today, calculates completion percentage
- **Weekly**: Filters todos created since Sunday of current week
- **Monthly**: Filters todos created since the 1st of current month
- Formula: `(completed todos / total todos) * 100`
- Returns 0% if no todos exist in the period

### Streak Tracking
- Tracks consecutive days with at least one completed todo
- Checks completion dates and counts consecutive days
- Resets automatically if a day is missed
- Updates whenever todos are completed or deleted

### Notification System
- Checks for due/overdue todos periodically (every hour)
- Sends notifications only once per day per category
- Uses browser Notification API
- Respects user's notification preferences

### PWA Implementation
- **manifest.json**: Defines app metadata, icons, and display mode
- **Service Worker**: Caches app resources for offline access
- **Install Prompt**: Browser shows install option when criteria are met
- Works offline with cached localStorage data

## How to Run the App Locally

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   - The app will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to that URL in your browser

### Build for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## Testing Each Feature

### 1. Due Date Feature
1. Add a new todo with a due date (select a date in the date picker)
2. Verify the due date appears below the todo text
3. Set a due date in the past to see overdue highlighting (red border and background)
4. Edit a todo to change its due date
5. Complete a todo with a due date to see it no longer shows as overdue

### 2. Dark Mode
1. Click the moon/sun icon in the header
2. Verify the entire app switches themes
3. Refresh the page - your theme preference should persist
4. Check that all UI elements are visible in both themes

### 3. Accuracy Tracking
1. Create several todos today
2. Complete some of them
3. Check the Daily accuracy percentage and progress bar
4. Create todos throughout the week to see Weekly accuracy
5. Create todos throughout the month to see Monthly accuracy
6. Verify accuracy updates when you complete todos

### 4. Accuracy Charts
1. Look at the stats section below the header
2. Verify progress bars show for Daily, Weekly, and Monthly
3. Complete todos and watch the bars update
4. Check that bars are color-coded and easy to read

### 5. Daily Streaks
1. Complete at least one todo today
2. Check the streak display (should show "🔥 1-day streak")
3. Complete at least one todo tomorrow
4. Verify streak increases to 2 days
5. Skip a day without completing any todos
6. Verify streak resets to 0

### 6. Browser Notifications
1. Click the bell icon to enable notifications
2. Grant permission when browser prompts
3. Create a todo with today's date as due date
4. Wait for notification (or check immediately if already due)
5. Create a todo with a past due date
6. Verify overdue notification appears
7. Toggle notifications off/on to test the toggle

### 7. PWA Installation
1. Build the app: `npm run build`
2. Serve the build folder (or deploy to a server)
3. Open in Chrome/Edge
4. Look for install icon in address bar or "Install" option in menu
5. Install the app
6. Open the installed app - it should work like a native app
7. Test offline functionality by disconnecting internet
8. Verify todos are still accessible and editable offline

## Project Structure

```
Todo_list/
├── public/
│   ├── index.html          # HTML template with manifest reference
│   ├── manifest.json       # PWA manifest file
│   └── sw.js               # Service worker for offline support
├── src/
│   ├── App.js              # Main component with all features
│   ├── App.css             # Component styles (light & dark mode)
│   ├── index.js            # React entry point with service worker registration
│   ├── index.css           # Global styles
│   └── serviceWorkerRegistration.js  # Service worker registration logic
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Code Style

- Uses React functional components exclusively
- Hooks: `useState` for state management, `useEffect` for side effects
- Clear, descriptive variable names
- Minimal comments (only where needed for complex logic)
- Simple, readable code structure
- Error handling for localStorage and notifications
- Backward compatible with existing todos (migrates old data)

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- React 18
- Service Workers (for PWA features)
- Notification API (for notifications)

## Notes

- **Data Storage**: All data is stored locally in your browser (localStorage)
- **Data Migration**: Old todos without `createdAt` or `dueDate` are automatically migrated
- **Offline Support**: With PWA, the app works offline using cached resources
- **Notifications**: Require user permission and work best in Chrome/Edge/Firefox
- **Streak Reset**: Streak resets if you miss a day (no todos completed)
- **Theme Persistence**: Your theme choice is saved and restored on app load

## Troubleshooting

### Notifications Not Working
- Ensure you've granted notification permission
- Check browser settings allow notifications
- Some browsers require HTTPS for notifications (except localhost)

### PWA Not Installing
- Ensure you're using HTTPS (or localhost for development)
- Check that manifest.json is accessible
- Verify service worker is registered (check browser DevTools)

### Streak Not Updating
- Ensure you complete at least one todo per day
- Check browser console for any errors
- Verify localStorage is working (check DevTools > Application > Local Storage)

### Dark Mode Not Persisting
- Check browser localStorage is enabled
- Verify no browser extensions are blocking localStorage
- Clear browser cache and try again

## Future Enhancements

Potential features for future versions:
- Categories/Tags for todos
- Priority levels
- Search and filter functionality
- Export/Import todos
- Cloud sync across devices
- Recurring todos
- Subtasks
