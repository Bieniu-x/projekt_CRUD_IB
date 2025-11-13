const api = {
  list: () => fetch('/api/games').then(r => r.json()),
  get: (id) => fetch(`/api/games/${id}`).then(r => r.json()),
  create: (data) => fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => fetch(`/api/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => fetch(`/api/games/${id}`, { method: 'DELETE' })
};

const tbody = document.querySelector('#games-table tbody');
const form = document.querySelector('#game-form');
const idInput = document.querySelector('#game-id');
const titleInput = document.querySelector('#title');
const yearInput = document.querySelector('#year');
const ratingInput = document.querySelector('#rating');
const descInput = document.querySelector('#description');
const errorBox = document.querySelector('#error');
const saveBtn = document.querySelector('#save-btn');
const cancelBtn = document.querySelector('#cancel-btn');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = !msg;
}

function formData() {
  return {
    title: titleInput.value.trim(),
    year: Number(yearInput.value),
    rating: Number(ratingInput.value),
    description: descInput.value.trim() || null
  };
}

function resetForm() {
  idInput.value = '';
  form.reset();
  saveBtn.textContent = 'Dodaj';
  cancelBtn.hidden = true;
  [...tbody.children].forEach(tr => tr.classList.remove('editing'));
  showError('');
}

async function loadTable() {
  const rows = await api.list();
  tbody.innerHTML = '';
  for (const g of rows) {
    const tr = document.createElement('tr');
    tr.dataset.id = g.id;
    tr.innerHTML = `
      <td>${g.id}</td>
      <td>${g.title}</td>
      <td>${g.year}</td>
      <td>${g.rating}</td>
      <td>${g.description ?? ''}</td>
      <td class="actions">
        <button data-action="edit">Edytuj</button>
        <button data-action="delete">Usuń</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;

  if (btn.dataset.action === 'edit') {
    const g = await api.get(id);
    idInput.value = g.id;
    titleInput.value = g.title;
    yearInput.value = g.year;
    ratingInput.value = g.rating;
    descInput.value = g.description ?? '';
    saveBtn.textContent = 'Zapisz';
    cancelBtn.hidden = false;
    [...tbody.children].forEach(row => row.classList.remove('editing'));
    tr.classList.add('editing');
    showError('');
  }

  if (btn.dataset.action === 'delete') {
    if (!confirm('Usunąć tę grę?')) return;
    const res = await api.remove(id);
    if (res.status === 204) loadTable();
    else {
      const body = await res.json().catch(() => ({}));
      showError(body.error || 'Błąd usuwania');
    }
  }
});

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');

  const data = formData();
  let res;

  if (idInput.value) {
    res = await api.update(idInput.value, data);
  } else {
    res = await api.create(data);
  }

  if (res.ok) {
    resetForm();
    loadTable();
  } else {
    const body = await res.json().catch(() => ({}));
    const message = body.error || 'Błąd walidacji';
    const details = body.details ? ' ' + Object.values(body.details).join(' ') : '';
    showError(message + details);
  }
});

loadTable();
