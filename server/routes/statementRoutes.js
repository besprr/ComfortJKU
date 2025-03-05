const express = require('express')
const router = express.Router()

const { createStatementHandler } = require('../controllers/statementController')
const { authenticateToken } = require('../middlewares/authMiddleware')
const { getBookedTimes } = require('../services/statementService')
const { getMasters } = require('../services/statementService');

router.post('/create', authenticateToken, createStatementHandler)

router.get(
	'/booked-times/:masterID/:date',
	async (req, res) => {
		const { masterID, date } = req.params

		try {
			const bookedTimes = await getBookedTimes(masterID, date)
			res.status(200).json(bookedTimes)
		} catch (error) {
			console.error('Ошибка при получении занятых времен:', error)
			res.status(500).json({ error: 'Ошибка при получении занятых времен' })
		}
	}
)

router.get('/masters', async (req, res) => {
	try {
			const masters = await getMasters();
			res.status(200).json(masters);
	} catch (error) {
			console.error('Ошибка при получении списка мастеров:', error);
			res.status(500).json({ error: 'Ошибка при получении списка мастеров' });
	}
});

module.exports = router
