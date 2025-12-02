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

// Mapeo de iconos
const ICONS = {
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

// Configuración del menú (estructura completamente nueva)
const MENU_CONFIG = [
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
    children: [
      {
        id: 'clasicas',
        label: 'Clásicas',
        icon: 'list',
        path: 'clasicas',
        children: [
          { id: 'secuencial', label: 'Secuencial', icon: 'arrow-right', path: 'secuencial' },
          { id: 'binaria', label: 'Binaria', icon: 'scissors', path: 'binaria' },
          { id: 'hash', label: 'Hash', icon: 'hash', path: 'hash' }
        ]
      },
      {
        id: 'arboles',
        label: 'Árboles',
        icon: 'git-branch',
        path: 'arboles',
        children: [
          { id: 'residuos', label: 'Residuos', icon: 'calculator', path: 'residuos' },
          { id: 'digitales', label: 'Digitales', icon: 'binary', path: 'digitales' },
          { id: 'trie', label: 'Trie', icon: 'network', path: 'trie' },
          { id: 'multiples', label: 'Múltiples', icon: 'layers', path: 'multiples' },
          { id: 'huffman', label: 'Huffman', icon: 'git-branch', path: 'huffman' }
        ]
      }
    ]
  },
  {
    id: 'external-search',
    label: 'Búsquedas Externas',
    icon: 'globe',
    path: 'external-search',
    children: [
      {
        id: 'bloques',
        label: 'Bloques',
        icon: 'layers',
        path: 'bloques'
      },
      {
        id: 'dinamicas',
        label: 'Dinámicas',
        icon: 'network',
        path: 'dinamicas',
        children: [
          { id: 'dinamicas-totales', label: 'Totales', icon: 'arrow-right', path: 'dinamicas-totales' },
          { id: 'dinamicas-parciales', label: 'Parciales', icon: 'scissors', path: 'dinamicas-parciales' }
        ]
      },
      {
        id: 'indices',
        label: 'Índices',
        icon: 'list',
        path: 'indices'
      }
    ]
  },
  {
    id: 'grafos',
    label: 'Grafos',
    icon: 'network',
    path: 'grafos',
    children: [
      {
        id: 'operaciones-grafos',
        label: 'Operaciones de Grafos',
        icon: 'network',
        path: 'operaciones-grafos',
        children: [
          { id: 'sobre-grafo', label: 'Sobre un Grafo', icon: 'arrow-right', path: 'sobre-grafo' },
          { id: 'entre-grafos', label: 'Entre Múltiples Grafos', icon: 'layers', path: 'entre-grafos' }
        ]
      },
      {
        id: 'arboles-grafos',
        label: 'Árboles',
        icon: 'git-branch',
        path: 'arboles-grafos',
        children: [
          { id: 'arbol-generador', label: 'Árbol Generador', icon: 'git-branch', path: 'arbol-generador' },
          { id: 'operaciones-arboles', label: 'Operaciones entre Árboles', icon: 'network', path: 'operaciones-arboles' },
          { id: 'floyd', label: 'Floyd', icon: 'arrow-right', path: 'floyd' }
        ]
      },
      {
        id: 'matrices-grafos',
        label: 'Matrices',
        icon: 'hash',
        path: 'matrices-grafos'
      }
    ]
  },
  {
    id: 'information',
    label: 'Información',
    icon: 'info',
    path: 'information'
  }
];

function Sidebar({ 
  isVisible, 
  onNavigate, 
  currentSection, 
  isMobile, 
  onClose 
}) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Auto-expandir menús basado en la sección actual
  useEffect(() => {
    const newExpanded = new Set();
    
    // Función recursiva para encontrar el path y expandir padres
    const findAndExpand = (items, targetPath, parentIds = []) => {
      for (const item of items) {
        const currentPath = [...parentIds, item.id];
        
        if (item.path === targetPath) {
          // Encontramos el item, expandir todos los padres
          parentIds.forEach(id => newExpanded.add(id));
          return true;
        }
        
        if (item.children) {
          if (findAndExpand(item.children, targetPath, currentPath)) {
            newExpanded.add(item.id);
            return true;
          }
        }
      }
      return false;
    };
    
    findAndExpand(MENU_CONFIG, currentSection);
    setExpandedItems(newExpanded);
  }, [currentSection]);

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item) => {
    // Si tiene hijos, toggle expansión
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    }
    
    // Si tiene path, navegar
    if (item.path) {
      // Verificar cambios no guardados antes de navegar
      if (currentSection === 'indices' && window.indicesCheckUnsavedChanges) {
        window.indicesCheckUnsavedChanges(item.path, () => {
          onNavigate(item.path);
          if (isMobile) {
            setTimeout(() => onClose(), 300);
          }
        });
      } else if (currentSection === 'dinamicas-totales' && window.dinamicasCompletasCheckUnsavedChanges) {
        window.dinamicasCompletasCheckUnsavedChanges(item.path, () => {
          onNavigate(item.path);
          if (isMobile) {
            setTimeout(() => onClose(), 300);
          }
        });
      } else if (currentSection === 'dinamicas-parciales' && window.dinamicasParcialesCheckUnsavedChanges) {
        window.dinamicasParcialesCheckUnsavedChanges(item.path, () => {
          onNavigate(item.path);
          if (isMobile) {
            setTimeout(() => onClose(), 300);
          }
        });
      } else {
        // Navegar directamente si no hay verificación
        onNavigate(item.path);
        if (isMobile) {
          setTimeout(() => onClose(), 300);
        }
      }
    }
  };

  const IconComponent = ({ iconName, size = 20 }) => {
    const Icon = ICONS[iconName] || Search;
    return <Icon size={size} />;
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    // LÓGICA SIMPLE Y CORRECTA: Solo está activo si es EXACTAMENTE la sección actual
    const isActive = currentSection === item.path;
    
    const itemClasses = [
      'sidebar-item',
      `level-${level}`,
      isActive ? 'active' : '',
      isExpanded ? 'expanded' : ''
    ].filter(Boolean).join(' ');

    return (
      <div key={item.id} className={itemClasses}>
        <div
          className="sidebar-item-content"
          onClick={() => handleItemClick(item)}
        >
          <div className="sidebar-item-main">
            <IconComponent iconName={item.icon} />
            <span className="sidebar-item-label">{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown 
              size={16} 
              className={`chevron ${isExpanded ? 'expanded' : ''}`}
            />
          )}
        </div>
        
        {hasChildren && (
          <div className={`sidebar-children ${isExpanded ? 'expanded' : ''}`}>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isVisible && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar-new ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="sidebar-header">
          <h2>Navegación</h2>
        </div>
        
        <nav className="sidebar-nav">
          {MENU_CONFIG.map(item => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;