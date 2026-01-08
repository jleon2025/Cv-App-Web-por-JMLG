// Manejo de almacenamiento local "Serverless"

const STORAGE_KEY = 'cv_editor_data';

function saveToLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showAutoSaveIndicator();
  } catch (e) {
    console.error('Error saving to local storage', e);
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading from local storage', e);
    return null;
  }
}

function clearLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

// Simple visual feedback
function showAutoSaveIndicator() {
  let ind = document.getElementById('autosave-indicator');
  if (!ind) {
    ind = document.createElement('div');
    ind.id = 'autosave-indicator';
    ind.style.position = 'fixed';
    ind.style.bottom = '10px';
    ind.style.right = '10px';
    ind.style.padding = '5px 10px';
    ind.style.background = 'rgba(0, 0, 0, 0.7)';
    ind.style.color = '#fff';
    ind.style.borderRadius = '5px';
    ind.style.fontSize = '12px';
    ind.style.opacity = '0';
    ind.style.transition = 'opacity 0.5s';
    ind.innerText = 'Guardado';
    document.body.appendChild(ind);
  }

  ind.style.opacity = '1';
  setTimeout(() => { ind.style.opacity = '0'; }, 1500);
}
