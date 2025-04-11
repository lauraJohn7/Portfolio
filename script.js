// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.getElementById("theme-switch");
    const body = document.body;
    const filterButtons = document.querySelectorAll(".filter-btn");
    const cardsContainer = document.querySelector(".gallery");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeLightbox = document.querySelector(".close");
  
    const hamburger = document.querySelector(".hamburger");
    const mainMenu = document.querySelector(".main-menu");
  
    hamburger.addEventListener("click", () => {
      mainMenu.classList.toggle("open");
    });
  
    let currentIndex = -1;
    let allCards = [];
  
    // === Theme Toggle ===
    themeSwitch.addEventListener("change", () => {
      body.classList.toggle("dark-mode", themeSwitch.checked);
      body.classList.toggle("light-mode", !themeSwitch.checked);
      localStorage.setItem("theme", themeSwitch.checked ? "dark" : "light");
    });
  
    // Load theme from storage
    if (localStorage.getItem("theme") === "dark") {
      themeSwitch.checked = true;
      body.classList.add("dark-mode");
    }
  
    // === IntersectionObserver for scroll animations ===
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
  
    // === Add image cards dynamically from JSON ===
    function addImageCardsFromJSON(folder, categories, images) {
      images.forEach(({ file, title }) => {
        const imgPath = `images/${folder}/${file}`;
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-category", categories.join(" "));
  
        const img = document.createElement("img");
        img.src = imgPath;
        img.alt = title;
        img.loading = "lazy";
        img.width = 300;
        img.height = 400;
        img.onerror = () => card.remove();
  
        const titleEl = document.createElement("p");
        titleEl.className = "title";
        titleEl.textContent = title;
  
        const categoryEl = document.createElement("p");
        categoryEl.className = "category";
        const readableCategory = categories
          .filter(cat => !["all_work", "my_work", "student_work"].includes(cat))
          .at(-1)
          .replace(/_/g, " ")
          .replace(/\b\w/g, c => c.toUpperCase());
        categoryEl.textContent = readableCategory;
  
        card.appendChild(img);
        card.appendChild(titleEl);
        card.appendChild(categoryEl);
        cardsContainer.appendChild(card);
  
        observer.observe(card);
      });
    }
  
    // === Load JSON and populate gallery ===
    fetch("titles.json")
      .then(response => response.json())
      .then(data => {
        data.forEach(group => {
          addImageCardsFromJSON(group.folder, group.category, group.images);
        });
  
        allCards = Array.from(cardsContainer.querySelectorAll(".card"));
  
        cardsContainer.addEventListener("click", (event) => {
          const img = event.target.closest("img");
          const card = event.target.closest(".card");
          if (img && card) {
            currentIndex = allCards.indexOf(card);
            openLightbox(img.src, card.querySelector(".title").textContent);
          }
        });
      })
      .catch(error => console.error("Failed to load titles.json", error));
  
    // === Filter buttons ===
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        const isTopLevelFilter = !button.closest(".dropdown-menu");
        if (isTopLevelFilter && mainMenu.classList.contains("open")) {
          mainMenu.classList.remove("open");
        }
  
        const category = button.getAttribute("data-category");
        cardsContainer.querySelectorAll(".card").forEach(card => {
          const cardCategories = card.getAttribute("data-category").split(" ");
          if (category === "all" || cardCategories.includes(category) || category === "all_work") {
            card.style.display = "inline-block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  
    // === Lightbox ===
    function openLightbox(src, title) {
      lightboxImg.src = src;
      document.getElementById("lightbox-title").textContent = title;
      lightbox.classList.remove("hidden");
      lightbox.classList.add("fade-in");
    }
  
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === closeLightbox) {
        lightbox.classList.add("hidden");
        lightbox.classList.remove("fade-in");
        lightboxImg.src = "";
        document.getElementById("lightbox-title").textContent = "";
      }
    });
  
    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("hidden")) {
        if (event.key === "ArrowRight") {
          currentIndex = (currentIndex + 1) % allCards.length;
        } else if (event.key === "ArrowLeft") {
          currentIndex = (currentIndex - 1 + allCards.length) % allCards.length;
        } else if (event.key === "Escape") {
          lightbox.classList.add("hidden");
          lightbox.classList.remove("fade-in");
          lightboxImg.src = "";
          document.getElementById("lightbox-title").textContent = "";
          return;
        } else {
          return;
        }
        const newCard = allCards[currentIndex];
        openLightbox(
          newCard.querySelector("img").src,
          newCard.querySelector(".title").textContent
        );
      }
    });
  });
  