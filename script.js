const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blur');
const rotateSlider = document.getElementById('rotate');
const textInput = document.getElementById('textInput');
const textColorInput = document.getElementById('textColor');
const fontSizeSlider = document.getElementById('fontSize');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

const valueEls = {
  brightness: document.getElementById('brightnessValue'),
  contrast: document.getElementById('contrastValue'),
  saturation: document.getElementById('saturationValue'),
  blur: document.getElementById('blurValue'),
  rotate: document.getElementById('rotateValue'),
  fontSize: document.getElementById('fontSizeValue')
};

const state = {
  image: null,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  rotate: 0,
  filterPreset: 'original',
  text: '',
  textColor: '#ffffff',
  fontSize: 48,
  sticker: ''
};

const presets = {
  original: { brightness: 100, contrast: 100, saturation: 100, blur: 0 },
  warm: { brightness: 110, contrast: 110, saturation: 125, blur: 0 },
  vintage: { brightness: 115, contrast: 95, saturation: 85, blur: 0.5 },
  cinematic: { brightness: 90, contrast: 140, saturation: 130, blur: 0 },
  cool: { brightness: 102, contrast: 100, saturation: 80, blur: 0 },
  mono: { brightness: 100, contrast: 120, saturation: 50, blur: 0 }
};

function setFilterValues(values) {
  state.brightness = values.brightness;
  state.contrast = values.contrast;
  state.saturation = values.saturation;
  state.blur = values.blur;

  brightnessSlider.value = values.brightness;
  contrastSlider.value = values.contrast;
  saturationSlider.value = values.saturation;
  blurSlider.value = values.blur;
  updateValueLabels();
}

function updateValueLabels() {
  valueEls.brightness.textContent = `${state.brightness}%`;
  valueEls.contrast.textContent = `${state.contrast}%`;
  valueEls.saturation.textContent = `${state.saturation}%`;
  valueEls.blur.textContent = `${state.blur}px`;
  valueEls.rotate.textContent = `${state.rotate}°`;
  valueEls.fontSize.textContent = `${state.fontSize}`;
}

function renderCanvas() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, w, h);

  if (!state.image) {
    drawPlaceholder();
    return;
  }

  const img = state.image;
  const ratio = Math.min(w / img.width, h / img.height);
  const drawW = img.width * ratio;
  const drawH = img.height * ratio;
  const drawX = (w - drawW) / 2;
  const drawY = (h - drawH) / 2;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((state.rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px)`;

  if (state.filterPreset === 'mono') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) grayscale(1) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'warm') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) sepia(0.3) hue-rotate(-10deg) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'vintage') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) sepia(0.6) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'cinematic') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) hue-rotate(10deg) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'cool') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) hue-rotate(-25deg) blur(${state.blur}px)`;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  drawOverlays(drawX, drawY, drawW, drawH);
}

function drawPlaceholder() {
  const w = canvas.width;
  const h = canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#1c243a');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.font = '700 46px Inter';
  ctx.fillText('Upload a photo to begin', w / 2, h / 2 - 14);
  ctx.font = '500 22px Inter';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('PixelCut Studio', w / 2, h / 2 + 32);
}

function drawOverlays(imageX, imageY, imageW, imageH) {
  if (state.text.trim()) {
    ctx.save();
    ctx.font = `700 ${state.fontSize}px Inter`;
    ctx.fillStyle = state.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillText(state.text, canvas.width / 2, canvas.height / 2 + imageH * 0.37);
    ctx.restore();
  }

  if (state.sticker) {
    const stickerSize = Math.min(imageW * 0.2, 110);
    const stickerX = canvas.width / 2 + imageW * 0.16;
    const stickerY = canvas.height / 2 - imageH * 0.22;

    ctx.save();
    ctx.font = `${stickerSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.fillText(state.sticker, stickerX, stickerY);
    ctx.restore();
  }
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  state.filterPreset = name;

  document.querySelectorAll('.preset').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === name);
  });

  setFilterValues(preset);
  renderCanvas();
}

brightnessSlider.addEventListener('input', (e) => {
  state.brightness = Number(e.target.value);
  state.filterPreset = 'original';
  document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
  updateValueLabels();
  renderCanvas();
});

contrastSlider.addEventListener('input', (e) => {
  state.contrast = Number(e.target.value);
  state.filterPreset = 'original';
  document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
  updateValueLabels();
  renderCanvas();
});

saturationSlider.addEventListener('input', (e) => {
  state.saturation = Number(e.target.value);
  state.filterPreset = 'original';
  document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
  updateValueLabels();
  renderCanvas();
});

blurSlider.addEventListener('input', (e) => {
  state.blur = Number(e.target.value);
  state.filterPreset = 'original';
  document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
  updateValueLabels();
  renderCanvas();
});

rotateSlider.addEventListener('input', (e) => {
  state.rotate = Number(e.target.value);
  updateValueLabels();
  renderCanvas();
});

textInput.addEventListener('input', (e) => {
  state.text = e.target.value;
  renderCanvas();
});

textColorInput.addEventListener('input', (e) => {
  state.textColor = e.target.value;
  renderCanvas();
});

fontSizeSlider.addEventListener('input', (e) => {
  state.fontSize = Number(e.target.value);
  updateValueLabels();
  renderCanvas();
});

imageUpload.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      renderCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === button.dataset.panel);
    });
  });
});

document.querySelectorAll('.preset').forEach((button) => {
  button.addEventListener('click', () => applyPreset(button.dataset.preset));
});

document.querySelectorAll('.sticker').forEach((button) => {
  button.addEventListener('click', () => {
    state.sticker = button.dataset.sticker;
    renderCanvas();
  });
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'pixelcut-export.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

resetBtn.addEventListener('click', () => {
  state.image = null;
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  state.blur = 0;
  state.rotate = 0;
  state.filterPreset = 'original';
  state.text = '';
  state.textColor = '#ffffff';
  state.fontSize = 48;
  state.sticker = '';

  textInput.value = '';
  textColorInput.value = '#ffffff';
  fontSizeSlider.value = 48;
  brightnessSlider.value = 100;
  contrastSlider.value = 100;
  saturationSlider.value = 100;
  blurSlider.value = 0;
  rotateSlider.value = 0;

  document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));

  updateValueLabels();
  renderCanvas();
});

updateValueLabels();
renderCanvas();
