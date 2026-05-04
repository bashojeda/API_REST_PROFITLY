const express = require('express');
const router = express.Router();
const { getTables, testConnection } = require('../controllers/debugController');

router.get('/tables', getTables);
router.get('/connection', testConnection);

module.exports = router;