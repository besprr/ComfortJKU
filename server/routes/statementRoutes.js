const express = require('express')
const router = express.Router()

const { createStatementHandler } = require('../controllers/statementController')
const { authenticateToken } = require('../middlewares/authMiddleware')
const { getBookedTimes } = require('../services/statementService')
const { getMasters } = require('../services/statementService')
const { queryDatabase } = require('../config/bd')

router.post('/create', authenticateToken, createStatementHandler)

router.get('/booked-times/:masterID/:date', async (req, res) => {
	const { masterID, date } = req.params

	try {
		const bookedTimes = await getBookedTimes(masterID, date)
		res.status(200).json(bookedTimes)
	} catch (error) {
		console.error('Ошибка при получении занятых времен:', error)
		res.status(500).json({ error: 'Ошибка при получении занятых времен' })
	}
})

router.get('/masters', async (req, res) => {
	try {
		const masters = await getMasters()
		res.status(200).json(masters)
	} catch (error) {
		console.error('Ошибка при получении списка мастеров:', error)
		res.status(500).json({ error: 'Ошибка при получении списка мастеров' })
	}
})

router.post(
	'/acceptRequest/:requestId',
	authenticateToken,
	async (req, res) => {
		const { requestId } = req.params

		try {
			const updateQuery = `
      UPDATE Requests 
      SET StatusID = 2 -- Подтверждено
      WHERE RequestID = ?
    `
			await queryDatabase(updateQuery, [requestId])

			res.status(200).json({ message: 'Заявка подтверждена' })
		} catch (error) {
			console.error('Ошибка при подтверждении заявки:', error)
			res.status(500).json({
				error: 'Ошибка при подтверждении заявки',
				details: error.message,
			})
		}
	}
)

router.post(
	'/reject-request/:requestId',
	authenticateToken,
	async (req, res) => {
		const { requestId } = req.params

		try {
			// Обновляем статус заявки на "Отклонено"
			const updateQuery = `
      UPDATE Requests 
      SET StatusID = 3 -- Отклонено
      WHERE RequestID = ?
    `
			await queryDatabase(updateQuery, [requestId])

			res.status(200).json({ message: 'Заявка отклонена' })
		} catch (error) {
			console.error('Ошибка при отклонении заявки:', error)
			res
				.status(500)
				.json({ error: 'Ошибка при отклонении заявки', details: error.message })
		}
	}
)

module.exports = router
