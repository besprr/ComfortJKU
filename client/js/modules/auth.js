// auth.js

const serverURL = 'http://localhost:3000';

export async function loginUser() {
  const Login = document.getElementById('authLogin').value;
  const Password = document.getElementById('authPassword').value;

  if (!Login || !Password) {
    alert('Все поля должны быть заполнены!');
    return;
  }

  const userData = {
    Login,
    Password,
  };

  try {
    const response = await fetch(`${serverURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (response.ok) {
      alert('Авторизация успешна');
      const accessToken = result.accessToken;

      if (!accessToken) {
        throw new Error('Токен отсутствует в ответе сервера');
      }

      const decodedToken = decodeToken(accessToken);
      if (!decodedToken) {
        throw new Error('Не удалось декодировать токен');
      }

      localStorage.setItem('userId', decodedToken.userId);
      localStorage.setItem('login', decodedToken.login);
      localStorage.setItem('roleId', decodedToken.roleId);
      localStorage.setItem('accessToken', accessToken);

      updateUIAfterLogin(decodedToken.roleId);
      Login.value = '';
      Password.value = '';
    } else {
      alert(`Ошибка: ${response.error}`);
    }
  } catch (error) {
    console.log('Ошибка при авторизации', error);
  }
}

export function decodeToken(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export async function registerUser() {
  const Name = document.getElementById('registerName').value;
  const Phone = document.getElementById('registerTel').value;
  const Email = document.getElementById('registerEmail').value;
  const Login = document.getElementById('registerLogin').value;
  const Password = document.getElementById('registerPassword').value;

  if (!Name || !Phone || !Email || !Login || !Password) {
    alert('Все поля должны быть заполнены');
    return;
  }

  const userData = {
    Name,
    Phone,
    Email,
    Login,
    Password,
  };

  try {
    const response = await fetch(`${serverURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (response.ok) {
      alert('Пользователь успешно зарегистрирован!');
    } else {
      alert(`Ошибка: ${result.error}`);
    }
  } catch (error) {
    console.log('Ошибка регистрации ', error);
  }
}

export function logoutUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('login');
  localStorage.removeItem('roleId');
  updateUIAfterLogout();
}
