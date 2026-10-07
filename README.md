const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');

const controls = {
  brightness: document.getElementById('brightness'),
  contrast: document.getElementById('contrast'),
  saturation: document.getElementById('saturation'),
  exposure: document.getElementById('exposure'),
  vibrance: document.getElementById('vibrance'),
  blur: document.getElementById('blur'),
  rotate: document.getElementById('rotate'),
  zoom: document.getElementById('zoom'),
  fontSize: document.getElementById('fontSize'),
  textOpacity: document.getElementById('textOpacity')
};

const labels = {
  brightness: document.getElementById('brightnessValue'),
  contrast: document.getElementById('contrastValue'),
  saturation: document.getElementById('saturationValue'),
  exposure: document.getElementById('exposureValue'),
  vibrance: document.getElementById('vibranceValue'),
  blur: document.getElementById('blurValue'),
  rotate: document.getElementById('rotateValue'),
  zoom: document.getElementById('zoomValue'),
  fontSize: document.getElementById('fontSizeValue'),
  textOpacity: document.getElementById('textOpacityValue')
};

const state = {
  image: null,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 100,
  vibrance: 100,
  blur: 0,
  rotate: 0,
  zoom: 100,
  filterPreset: 'original',
  aspectRatio: '16:9',
  text: '',
  textColor: '#ffffff',
  fontSize: 48,
  textOpacity: 100,
  sticker: '',
  stickerX: 0,
  stickerY: 0,
  textX: 0,
  textY: 0,
  drag: null
};

const presets = {
  original: { brightness: 100, contrast: 100, saturation: 100, exposure: 100, vibrance: 100, blur: 0 },
  golden: { brightness: 112, contrast: 120, saturation: 128, exposure: 118, vibrance: 140, blur: 0 },
  vintage: { brightness: 116, contrast: 90, saturation: 82, exposure: 105, vibrance: 100, blur: 0.5 },
  cinematic: { brightness: 92, contrast: 138, saturation: 126, exposure: 112, vibrance: 120, blur: 0 },
  neon: { brightness: 108, contrast: 110, saturation: 150, exposure: 120, vibrance: 160, blur: 0 },
  mono: { brightness: 100, contrast: 120, saturation: 55, exposure: 100, vibrance: 90, blur: 0 }
};

function updateLabels() {
  labels.brightness.textContent = `${state.brightness}%`;
  labels.contrast.textContent = `${state.contrast}%`;
  labels.saturation.textContent = `${state.saturation}%`;
  labels.exposure.textContent = `${state.exposure}%`;
  labels.vibrance.textContent = `${state.vibrance}%`;
  labels.blur.textContent = `${state.blur}px`;
  labels.rotate.textContent = `${state.rotate}°`;
  labels.zoom.textContent = `${state.zoom}%`;
  labels.fontSize.textContent = `${state.fontSize}`;
  labels.textOpacity.textContent = `${state.textOpacity}%`;
}

function setPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  state.filterPreset = name;
  state.brightness = preset.brightness;
  state.contrast = preset.contrast;
  state.saturation = preset.saturation;
  state.exposure = preset.exposure;
  state.vibrance = preset.vibrance;
  state.blur = preset.blur;

  controls.brightness.value = preset.brightness;
  controls.contrast.value = preset.contrast;
  controls.saturation.value = preset.saturation;
  controls.exposure.value = preset.exposure;
  controls.vibrance.value = preset.vibrance;
  controls.blur.value = preset.blur;

  document.querySelectorAll('.preset').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === name);
  });

  updateLabels();
  renderCanvas();
}

function getAspectRatioValue() {
  const map = {
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '1:1': 1,
    '4:5': 4 / 5
  };
  return map[state.aspectRatio] || 16 / 9;
}

function getCanvasFrame() {
  const ratio = getAspectRatioValue();
  const maxW = canvas.width * 0.76;
  const maxH = canvas.height * 0.76;

  let width = maxW;
  let height = width / ratio;

  if (height > maxH) {
    height = maxH;
    width = height * ratio;
  }

  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;

  return { x, y, width, height };
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function measureTextWidth(text, fontSize) {
  ctx.save();
  ctx.font = `700 ${fontSize}px Inter`;
  const width = ctx.measureText(text).width;
  ctx.restore();
  return width;
}

function drawPlaceholder() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1a2438');
  gradient.addColorStop(1, '#0d1423');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#edf2ff';
  ctx.textAlign = 'center';
  ctx.font = '700 42px Inter';
  ctx.fillText('Upload a photo to start editing', canvas.width / 2, canvas.height / 2 - 18);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '500 20px Inter';
  ctx.fillText('PixelCut Pro', canvas.width / 2, canvas.height / 2 + 26);
}

