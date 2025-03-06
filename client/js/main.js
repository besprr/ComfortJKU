const serverURL = 'http://localhost:3000'

function updateUIAfterLogin(roleId) {
	const loginButton = document.querySelector('.header__login-button')
	const registerButton = document.querySelector('.header__register-button')
	const logoutButton = document.querySelector('.header__leave-button')
	const adminButton = document.querySelector('.header__admin-button')

	loginButton.style.display = 'none'
	registerButton.style.display = 'none'

	logoutButton.style.display = 'inline-block'

	if (roleId === 1) {
		adminButton.style.display = 'inline-block'
	} else {
		adminButton.style.display = 'none'
	}
}

function updateUIAfterLogout() {
	const loginButton = document.querySelector('.header__login-button')
	const registerButton = document.querySelector('.header__register-button')
	const logoutButton = document.querySelector('.header__leave-button')
	const adminButton = document.querySelector('.header__admin-button')

	loginButton.style.display = 'inline-block'
	registerButton.style.display = 'inline-block'

	logoutButton.style.display = 'none'
	adminButton.style.display = 'none'
}

function logoutUser() {
	localStorage.removeItem('userId')
	localStorage.removeItem('login')
	localStorage.removeItem('roleId')

	updateUIAfterLogout()

	alert('Вы успешно вышли из системы!')
}

async function loginUser() {
	const Login = document.getElementById('authLogin').value
	const Password = document.getElementById('authPassword').value

	if (!Login || !Password) {
		alert('Все поля должны быть заполнены!')
		return
	}

	const userData = {
		Login,
		Password,
	}

	try {
		const response = await fetch(`${serverURL}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		})

		const result = await response.json()
		if (response.ok) {
			alert('Авторизация успешна')

			console.log(result)
			const accessToken = result.accessToken

			if (!accessToken) {
				throw new Error('Токен отсутствует в ответе сервера')
			}

			const decodedToken = decodeToken(accessToken)

			if (!decodedToken) {
				throw new Error('Не удалось декодировать токен')
			}

			localStorage.setItem('userId', decodedToken.userId)
			localStorage.setItem('login', decodedToken.login)
			localStorage.setItem('roleId', decodedToken.roleId)
			localStorage.setItem('accessToken', accessToken)

			updateUIAfterLogin(decodedToken.roleId)

			Login.value = ''
			Password.value = ''
		} else {
			alert(`Ошибка: ${response.error}`)
		}
	} catch (error) {
		console.log('Ошибка при авторизации', error)
	}
}

function decodeToken(token) {
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

async function registerUser() {
	const Name = document.getElementById('registerName').value
	const Phone = document.getElementById('registerTel').value
	const Email = document.getElementById('registerEmail').value
	const Login = document.getElementById('registerLogin').value
	const Password = document.getElementById('registerPassword').value
	const RoleID = 2

	if (!Name || !Phone || !Email || !Login || !Password) {
		alert('Все поля должны быть заполнены')
		return
	}

	const userData = {
		Name,
		Phone,
		Email,
		Login,
		Password,
		RoleID,
	}

	try {
		const response = await fetch(`${serverURL}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		})

		const result = await response.json()
		if (response.ok) {
			alert('Пользователь успешно зарегистрирован!')
		} else {
			alert(`Ошибка: ${result.error}`)
		}
	} catch (error) {
		console.log('Ошибка регистрации ', error)
	}
}

async function loadMasters() {
	const masterSelect = document.getElementById('masterSelect')
	try {
		const response = await fetch(`${serverURL}/statement/masters`)
		const masters = await response.json()

		masters.forEach(master => {
			const option = document.createElement('option')
			option.value = master.MasterID
			option.textContent = master.Name
			masterSelect.appendChild(option)
		})
	} catch (error) {
		console.error('Ошибка при загрузке мастеров:', error)
		alert('Не удалось загрузить список мастеров')
	}
}

