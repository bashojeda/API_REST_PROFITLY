const pool = require('../config/db');

// Validation helper
const validateSale = (data) => {
    const errors = [];
    if (!data.productName || typeof data.productName !== 'string' || data.productName.trim() === '') {
        errors.push('productName is required and must be a non-empty string');
    }
    if (!data.sellingPrice || typeof data.sellingPrice !== 'number' || data.sellingPrice <= 0) {
        errors.push('sellingPrice is required and must be a positive number');
    }
    if (!data.productionCost || typeof data.productionCost !== 'number' || data.productionCost < 0) {
        errors.push('productionCost is required and must be a non-negative number');
    }
    if (!data.quantitySold || typeof data.quantitySold !== 'number' || !Number.isInteger(data.quantitySold) || data.quantitySold <= 0) {
        errors.push('quantitySold is required and must be a positive integer');
    }
    if (!data.createdAtMillis || typeof data.createdAtMillis !== 'number') {
        errors.push('createdAtMillis is required and must be a number');
    }
    return errors;
};

// Get all sales
const getSales = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM product_sales ORDER BY createdAtMillis DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new sale
const createSale = async (req, res) => {
    try {
        const data = req.body;
        const errors = validateSale(data);

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const { productName, sellingPrice, productionCost, quantitySold, createdAtMillis } = data;

        const [result] = await pool.execute(
            'INSERT INTO product_sales (productName, sellingPrice, productionCost, quantitySold, createdAtMillis) VALUES (?, ?, ?, ?, ?)',
            [productName.trim(), sellingPrice, productionCost, quantitySold, createdAtMillis]
        );

        const newSale = {
            id: result.insertId,
            productName: productName.trim(),
            sellingPrice,
            productionCost,
            quantitySold,
            createdAtMillis
        };

        res.status(201).json(newSale);
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getSales,
    createSale
};