function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.image) {
    drawPlaceholder();
    return;
  }

  const frame = getCanvasFrame();
  const image = state.image;
  const zoomRatio = state.zoom / 100;

  const drawWidth = frame.width * zoomRatio;
  const drawHeight = frame.height * zoomRatio;
  const drawX = frame.x + (frame.width - drawWidth) / 2;
  const drawY = frame.y + (frame.height - drawHeight) / 2;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((state.rotate * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  const filterBase = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) sepia(${state.filterPreset === 'vintage' ? 0.35 : 0})`;
  const exposureFilter = `brightness(${state.exposure}%)`;
  const vibranceFilter = `saturate(${state.vibrance}%)`;

  ctx.filter = `${filterBase} ${exposureFilter} ${vibranceFilter} blur(${state.blur}px)`;

  if (state.filterPreset === 'golden') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) sepia(0.25) hue-rotate(-10deg) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'cinematic') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) hue-rotate(8deg) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'neon') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) hue-rotate(40deg) blur(${state.blur}px)`;
  }

  if (state.filterPreset === 'mono') {
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) grayscale(1) blur(${state.blur}px)`;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  drawTextOverlay();
  drawStickerOverlay();
}

function drawTextOverlay() {
  if (!state.text.trim()) return;

  ctx.save();
  ctx.font = `700 ${state.fontSize}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = state.textColor.replace(')', ', 1)');

  const alpha = state.textOpacity / 100;
  const color = hexToRgba(state.textColor, alpha);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.fillText(state.text, canvas.width / 2, canvas.height * 0.75);
  ctx.restore();
}

function drawStickerOverlay() {
  if (!state.sticker) return;

  const size = Math.min(canvas.width * 0.09, 90);
  ctx.save();
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 18;
  ctx.fillText(state.sticker, canvas.width * 0.78, canvas.height * 0.28);
  ctx.restore();
}

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function handleUpload(event) {
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
}

function resetEditor() {
  state.image = null;
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  state.exposure = 100;
  state.vibrance = 100;
  state.blur = 0;
  state.rotate = 0;
  state.zoom = 100;
  state.filterPreset = 'original';
  state.aspectRatio = '16:9';
  state.text = '';
  state.textColor = '#ffffff';
  state.fontSize = 48;
  state.textOpacity = 100;
  state.sticker = '';

  document.getElementById('textInput').value = '';
  document.getElementById('textColor').value = '#ffffff';
  controls.brightness.value = 100;
  controls.contrast.value = 100;
  controls.saturation.value = 100;
  controls.exposure.value = 100;
  controls.vibrance.value = 100;
  controls.blur.value = 0;
  controls.rotate.value = 0;
  controls.zoom.value = 100;
  controls.fontSize.value = 48;
  controls.textOpacity.value = 100;

  document.querySelectorAll('.preset').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === 'original');
  });
  document.querySelectorAll('.ratio').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.ratio === '16:9');
  });

  updateLabels();
  renderCanvas();
}

