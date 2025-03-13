import { serverURL } from './constants.js'
import { updateUIAfterLogin, updateUIAfterLogout } from './ui.js'

export function decodeToken(token) {
	const base64Url = token.split('.')[1]
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split('')
			.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
			.join('')
	)
	return JSON.parse(jsonPayload)
}

export async function loginUser(event) {
	event.preventDefault()

	const Login = document.getElementById('authLogin').value
	const Password = document.getElementById('authPassword').value

	if (!Login || !Password) {
		alert('Все поля должны быть заполнены!')
		return
	}

	const userData = { Login, Password }

	try {
		const response = await fetch(`${serverURL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData),
			credentials: 'include',
		})

		const result = await response.json()
		if (response.ok) {
			alert('Авторизация успешна')

			const accessToken = result.accessToken
			if (!accessToken) throw new Error('Токен отсутствует в ответе сервера')

			const decodedToken = decodeToken(accessToken)
			if (!decodedToken) throw new Error('Не удалось декодировать токен')

			localStorage.setItem('userId', decodedToken.userId)
			localStorage.setItem('login', decodedToken.login)
			localStorage.setItem('roleId', decodedToken.roleId)
			localStorage.setItem('accessToken', accessToken)

			updateUIAfterLogin()

			const loginDialog = document.getElementById('loginDialog')
			if (loginDialog) {
				loginDialog.close()
			}
		} else {
			alert(`Ошибка: ${result.error}`)
		}
	} catch (error) {
		console.error('Ошибка при авторизации', error)
	}
}

export async function registerUser(event) {
	event.preventDefault()

	const Name = document.getElementById('registerName').value
	const Phone = document.getElementById('registerTel').value
	const Email = document.getElementById('registerEmail').value
	const Login = document.getElementById('registerLogin').value
	const Password = document.getElementById('registerPassword').value

	if (!Name || !Phone || !Email || !Login || !Password) {
		alert('Все поля должны быть заполнены')
		return
	}

	const userData = { Name, Phone, Email, Login, Password }

	try {
		const response = await fetch(`${serverURL}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData),
		})

		const result = await response.json()
		if (response.ok) {
			alert('Пользователь успешно зарегистрирован!')

			const registerDialog = document.getElementById('registerDialog')
			if (registerDialog) {
				registerDialog.close()
			}
		} else {
			alert(`Ошибка: ${result.error}`)
		}
	} catch (error) {
		console.error('Ошибка регистрации', error)
	}
}

export async function logoutUser() {
	localStorage.removeItem('userId')
	localStorage.removeItem('login')
	localStorage.removeItem('roleId')
	localStorage.removeItem('accessToken')

	const response = await fetch(`${serverURL}/auth/logout`, {
    method: 'POST', 
    credentials: 'include',
  });

	
	if (!response.ok){
		throw new Error('Не удалось выйти из аккаунта')
	}
	else updateUIAfterLogout()
}

export async function refreshAccessToken() {
	try {
		const response = await fetch(`${serverURL}/auth/refresh`, {
			method: 'GET',
			credentials: 'include',
		})

		if (!response.ok) throw new Error('Не удалось обновить токен')

		const data = await response.json()
		localStorage.setItem('accessToken', data.accessToken)
		return data.accessToken
	} catch (error) {
		console.error('Ошибка при обновлении токена:', error)
		localStorage.removeItem('accessToken')
	}
}
