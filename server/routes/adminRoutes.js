const express = require('express')
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware')
const { getAllRequests } = require('../controllers/adminController')

const router = express.Router()

router.get('/checkRole', authenticateToken, isAdmin, (req, res) => {
	res.json({
		message: 'Добро пожаловать админ!',
	})
})

router.get('/requests', getAllRequests)

module.exports = router
