import { 
  ArrowLeft,
  Calculator,
  Binary,
  Network,
  Layers,
  GitBranch
} from 'lucide-react';
import '../styles/SearchSection.css';

function TreeSearchSection({ onNavigate }) {

  const treeMethods = [
    {
      id: 'residuos',
      name: 'Residuos',
      description: 'Búsqueda basada en operaciones de módulo para distribución uniforme.',
      complexity: 'O(1) - O(n)',
      icon: Calculator,
      path: 'residuos'
    },
    {
      id: 'digitales',
      name: 'Digitales',
      description: 'Búsqueda basada en la representación digital de las claves.',
      complexity: 'O(k)',
      icon: Binary,
      path: 'digitales'
    },
    {
      id: 'trie',
      name: 'Residuos Trie',
      description: 'Estructura de árbol especializada para búsqueda de cadenas por prefijos.',
      complexity: 'O(m)',
      icon: Network,
      path: 'trie'
    },
    {
      id: 'multiples',
      name: 'Residuos Múltiples',
      description: 'Utiliza múltiples funciones de hash para reducir colisiones.',
      complexity: 'O(1) - O(k)',
      icon: Layers,
      path: 'multiples'
    },
    {
      id: 'huffman',
      name: 'Huffman',
      description: 'Algoritmo de codificación que crea árboles binarios óptimos para búsqueda.',
      complexity: 'O(log n)',
      icon: GitBranch,
      path: 'huffman'
    }
  ];

  const handleMethodClick = (method) => {
    onNavigate(method.path);
  };

  const renderMethodCard = (method) => {
    const IconComponent = method.icon;

    return (
      <div 
        key={method.id} 
        className="search-method-card" 
        data-method={method.id}
        onClick={() => handleMethodClick(method)}
        style={{ cursor: 'pointer' }}
      >
        <div className="method-icon">
          <IconComponent size={28} />
        </div>
        <h3>{method.name}</h3>
        <div className="method-complexity">
          <span className="complexity-label">Complejidad:</span>
          <span className="complexity-value">{method.complexity}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Network className="section-icon" size={56} />
          <h1>Búsquedas en Árboles</h1>
          <p className="section-subtitle">
            Algoritmos especializados para estructuras de árbol y métodos avanzados
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid">
            {treeMethods.map(method => renderMethodCard(method))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('internal-search')}
          >
            <ArrowLeft size={16} />
            Volver a Búsquedas Internas
          </button>
          <button 
            className="back-btn" 
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={16} />
            Volver al Inicio
          </button>
        </div>
      </div>
    </section>
  );
}

export default TreeSearchSection;