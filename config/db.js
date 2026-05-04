const mysql = require('mysql2/promise');

// Database configuration - supports Railway DATABASE_URL
let dbConfig;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL in format: mysql://user:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading slash
        port: url.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    // Local development fallback
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'profitly_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please check your DATABASE_URL in Railway dashboard');
    });

module.exports = pool;