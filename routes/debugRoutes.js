const express = require('express');
const router = express.Router();
const { getTables, testConnection, testAnalytics, testChartsData, testInsightsData } = require('../controllers/debugController');

router.get('/tables', getTables);
router.get('/connection', testConnection);
router.get('/analytics', testAnalytics);
router.get('/charts-data', testChartsData);
router.get('/insights-data', testInsightsData);

module.exports = router;