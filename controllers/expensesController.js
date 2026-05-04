const pool = require('../config/db');

// Validation helper
const validateExpense = (data) => {
    const errors = [];
    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
        errors.push('description is required and must be a non-empty string');
    }
    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
        errors.push('amount is required and must be a positive number');
    }
    if (!data.createdAtMillis || typeof data.createdAtMillis !== 'number') {
        errors.push('createdAtMillis is required and must be a number');
    }
    return errors;
};

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM expenses ORDER BY createdAtMillis DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new expense
const createExpense = async (req, res) => {
    try {
        const data = req.body;
        const errors = validateExpense(data);

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const { description, amount, createdAtMillis } = data;

        const [result] = await pool.execute(
            'INSERT INTO expenses (description, amount, createdAtMillis) VALUES (?, ?, ?)',
            [description.trim(), amount, createdAtMillis]
        );

        const newExpense = {
            id: result.insertId,
            description: description.trim(),
            amount,
            createdAtMillis
        };

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getExpenses,
    createExpense
};