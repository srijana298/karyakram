import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import Login from './pages/landing/Login';
import Signup from './pages/landing/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Account from './pages/dashboard/Account';
import AuthLayout from './layouts/AuthLayout';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Create from './pages/dashboard/Create';
import Events from './pages/dashboard/Events';
import Event from './pages/dashboard/Event';
import Landing from './pages/landing/Landing';
import Explore from './pages/landing/Explore';
import Calendar from './pages/landing/Calendar';
import EventPage from './pages/landing/EventPage';
import Ticket from './components/Ticket';
import DashboardScreenLayout from './layouts/DashboardScreenLayout';
import MarkAttendance from './pages/MarkAttendance';
import SelfCheckIn from './pages/SelfCheckIn';
import NotificationPage from './pages/dashboard/Notifications';
import Groups from './pages/dashboard/Groups';
import GroupDetails from './pages/dashboard/GroupDetails';
import CreateGroup from './pages/dashboard/CreateGroup';
import EventAttendance from './pages/dashboard/EventAttendance';
import MyRsvps from './pages/landing/MyRsvps';
import Calendars from './pages/dashboard/Calendars';
import CreateCalendar from './pages/dashboard/CreateCalendar';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/" element={<LandingLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="explore" element={<Explore />} />
            <Route path="calendar/:id" element={<Calendar />} />
            <Route path="my-rsvps" element={<MyRsvps />} />
            <Route path="auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>
          </Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Navigate to="/dashboard/events?filter=total" replace />} />
            <Route path="create" element={<Create />} />
            <Route path="event/:id" element={<Event />} />
            <Route path="account" element={<Account />} />
            <Route path="events" element={<Events />} />
            <Route path="calendars" element={<Calendars />} />
            <Route path="calendars/create" element={<CreateCalendar />} />
            <Route path="notifications" element={<NotificationPage />} />
            <Route path="groups/create" element={<CreateGroup />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/:id" element={<GroupDetails />} />
            <Route
              path="event/:id/attendance"
              element={
                <DashboardScreenLayout title={'Attendance'}>
                  <EventAttendance />
                </DashboardScreenLayout>
              }
            />
          </Route>
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/checkin/:id" element={<SelfCheckIn />} />
          {/* Public event links use unguessable random codes. Keep last so it never shadows static routes above. */}
          <Route path="/:code" element={<EventPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
