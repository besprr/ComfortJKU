const express = require('express')
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/checkRole', authenticateToken, isAdmin, (req, res) =>{
	res.json({
		message: 'Добро пожаловать админ!'
	})
})

module.exports = router;