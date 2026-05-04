const express = require('express');
const router = express.Router();
const { getTables, testConnection, testAnalytics } = require('../controllers/debugController');

router.get('/tables', getTables);
router.get('/connection', testConnection);
router.get('/analytics', testAnalytics);

module.exports = router;