async function handleDateChange(event) {
	const selectedDate = event.target.value
	const masterID = document.getElementById('masterSelect').value

	console.log('masterID:', masterID, 'Type:', typeof masterID)
	console.log('selectedDate:', selectedDate, 'Type:', typeof selectedDate)

	if (!masterID || isNaN(masterID)) {
		console.error('Некорректный masterID:', masterID)
		alert('Сначала выберите мастера')
		return
	}

	if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
		console.error('Некорректная дата:', selectedDate)
		alert('Некорректная дата')
		return
	}

	const url = `${serverURL}/statement/booked-times/${masterID}/${selectedDate}`
	console.log('Отправка запроса по URL:', url)

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
			},
		})
		if (!response.ok) {
			throw new Error(`Ошибка HTTP: ${response.status}`)
		}
		const bookedTimes = await response.json()

		const bookingTimeInput = document.getElementById('bookingTime')
		bookingTimeInput.innerHTML = ''
		for (let hour = 9; hour <= 18; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const time = `${String(hour).padStart(2, '0')}:${String(
					minute
				).padStart(2, '0')}`
				if (!bookedTimes.includes(time)) {
					const option = document.createElement('option')
					option.value = time
					option.textContent = time
					bookingTimeInput.appendChild(option)
				}
			}
		}
	} catch (error) {
		console.error('Ошибка при загрузке занятых времен:', error)
		alert('Не удалось загрузить занятые времена')
	}
}

async function handleFormSubmit(event) {
	event.preventDefault()

	const token = localStorage.getItem('accessToken')
	if (!token) {
		alert('Пожалуйста войдите в систему')
	}

	const masterID = document.getElementById('masterSelect').value
	const problemDescription = document.getElementById('problemDescription').value
	const address = document.getElementById('address').value
	const apartmentNumber = document.getElementById('apartmentNumber').value
	const bookingDate = document.getElementById('bookingDate').value
	const bookingTime = document.getElementById('bookingTime').value

	const currentDate = new Date().toISOString().split('T')[0]
	if (bookingDate < currentDate) {
		alert('Нельзя выбрать дату раньше текущей')
		return
	}

	if (
		!masterID ||
		!problemDescription ||
		!address ||
		!apartmentNumber ||
		!bookingDate ||
		!bookingTime
	) {
		alert('Все поля должны быть заполнены')
		return
	}

	try {
		const response = await fetch(`${serverURL}/statement/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
			},
			body: JSON.stringify({
				MasterID: masterID,
				ProblemDescription: problemDescription,
				Address: address,
				ApartmentNumber: apartmentNumber,
				Date: bookingDate,
				Time: bookingTime,
			}),
		})

		if (response.status === 401) {
			accessToken = await refreshAccessToken()
			if (!accessToken) return

			response = await fetch(`${serverURL}/statement/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					MasterID: masterID,
					ProblemDescription: problemDescription,
					Address: address,
					ApartmentNumber: apartmentNumber,
					Date: bookingDate,
					Time: bookingTime,
				}),
			})
		}
		
		const result = await response.json()
		if (response.ok) {
			alert('Заявка успешно создана!')
		} else {
			alert(`Ошибка: ${result.error}`)
		}
	} catch (error) {
		console.error('Ошибка при отправке заявки:', error)
		alert('Произошла ошибка при отправке заявки')
	}
}

async function refreshAccessToken() {
	try {
		const response = await fetch(`${serverURL}/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
		})

		if (!response.ok) {
			throw new Error('Не удалось обновить токен')
		}

		const data = await response.json()
		localStorage.setItem('accessToken', data.accessToken)
		return data.accessToken
	} catch (error) {
		console.error('Ошибка при обновлении токена:', error)
		localStorage.removeItem('accessToken')
	}
}

document.addEventListener('DOMContentLoaded', function () {
	loadMasters()

	const roleId = localStorage.getItem('roleId')

	if (roleId) {
		updateUIAfterLogin(roleId)
	} else {
		updateUIAfterLogout()
	}
	const logoutButton = document.querySelector('.header__leave-button')
	const bookingDateInput = document.getElementById('bookingDate')
	const bidForm = document.getElementById('bidForm')
	const registerForm = document.getElementById('registerForm')
	const loginForm = document.getElementById('loginForm')

	bookingDateInput.addEventListener('change', handleDateChange)
	bidForm.addEventListener('submit', handleFormSubmit)
	registerForm.addEventListener('submit', registerUser)
	loginForm.addEventListener('submit', loginUser)
	logoutButton.addEventListener('click', logoutUser)
})
