const express = require('express')
const router = express.Router();

const { createStatementHandler } = require('../controllers/statementController')
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/create', authenticateToken, createStatementHandler)

module.exports = router;