const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;

    try {
        let dbConfig;
        const urlSource = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
        if (urlSource) {
            const url = new URL(urlSource);
            dbConfig = {
                host: url.hostname,
                user: url.username || process.env.MYSQL_USER || process.env.DB_USER || 'root',
                password: url.password || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
                database: url.pathname.replace(/^\//, ''),
                port: url.port || 3306
            };
        } else if (process.env.MYSQL_HOST) {
            dbConfig = {
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
                password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'profitly_db',
                port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306
            };
        } else {
            dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'profitly_db'
            };
        }

        console.log('🔄 Connecting to database server...');
        if (!process.env.DATABASE_URL && !process.env.MYSQL_URL && !process.env.MYSQL_PUBLIC_URL && !process.env.MYSQL_HOST) {
            const tempConfig = { ...dbConfig };
            delete tempConfig.database;
            connection = await mysql.createConnection(tempConfig);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
            console.log(`✅ Database '${dbConfig.database}' ready`);
            await connection.query(`USE \`${dbConfig.database}\``);
        } else {
            connection = await mysql.createConnection(dbConfig);
            console.log(`✅ Connected to existing database '${dbConfig.database}'`);
        }

        const statements = [
            `CREATE TABLE IF NOT EXISTS product_sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productName VARCHAR(255) NOT NULL,
                sellingPrice DECIMAL(10,2) NOT NULL,
                productionCost DECIMAL(10,2) NOT NULL,
                quantitySold INT NOT NULL,
                createdAtMillis BIGINT NOT NULL
            )`,
            `CREATE INDEX IF NOT EXISTS idx_product_sales_created_at ON product_sales (createdAtMillis)`,
            `CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                createdAtMillis BIGINT NOT NULL
            )`,
            `CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (createdAtMillis)`
        ];

        console.log('🔄 Creating tables...');
        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('✅ Database tables ready');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = initializeDatabase;