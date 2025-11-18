// ======= ELEMENTY DOM =======
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');

const authMessage = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');

const gameForm = document.getElementById('gameForm');
const titleInput = document.getElementById('titleInput');
const yearInput = document.getElementById('yearInput');
const ratingInput = document.getElementById('ratingInput');
const descriptionInput = document.getElementById('descriptionInput');
const saveButton = document.getElementById('saveButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const gamesTableBody = document.querySelector('#gamesTable tbody');

let editingId = null; // jeżeli null -> dodawanie, jeżeli liczba -> edycja istniejącej gry

// ======= POMOCNICZE FUNKCJE UI =======

function showAuth(message) {
  authSection.style.display = 'block';
  appSection.style.display = 'none';
  if (message) {
    authMessage.textContent = message;
  } else {
    authMessage.textContent = '';
  }
}

function showApp(user) {
  authSection.style.display = 'none';
  appSection.style.display = 'block';
  userNameSpan.textContent = user.username || '';
  authMessage.textContent = '';
}

function setGameFormToCreate() {
  editingId = null;
  saveButton.textContent = 'Dodaj';
  cancelEditButton.style.display = 'none';
  gameForm.reset();
}

function setGameFormToEdit(game) {
  editingId = game.id;
  titleInput.value = game.title;
  yearInput.value = game.year;
  ratingInput.value = game.rating;
  descriptionInput.value = game.description || '';
  saveButton.textContent = 'Zapisz zmiany';
  cancelEditButton.style.display = 'inline-block';
}

// ======= AUTORYZACJA =======

async function checkAuth() {
  try {
    const res = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Brak autoryzacji');
    }

    const user = await res.json();
    showApp(user);
    await loadGames();
  } catch (err) {
    showAuth('Zaloguj się, aby zarządzać biblioteką gier.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const body = {
    username: formData.get('username'),
    password: formData.get('password'),
  };

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error((data && data.message) || 'Błąd logowania');
    }

    const data = await res.json();
    showApp(data.user);
    loginForm.reset();
    await loadGames();
  } catch (err) {
    console.error(err);
    authMessage.textContent = err.message || 'Błąd logowania';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const body = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      // jeżeli backend zwrócił errors, pokaż pierwszy
      if (data && data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].message || 'Błąd rejestracji');
      }
      throw new Error(data && data.message ? data.message : 'Błąd rejestracji');
    }

    const data = await res.json();
    showApp(data.user);
    registerForm.reset();
    await loadGames();
  } catch (err) {
    console.error(err);
    authMessage.textContent = err.message || 'Błąd rejestracji';
  }
}

async function handleLogout() {
  try {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Błąd wylogowania:', err);
  } finally {
    showAuth('Zostałeś wylogowany.');
    gamesTableBody.innerHTML = '';
    setGameFormToCreate();
  }
}

// ======= CRUD GIER =======

async function loadGames() {
  try {
    const res = await fetch('/api/games', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        showAuth('Zaloguj się, aby zobaczyć swoje gry.');
        return;
      }
      throw new Error('Nie udało się pobrać gier');
    }

    const games = await res.json();
    renderGames(games);
  } catch (err) {
    console.error(err);
  }
}

function renderGames(games) {
  gamesTableBody.innerHTML = '';

  games.forEach((game) => {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.textContent = game.id;

    const titleTd = document.createElement('td');
    titleTd.textContent = game.title;

    const yearTd = document.createElement('td');
    yearTd.textContent = game.year;

    const ratingTd = document.createElement('td');
    ratingTd.textContent = game.rating;

    const descTd = document.createElement('td');
    descTd.textContent = game.description || '';

    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edytuj';
    editBtn.addEventListener('click', () => setGameFormToEdit(game));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Usuń';
    deleteBtn.addEventListener('click', () => deleteGame(game.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(idTd);
    tr.appendChild(titleTd);
    tr.appendChild(yearTd);
    tr.appendChild(ratingTd);
    tr.appendChild(descTd);
    tr.appendChild(actionsTd);

    gamesTableBody.appendChild(tr);
  });
}

async function saveGame(event) {
  event.preventDefault();

  const game = {
    title: titleInput.value.trim(),
    year: Number(yearInput.value),
    rating: Number(ratingInput.value),
    description: descriptionInput.value.trim(),
  };

  if (!game.title || !game.year || !game.rating) {
    alert('Uzupełnij tytuł, rok i ocenę.');
    return;
  }

  const isEdit = editingId !== null;
  const url = isEdit ? `/api/games/${editingId}` : '/api/games';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(game),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        showAuth('Sesja wygasła – zaloguj się ponownie.');
        return;
      }
      throw new Error('Błąd zapisywania gry');
    }

    await loadGames();
    setGameFormToCreate();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Błąd zapisywania gry');
  }
}

async function deleteGame(id) {
  if (!confirm('Na pewno chcesz usunąć tę grę?')) return;

  try {
    const res = await fetch(`/api/games/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        showAuth('Sesja wygasła – zaloguj się ponownie.');
        return;
      }
      throw new Error('Błąd usuwania gry');
    }

    await loadGames();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Błąd usuwania gry');
  }
}

// ======= PODPIĘCIE ZDARZEŃ =======
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);

gameForm.addEventListener('submit', saveGame);
cancelEditButton.addEventListener('click', setGameFormToCreate);

// ======= START APLIKACJI =======
checkAuth();
