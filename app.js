require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./config/initDb');
const salesRoutes = require('./routes/salesRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
initializeDatabase().then(() => {
    console.log('🚀 Database initialization complete');
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1); // Exit if database fails
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});