// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('overlay');
    const menuItems = document.querySelectorAll('.menu-item a');
    
    // Secciones
    const welcomeSection = document.querySelector('.welcome-section');
    const internalSearchSection = document.getElementById('internalSearchSection');

    // Variables de estado
    let isMobile = window.innerWidth <= 768;
    let sidebarVisible = !isMobile; // En desktop el sidebar está visible por defecto

    // Función para detectar si es dispositivo móvil
    function checkIfMobile() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        // Si cambió de móvil a desktop o viceversa, ajustar el estado
        if (wasMobile !== isMobile) {
            if (isMobile) {
                // Cambió a móvil: ocultar sidebar
                hideSidebar();
            } else {
                // Cambió a desktop: mostrar sidebar
                showSidebar();
            }
        }
    }

    // Función para mostrar el sidebar
    function showSidebar() {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('active');
        
        if (isMobile) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll en móvil
        } else {
            mainContent.classList.remove('expanded');
        }
        
        sidebarVisible = true;
        updateToggleIcon();
    }

    // Función para ocultar el sidebar
    function hideSidebar() {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
        
        if (!isMobile) {
            mainContent.classList.add('expanded');
        }
        
        sidebarVisible = false;
        updateToggleIcon();
    }

    // Función para alternar el sidebar
    function toggleSidebar() {
        if (sidebarVisible) {
            hideSidebar();
        } else {
            showSidebar();
        }
    }

    // Función para actualizar el ícono del botón toggle
    function updateToggleIcon() {
        const icon = menuToggle.querySelector('i');
        if (sidebarVisible) {
            icon.className = 'fas fa-times';
            menuToggle.setAttribute('aria-label', 'Cerrar menú');
        } else {
            icon.className = 'fas fa-bars';
            menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
    }

    // Función para manejar el click en elementos del menú
    function handleMenuItemClick(event) {
        event.preventDefault();
        
        const clickedLink = event.currentTarget;
        const parentLi = clickedLink.closest('li');
        const href = clickedLink.getAttribute('href');
        
        // Manejar menú principal con submenú
        if (clickedLink.classList.contains('menu-link')) {
            const submenu = parentLi.querySelector('.submenu');
            const menuItem = parentLi;
            
            if (submenu) {
                const isOpen = submenu.classList.contains('open');
                
                // Cerrar otros menús principales
                document.querySelectorAll('.menu-item').forEach(item => {
                    if (item !== menuItem) {
                        const otherSubmenu = item.querySelector('.submenu');
                        if (otherSubmenu) {
                            otherSubmenu.classList.remove('open');
                            item.classList.remove('open');
                        }
                        item.classList.remove('active');
                    }
                });
                
                // Toggle del menú actual
                if (isOpen) {
                    submenu.classList.remove('open');
                    menuItem.classList.remove('open');
                    menuItem.classList.remove('active');
                } else {
                    submenu.classList.add('open');
                    menuItem.classList.add('open');
                    menuItem.classList.add('active');
                }
                
                return;
            }
        }
        
        // Manejar submenú nivel 1 con submenú nivel 2
        if (clickedLink.classList.contains('submenu-link')) {
            const submenuLevel2 = parentLi.querySelector('.submenu-level-2');
            const submenuItem = parentLi;
            
            if (submenuLevel2) {
                const isOpen = submenuLevel2.classList.contains('open');
                
                // Cerrar otros submenús nivel 2 en el mismo grupo
                const parentSubmenu = submenuItem.closest('.submenu');
                if (parentSubmenu) {
                    parentSubmenu.querySelectorAll('.submenu-level-2').forEach(level2 => {
                        if (level2 !== submenuLevel2) {
                            level2.classList.remove('open');
                            level2.closest('.submenu-item').classList.remove('open');
                        }
                    });
                }
                
                // Toggle del submenú nivel 2 actual
                if (isOpen) {
                    submenuLevel2.classList.remove('open');
                    submenuItem.classList.remove('open');
                } else {
                    submenuLevel2.classList.add('open');
                    submenuItem.classList.add('open');
                }
                
                return;
            }
        }
        
        // Navegación normal para elementos finales
        handleNavigation(href);
        
        // Actualizar estado activo para navegación final
        if (clickedLink.classList.contains('submenu-level-2-link')) {
            // Remover todos los estados activos de nivel 2
            document.querySelectorAll('.submenu-level-2-item').forEach(item => {
                item.classList.remove('active');
            });
            parentLi.classList.add('active');
        } else {
            // Remover clase active de todos los elementos
            document.querySelectorAll('.menu-item').forEach(item => {
                if (!item.querySelector('.submenu')) {
                    item.classList.remove('active');
                }
            });
            
            // Agregar clase active al elemento clickeado si no tiene submenú
            if (!parentLi.querySelector('.submenu')) {
                parentLi.classList.add('active');
            }
        }
        
        // En móvil, cerrar el menú después de seleccionar
        if (isMobile) {
            setTimeout(() => {
                hideSidebar();
            }, 300);
        }
    }

    // Función para mostrar sección específica
    function showSection(sectionName) {
        // Ocultar todas las secciones
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (internalSearchSection) {
            internalSearchSection.classList.remove('active');
            internalSearchSection.style.display = 'none';
        }
        
        // Mostrar la sección solicitada
        switch(sectionName) {
            case 'home':
                if (welcomeSection) {
                    welcomeSection.style.display = 'block';
                }
                break;
            case 'internal-search':
                if (internalSearchSection) {
                    internalSearchSection.style.display = 'block';
                    setTimeout(() => {
                        internalSearchSection.classList.add('active');
                    }, 10);
                }
                break;
            case 'external-search':
                console.log('Sección de búsquedas externas - Por implementar');
                break;
            case 'information':
                console.log('Sección de información - Por implementar');
                break;
        }
    }

    // Función para manejar la navegación (actualizada)
    function handleNavigation(route) {
        const sectionName = route.replace('#', '');
        
        console.log('Navegando a:', route);
        
        switch(route) {
            case '#home':
                showSection('home');
                break;
            case '#internal-search':
            case '#clasicas':
            case '#arboles':
                showSection('internal-search');
                // Si es una subsección específica, hacer scroll suave a esa parte
                if (route === '#clasicas' || route === '#arboles') {
                    setTimeout(() => {
                        const targetSection = document.querySelector(route === '#clasicas' ? 
                            '.subsection:first-of-type' : '.subsection:last-of-type');
                        if (targetSection) {
                            targetSection.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }
                    }, 300);
                }
                break;
            case '#secuencial':
            case '#binaria':
            case '#hash':
            case '#residuos':
            case '#digitales':
            case '#trie':
            case '#multiples':
            case '#huffman':
                showSection('internal-search');
                // Para métodos específicos, hacer scroll y resaltar la tarjeta
                setTimeout(() => {
                    const methodName = route.replace('#', '');
                    const targetCard = document.querySelector(`[data-method="${methodName}"]`);
                    if (targetCard) {
                        targetCard.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        // Efecto de resaltado
                        targetCard.style.transform = 'scale(1.05)';
                        targetCard.style.boxShadow = '0 15px 35px rgba(74, 144, 226, 0.4)';
                        targetCard.style.border = '2px solid var(--primary-color)';
                        
                        setTimeout(() => {
                            targetCard.style.transform = '';
                            targetCard.style.boxShadow = '';
                            targetCard.style.border = '';
                        }, 2000);
                    }
                }, 300);
                break;
            case '#external-search':
                console.log('Sección de búsquedas externas - Por implementar');
                showSection('external-search');
                break;
            case '#information':
                console.log('Sección de información - Por implementar');
                showSection('information');
                break;
            default:
                console.log('Ruta no encontrada:', route);
                showSection('home');
        }
    }

    // Función para inicializar el estado del sidebar
    function initializeSidebar() {
        checkIfMobile();
        
        if (isMobile) {
            hideSidebar();
        } else {
            showSidebar();
        }
    }

    // Event Listeners
    
    // Toggle del menú
    menuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleSidebar();
    });

    // Click en overlay para cerrar menú en móvil
    overlay.addEventListener('click', function() {
        if (isMobile) {
            hideSidebar();
        }
    });

    // Click en elementos del menú
    menuItems.forEach(item => {
        item.addEventListener('click', handleMenuItemClick);
    });

    // Agregar event listeners para todos los tipos de enlaces del menú
    const allMenuLinks = document.querySelectorAll('.menu-link, .submenu-link, .submenu-level-2-link');
    allMenuLinks.forEach(link => {
        link.addEventListener('click', handleMenuItemClick);
    });

    // Redimensionamiento de ventana
    window.addEventListener('resize', function() {
        checkIfMobile();
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebarVisible && isMobile) {
            hideSidebar();
        }
    });

    // Prevenir propagación de clicks dentro del sidebar
    sidebar.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Click fuera del sidebar en móvil para cerrarlo
    document.addEventListener('click', function(event) {
        if (isMobile && sidebarVisible && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            hideSidebar();
        }
    });

    // Funcionalidad para los botones de la sección de bienvenida
    const featureCards = document.querySelectorAll('.feature-card');

    // Hacer las tarjetas clickeables
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardTitle = this.querySelector('h3').textContent;
            let targetRoute = '';
            
            switch(cardTitle) {
                case 'Búsquedas Internas':
                    targetRoute = '#internal-search';
                    // Abrir automáticamente el menú desplegable
                    setTimeout(() => {
                        const internalSearchMenuItem = document.querySelector('a[href="#internal-search"]').closest('.menu-item');
                        const submenu = internalSearchMenuItem.querySelector('.submenu');
                        if (submenu && !submenu.classList.contains('open')) {
                            submenu.classList.add('open');
                            internalSearchMenuItem.classList.add('open');
                            internalSearchMenuItem.classList.add('active');
                        }
                    }, 100);
                    break;
                case 'Búsquedas Externas':
                    targetRoute = '#external-search';
                    break;
                case 'Información':
                    targetRoute = '#information';
                    break;
            }
            
            if (targetRoute) {
                // Remover clase active de todos los elementos del menú principales
                document.querySelectorAll('.menu-item').forEach(item => {
                    if (!item.querySelector('.submenu') || targetRoute !== '#internal-search') {
                        item.classList.remove('active');
                    }
                });
                
                // Si no es búsquedas internas, agregar active al elemento correspondiente
                if (targetRoute !== '#internal-search') {
                    const targetMenuItem = document.querySelector(`a[href="${targetRoute}"]`);
                    if (targetMenuItem) {
                        targetMenuItem.closest('.menu-item').classList.add('active');
                    }
                }
                
                // Navegar a la sección
                handleNavigation(targetRoute);
                
                // En móvil, cerrar el menú si está abierto
                if (isMobile && sidebarVisible) {
                    setTimeout(() => {
                        hideSidebar();
                    }, 300);
                }
            }
        });
        
        // Agregar efecto hover con cursor pointer
        card.style.cursor = 'pointer';
    });

    // Animación suave para las cards de características
    
    // Observador de intersección para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar el observador a las cards (reutilizando la variable featureCards)
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Funcionalidad para los métodos de búsqueda
    function initializeSearchMethods() {
        const methodCards = document.querySelectorAll('.search-method-card');
        const methodBtns = document.querySelectorAll('.method-btn');
        const backBtn = document.getElementById('backToHome');

        // Agregar funcionalidad a las tarjetas de métodos
        methodCards.forEach(card => {
            card.addEventListener('click', function(event) {
                // Prevenir que el click del botón dispare el click de la tarjeta
                if (event.target.classList.contains('method-btn')) {
                    return;
                }
                
                const method = this.dataset.method;
                console.log(`Información sobre método: ${method}`);
                
                // Aquí puedes agregar lógica para mostrar información detallada
                this.classList.add('selected');
                setTimeout(() => {
                    this.classList.remove('selected');
                }, 2000);
            });
        });

        // Agregar funcionalidad a los botones de simular
        methodBtns.forEach(btn => {
            btn.addEventListener('click', function(event) {
                event.stopPropagation();
                const card = this.closest('.search-method-card');
                const method = card.dataset.method;
                console.log(`Simulando método: ${method}`);
                
                // Aquí puedes agregar la lógica para abrir el simulador
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
                
                setTimeout(() => {
                    this.innerHTML = 'Simular';
                    alert(`Iniciando simulación de ${method.charAt(0).toUpperCase() + method.slice(1)}`);
                }, 1500);
            });
        });

        // Botón de regreso al inicio
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                // Remover clase active de todos los elementos del menú
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Activar el elemento "Inicio"
                const homeMenuItem = document.querySelector('a[href="#home"]');
                if (homeMenuItem) {
                    homeMenuItem.closest('.menu-item').classList.add('active');
                }
                
                // Navegar al inicio
                handleNavigation('#home');
            });
        }
    }

    // Inicializar la aplicación
    initializeSidebar();
    
    // Inicializar funcionalidad de métodos de búsqueda
    initializeSearchMethods();
    
    // Mostrar la sección de inicio por defecto
    showSection('home');
    
    // Mensaje de bienvenida en la consola
    console.log('🔍 Simulador de Búsquedas inicializado correctamente');
    console.log('📱 Dispositivo:', isMobile ? 'Móvil' : 'Desktop');
});

// Funciones globales para acceso externo si es necesario
window.AppSidebar = {
    toggle: function() {
        const event = new Event('click');
        document.getElementById('menuToggle').dispatchEvent(event);
    },
    
    show: function() {
        // Implementar lógica para mostrar sidebar
    },
    
    hide: function() {
        // Implementar lógica para ocultar sidebar
    }
};