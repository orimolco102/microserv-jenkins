async function load() {
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const items = document.getElementById('items');
  try {

    const res = await fetch('/status');
    const data = await res.json();

    dot.classList.add('ok');
    statusText.textContent = 'מחובר';
    document.getElementById('buildNum').textContent = data.build ?? '—';
    document.getElementById('commitHash').textContent = data.commit ?? '—';
    console.log(data);
    
    if (data.message) {
      items.innerHTML = `<p>${data.message}</p>`;
    } else {
      items.innerHTML = '<li class="empty">אין נתונים להצגה</li>';
    }
  } catch (err) {
    dot.classList.add('fail');
    statusText.textContent = 'אין חיבור ל-api';
    items.innerHTML = '<li class="error">נכשלה קריאה לשירות הנתונים</li>';
  }
}

document.getElementById('rollBtn').addEventListener('click', async () => {
  const min = document.getElementById('minInput').value;
  const max = document.getElementById('maxInput').value;
  const resultEl = document.getElementById('randomResult');

  try {
    const res = await fetch(`/random?min=${min}&max=${max}`);
    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = `שגיאה: ${data.error}`;
      return;
    }

    resultEl.textContent = `התוצאה: ${data.result}`;
  } catch (err) {
    resultEl.textContent = 'שגיאה בתקשורת עם השרת';
  }
});

load();