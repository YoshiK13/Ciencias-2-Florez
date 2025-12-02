import { 
  ArrowLeft,
  Network,
  Circle,
  GitMerge
} from 'lucide-react';
import '../styles/SearchSection.css';

function OperacionesGrafosSection({ onNavigate }) {
  const operacionesMetodos = [
    {
      id: 'sobre-grafo',
      name: 'Operaciones sobre un Grafo',
      description: 'Operaciones que se realizan sobre un único grafo: recorridos, búsqueda de caminos, ciclos.',
      complexity: 'Varía según operación',
      icon: Circle,
      path: 'sobre-grafo'
    },
    {
      id: 'entre-grafos',
      name: 'Operaciones entre Múltiples Grafos',
      description: 'Operaciones que involucran múltiples grafos: unión, intersección, isomorfismo.',
      complexity: 'Varía según operación',
      icon: GitMerge,
      path: 'entre-grafos'
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
          <h1>Operaciones de Grafos</h1>
          <p className="section-subtitle">
            Operaciones fundamentales sobre grafos individuales y múltiples
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid">
            {operacionesMetodos.map(method => renderMethodCard(method))}
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

export default OperacionesGrafosSection;
