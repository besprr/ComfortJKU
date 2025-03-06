// ui.js
export function updateUIAfterLogin() {
  const loginButton = document.querySelector('.header__login-button');
  const registerButton = document.querySelector('.header__register-button');
  const logoutButton = document.querySelector('.header__leave-button');
  const adminButton = document.querySelector('.header__admin-button');

  loginButton.style.display = 'none';
  registerButton.style.display = 'none';
  logoutButton.style.display = 'inline-block';

  if (localStorage.getItem('roleId') === '1') {
    adminButton.style.display = 'inline-block';
  } else {
    adminButton.style.display = 'none';
  }
}

export function updateUIAfterLogout() {
  const loginButton = document.querySelector('.header__login-button');
  const registerButton = document.querySelector('.header__register-button');
  const logoutButton = document.querySelector('.header__leave-button');
  const adminButton = document.querySelector('.header__admin-button');

  loginButton.style.display = 'inline-block';
  registerButton.style.display = 'inline-block';
  logoutButton.style.display = 'none';
  adminButton.style.display = 'none';
}