import { 
  ArrowLeft,
  GitBranch,
  TreeDeciduous,
  Route,
  GitCompare
} from 'lucide-react';
import '../styles/SearchSection.css';

function ArbolesGrafosSection({ onNavigate }) {
  const arbolesMetodos = [
    {
      id: 'arbol-generador',
      name: 'Árbol Generador',
      description: 'Árbol que conecta todos los vértices de un grafo con el mínimo de aristas.',
      complexity: 'O(E log V)',
      icon: TreeDeciduous,
      path: 'arbol-generador'
    },
    {
      id: 'operaciones-arboles',
      name: 'Operaciones entre Árboles',
      description: 'Operaciones y comparaciones entre diferentes árboles generadores.',
      complexity: 'Varía según operación',
      icon: GitCompare,
      path: 'operaciones-arboles'
    },
    {
      id: 'floyd',
      name: 'Algoritmo de Floyd',
      description: 'Encuentra los caminos más cortos entre todos los pares de vértices.',
      complexity: 'O(V³)',
      icon: Route,
      path: 'floyd'
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
          <GitBranch className="section-icon" size={56} />
          <h1>Árboles en Grafos</h1>
          <p className="section-subtitle">
            Árboles generadores y algoritmos de caminos en grafos
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid">
            {arbolesMetodos.map(method => renderMethodCard(method))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Grafos
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

export default ArbolesGrafosSection;
