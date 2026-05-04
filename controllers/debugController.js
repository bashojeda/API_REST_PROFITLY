const pool = require('../config/db');

const getTables = async (req, res) => {
    try {
        const [rows] = await pool.execute('SHOW TABLES');
        res.status(200).json({ tables: rows });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: error.message });
    }
};

const testConnection = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 as result');
        res.status(200).json({ result: rows[0].result });
    } catch (error) {
        console.error('Error testing connection:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTables,
    testConnection
};