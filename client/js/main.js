const serverURL = 'http://localhost:3000'

function updateUIAfterLogin() {
	const loginButton = document.querySelector('.header__login-button')
	const registerButton = document.querySelector('.header__register-button')
	const logoutButton = document.querySelector('.header__leave-button')
	const adminButton = document.querySelector('.header__admin-button')

	loginButton.style.display = 'none'
	registerButton.style.display = 'none'

	logoutButton.style.display = 'inline-block'
	if (localStorage.getItem('roleId') === '1') {
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

//Выход из аккаунта
function logoutUser() {
	localStorage.removeItem('userId')
	localStorage.removeItem('login')
	localStorage.removeItem('roleId')

	updateUIAfterLogout()
}

//Авторизация
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


//Админ панель

function closeAdminPanel() {
	document.getElementById('adminPanelDialog').close();
}

function openTab(evt, tabName) {
	let i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = 'none';
	}
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(' active', '');
	}
	document.getElementById(tabName).style.display = 'block';
	evt.currentTarget.className += ' active';
}

async function loadRequests() {
	try {
			const response = await fetch(`${serverURL}/admin/requests`, {
					headers: {
							Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
					},
			});
			const data = await response.json();
			console.log('Ответ сервера:', data);

			// Проверяем, что result существует и приводим его к массиву
			const requests = Array.isArray(data.result) ? data.result : [data.result];

			console.log('requests:', requests);
			console.log('Is Array:', Array.isArray(requests));

			const allRequestsTableBody = document.querySelector('#allRequestsTableBody');
			const pendingRequestsTableBody = document.querySelector('#pendingRequestsTableBody');

			// Очищаем таблицы перед добавлением новых данных
			allRequestsTableBody.innerHTML = '';
			pendingRequestsTableBody.innerHTML = '';

			requests.forEach(request => {
					// Добавляем строку в таблицу "Все заявки"
					const allRequestsRow = document.createElement('tr');
					allRequestsRow.innerHTML = `
							<td>${request.RequestID}</td>
							<td>${request.UserName || 'Не указано'}</td>
							<td>${request.ProblemDescription}</td>
							<td>${request.Address}</td>
							<td>${request.MasterName || 'Не назначен'}</td>
							<td>${request.StatusName}</td>
					`;
					allRequestsTableBody.appendChild(allRequestsRow);

					// Добавляем строку в таблицу "Заявки на подтверждение", если статус "Pending"
					if (request.StatusName === 'Pending') {
							const pendingRequestsRow = document.createElement('tr');
							pendingRequestsRow.innerHTML = `
									<td>${request.UserName || 'Не указано'}</td>
									<td>${request.ProblemDescription}</td>
									<td>${request.Address}</td>
									<td>${request.MasterName || 'Не назначен'}</td>
									<td>
											<button type="button" onclick="confirmRequest(${request.RequestID})">Подтвердить</button>
											<button type="button" onclick="rejectRequest(${request.RequestID})">Отклонить</button>
									</td>
							`;
							pendingRequestsTableBody.appendChild(pendingRequestsRow);
					}
			});
	} catch (error) {
			console.error('Ошибка при загрузке заявок:', error);
			alert('Не удалось загрузить заявки');
	}
}

async function confirmRequest(requestId) {
	try {
			const response = await fetch(
					`${serverURL}/admin/confirm-request/${requestId}`,
					{
							method: 'POST',
							headers: {
									Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
							},
					}
			);

			if (response.ok) {
					alert('Заявка подтверждена');
					loadRequests(); // Перезагружаем данные после подтверждения
			} else {
					alert('Ошибка при подтверждении заявки');
			}
	} catch (error) {
			console.error('Ошибка при подтверждении заявки:', error);
			alert('Произошла ошибка при подтверждении заявки');
	}
}

async function rejectRequest(requestId) {
	try {
			const response = await fetch(
					`${serverURL}/admin/reject-request/${requestId}`,
					{
							method: 'POST',
							headers: {
									Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
							},
					}
			);

			if (response.ok) {
					alert('Заявка отклонена');
					loadRequests(); // Перезагружаем данные после отклонения
			} else {
					alert('Ошибка при отклонении заявки');
			}
	} catch (error) {
			console.error('Ошибка при отклонении заявки:', error);
			alert('Произошла ошибка при отклонении заявки');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	loadMasters()
	loadRequests()

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

	document.querySelector('.tablinks').click();
})