function exportImage() {
  const link = document.createElement('a');
  link.download = 'pixelcut-pro-export.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function attachEventHandlers() {
  imageUpload.addEventListener('change', handleUpload);

  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      document.querySelectorAll('.panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === button.dataset.panel);
      });
    });
  });

  document.querySelectorAll('.preset').forEach((button) => {
    button.addEventListener('click', () => setPreset(button.dataset.preset));
  });

  document.querySelectorAll('.ratio').forEach((button) => {
    button.addEventListener('click', () => {
      state.aspectRatio = button.dataset.ratio;
      document.querySelectorAll('.ratio').forEach((ratioButton) => {
        ratioButton.classList.toggle('active', ratioButton === button);
      });
      renderCanvas();
    });
  });

  document.querySelectorAll('.sticker').forEach((button) => {
    button.addEventListener('click', () => {
      state.sticker = button.dataset.sticker;
      renderCanvas();
    });
  });

  controls.brightness.addEventListener('input', (e) => {
    state.brightness = Number(e.target.value);
    state.filterPreset = 'original';
    document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
    updateLabels();
    renderCanvas();
  });

  controls.contrast.addEventListener('input', (e) => {
    state.contrast = Number(e.target.value);
    state.filterPreset = 'original';
    document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
    updateLabels();
    renderCanvas();
  });

  controls.saturation.addEventListener('input', (e) => {
    state.saturation = Number(e.target.value);
    state.filterPreset = 'original';
    document.querySelectorAll('.preset').forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === 'original'));
    updateLabels();
    renderCanvas();
  });

  controls.exposure.addEventListener('input', (e) => {
    state.exposure = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.vibrance.addEventListener('input', (e) => {
    state.vibrance = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.blur.addEventListener('input', (e) => {
    state.blur = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.rotate.addEventListener('input', (e) => {
    state.rotate = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.zoom.addEventListener('input', (e) => {
    state.zoom = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.fontSize.addEventListener('input', (e) => {
    state.fontSize = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  controls.textOpacity.addEventListener('input', (e) => {
    state.textOpacity = Number(e.target.value);
    updateLabels();
    renderCanvas();
  });

  document.getElementById('textInput').addEventListener('input', (e) => {
    state.text = e.target.value;
    renderCanvas();
  });

  document.getElementById('textColor').addEventListener('input', (e) => {
    state.textColor = e.target.value;
    renderCanvas();
  });

  document.getElementById('resetBtn').addEventListener('click', resetEditor);
  document.getElementById('downloadBtn').addEventListener('click', exportImage);

  canvas.addEventListener('pointerdown', (event) => {
    const pos = getPointerPosition(event);
    if (!state.text && !state.sticker) return;

    const textWidth = measureTextWidth(state.text || 'A', state.fontSize);
    const textBox = {
      x: canvas.width / 2 - textWidth / 2,
      y: canvas.height * 0.75 - state.fontSize / 2,
      width: textWidth,
      height: state.fontSize * 1.2
    };

    const stickerSize = Math.min(canvas.width * 0.09, 90);
    const stickerBox = {
      x: canvas.width * 0.78 - stickerSize / 2,
      y: canvas.height * 0.28 - stickerSize / 2,
      width: stickerSize,
      height: stickerSize
    };

    if (state.text && pos.x >= textBox.x && pos.x <= textBox.x + textBox.width && pos.y >= textBox.y && pos.y <= textBox.y + textBox.height) {
      state.drag = { type: 'text', offsetX: pos.x - textBox.x, offsetY: pos.y - textBox.y };
      canvas.setPointerCapture(event.pointerId);
      return;
    }

    if (state.sticker && pos.x >= stickerBox.x && pos.x <= stickerBox.x + stickerBox.width && pos.y >= stickerBox.y && pos.y <= stickerBox.y + stickerBox.height) {
      state.drag = { type: 'sticker', offsetX: pos.x - stickerBox.x, offsetY: pos.y - stickerBox.y };
      canvas.setPointerCapture(event.pointerId);
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!state.drag) return;
    const pos = getPointerPosition(event);

    if (state.drag.type === 'text') {
      state.textX = pos.x - state.drag.offsetX;
      state.textY = pos.y - state.drag.offsetY;
      const textWidth = measureTextWidth(state.text, state.fontSize);
      const half = textWidth / 2;
      state.textX = Math.min(Math.max(state.textX, canvas.width / 2 - half), canvas.width / 2 + half);
      state.textY = Math.min(Math.max(state.textY, 20), canvas.height - 20);
    }

    if (state.drag.type === 'sticker') {
      const stickerSize = Math.min(canvas.width * 0.09, 90);
      state.stickerX = pos.x - state.drag.offsetX;
      state.stickerY = pos.y - state.drag.offsetY;
      state.stickerX = Math.min(Math.max(state.stickerX, 20), canvas.width - stickerSize - 20);
      state.stickerY = Math.min(Math.max(state.stickerY, 20), canvas.height - stickerSize - 20);
    }

    renderCanvas();
  });

  canvas.addEventListener('pointerup', () => {
    state.drag = null;
  });

  canvas.addEventListener('pointerleave', () => {
    state.drag = null;
  });
}

updateLabels();
attachEventHandlers();
renderCanvas();
