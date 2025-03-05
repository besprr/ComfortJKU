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

module.exports = { checkMasterAvailability, createStatement }
