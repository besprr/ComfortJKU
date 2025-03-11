import { serverURL } from './constants.js'

export async function loadMasters() {
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

export async function handleDateChange(event) {
	const selectedDate = event.target.value
	const masterID = document.getElementById('masterSelect').value

	if (!masterID || isNaN(masterID)) {
		alert('Сначала выберите мастера')
		return
	}

	if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
		alert('Некорректная дата')
		return
	}

	try {
		const response = await fetch(
			`${serverURL}/statement/booked-times/${masterID}/${selectedDate}`
		)
		const bookedTimes = await response.json()

		const bookingTimeInput = document.getElementById('bookingTime')
		bookingTimeInput.innerHTML = ''

		for (let hour = 9; hour <= 18; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const time = `${String(hour).padStart(2, '0')}:${String(
					minute
				).padStart(2, '0')}`
				const isBooked = bookedTimes.some(
					booked => time >= booked.start && time < booked.end
				)

				if (!isBooked) {
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
