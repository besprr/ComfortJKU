const { queryDatabase } = require('../config/bd')

const checkMasterAvailability = async (masterID, date, time) => {
	try {
		const startTime = new Date(`${date} ${time}`)
		const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

		const scheduleQuery = `
        SELECT * FROM WorkSchedules 
        WHERE MasterID = ? AND WorkDate = ? AND WorkTime BETWEEN ? AND ?
    `
		const scheduleResult = await queryDatabase(scheduleQuery, [
			masterID,
			date,
			time,
			endTime.toISOString().slice(11, 16),
		])

		if (scheduleResult.length > 0) {
			return false
		}

		const requestQuery = `
        SELECT * FROM Requests 
        WHERE MasterID = ? AND CreationDate = ? AND StatusID IN (1, 2)
    `
		const requestResult = await queryDatabase(requestQuery, [
			masterID,
			startTime,
			endTime,
		])
		return requestResult.length === 0
	} catch (err) {
		console.log('Ошибка при проверке доступности мастера', err)
		throw error
	}
}

const getBookedTimes = async (masterID, date) => {
	try {
		// Получаем занятые времена из таблицы Requests
		const requestQuery = `
					SELECT CreationDate 
					FROM Requests 
					WHERE MasterID = ? AND CAST(CreationDate AS DATE) = ? AND StatusID IN (1, 2)
			`
		const requestResult = await queryDatabase(requestQuery, [masterID, date])


		const scheduleQuery = `
					SELECT WorkTime 
					FROM WorkSchedules 
					WHERE MasterID = ? AND WorkDate = ?
			`
		const scheduleResult = await queryDatabase(scheduleQuery, [masterID, date])


		const bookedTimes = [
			...requestResult.map(row => row.CreationDate.slice(11, 16)), 
			...scheduleResult.map(row => row.WorkTime.slice(0, 5)),
		]

		return bookedTimes
	} catch (err) {
		console.error('Ошибка при получении занятых времен:', err)
		throw err
	}
}

const getMasters = async () => {
	try {
		const query = `
					SELECT MasterID, Name 
					FROM Masters
			`
		const result = await queryDatabase(query)
		return result
	} catch (err) {
		console.error('Ошибка при получении списка мастеров:', err)
		throw err
	}
}

const createStatement = async (
	userID,
	masterID,
	problemDescription,
	date,
	time,
	apartmentNumber,
	address
) => {
	try {
		const creationDate = new Date(`${date} ${time}`)
			.toISOString()
			.slice(0, 19)
			.replace('T', ' ')
		const query = `
        INSERT INTO Requests (UserID, MasterID, ProblemDescription, Address,ApartmentNumber, CreationDate, StatusID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `
		const statusID = 1
		await queryDatabase(query, [
			userID,
			masterID,
			problemDescription,
			address,
			apartmentNumber,
			creationDate,
			statusID,
		])
	} catch (err) {
		console.log('Ошибка при создании заявки', err)
		throw err
	}
}

module.exports = {
	checkMasterAvailability,
	createStatement,
	getBookedTimes,
	getMasters,
}
