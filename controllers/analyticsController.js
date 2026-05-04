const pool = require('../config/db');

// Helper to calculate summary
const calculateSummary = async () => {
    // Revenue: SUM(sellingPrice * quantitySold)
    const [revenueResult] = await pool.execute(
        'SELECT SUM(sellingPrice * quantitySold) as totalRevenue FROM product_sales'
    );
    const totalRevenue = revenueResult?.[0]?.totalRevenue || 0;

    // Production Cost: SUM(productionCost * quantitySold)
    const [prodCostResult] = await pool.execute(
        'SELECT SUM(productionCost * quantitySold) as productionCost FROM product_sales'
    );
    const productionCost = prodCostResult?.[0]?.productionCost || 0;

    // Expenses: SUM(amount)
    const [expensesResult] = await pool.execute(
        'SELECT SUM(amount) as totalExpenses FROM expenses'
    );
    const totalExpenses = expensesResult?.[0]?.totalExpenses || 0;

    // Total Costs: production cost + expenses
    const totalCosts = productionCost + totalExpenses;

    // Net Profit: revenue - total costs
    const netProfit = totalRevenue - totalCosts;

    // Profit Margin: (netProfit / revenue) * 100, handle /0
    const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCosts: parseFloat(totalCosts.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2)),
        profitMarginPercent: parseFloat(profitMarginPercent.toFixed(2))
    };
};

// Get financial summary
const getSummary = async (req, res) => {
    try {
        const summary = await calculateSummary();
        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get charts data
const getCharts = async (req, res) => {
    try {
        // Sales over time: group by day, sum(sellingPrice * quantitySold)
        const [salesData] = await pool.execute(`
            SELECT
                DATE_FORMAT(FROM_UNIXTIME(createdAtMillis / 1000), '%m/%d') as label,
                SUM(sellingPrice * quantitySold) as value
            FROM product_sales
            GROUP BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
            ORDER BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
        `);

        // Profit over time is calculated below by combining daily revenues and expenses in JS.

        const [dailyRevenues] = await pool.execute(`
            SELECT
                DATE(FROM_UNIXTIME(createdAtMillis / 1000)) as date,
                SUM(sellingPrice * quantitySold) as revenue,
                SUM(productionCost * quantitySold) as prod_cost
            FROM product_sales
            GROUP BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
            ORDER BY date
        `);

        const [dailyExpenses] = await pool.execute(`
            SELECT
                DATE(FROM_UNIXTIME(createdAtMillis / 1000)) as date,
                SUM(amount) as exp_cost
            FROM expenses
            GROUP BY DATE(FROM_UNIXTIME(createdAtMillis / 1000))
            ORDER BY date
        `);

        // Combine into profit data
        const profitMap = new Map();
        dailyRevenues.forEach(row => {
            const date = row.date.toISOString().split('T')[0]; // YYYY-MM-DD
            profitMap.set(date, {
                revenue: parseFloat(row.revenue || 0),
                prod_cost: parseFloat(row.prod_cost || 0),
                exp_cost: 0
            });
        });
        dailyExpenses.forEach(row => {
            const date = row.date.toISOString().split('T')[0];
            if (profitMap.has(date)) {
                profitMap.get(date).exp_cost = parseFloat(row.exp_cost || 0);
            } else {
                profitMap.set(date, {
                    revenue: 0,
                    prod_cost: 0,
                    exp_cost: parseFloat(row.exp_cost || 0)
                });
            }
        });

        const profitOverTime = Array.from(profitMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => {
                const label = new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                const value = data.revenue - (data.prod_cost + data.exp_cost);
                return { label, value: parseFloat(value.toFixed(2)) };
            });

        // Format salesOverTime
        const salesOverTime = salesData.map(row => ({
            label: row.label,
            value: parseFloat(row.value.toFixed(2))
        }));

        res.status(200).json({
            salesOverTime,
            profitOverTime
        });
    } catch (error) {
        console.error('Error fetching charts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get insights
const getInsights = async (req, res) => {
    try {
        const summary = await calculateSummary();
        let insights = [];

        // No sales
        if (summary.totalRevenue === 0) {
            insights.push("No sales recorded yet...");
        }

        // Negative profit
        if (summary.netProfit < 0) {
            insights.push("Your costs are too high...");
        }

        // Low margin (<15%)
        if (summary.profitMarginPercent < 15 && summary.totalRevenue > 0) {
            insights.push("Your profit margin is low. Consider increasing prices or reducing costs.");
        }

        // High margin (>=20%)
        if (summary.profitMarginPercent >= 20) {
            insights.push("Great job! Your profit margin is healthy.");
        }

        // Declining trend (last 3 days decreasing)
        const [lastProfits] = await pool.execute(`
            SELECT date, revenue - (prod_cost + exp_cost) as profit FROM (
                SELECT
                    DATE(FROM_UNIXTIME(ps.createdAtMillis / 1000)) as date,
                    SUM(ps.sellingPrice * ps.quantitySold) as revenue,
                    SUM(ps.productionCost * ps.quantitySold) as prod_cost,
                    COALESCE(e.exp_sum, 0) as exp_cost
                FROM product_sales ps
                LEFT JOIN (
                    SELECT DATE(FROM_UNIXTIME(createdAtMillis / 1000)) as e_date, SUM(amount) as exp_sum
                    FROM expenses
                    GROUP BY e_date
                ) e ON e.e_date = DATE(FROM_UNIXTIME(ps.createdAtMillis / 1000))
                GROUP BY date
            ) t
            ORDER BY date DESC
            LIMIT 3
        `);

        if (lastProfits.length >= 3) {
            const profits = lastProfits.reverse().map(row => parseFloat(row.profit || 0));
            if (profits[0] > profits[1] && profits[1] > profits[2]) {
                insights.push("Your profit is declining over the last 3 days. Review recent sales and expenses.");
            }
        }

        res.status(200).json({ insights });
    } catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getSummary,
    getCharts,
    getInsights
};