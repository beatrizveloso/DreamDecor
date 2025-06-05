document.addEventListener("DOMContentLoaded", function() {
  const carousel = document.getElementById("carousel");
  const prevArrow = document.getElementById("prevArrow");
  const nextArrow = document.getElementById("nextArrow");
  const canvas = document.getElementById("avatarCanvas");
  const ctx = canvas.getContext("2d");
  const layersPanel = document.getElementById("layersPanel");
  const layersList = document.getElementById("layersList");
  const togglePanelBtn = document.getElementById("togglePanel");
  const saveButton = document.getElementById("saveAvatar");
  const tabs = document.querySelectorAll(".tab");
  const tabsContainer = document.getElementById("tabsContainer");
  const toggleTabsBtn = document.getElementById("toggleTabs");

  canvas.width = 1000;
  canvas.height = 800;

  const selectedCharacter = localStorage.getItem('selectedCharacter');
  let characterImage = null;
  const accessoryImages = [];
  let selectedAccessory = null;
  let isDragging = false;
  let resizing = null;
  let rotating = false;
  let skewing = false;
  let skewAxis = null;
  let panelCollapsed = false;
  let tabsCollapsed = false;
  let currentIndex = 0;
  let dragStartX, dragStartY;
  let initialX, initialY;
  let initialWidth, initialHeight;
  let initialAngle = 0;
  let initialMouseAngle = 0;
  let initialSkewX = 0;
  let initialSkewY = 0;
  
  const HANDLE_SIZE = 8;
  const ROTATION_HANDLE_DISTANCE = 25;
  const SKEW_HANDLE_DISTANCE = 20;

  const SELECTION_COLOR = "rgba(102, 205, 170, 0.8)";
  const HANDLE_COLOR = "rgba(127, 255, 212, 0.8)";
  const ROTATION_LINE_COLOR = "rgba(64, 224, 208, 0.8)";
  const SKEW_LINE_COLOR = "rgba(72, 209, 204, 0.8)";

  function checkArrowsVisibility() {
    prevArrow.style.visibility = carousel.scrollLeft > 0 ? 'visible' : 'hidden';
    nextArrow.style.visibility = carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth ? 'visible' : 'hidden';
  }

  carousel.addEventListener("scroll", checkArrowsVisibility);

  carousel.addEventListener("wheel", (event) => {
    event.preventDefault();
    carousel.scrollBy({
      left: event.deltaY,
      behavior: "smooth"
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  let isDraggingCarousel = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDraggingCarousel = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDraggingCarousel) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
  });

  carousel.addEventListener('mouseup', () => {
    isDraggingCarousel = false;
  });

  carousel.addEventListener('mouseleave', () => {
    isDraggingCarousel = false;
  });

  carousel.addEventListener('touchstart', (e) => {
    isDraggingCarousel = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDraggingCarousel) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
  });

  carousel.addEventListener('touchend', () => {
    isDraggingCarousel = false;
    checkArrowsVisibility();
  });

  prevArrow.addEventListener("click", () => {
    carousel.scrollBy({
      left: -carousel.clientWidth,
      behavior: 'smooth'
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  nextArrow.addEventListener("click", () => {
    carousel.scrollBy({
      left: carousel.clientWidth,
      behavior: 'smooth'
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  togglePanelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panelCollapsed = !panelCollapsed;
    layersPanel.classList.toggle('collapsed', panelCollapsed);
    togglePanelBtn.textContent = panelCollapsed ? '►' : '▼';
  });

  toggleTabsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tabsCollapsed = !tabsCollapsed;
    tabsContainer.classList.toggle('collapsed', tabsCollapsed);
    toggleTabsBtn.textContent = tabsCollapsed ? '►' : '▼';
  });

  function updateLayersPanel() {
    layersList.innerHTML = '';
    
    const characterLayer = document.createElement('div');
    characterLayer.className = 'layer-item';
    characterLayer.textContent = 'Cenário Base';
    characterLayer.addEventListener('click', () => {
      selectedAccessory = null;
      drawCharacterAndAccessories();
      updateLayersPanel();
    });
    layersList.appendChild(characterLayer);
    
    for (let i = accessoryImages.length - 1; i >= 0; i--) {
      const accessory = accessoryImages[i];
      const layerItem = document.createElement('div');
      layerItem.className = 'layer-item';
      if (selectedAccessory && selectedAccessory.img === accessory.img) {
        layerItem.classList.add('selected');
      }
      
      const category = getCategoryFromImageSrc(accessory.img.src);
      layerItem.textContent = `${category} ${accessoryImages.length - i}`;
      
      const layerControls = document.createElement('div');
      layerControls.className = 'layer-controls';
      
      const moveUpBtn = document.createElement('button');
      moveUpBtn.textContent = '↑';
      moveUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (i < accessoryImages.length - 1) {
          [accessoryImages[i], accessoryImages[i + 1]] = [accessoryImages[i + 1], accessoryImages[i]];
          updateLayersPanel();
          drawCharacterAndAccessories();
        }
      });
      
      const moveDownBtn = document.createElement('button');
      moveDownBtn.textContent = '↓';
      moveDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (i > 0) {
          [accessoryImages[i], accessoryImages[i - 1]] = [accessoryImages[i - 1], accessoryImages[i]];
          updateLayersPanel();
          drawCharacterAndAccessories();
        }
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'X';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accessoryImages.splice(i, 1);
        if (selectedAccessory && selectedAccessory.img === accessory.img) {
          selectedAccessory = null;
        }
        updateLayersPanel();
        drawCharacterAndAccessories();
      });
      
      layerControls.appendChild(moveUpBtn);
      layerControls.appendChild(moveDownBtn);
      layerControls.appendChild(deleteBtn);
      layerItem.appendChild(layerControls);
      
      layerItem.addEventListener('click', () => {
        selectedAccessory = accessory;
        drawCharacterAndAccessories();
        updateLayersPanel();
      });
      
      layersList.appendChild(layerItem);
    }
  }

  function getCategoryFromImageSrc(src) {
    if (src.includes('moveis')) return 'Móvel';
    if (src.includes('eletrodomesticos')) return 'Eletrodoméstico';
    if (src.includes('decoracao')) return 'Decoração';
    if (src.includes('iluminacao')) return 'Iluminação';
    if (src.includes('plantas')) return 'Planta';
    return 'Item';
  }

  function drawCharacterAndAccessories() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (characterImage) {
      const scale = Math.min(
        canvas.width / characterImage.width,
        canvas.height / characterImage.height
      );
      const newWidth = characterImage.width * scale;
      const newHeight = characterImage.height * scale;

      ctx.drawImage(
        characterImage,
        (canvas.width - newWidth) / 2,
        (canvas.height - newHeight) / 2,
        newWidth,
        newHeight
      );
    }

    accessoryImages.forEach(({ img, x, y, width, height, angle = 0, skewX = 0, skewY = 0 }) => {
      ctx.save();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      ctx.transform(1, skewY, skewX, 1, 0, 0);
      
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      
      if (selectedAccessory && selectedAccessory.img === img) {
        ctx.strokeStyle = SELECTION_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.fillStyle = HANDLE_COLOR;
        
        const cornerHandles = [
          { x: -width/2, y: -height/2, type: 'resize', corner: 'nw' }, 
          { x: width/2, y: -height/2, type: 'resize', corner: 'ne' },    
          { x: -width/2, y: height/2, type: 'resize', corner: 'sw' },    
          { x: width/2, y: height/2, type: 'resize', corner: 'se' },    
          
          { x: 0, y: -height/2, type: 'resize', corner: 'n' },          
          { x: width/2, y: 0, type: 'resize', corner: 'e' },           
          { x: 0, y: height/2, type: 'resize', corner: 's' },      
          { x: -width/2, y: 0, type: 'resize', corner: 'w' },           
        ];
        
        cornerHandles.forEach(({x, y}) => {
          ctx.beginPath();
          ctx.arc(x, y, HANDLE_SIZE, 0, Math.PI * 2);
          ctx.fill();
        });
        
        const rotationHandleY = -height/2 - ROTATION_HANDLE_DISTANCE;
        ctx.beginPath();
        ctx.arc(0, rotationHandleY, HANDLE_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, rotationHandleY);
        ctx.strokeStyle = ROTATION_LINE_COLOR;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (Math.abs(skewX) > 0.1 || Math.abs(skewY) > 0.1) {
          ctx.restore();
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle * Math.PI / 180);
          
          ctx.fillStyle = SKEW_LINE_COLOR;
          ctx.beginPath();
          ctx.arc(width/2 + SKEW_HANDLE_DISTANCE, 0, HANDLE_SIZE, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(0, -height/2 - SKEW_HANDLE_DISTANCE, HANDLE_SIZE, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(width/2, 0);
          ctx.lineTo(width/2 + SKEW_HANDLE_DISTANCE, 0);
          ctx.moveTo(0, -height/2);
          ctx.lineTo(0, -height/2 - SKEW_HANDLE_DISTANCE);
          ctx.strokeStyle = SKEW_LINE_COLOR;
          ctx.stroke();
        }
      }
      ctx.restore();
    });
  }
  
  function setCharacter(imageSrc) {
    characterImage = new Image();
    characterImage.src = imageSrc;
    characterImage.onload = () => {
      drawCharacterAndAccessories();
      updateLayersPanel();
    };
  }
  
  function addAccessory(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const newAccessory = {
        img,
        x: (canvas.width - 100) / 2,
        y: (canvas.height - 100) / 2,
        width: 100,
        height: 100,
        angle: 0,
        skewX: 0,
        skewY: 0
      };
      accessoryImages.push(newAccessory);
      selectedAccessory = newAccessory;
      drawCharacterAndAccessories();
      updateLayersPanel();
      
      if (panelCollapsed) {
        panelCollapsed = false;
        layersPanel.classList.remove('collapsed');
        togglePanelBtn.textContent = '▼';
      }
    };
  }

  function getAccessoryAtPosition(x, y) {
    for (let i = accessoryImages.length - 1; i >= 0; i--) {
      const acc = accessoryImages[i];
      const centerX = acc.x + acc.width / 2;
      const centerY = acc.y + acc.height / 2;
      
      const angle = -acc.angle * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const localX = (x - centerX) * cos - (y - centerY) * sin;
      const localY = (x - centerX) * sin + (y - centerY) * cos;
      
      if (localX >= -acc.width/2 && localX <= acc.width/2 && 
          localY >= -acc.height/2 && localY <= acc.height/2) {
        return acc;
      }
    }
    return null;
  }

  function detectControl(x, y, acc) {
    const centerX = acc.x + acc.width / 2;
    const centerY = acc.y + acc.height / 2;
    const angle = -acc.angle * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const localX = (x - centerX) * cos - (y - centerY) * sin;
    const localY = (x - centerX) * sin + (y - centerY) * cos;
  
    const resizeHandles = [
      { name: "resize-nw", x: -acc.width/2, y: -acc.height/2 },
      { name: "resize-ne", x: acc.width/2, y: -acc.height/2 },
      { name: "resize-sw", x: -acc.width/2, y: acc.height/2 },
      { name: "resize-se", x: acc.width/2, y: acc.height/2 },
      { name: "resize-n", x: 0, y: -acc.height/2 },
      { name: "resize-e", x: acc.width/2, y: 0 },
      { name: "resize-s", x: 0, y: acc.height/2 },
      { name: "resize-w", x: -acc.width/2, y: 0 }
    ];
    
    for (const handle of resizeHandles) {
      const dx = localX - handle.x;
      const dy = localY - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_SIZE) {
        return { type: handle.name.split('-')[0], corner: handle.name.split('-')[1] };
      }
    }
    
    const rotationHandleY = -acc.height/2 - ROTATION_HANDLE_DISTANCE;
    const rotDx = localX - 0;
    const rotDy = localY - rotationHandleY;
    if (Math.sqrt(rotDx * rotDx + rotDy * rotDy) <= HANDLE_SIZE) {
      return { type: "rotate" };
    }
    if (Math.abs(acc.skewX || 0) > 0.1 || Math.abs(acc.skewY || 0) > 0.1) {
      const skewHDx = localX - (acc.width/2 + SKEW_HANDLE_DISTANCE);
      const skewHDy = localY - 0;
      if (Math.sqrt(skewHDx * skewHDx + skewHDy * skewHDy) <= HANDLE_SIZE) {
        return { type: "skew", axis: "x" };
      }
      
      const skewVDx = localX - 0;
      const skewVDy = localY - (-acc.height/2 - SKEW_HANDLE_DISTANCE);
      if (Math.sqrt(skewVDx * skewVDx + skewVDy * skewVDy) <= HANDLE_SIZE) {
        return { type: "skew", axis: "y" };
      }
    }
    
    return null;
  }

  function handleCanvasMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    const clickedAccessory = getAccessoryAtPosition(offsetX, offsetY);
    if (clickedAccessory) {
      const control = detectControl(offsetX, offsetY, clickedAccessory);
      selectedAccessory = clickedAccessory;
      
      if (control) {                
        if (control.type === "rotate") {
          rotating = true;
          dragStartX = offsetX;
          dragStartY = offsetY;
          initialAngle = selectedAccessory.angle;
          
          const centerX = selectedAccessory.x + selectedAccessory.width / 2;
          const centerY = selectedAccessory.y + selectedAccessory.height / 2;
          initialMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
        } 
        else if (control.type === "skew") {
          skewing = true;
          skewAxis = control.axis;
          dragStartX = offsetX;
          dragStartY = offsetY;
          initialSkewX = selectedAccessory.skewX || 0;
          initialSkewY = selectedAccessory.skewY || 0;
        }
        else if (control.type === "resize") {
          resizing = control.corner;
          isDragging = true;
          dragStartX = offsetX;
          dragStartY = offsetY;
          initialWidth = selectedAccessory.width;
          initialHeight = selectedAccessory.height;
          initialX = selectedAccessory.x;
          initialY = selectedAccessory.y;
        }
      } else {
        isDragging = true;
        dragStartX = offsetX;
        dragStartY = offsetY;
        initialX = selectedAccessory.x;
        initialY = selectedAccessory.y;
      }
      
      drawCharacterAndAccessories();
      return;
    }
    
    selectedAccessory = null;
    drawCharacterAndAccessories();
    updateLayersPanel();
  }

  function handleCanvasMouseMove(event) {
    if (!isDragging && !rotating && !skewing) return;
    
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    if (rotating && selectedAccessory) {
      const centerX = selectedAccessory.x + selectedAccessory.width / 2;
      const centerY = selectedAccessory.y + selectedAccessory.height / 2;
      
      const newMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
      selectedAccessory.angle = initialAngle + (newMouseAngle - initialMouseAngle);
    }
    else if (skewing && selectedAccessory) {
      const centerX = selectedAccessory.x + selectedAccessory.width / 2;
      const centerY = selectedAccessory.y + selectedAccessory.height / 2;
      
      const angle = -selectedAccessory.angle * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const localX = (offsetX - centerX) * cos - (offsetY - centerY) * sin;
      const localY = (offsetX - centerX) * sin + (offsetY - centerY) * cos;
      
      const startLocalX = (dragStartX - centerX) * cos - (dragStartY - centerY) * sin;
      const startLocalY = (dragStartX - centerX) * sin + (dragStartY - centerY) * cos;
      
      if (skewAxis === "x") {
        selectedAccessory.skewX = initialSkewX + (localY - startLocalY) / 100;
      } else {
        selectedAccessory.skewY = initialSkewY + (localX - startLocalX) / 100;
      }
    }
    else if (isDragging && selectedAccessory) {
      if (resizing) {
        const centerX = initialX + initialWidth / 2;
        const centerY = initialY + initialHeight / 2;
        
        const angle = -selectedAccessory.angle * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const localX = (offsetX - centerX) * cos - (offsetY - centerY) * sin;
        const localY = (offsetX - centerX) * sin + (offsetY - centerY) * cos;
        
        const startLocalX = (dragStartX - centerX) * cos - (dragStartY - centerY) * sin;
        const startLocalY = (dragStartX - centerX) * sin + (dragStartY - centerY) * cos;
        
        let newWidth = initialWidth;
        let newHeight = initialHeight;
        let deltaX = 0;
        let deltaY = 0;

        switch(resizing) {
          case "nw": 
            newWidth = initialWidth - (localX - startLocalX) * 2;
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaX = (localX - startLocalX);
            deltaY = (localY - startLocalY);
            break;
          case "ne": 
            newWidth = initialWidth + (localX - startLocalX) * 2;
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaY = (localY - startLocalY);
            break;
          case "sw":
            newWidth = initialWidth - (localX - startLocalX) * 2;
            newHeight = initialHeight + (localY - startLocalY) * 2;
            deltaX = (localX - startLocalX);
            break;
          case "se": 
            newWidth = initialWidth + (localX - startLocalX) * 2;
            newHeight = initialHeight + (localY - startLocalY) * 2;
            break;
          case "n":
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaY = (localY - startLocalY);
            break;
          case "e":
            newWidth = initialWidth + (localX - startLocalX) * 2;
            break;
          case "s": 
            newHeight = initialHeight + (localY - startLocalY) * 2;
            break;
          case "w": 
            newWidth = initialWidth - (localX - startLocalX) * 2;
            deltaX = (localX - startLocalX);
            break;
        }
        
        newWidth = Math.max(30, Math.min(800, newWidth));
        newHeight = Math.max(30, Math.min(800, newHeight));
        
        if (event.shiftKey) {
          const aspect = initialWidth / initialHeight;
          if (resizing.includes("w") || resizing.includes("e")) {
            newHeight = newWidth / aspect;
          } else {
            newWidth = newHeight * aspect;
          }
        }
        
        selectedAccessory.width = newWidth;
        selectedAccessory.height = newHeight;
        
        if (resizing.includes("n") || resizing.includes("w")) {
          selectedAccessory.x = initialX + deltaX;
          selectedAccessory.y = initialY + deltaY;
        }
      } else {
        selectedAccessory.x = initialX + (offsetX - dragStartX);
        selectedAccessory.y = initialY + (offsetY - dragStartY);
      }
    }
    
    drawCharacterAndAccessories();
  }

  function handleCanvasMouseUp() {
    isDragging = false;
    resizing = null;
    rotating = false;
    skewing = false;
    updateLayersPanel();
  }

  canvas.addEventListener("mousedown", handleCanvasMouseDown);
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("mouseup", handleCanvasMouseUp);
  canvas.addEventListener("mouseleave", handleCanvasMouseUp);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchend", () => {
    const mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
  });

  saveButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "dreamdecor.png";
    link.click();
  });

  const items = {
    moveis: Array.from({ length: 50 }, (_, i) => `src/images/moveis/movel${i + 1}.png`),
    eletrodomesticos: Array.from({ length: 50 }, (_, i) => `src/images/eletrodomesticos/eletro${i + 1}.png`),
    decoracao: [
      ...Array.from({ length: 40 }, (_, i) => `src/images/decoracao/decor${i + 1}.png`),
      ...Array.from({ length: 11 }, (_, i) => `src/images/decoracao/quadro${i + 1}.png`)
    ],
    iluminacao: [
      ...Array.from({ length: 50 }, (_, i) => `src/images/iluminacao/luminaria${i + 1}.png`)
    ],
    plantas: [
      ...Array.from({ length: 31 }, (_, i) => `src/images/plantas/planta${i + 1}.png`),
      ...Array.from({ length: 10 }, (_, i) => `src/images/plantas/vaso${i + 1}.png`)
    ]
  };

  function renderItems(category) {
    carousel.innerHTML = items[category].map(imageSrc => `
      <div class="carousel-item">
        <img src="${imageSrc}" alt="${category}" onclick="addAccessory('${imageSrc}')">
      </div>
    `).join('');
    checkArrowsVisibility();
  }

  function updateTabs() {
    tabs.forEach((tab, index) => {
      tab.classList.toggle("active", index === currentIndex);
    });
    renderItems(tabs[currentIndex].dataset.category);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      currentIndex = index;
      updateTabs();
    });
  });

  if (selectedCharacter) {
    setCharacter(selectedCharacter);
  } else {
    alert('Nenhum cenário foi selecionado!');
  }

  updateTabs();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Delete" && selectedAccessory) {
      const index = accessoryImages.findIndex(acc => acc.img === selectedAccessory.img);
      if (index !== -1) {
        accessoryImages.splice(index, 1);
        selectedAccessory = null;
        drawCharacterAndAccessories();
        updateLayersPanel();
      }
    }
    
    if (selectedAccessory) {
      const rotationStep = event.shiftKey ? 1 : 5;
      
      if (event.key === "ArrowLeft") {
        selectedAccessory.angle -= rotationStep;
        drawCharacterAndAccessories();
      } else if (event.key === "ArrowRight") {
        selectedAccessory.angle += rotationStep;
        drawCharacterAndAccessories();
      } else if (event.key === "r" || event.key === "R") {
        selectedAccessory.angle = 0;
        selectedAccessory.skewX = 0;
        selectedAccessory.skewY = 0;
        drawCharacterAndAccessories();
      }
    }
  });

  window.addAccessory = addAccessory;
});