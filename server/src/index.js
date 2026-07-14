import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import rsvpRoutes from './routes/rsvps.js';
import memberRoutes from './routes/members.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import groupRoutes from './routes/groups.js';
import categoryRoutes from './routes/categories.js';
import calendarRoutes from './routes/calendars.js';
import attendanceRoutes from './routes/attendance.js';
import certificateRoutes from './routes/certificates.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rsvps', rsvpRoutes);
app.use('/api', memberRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
