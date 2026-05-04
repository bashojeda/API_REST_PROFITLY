const mysql = require('mysql2/promise');

function createDbConfig() {
    const urlSource = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
    if (urlSource) {
        const url = new URL(urlSource);
        return {
            host: url.hostname,
            user: url.username || process.env.MYSQL_USER || process.env.DB_USER || 'root',
            password: url.password || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
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
            password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
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

console.log('🔎 Database configuration used:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Detected env vars:', {
            DATABASE_URL: !!process.env.DATABASE_URL,
            MYSQL_URL: !!process.env.MYSQL_URL,
            MYSQL_PUBLIC_URL: !!process.env.MYSQL_PUBLIC_URL,
            MYSQL_HOST: !!process.env.MYSQL_HOST,
            MYSQL_USER: !!process.env.MYSQL_USER,
            MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
            MYSQL_ROOT_PASSWORD: !!process.env.MYSQL_ROOT_PASSWORD,
            MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
            MYSQL_PORT: !!process.env.MYSQL_PORT
        });
        console.error('Please check your Railway MySQL environment variables');
    });

module.exports = pool;