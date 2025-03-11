import { serverURL } from './constants.js'

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
			`${serverURL}/statement/acceptRequest/${requestId}`,
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
    const response = await fetch(`${serverURL}/statement/reject-request/${requestId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (response.ok) {
      alert('Заявка отклонена');
      loadRequests(); 
    } else {
      alert('Ошибка при отклонении заявки');
    }
  } catch (error) {
    console.error('Ошибка при отклонении заявки:', error);
    alert('Произошла ошибка при отклонении заявки');
  }
}

export function openTab(evt, tabName) {
	const tabcontent = document.getElementsByClassName('tabcontent')
	for (let i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none'
	}

	const tablinks = document.getElementsByClassName('tablinks')
	for (let i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '')
	}

	document.getElementById(tabName).style.display = 'block'
	evt.currentTarget.className += ' active'
}

window.openTab = openTab

export function closeAdminPanel() {
	document.getElementById('adminPanelDialog').close()
}

window.confirmRequest = confirmRequest
window.rejectRequest = rejectRequest
