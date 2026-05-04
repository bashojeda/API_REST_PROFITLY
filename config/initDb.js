const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    let connection;

    try {
        // Get database config (same as db.js)
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

        // Connect without database first
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;

        console.log('🔄 Connecting to database server...');
        connection = await mysql.createConnection(tempConfig);

        if (!process.env.DATABASE_URL && !process.env.MYSQL_URL && !process.env.MYSQL_PUBLIC_URL) {
            // Only create the database in local development.
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
            console.log(`✅ Database '${dbConfig.database}' ready`);
            await connection.query(`USE \`${dbConfig.database}\``);
        } else {
            // Railway already provides the database and name.
            await connection.changeUser({ database: dbConfig.database });
            console.log(`✅ Connected to existing Railway database '${dbConfig.database}'`);
        }

        // Read and execute schema
        const schemaPath = path.join(__dirname, '..', 'database.sql');
        console.log('🔄 Reading database schema...');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual statements and execute
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.toUpperCase().startsWith('CREATE DATABASE') && !stmt.toUpperCase().startsWith('USE '));

        console.log('🔄 Creating tables...');
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }

        console.log('✅ Database tables created successfully');

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