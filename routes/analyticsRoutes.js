const express = require('express');
const router = express.Router();
const { getSummary, getCharts, getInsights } = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/charts', getCharts);
router.get('/insights', getInsights);

module.exports = router;