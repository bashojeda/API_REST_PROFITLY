const mysql = require('mysql2/promise');

function createDbConfig() {
    if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
        const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
        const url = new URL(rawUrl);
        return {
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.replace(/^\//, ''),
            port: url.port || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }

    if (process.env.MYSQL_HOST) {
        return {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
            password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'profitly_db',
            port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'profitly_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

const dbConfig = createDbConfig();

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please check your Railway MySQL environment variables');
    });

module.exports = pool;