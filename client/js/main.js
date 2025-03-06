// main.js
import { loadRequests } from './admin.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { handleDateChange, loadMasters } from './masters.js'
import { handleFormSubmit } from './statements.js'
import { updateUIAfterLogin, updateUIAfterLogout } from './ui.js'

document.addEventListener('DOMContentLoaded', () => {
  const roleId = localStorage.getItem('roleId');
  roleId ? updateUIAfterLogin() : updateUIAfterLogout();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').setAttribute('min', today);

  loadMasters();
  loadRequests();

  document.getElementById('bookingDate').addEventListener('change', handleDateChange);
  document.getElementById('bidForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('registerForm').addEventListener('submit', registerUser);
  document.getElementById('loginForm').addEventListener('submit', loginUser);
  document.querySelector('.header__leave-button').addEventListener('click', logoutUser);

	
  document.querySelector('.tablinks').click();
});