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

const testChartsData = async (req, res) => {
    try {
        const [salesData] = await pool.execute(`
            SELECT
                DATE_FORMAT(FROM_UNIXTIME(createdAtMillis / 1000), '%m/%d') as label,
                SUM(sellingPrice * quantitySold) as value
            FROM product_sales
            GROUP BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
            ORDER BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
        `);

        const [dailyRevenues] = await pool.execute(`
            SELECT
                DATE(FROM_UNIXTIME(createdAtMillis / 1000)) as date,
                SUM(sellingPrice * quantitySold) as revenue,
                SUM(productionCost * quantitySold) as prod_cost
            FROM product_sales
            GROUP BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
            ORDER BY date
        `);

        res.status(200).json({
            salesData,
            dailyRevenues,
            sampleSalesData: salesData[0],
            sampleDailyRevenues: dailyRevenues[0]
        });
    } catch (error) {
        console.error('Error in test charts data:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

module.exports = {
    getTables,
    testConnection,
    testAnalytics,
    testChartsData
};