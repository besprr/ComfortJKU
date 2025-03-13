import { refreshAccessToken } from './auth.js'
import { serverURL } from './constants.js'

export async function handleFormSubmit(event) {
	event.preventDefault()

	const token = localStorage.getItem('accessToken')
	if (!token) {
		alert('Пожалуйста войдите в систему')
		return
	}

	const masterID = document.getElementById('masterSelect').value
	const problemDescription = document.getElementById('problemDescription').value
	const address = document.getElementById('address').value
	const apartmentNumber = document.getElementById('apartmentNumber').value
	const bookingDate = document.getElementById('bookingDate').value
	const bookingTime = document.getElementById('bookingTime').value

	const currentDate = new Date().toISOString().split('T')[0]
	console.log(bookingDate)
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
		let response = await fetch(`${serverURL}/statement/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
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
			const newToken = await refreshAccessToken()
			if (!newToken) return

			response = await fetch(`${serverURL}/statement/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${newToken}`,
				},
				credentials: 'include',
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
