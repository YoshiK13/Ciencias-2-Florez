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
import '../styles/SidebarNew.css';

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

function SidebarNew({ 
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
      onNavigate(item.path);
      
      // Cerrar sidebar en móvil
      if (isMobile) {
        setTimeout(() => onClose(), 300);
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

export default SidebarNew;