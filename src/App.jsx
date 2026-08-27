import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import Todo from './pages/todo/Todo';
import Calendar from './pages/calendar/Calendar';
import Location from './pages/location/Location';
import Haid from './pages/haid/Haid';
import Chat from './pages/chat/Chat';
import Savings from './pages/savings/Savings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/location" element={<Location />} />
          <Route path="/haid" element={<Haid />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/savings" element={<Savings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;