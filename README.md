
# Event Management System

Event Management System is a full-stack application designed to organize, schedule, and manage events efficiently across multiple user profiles. It supports timezone-aware scheduling, history tracking for event updates, and profile-based filtering. Optimized with modern frontend patterns and data structures, it delivers fast performance with Zustand state management, React hooks, and API integration. The backend follows a modular architecture using Node.js and Express with MongoDB for persistent storage.

---

## Features

### Core Functionality

- Create, edit, and delete events
- Assign events to multiple profiles
- Manage and switch between profiles dynamically
- Timezone selection for accurate event scheduling
- Real-time UI updates using global state management
- Classic black & white toast notifications

### Event Logs

- Detailed event update history
- Tracks title, time, timezone changes
- Logs added/removed profiles
- Sorted updates by **newest first**
- Skips empty fields for clean readability

---

## Tech Stack

| Area       | Technology Used                     |
| ---------- | ----------------------------------- |
| Frontend   | React.js, Zustand, Vite             |
| Styling    | CSS Modules / Custom CSS            |
| Icons      | Lucide Icons                        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## Installation and Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd event-management-system
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Setup environment variables

Create .env inside backend folder:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 5. Start project

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

## 🔧 Optimizations & DSA Strategies Used

| Strategy                         | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| Debouncing                       | Reduces unnecessary function calls during typing |
| Memoization (`useMemo`)          | Avoids recalculating filtered/sorted data        |
| Hash Maps                        | Fast access to profiles and events (O(1) lookup) |
| Sets                             | Prevents duplicate profile assignments           |
| Caching with Zustand             | Optimized global state + avoids prop drilling    |
| Efficient Array Methods          | Immutable updates using map/filter/reduce        |
| `useCallback`                    | Prevents re-render loops in child components     |
| Async Task Queue Logic           | Handles sequential CRUD operations cleanly       |
| Early Returns & Short-Circuiting | Prevents deep nested if-else logic               |

## Screens

- Profile switching

- Create & Assign events

- View logs with history

- Toast feedback UI
