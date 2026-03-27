const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');
const AdminIdea = require('./models/AdminIdea');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running...');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Startup Idea Analyser API is running.' });
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    const timestamp = Date.now();
    const dummyUser = await User.create({
      name: `Dummy User ${timestamp}`,
      email: `dummy${timestamp}@example.com`,
      // WARNING: Plain text password storage used ONLY for college project.
      // DO NOT use in production.
      password: 'password123',
      role: 'user'
    });

    res.status(201).json({
      message: 'Database connection works and dummy user was inserted successfully.',
      userId: dummyUser._id
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Centralized error handling keeps controller code focused on core logic.
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    message: error.message || 'Something went wrong on the server.'
  });
});

const seedSampleAdminIdea = async () => {
  try {
    const ideaCount = await AdminIdea.countDocuments();

    if (ideaCount > 0) {
      return;
    }

    await AdminIdea.create({
      title: 'Food Delivery App',
      description: 'Online platform for food delivery',
      keywords: ['food', 'delivery', 'app']
    });

    console.log('Sample AdminIdea inserted');
  } catch (error) {
    console.error('Failed to seed sample AdminIdea:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'ashnaadmin@gmail.com' });

    if (!existingAdmin) {
      await User.create({
        name: 'Ashna ann scaria',
        email: 'ashnaadmin@gmail.com',
        // WARNING: Plain text password storage used ONLY for college project.
        // DO NOT use in production.
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

connectDB()
  .then(async () => {
    await seedAdmin();
    await seedSampleAdminIdea();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
