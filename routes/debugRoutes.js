const express = require('express');
const router = express.Router();
const { getTables, testConnection, testAnalytics, testChartsData } = require('../controllers/debugController');

router.get('/tables', getTables);
router.get('/connection', testConnection);
router.get('/analytics', testAnalytics);
router.get('/charts-data', testChartsData);

module.exports = router;