const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const codingRoutes = require('./routes/codingRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // broadcast to everyone in room including sender to confirm
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Dharshan@2004', salt);

    const adminUser = await User.findOne({ email: 'd978975@gmail.com' });
    if (!adminUser) {
      await User.create({
        name: 'Dharshan (Platform Director)',
        email: 'd978975@gmail.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          skills: ['Talent Strategy', 'System Proctorship', 'Gemini Auditing'],
          experience: 10,
          targetRole: 'Director of Assessments',
          bio: 'Platform Administrator of AURORA Smart Interview System.'
        }
      });
      console.log('Master Admin Account seeded successfully: d978975@gmail.com');
    } else {
      // Force update to guarantee correct credentials and role
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      if (!adminUser.name || adminUser.name === 'Candidate') {
        adminUser.name = 'Dharshan (Platform Director)';
      }
      await adminUser.save();
      console.log('Master Admin Account verified/reset successfully: d978975@gmail.com');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedAdminUser();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
