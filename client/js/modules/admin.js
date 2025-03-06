// admin.js

const serverURL = 'http://localhost:3000'

export async function loadRequests() {
	try {
		const response = await fetch(`${serverURL}/admin/requests`)
		const data = await response.json()
		const requests = Array.isArray(data.result) ? data.result : [data.result]

		const allRequestsTableBody = document.querySelector('#allRequestsTableBody')
		const pendingRequestsTableBody = document.querySelector(
			'#pendingRequestsTableBody'
		)

		allRequestsTableBody.innerHTML = ''
		pendingRequestsTableBody.innerHTML = ''

		requests.forEach(request => {
			const allRequestsRow = document.createElement('tr')
			allRequestsRow.innerHTML = `
        <td>${request.RequestID}</td>
        <td>${request.UserName || 'Не указано'}</td>
        <td>${request.ProblemDescription}</td>
        <td>${request.Address}</td>
        <td>${request.MasterName || 'Не назначен'}</td>
        <td>${request.StatusName}</td>
      `
			allRequestsTableBody.appendChild(allRequestsRow)

			if (request.StatusName === 'Pending') {
				const pendingRequestsRow = document.createElement('tr')
				pendingRequestsRow.innerHTML = `
          <td>${request.UserName || 'Не указано'}</td>
          <td>${request.ProblemDescription}</td>
          <td>${request.Address}</td>
          <td>${request.MasterName || 'Не назначен'}</td>
          <td class='requests__btn-group'>
            <button type="button" onclick="confirmRequest(${
							request.RequestID
						})">Подтвердить</button>
            <button type="button" onclick="rejectRequest(${
							request.RequestID
						})">Отклонить</button>
          </td>
        `
				pendingRequestsTableBody.appendChild(pendingRequestsRow)
			}
		})
	} catch (error) {
		console.error('Ошибка при загрузке заявок:', error)
		alert('Не удалось загрузить заявки')
	}
}

export async function confirmRequest(requestId) {
	try {
		const response = await fetch(
			`${serverURL}/admin/confirm-request/${requestId}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
				},
			}
		)

		if (response.ok) {
			alert('Заявка подтверждена')
			loadRequests()
		} else {
			alert('Ошибка при подтверждении заявки')
		}
	} catch (error) {
		console.error('Ошибка при подтверждении заявки:', error)
		alert('Произошла ошибка при подтверждении заявки')
	}
}

export async function rejectRequest(requestId) {
	try {
		const response = await fetch(
			`${serverURL}/admin/reject-request/${requestId}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
				},
			}
		)

		if (response.ok) {
			alert('Заявка отклонена')
			loadRequests()
		} else {
			alert('Ошибка при отклонении заявки')
		}
	} catch (error) {
		console.error('Ошибка при отклонении заявки:', error)
		alert('Произошла ошибка при отклонении заявки')
	}
}
