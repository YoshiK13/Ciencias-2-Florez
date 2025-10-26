import { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Globe, 
  Info, 
  ChevronDown,
  ArrowRight,
  Scissors,
  Hash,
  Calculator,
  Binary,
  Network,
  Layers,
  GitBranch,
  List
} from 'lucide-react';
import '../styles/Sidebar.css';

// Iconos para cada método de búsqueda
const methodIcons = {
  home: Home,
  search: Search,
  globe: Globe,
  info: Info,
  list: List,
  'arrow-right': ArrowRight,
  scissors: Scissors,
  hash: Hash,
  calculator: Calculator,
  binary: Binary,
  network: Network,
  layers: Layers,
  'git-branch': GitBranch
};

function Sidebar({ 
  isVisible, 
  onNavigate, 
  currentSection, 
  isMobile, 
  onClose 
}) {
  const [openMenus, setOpenMenus] = useState({});

  const menuItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: 'home'
    },
    {
      id: 'internal-search',
      label: 'Búsquedas Internas',
      icon: 'search',
      path: 'internal-search',
      submenu: [
        {
          id: 'clasicas',
          label: 'Clásicas',
          icon: 'list',
          path: 'clasicas',
          submenu: [
            {
              id: 'secuencial',
              label: 'Secuencial',
              icon: 'arrow-right',
              path: 'secuencial'
            },
            {
              id: 'binaria',
              label: 'Binaria',
              icon: 'scissors',
              path: 'binaria'
            },
            {
              id: 'hash',
              label: 'Funciones Hash',
              icon: 'hash',
              path: 'hash'
            }
          ]
        },
        {
          id: 'arboles',
          label: 'Árboles',
          icon: 'network',
          path: 'arboles',
          submenu: [
            {
              id: 'residuos',
              label: 'Residuos',
              icon: 'calculator',
              path: 'residuos'
            },
            {
              id: 'digitales',
              label: 'Digitales',
              icon: 'binary',
              path: 'digitales'
            },
            {
              id: 'trie',
              label: 'Residuos Trie',
              icon: 'network',
              path: 'trie'
            },
            {
              id: 'multiples',
              label: 'Residuos Múltiples',
              icon: 'layers',
              path: 'multiples'
            },
            {
              id: 'huffman',
              label: 'Huffman',
              icon: 'git-branch',
              path: 'huffman'
            }
          ]
        }
      ]
    },
    {
      id: 'external-search',
      label: 'Búsquedas Externas',
      icon: 'globe',
      path: 'external-search'
    },
    {
      id: 'grafos',
      label: 'Grafos',
      icon: 'network',
      path: 'grafos'
    },
    {
      id: 'information',
      label: 'Información',
      icon: 'info',
      path: 'information'
    }
  ];

  // Efecto para abrir automáticamente los menús según la sección actual
  useEffect(() => {
    const internalSearchSections = ['internal-search', 'clasicas', 'arboles', 'secuencial', 'binaria', 'hash', 'residuos', 'digitales', 'trie', 'multiples', 'huffman'];
    
    if (internalSearchSections.includes(currentSection)) {
      setOpenMenus(prev => ({
        ...prev,
        'internal-search': true
      }));
      
      // Abrir también el submenú correspondiente
      if (['secuencial', 'binaria', 'hash'].includes(currentSection)) {
        setOpenMenus(prev => ({
          ...prev,
          'internal-search': true,
          'clasicas': true
        }));
      } else if (['residuos', 'digitales', 'trie', 'multiples', 'huffman'].includes(currentSection)) {
        setOpenMenus(prev => ({
          ...prev,
          'internal-search': true,
          'arboles': true
        }));
      }
    }
  }, [currentSection]);

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleNavigation = (path) => {
    onNavigate(path);
    
    if (isMobile) {
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const IconComponent = ({ iconName, size = 20 }) => {
    const Icon = methodIcons[iconName] || Search;
    return <Icon size={size} />;
  };

  const renderMenuItem = (item, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isOpen = openMenus[item.id];
    
    // NUEVA LÓGICA ULTRA SIMPLE: Solo está activo si es EXACTAMENTE la sección actual
    const isActive = (currentSection === item.path);
    
    // Construir clases CSS - SOLO active, sin parent-highlight
    const cssClasses = [
      'menu-item',
      level === 1 ? 'submenu-item' : level === 2 ? 'submenu-level-2-item' : '',
      isActive ? 'active' : '',
      isOpen ? 'open' : ''
    ].filter(Boolean).join(' ');

    return (
      <li key={item.id} className={cssClasses}>
        <div
          className={`menu-link ${level === 1 ? 'submenu-link' : level === 2 ? 'submenu-level-2-link' : ''}`}
          onClick={() => {
            if (hasSubmenu) {
              toggleMenu(item.id);
              // Si es el elemento principal y tiene path, también navegar
              if (level === 0 && item.path) {
                handleNavigation(item.path);
              }
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <div className="menu-item-content">
            <IconComponent iconName={item.icon} />
            <span>{item.label}</span>
          </div>
          {hasSubmenu && (
            <ChevronDown 
              size={16} 
              className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            />
          )}
        </div>
        
        {hasSubmenu && (
          <ul className={`${level === 0 ? 'submenu' : 'submenu-level-2'} ${isOpen ? 'open' : ''}`}>
            {item.submenu.map(subItem => renderMenuItem(subItem, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <nav className={`sidebar ${isVisible ? 'active' : 'hidden'}`}>
        <div className="sidebar-header">
          <h2>Navegación</h2>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>
      
      {/* Overlay para móviles */}
      <div 
        className={`overlay ${isVisible && isMobile ? 'active' : ''}`}
        onClick={onClose}
      />
    </>
  );
}

export default Sidebar;