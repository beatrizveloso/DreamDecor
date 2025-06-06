
    const categories = {
    ambientes: {
  title: "Ambientes de Casa",
  items: [
    { src: "src/images/fundos/wall-1.png", alt: "Fundo  Branco" },
    { src: "src/images/fundos/wall-2.png", alt: "Fundo Bege" },
    { src: "src/images/fundos/wall-3.png", alt: "Cozinha" },
    { src: "src/images/fundos/wall-4.png", alt: "Banheiro" },
    { src: "src/images/fundos/wall-5.png", alt: "Closet" },
    { src: "src/images/fundos/wall-6.png", alt: "Quarto" },
  ]
},
profissionais: {
  title: "Cenários Profissionais",
  items: [
    { src: "src/images/fundos/wall-7.png", alt: "Consultório" },
    { src: "src/images/fundos/wall-8.png", alt: "Salão de Beleza" },
    { src: "src/images/fundos/wall-9.png", alt: "Loja de Roupas" },
    { src: "src/images/fundos/wall-10.png", alt: "Cafeteria" },
    { src: "src/images/fundos/wall-11.png", alt: "Restaurante" },
    { src: "src/images/fundos/wall-12.png", alt: "Estúdio" },
  ]
},
locais: {
  title: "Temas de Locais",
  items: [
    { src: "src/images/fundos/wall-13.png", alt: "Praia" },
    { src: "src/images/fundos/wall-14.png", alt: "Floresta" },
    { src: "src/images/fundos/wall-15.png", alt: "Deserto" },
    { src: "src/images/fundos/wall-16.png", alt: "Fundo do Mar" },
    { src: "src/images/fundos/wall-17.png", alt: "Espaço Sideral" },
    { src: "src/images/fundos/wall-18.png", alt: "Castelo" },
  ]
},
datascomemorativas: {
  title: "Datas Comemorativas",
  items: [
    { src: "src/images/fundos/wall-19.png", alt: "Natal" },
    { src: "src/images/fundos/wall-20.png", alt: "Páscoa" },
    { src: "src/images/fundos/wall-21.png", alt: "São João" },
    { src: "src/images/fundos/wall-22.png", alt: "Dia dos Namorados" },
    { src: "src/images/fundos/wall-23.png", alt: "Dia dos Namorados" },
    { src: "src/images/fundos/wall-24.png", alt: "Halloween" },
  ]
},
arlivre: {
  title: "Ar Livre",
  items: [
    { src: "src/images/fundos/wall-25.png", alt: "Jardim" },
    { src: "src/images/fundos/wall-26.png", alt: "Jardim" },
    { src: "src/images/fundos/wall-27.png", alt: "Jardim" },
    { src: "src/images/fundos/wall-28.png", alt: "Jardim" },
    { src: "src/images/fundos/wall-29.png", alt: "Jardim" },
    { src: "src/images/fundos/wall-30.png", alt: "Jardim" },
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
        item.style.transform = `rotateY(${angle}deg) translateZ(440px)`;
        
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
        window.location.href = 'costume.html';
      }
    });

    function showCustomAlert() {
      customAlert.style.display = 'flex';
    }

    function closeCustomAlert() {
      customAlert.style.display = 'none';
    }