const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
let animationId;

let visualizerType = "bars";
let source;
let visualizerModeChangeTime = new Date();

async function startVisualization(visualizerType) {
  if (!source) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      document.getElementById('welcome').style.display = 'none';
      document.getElementById('settings').classList.add('visible');
    } catch (err) {
      console.error('Error accessing audio stream:', err);
    }
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // Add this line to send an event to Google Analytics
  gtag('event', 'visualizer_mode_start', { 'event_category': 'Visualizer', 'event_label': visualizerType });

  // Update the visualizer mode change time
  visualizerModeChangeTime = new Date();

  if (visualizerType === 'trippy') {
    psychedelicVisualize();
  } else {
    visualize();
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.getElementById('startButton').addEventListener('click', () => {
  startVisualization(visualizerType);
});

document.getElementById('bars').addEventListener('click', (event) => {
  if(visualizerType !== 'bars') {
    visualizerType = 'bars';
    stopVisualization();
    startVisualization('bars');
  }
});

document.getElementById('trippy').addEventListener('click', (event) => {
  if(visualizerType !== 'trippy') {
    visualizerType = 'trippy';
    stopVisualization();
    startVisualization('trippy');
  }
});

document.getElementById('poop').addEventListener('click', (event) => {
  if(visualizerType !== 'poop') {
    visualizerType = 'poop';
    stopVisualization();
    startVisualization('poop');
  }
});


function barsVisualize() {
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 6.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 2;
      const hue = i / bufferLength * 360;

      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}

function psychedelicVisualize() {
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let shapes = [];
  let stars = [];

  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1 + 0.5,
    });
  }

  function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let sum = dataArray.reduce((a, b) => a + b, 0);
    let avg = sum / dataArray.length;

    const maxWaveCount = 8;
    const waveCount = Math.ceil((avg / 255) * maxWaveCount);

    for (let i = 0; i < waveCount; i++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * (0.45 + i * 0.04));

      const waveWidth = 0.02 + i * 0.005;
      const waveHeight = 20 * (1 + avg * 0.01) * (1 + i * 0.1);

      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height * (0.45 + i * 0.04) +
          Math.sin(x * waveWidth + i * 0.2) * Math.cos(x * waveWidth) * waveHeight;

        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `hsla(${Math.random() * 360}, 100%, 50%, 0.5)`;
      ctx.stroke();
      ctx.closePath();
    }

    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      ctx.fillStyle = `hsla(0, 0%, 100%, ${avg / 255})`;
      ctx.fill();
      ctx.closePath();
    });

    if (Math.random() < 0.08) {
      const radius = Math.random() * 30 + 10;
      const hue = Math.random() * 360;
      const shapeTypes = avg > 50 ? ['circle', 'nebula', 'splash'] : (avg > 20 ? ['circle', 'splash'] : ['circle']);
      const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        hue: hue,
        scale: 1,
        opacity: 1,
        type: shapeType,
      });
    }

    shapes = shapes.filter((shape) => shape.opacity > 0.01);

    shapes.forEach((shape) => {
      if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius * shape.scale, 0, 2 * Math.PI);
        ctx.fillStyle = `hsla(${shape.hue}, 100%, 50%, ${shape.opacity})`;
        ctx.fill();
        ctx.closePath();
      } else if (shape.type === 'nebula') {
        const circleCount = 5;
        for (let i = 0; i < circleCount; i++) {
          ctx.beginPath();
          const offsetX = (Math.random() - 0.5) * shape.radius * shape.scale;
          const offsetY = (Math.random() - 0.5) * shape.radius * shape.scale;
          const circleRadius = (Math.random() * 0.5 + 0.5) * shape.radius * shape.scale;
          const circleHue = shape.hue + Math.random() * 60 - 30;
          ctx.arc(shape.x + offsetX, shape.y + offsetY, circleRadius, 0, 2 * Math.PI);
          ctx.fillStyle = `hsla(${circleHue}, 100%, 50%, ${shape.opacity})`;
          ctx.fill();
          ctx.closePath();
        }
      } else if (shape.type === 'splash') {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, (shape.radius * shape.scale) * (i + 1), 0, 2 * Math.PI);
          ctx.strokeStyle = `hsla(${shape.hue}, 100%, 50%, ${shape.opacity})`;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.closePath();
        }
      }

      shape.scale += 0.03;
      shape.opacity -= 0.015;
    });
  }

  draw();
}

function poopVisualize() {
  const poopEmoji = new Image();
  poopEmoji.src = 'https://emojicdn.elk.sh/%F0%9F%92%A9?size=100';

  let poops = [];

  function draw() {
    animationId = requestAnimationFrame(draw);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.1) {
      poops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        scale: 1,
        opacity: 1,
      });
    }

    poops = poops.filter((poop) => poop.opacity > 0.01);

    poops.forEach((poop) => {
      ctx.save();
      ctx.globalAlpha = poop.opacity;
      ctx.drawImage(poopEmoji, poop.x, poop.y, 100 * poop.scale, 100 * poop.scale);
      ctx.restore();

      poop.scale += 0.03;
      poop.opacity -= 0.015;
    });
  }

  draw();
}

function visualize() {
  if (visualizerType === 'bars') {
    barsVisualize();
  } else if (visualizerType === 'psychedelic') {
    psychedelicVisualize();
  } else if (visualizerType === 'poop') {
    poopVisualize();
  }
}

function stopVisualization() {
  if (source) {
    const timeSpentInPreviousMode = new Date() - visualizerModeChangeTime;

    gtag('event', 'timing_complete', {
      'name': 'visualizer_mode_duration',
      'value': timeSpentInPreviousMode,
      'event_category': 'Visualizer',
      'event_label': visualizerType,
    });

    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function shutDown() {
  source.disconnect(analyser);
  source.mediaStream.getTracks().forEach((track) => track.stop());
  source = null;
  stopVisualization();
  document.getElementById('welcome').style.display = 'flex';
  document.getElementById('settings').classList.remove('visible');
}

const fullscreenButton = document.getElementById("fullscreen");
fullscreenButton.addEventListener("click", () => {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) { /* Safari */
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) { /* IE11 */
    canvas.msRequestFullscreen();
  }
});

document.getElementById('stopButton').addEventListener('click', () => {
  shutDown();
});

const settingsElement = document.querySelector('#settings');
let timeoutId;

const welcomeElement = document.getElementById('welcome');

document.addEventListener('mousemove', () => {
  if (welcomeElement.style.display === 'none') {
    clearTimeout(timeoutId);
    settingsElement.classList.add('visible');
    document.body.style.cursor = 'auto';
    timeoutId = setTimeout(() => {
      settingsElement.classList.remove('visible');
      document.body.style.cursor = 'none';
    }, 3000);
  }
});

document.addEventListener('mouseleave', () => {
  clearTimeout(timeoutId);
  settingsElement.classList.remove('visible');
  document.body.style.cursor = 'none';
});

document.addEventListener('keydown', (event) => {
  if (welcomeElement.style.display === 'none') {
    if (event.key === 'f' || event.key === 'F') {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) { /* Safari */
        canvas.webkitRequestFullscreen();
      } else if (canvas.msRequestFullscreen) { /* IE11 */
        canvas.msRequestFullscreen();
      }
    }
  }
});
