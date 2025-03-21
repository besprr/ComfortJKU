require('dotenv').config()
const bcrypt = require('bcrypt')
const {
	checkIfExists,
	getUserByLogin,
	saveRefreshToken,
	createUser,
} = require('../services/userService')

const {
	verifyRefreshToken,
	generateAccessToken,
	generateRefreshToken,
	getUserByRefreshToken,
} = require('../services/jwtService')
const { queryDatabase } = require('../config/bd')

const saltRounds = parseInt(process.env.SALT_ROUNDS)

const registerUser = async (req, res) => {
	const { Name, Phone, Email, Login, Password } = req.body

	if (!Name || !Phone || !Email || !Login || !Password) {
		return res
			.status(400)
			.json({ error: 'Все поля обязательны для заполнения' })
	}

	try {
		const loginExists = await checkIfExists('Login', Login)
		if (loginExists) {
			return res.status(400).json({ error: 'Этот логин уже занят' })
		}

		const emailExists = await checkIfExists('Email', Email)
		if (emailExists) {
			return res.status(400).json({ error: 'Этот email уже занят' })
		}

		const hashedPassword = await bcrypt.hash(Password, saltRounds)
		await createUser(Name, Phone, Email, Login, hashedPassword)

		console.log('✅ Пользователь успешно зарегистрирован:', {
			Name,
			Email,
			Login,
		})
		res.status(201).json({ message: 'Пользователь успешно зарегистрирован' })
	} catch (error) {
		console.error('❌ Ошибка при регистрации:', error)
		res.status(500).json({
			error: 'Ошибка при регистрации пользователя',
			details: error.message,
		})
	}
}

const loginUser = async (req, res) => {
	const { Login, Password } = req.body

	if (!Login || !Password) {
		return res.status(400).json({ error: 'Логин и пароль обязательны' })
	}

	try {
		const user = await getUserByLogin(Login)
		if (!user) {
			return res.status(400).json({ error: 'Пользователь не найден' })
		}

		const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash)
		if (!isPasswordValid) {
			return res.status(400).json({ error: 'Неверный пароль' })
		}

		const accessToken = generateAccessToken(
			user.UserID,
			user.Login,
			user.RoleID
		)
		const refreshToken = generateRefreshToken(
			user.UserID,
			user.Login,
			user.RoleID
		)

		await saveRefreshToken(user.UserID, refreshToken)

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, 
			sameSite: 'lax',
			secure: false, 
		})

		res.status(200).json({ accessToken, refreshToken })
	} catch (error) {
		console.error('❌ Ошибка при авторизации:', error)
		res
			.status(500)
			.json({ error: 'Ошибка при авторизации', details: error.message })
	}
}

const logoutUser = async (req, res) => {
	try {
		res.clearCookie('refreshToken', {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		})
		return res.status(200).json({ message: 'Выход выполнен успешно' })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при выходе' })
	}
}

const refreshTokens = async (req, res) => {
	const refreshToken = req.cookies.refreshToken

	console.log(refreshToken)

	if (!refreshToken) {
		return res.status(400).json({ error: 'Refresh токен обязателен' })
	}

	try {
		const decoded = verifyRefreshToken(refreshToken)
		if (!decoded) {
			return res.status(401).json({ error: 'Недействительный refresh токен' })
		}

		const user = await getUserByRefreshToken(refreshToken)
		if (!user) {
			return res.status(401).json({ error: 'Пользователь не найден' })
		}

		const accessToken = generateAccessToken(
			user.UserID,
			user.Login,
			user.RoleID
		)
		const newRefreshToken = generateRefreshToken(
			user.UserID,
			user.Login,
			user.RoleID
		)

		await saveRefreshToken(user.UserID, newRefreshToken)

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, 
			sameSite: 'lax',
			secure: false, 
		})

		res.status(200).json({ accessToken, newRefreshToken })
	} catch (error) {
		console.error('❌ Ошибка при обновлении токенов:', error)
		res
			.status(500)
			.json({ error: 'Ошибка при обновлении токенов', details: error.message })
	}
}

module.exports = { registerUser, loginUser, refreshTokens, logoutUser }
