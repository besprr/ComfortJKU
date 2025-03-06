// index.js
import { loadRequests } from './admin.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { handleDateChange, loadMasters } from './masters.js'
import { updateUIAfterLogin, updateUIAfterLogout } from './ui.js'

document.addEventListener('DOMContentLoaded', () => {
	const loginButton = document.querySelector('.header__login-button')
	const registerButton = document.querySelector('.header__register-button')
	const logoutButton = document.querySelector('.header__leave-button')
	const masterSelect = document.querySelector('#masterSelect')

	if (loginButton) loginButton.addEventListener('click', loginUser)
	if (registerButton) registerButton.addEventListener('click', registerUser)
	if (logoutButton) logoutButton.addEventListener('click', logoutUser)
	if (masterSelect) masterSelect.addEventListener('change', handleDateChange)

	if (localStorage.getItem('accessToken')) {
		const roleId = localStorage.getItem('roleId')
		updateUIAfterLogin(roleId)
		loadMasters()
	} else {
		updateUIAfterLogout()
	}

	loadRequests()
})
