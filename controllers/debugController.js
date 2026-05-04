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

const testAnalytics = async (req, res) => {
    try {
        const [revenueResult] = await pool.execute(
            'SELECT SUM(sellingPrice * quantitySold) as totalRevenue FROM product_sales'
        );
        console.log('Revenue result:', revenueResult);
        
        const totalRevenue = revenueResult?.[0]?.totalRevenue || 0;
        console.log('Total revenue:', totalRevenue);
        
        res.status(200).json({
            debug: 'Analytics query executed',
            revenueResult,
            totalRevenue
        });
    } catch (error) {
        console.error('Error in test analytics:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

module.exports = {
    getTables,
    testConnection,
    testAnalytics
};