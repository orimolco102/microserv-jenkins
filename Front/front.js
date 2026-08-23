
async function load() {
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const items = document.getElementById('items');
  try {
    const health_res = await fetch('http://127.0.0.1:3000/health');
    const health_data = await health_res.json();

    const data_res = await fetch('http://127.0.0.1:3000/api/data');
    const data_data = await data_res.json();
    dot.classList.add('ok');
    statusText.textContent = 'מחובר';
    document.getElementById('buildNum').textContent = health_data.build ?? '—';
    document.getElementById('commitHash').textContent = health_data.commit ?? '—';
    console.log(data_data);
    
    if (data_data.length) {
        // console.log("ifworking")
      items.innerHTML = `<p>${data_data}</p>`;
    } else {
      items.innerHTML = '<li class="empty">אין נתונים להצגה</li>';
    }
  } catch (err) {
    dot.classList.add('fail');
    statusText.textContent = 'אין חיבור ל-api';
    items.innerHTML = '<li class="error">נכשלה קריאה לשירות הנתונים</li>';
  }
}
load();