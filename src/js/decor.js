
    const categories = {
      sala: {
    title: "Sala de Estar",
    items: [
      { src: "src/images/fundos/wall-1.png", alt: "" },
      { src: "src/images/fundos/wall-2.png", alt: "Rambo" },
      { src: "src/images/fundos/wall-3.png", alt: "John Wick" },
      { src: "src/images/fundos/wall-4.png", alt: "Dom Toretto" },
    ]
  },
  cozinha: {
    title: "Cozinha",
    items: [
      { src: "src/images/fundos/wall-5.png", alt: "Batman" },
      { src: "src/images/fundos/wall-6.png", alt: "Thor" },
      { src: "src/images/fundos/wall-7.png", alt: "Capitão América" },
      { src: "src/images/fundos/wall-8.png", alt: "Homem de Ferro" },
    ]
  },
  arlivre: {
    title: "Ar Livre",
    items: [
      { src: "src/images/fundos/wall-9.png", alt: "Thimothee" },
      { src: "src/images/fundos/wall-10.png", alt: "Damon Salvatore" },
      { src: "src/images/fundos/wall-11.png", alt: "Leonardo DiCaprio" },
      { src: "src/images/fundos/wall-12.png", alt: "Robert Pattinson" },
    ]
  }
};
    const categoriesPage = document.getElementById('categories-page');
    const carouselPage = document.getElementById('carousel-page');
    const backButton = document.getElementById('back-button');
    const categoryTitle = document.getElementById('category-title');
    const carouselTrack = document.getElementById('carousel-track');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    const confirmarBtn = document.getElementById('confirmar-btn');
    const customAlert = document.getElementById('custom-alert');

    let currentAngle = 0;
    let itemAngle = 0;
    let selectedCharacter = null;
    let currentCategory = null;

    document.querySelectorAll('.category-btn').forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        showCarousel(category);
      });
    });

    backButton.addEventListener('click', () => {
      categoriesPage.style.display = 'flex';
      carouselPage.style.display = 'none';
      selectedCharacter = null;
    });

    function showCarousel(category) {
      currentCategory = category;
      const categoryData = categories[category];
      
      categoryTitle.textContent = categoryData.title;
      
      carouselTrack.innerHTML = '';
    
      categoryData.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
        carouselTrack.appendChild(div);
      });
      
      setupCarousel();
      
      categoriesPage.style.display = 'none';
      carouselPage.style.display = 'flex';
    }
    function setupCarousel() {
      const items = document.querySelectorAll('.carousel-item');
      const itemCount = items.length;
      itemAngle = itemCount > 0 ? 360 / itemCount : 0;
      
      items.forEach((item, index) => {
        const angle = index * itemAngle;
        item.style.transform = `rotateY(${angle}deg) translateZ(300px)`;
        
        item.addEventListener('click', () => {
          selectedCharacter = item.querySelector('img').src;
          items.forEach(i => i.querySelector('img').classList.remove('selected'));
          item.querySelector('img').classList.add('selected');
        });
      });
    }

    function rotateCarousel(direction) {
      currentAngle += direction * itemAngle;
      carouselTrack.style.transform = `rotateY(${currentAngle}deg)`;
    }

    nextButton.addEventListener('click', () => rotateCarousel(-1));
    prevButton.addEventListener('click', () => rotateCarousel(1));

    confirmarBtn.addEventListener('click', () => {
      if (!selectedCharacter) {
        showCustomAlert();
      } else {
        localStorage.setItem('selectedCharacter', selectedCharacter);
        window.location.href = 'monte seu avatar.html';
      }
    });

    function showCustomAlert() {
      customAlert.style.display = 'flex';
    }

    function closeCustomAlert() {
      customAlert.style.display = 'none';
    }