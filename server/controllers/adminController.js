	const { getAllUsers } = require('../services/adminService')

	const getAllRequests = async (req, res) => {
		try {
			const result = await getAllUsers()
	;		res.status(200).json({ result })
		} catch (error) {
			return res
				.status(400)
				.json({ error: 'Ошибка при получении пользователей ' + error })
		}
	}

	module.exports = { getAllRequests }
