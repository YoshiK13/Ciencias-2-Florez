import { useState } from 'react';
import { 
  Search, 
  ArrowLeft,
  ArrowRight,
  Scissors,
  Hash,
  Calculator,
  Binary,
  Network,
  Layers,
  GitBranch,
  List,
  Play,
  Loader
} from 'lucide-react';
import '../styles/SearchSection.css';

// Iconos para cada método
const methodIcons = {
  secuencial: ArrowRight,
  binaria: Scissors,
  hash: Hash,
  residuos: Calculator,
  digitales: Binary,
  trie: Network,
  multiples: Layers,
  huffman: GitBranch
};

function InternalSearchSection({ onNavigate, onSimulate }) {
  const [loading, setLoading] = useState({});

  const searchMethods = {
    clasicas: [
      {
        id: 'secuencial',
        name: 'Búsqueda Secuencial',
        description: 'Examina cada elemento de la estructura uno por uno hasta encontrar el objetivo.',
        complexity: 'O(n)',
        icon: 'secuencial'
      },
      {
        id: 'binaria',
        name: 'Búsqueda Binaria',
        description: 'Divide el espacio de búsqueda por la mitad en cada iteración (requiere orden).',
        complexity: 'O(log n)',
        icon: 'binaria'
      },
      {
        id: 'hash',
        name: 'Funciones Hash',
        description: 'Utiliza una función de hash para mapear claves a posiciones específicas.',
        complexity: 'O(1) promedio',
        icon: 'hash'
      }
    ],
    arboles: [
      {
        id: 'residuos',
        name: 'Residuos',
        description: 'Búsqueda basada en operaciones de módulo para distribución uniforme.',
        complexity: 'O(1) - O(n)',
        icon: 'residuos'
      },
      {
        id: 'digitales',
        name: 'Digitales',
        description: 'Búsqueda basada en la representación digital de las claves.',
        complexity: 'O(k)',
        icon: 'digitales'
      },
      {
        id: 'trie',
        name: 'Residuos Trie',
        description: 'Estructura de árbol especializada para búsqueda de cadenas por prefijos.',
        complexity: 'O(m)',
        icon: 'trie'
      },
      {
        id: 'multiples',
        name: 'Residuos Múltiples',
        description: 'Utiliza múltiples funciones de hash para reducir colisiones.',
        complexity: 'O(1) - O(k)',
        icon: 'multiples'
      },
      {
        id: 'huffman',
        name: 'Huffman',
        description: 'Algoritmo de codificación que crea árboles binarios óptimos para búsqueda.',
        complexity: 'O(log n)',
        icon: 'huffman'
      }
    ]
  };

  const handleSimulate = async (methodId) => {
    setLoading(prev => ({ ...prev, [methodId]: true }));
    
    try {
      await onSimulate(methodId);
    } catch (error) {
      console.error('Error en simulación:', error);
    } finally {
      setLoading(prev => ({ ...prev, [methodId]: false }));
    }
  };

  const renderMethodCard = (method) => {
    const IconComponent = methodIcons[method.icon] || Search;
    const isLoading = loading[method.id];

    return (
      <div key={method.id} className="search-method-card" data-method={method.id}>
        <div className="method-icon">
          <IconComponent size={28} />
        </div>
        <h3>{method.name}</h3>
        <p>{method.description}</p>
        <div className="method-complexity">
          <span className="complexity-label">Complejidad:</span>
          <span className="complexity-value">{method.complexity}</span>
        </div>
        <button 
          className="method-btn"
          onClick={() => handleSimulate(method.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Play size={16} />
              Simular
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Search className="section-icon" size={56} />
          <h1>Búsquedas Internas</h1>
          <p className="section-subtitle">
            Explora diferentes algoritmos de búsqueda para estructuras de datos internas
          </p>
        </div>

        {/* Subsección: Clásicas */}
        <div className="subsection">
          <div className="subsection-header">
            <h2>
              <List className="icon" size={32} />
              Búsquedas Clásicas
            </h2>
            <p>Algoritmos fundamentales de búsqueda en estructuras lineales</p>
          </div>
          
          <div className="subsection-nav">
            <button 
              className="subsection-btn"
              onClick={() => onNavigate('clasicas')}
            >
              <List size={24} />
              <div className="subsection-content">
                <h3>Explorar Búsquedas Clásicas</h3>
                <p>Secuencial, Binaria, Funciones Hash</p>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Subsección: Árboles */}
        <div className="subsection">
          <div className="subsection-header">
            <h2>
              <Network className="icon" size={32} />
              Búsquedas en Árboles
            </h2>
            <p>Algoritmos especializados para estructuras de árbol y métodos avanzados</p>
          </div>
          
          <div className="subsection-nav">
            <button 
              className="subsection-btn"
              onClick={() => onNavigate('arboles')}
            >
              <Network size={24} />
              <div className="subsection-content">
                <h3>Explorar Búsquedas en Árboles</h3>
                <p>Residuos, Digitales, Trie, Residuos Múltiples, Huffman</p>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="section-actions">
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

export default InternalSearchSection;