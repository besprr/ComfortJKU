const { queryDatabase } = require('../config/bd')

const checkIfExists = async (field, value) => {
	const allowedFields = ['Login', 'Email']
	if (!allowedFields.includes(field)) {
		throw new Error('Недопустимое поле для проверки')
	}

	const query = `SELECT * FROM Users WHERE ${field} = ?`
	const result = await queryDatabase(query, [value])
	return result.length > 0
}

const createUser = async (Name, Phone, Email, Login, hashedPassword) => {
	const query = `
        INSERT INTO Users (Name, Phone, Email, Login, PasswordHash)
        VALUES (?, ?, ?, ?, ?)
    `

	await queryDatabase(query, [Name, Phone, Email, Login, hashedPassword])
}

const getUserByLogin = async login => {
	const query = `SELECT * FROM Users WHERE Login = ?`
	const result = await queryDatabase(query, [login])
	return result[0]
}
 
const saveRefreshToken = async (userId, refreshToken) => {
	const delQuery = `DELETE FROM RefreshTokens WHERE UserID = ?;`
	await queryDatabase(delQuery, [userId])

	const isnQuery = `INSERT INTO RefreshTokens (Token, UserID)
    VALUES (?, ?)`
	await queryDatabase(isnQuery, [refreshToken, userId])
}

const getUserByRefreshToken = async refreshToken => {
	const query = `SELECT * FROM RefreshTokens WHERE RefreshToken = ?`
	const result = await queryDatabase(query, [refreshToken])
	return result[0]
}

module.exports = {
	checkIfExists,
	createUser,
	getUserByLogin,
	saveRefreshToken,
	getUserByRefreshToken,
}
