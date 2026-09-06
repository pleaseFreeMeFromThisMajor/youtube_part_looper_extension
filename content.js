function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

let isLooping = false;
let startTime = 0;
let endTime = 0;

function injectStyles() {
  if (document.getElementById('ytb-loop-style')) return;
  const style = document.createElement('style');
  style.id = 'ytb-loop-style';
  style.textContent = `
    #ytb-loop-container {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #0f0f0f;
      color: #fff;
      padding: 10px 16px;
      border-radius: 12px;
      margin: 12px 0;
      border: 1px solid #333;
      font-family: "Roboto", "Arial", sans-serif;
      font-size: 14px;
      width: fit-content;
    }
    #ytb-loop-container input {
      width: 55px;
      background: #212121;
      border: 1px solid #555;
      color: #fff;
      padding: 4px 6px;
      border-radius: 6px;
      text-align: center;
    }
    #ytb-loop-container button {
      padding: 6px 14px;
      border: none;
      border-radius: 18px;
      cursor: pointer;
      font-weight: 600;
      background-color: #f12bb2;
      color: white;
      transition: background 0.2s;
    }
    #ytb-loop-container button.active {
      background-color: #2ba640;
    }
    #ytb-loop-status {
      font-size: 12px;
      color: #aaa;
    }
  `;
  document.head.appendChild(style);
}

function createLoopUI() {
  if (document.getElementById('ytb-loop-container')) return;

  const targetContainer = 
    document.querySelector('ytd-watch-metadata #title') || 
    document.querySelector('#title.ytd-watch-metadata') ||
    document.querySelector('#actions.ytd-watch-metadata');

  if (!targetContainer) return;

  injectStyles();

  const loopDiv = document.createElement('div');
  loopDiv.id = 'ytb-loop-container';
  loopDiv.innerHTML = `
    <span><b>Loop Segment:</b></span>
    <label>Từ: <input type="text" id="ytb-loop-start" value="1:25"></label>
    <label>Đến: <input type="text" id="ytb-loop-end" value="3:00"></label>
    <button id="ytb-loop-btn-toggle">Bật Loop</button>
    <span id="ytb-loop-status"></span>
  `;

  targetContainer.insertAdjacentElement('afterend', loopDiv);

  const btnToggle = document.getElementById('ytb-loop-btn-toggle');
  const inputStart = document.getElementById('ytb-loop-start');
  const inputEnd = document.getElementById('ytb-loop-end');
  const statusSpan = document.getElementById('ytb-loop-status');

  btnToggle.addEventListener('click', () => {
    isLooping = !isLooping;

    if (isLooping) {
      startTime = timeToSeconds(inputStart.value);
      endTime = timeToSeconds(inputEnd.value);

      if (endTime <= startTime) {
        alert('Thời gian "Đến" phải lớn hơn thời gian "Từ"');
        isLooping = false;
        return;
      }

      btnToggle.textContent = 'end loop';
      btnToggle.classList.add('active');
      statusSpan.textContent = 'on loop';

      const video = document.querySelector('video');
      if (video && (video.currentTime < startTime || video.currentTime >= endTime)) {
        video.currentTime = startTime;
      }
    } else {
      btnToggle.textContent = 'start loop';
      btnToggle.classList.remove('active');
      statusSpan.textContent = '';
    }
  });
}

// Kiểm tra và tạo UI liên tục
setInterval(() => {
  if (window.location.href.includes('watch')) {
    createLoopUI();
  }
}, 1000);

// Xử lý logic loop video
setInterval(() => {
  const video = document.querySelector('video');
  if (video && isLooping && endTime > startTime) {
    if (video.currentTime >= endTime || video.currentTime < startTime) {
      video.currentTime = startTime;
    }
  }
}, 200);