const jwt = require('jsonwebtoken')
require('dotenv').config()
const { queryDatabase } = require('../config/bd')


const generateAccessToken = (userId, login, roleId) => {
	return jwt.sign({ userId, login, roleId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
	})
}

const generateRefreshToken = (userId, login, roleId) => {
	return jwt.sign({ userId, login, roleId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
	})
}

const verifyAccessToken = token => {
	try {
		return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
	} catch (error) {
		return null
	}
}

const verifyRefreshToken = token => {
	try {
		return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
	} catch (error) {
		return null
	}
}

const getUserByRefreshToken = async token => {
	try {
		console.log(token)
		const query = `SELECT * FROM RefreshTokens WHERE Token = ?`
		const result = await queryDatabase(query, [token])

		return result[0]
	} catch (error) {
		return null
	}
}

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	getUserByRefreshToken
}
