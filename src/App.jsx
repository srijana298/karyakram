import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import Login from './pages/landing/Login';
import Signup from './pages/landing/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Account from './pages/dashboard/Account';
import AuthLayout from './layouts/AuthLayout';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
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
import Admin from './pages/admin/Admin';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route
            path="/ticket"
            element={
              <UserRoute>
                <Ticket />
              </UserRoute>
            }
          />
          <Route path="/" element={<LandingLayout />}>
            <Route path="/" element={<UserRoute><Landing /></UserRoute>} />
            <Route path="explore" element={<UserRoute><Explore /></UserRoute>} />
            <Route path="calendar/:id" element={<UserRoute><Calendar /></UserRoute>} />
            <Route path="my-rsvps" element={<UserRoute><MyRsvps /></UserRoute>} />
            <Route path="auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>
          </Route>
          <Route
            path="/"
            element={
              <UserRoute>
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              </UserRoute>
            }
          >
            <Route path="" element={<Navigate to="/events?filter=total" replace />} />
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
          <Route
            path="/mark-attendance"
            element={
              <UserRoute>
                <MarkAttendance />
              </UserRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Admin />} />
          </Route>
          <Route
            path="/checkin/:id"
            element={
              <UserRoute>
                <SelfCheckIn />
              </UserRoute>
            }
          />
          {/* Public event links use unguessable random codes. Keep last so it never shadows static routes above. */}
          <Route path="/:code" element={<UserRoute><EventPage /></UserRoute>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
