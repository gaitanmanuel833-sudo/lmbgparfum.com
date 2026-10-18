/* =========================================================
   PERFUMERÍA BELTRÁN — JAVASCRIPT
   Menú interactivo, filtros, búsqueda, navegación y animaciones.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");
    const navLinks = [...document.querySelectorAll(".nav-link")];
    const filterButtons = [...document.querySelectorAll(".filtro")];
    const products = [...document.querySelectorAll(".producto")];
    const searchInput = document.getElementById("buscador");
    const results = document.getElementById("resultados");
    const emptyState = document.getElementById("sin-resultados");
    const year = document.getElementById("year");

    let activeCategory = "todos";

    /* -------------------------
       MENÚ RESPONSIVE
    ------------------------- */
    const closeMenu = () => {
        if (!mainNav || !menuToggle) return;
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.classList.remove("menu-open");
    };

    menuToggle?.addEventListener("click", event => {
        event.stopPropagation();
        const isOpen = mainNav.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
        menuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
        document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.forEach(link => link.addEventListener("click", closeMenu));

    // Cerrar al pulsar Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    // Cerrar al hacer clic fuera del menú en móviles
    document.addEventListener("click", event => {
        if (mainNav?.classList.contains("active") && !mainNav.contains(event.target) && !menuToggle?.contains(event.target)) {
            closeMenu();
        }
    });

    /* -------------------------
       HEADER AL HACER SCROLL
    ------------------------- */
    const updateHeader = () => {
        if (header) {
            header.classList.toggle("scrolled", window.scrollY > 15);
        }
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* -------------------------
       CATÁLOGO: FILTRO + BÚSQUEDA
    ------------------------- */
    const normalize = text => (text || "")
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const applyCatalogFilter = () => {
        const query = searchInput ? normalize(searchInput.value.trim()) : "";
        let visibleCount = 0;

        products.forEach(product => {
            const category = product.dataset.category;
            const searchableText = normalize(product.textContent);
            const categoryMatches = activeCategory === "todos" || category === activeCategory;
            const searchMatches = !query || searchableText.includes(query);
            const visible = categoryMatches && searchMatches;

            product.hidden = !visible;
            if (visible) {
                visibleCount++;
                // Reiniciar animación para los que se muestran
                product.classList.add("visible");
            }
        });

        if (results) {
            results.textContent = `${visibleCount} ${visibleCount === 1 ? "fragancia disponible" : "fragancias disponibles"}`;
        }
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filter;
            filterButtons.forEach(item => item.classList.toggle("active", item === button));
            applyCatalogFilter();
        });
    });

    searchInput?.addEventListener("input", applyCatalogFilter);

    /* -------------------------
       FALLBACK PARA IMÁGENES
    ------------------------- */
    document.querySelectorAll(".producto-imagen img").forEach(image => {
        image.addEventListener("error", () => {
            image.remove();
            image.closest(".producto-imagen")?.classList.add("sin-imagen");
        }, { once: true });
    });

    /* -------------------------
       NAVEGACIÓN ACTIVA CON SCROLL
    ------------------------- */
    const sections = [...document.querySelectorAll("main section[id]")];
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const currentId = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
            });
        });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });

    sections.forEach(section => observer.observe(section));

    /* -------------------------
       ANIMACIONES DE ENTRADA (REVEAL)
    ------------------------- */
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(element => revealObserver.observe(element));

    /* -------------------------
       AÑO AUTOMÁTICO EN COPYRIGHT
    ------------------------- */
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    applyCatalogFilter();
});

