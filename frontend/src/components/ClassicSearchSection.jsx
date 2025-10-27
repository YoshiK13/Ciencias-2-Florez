import { 
  ArrowLeft,
  ArrowRight,
  Scissors,
  Hash,
  List
} from 'lucide-react';
import '../styles/SearchSection.css';

function ClassicSearchSection({ onNavigate }) {
  const classicMethods = [
    {
      id: 'secuencial',
      name: 'Búsqueda Secuencial',
      description: 'Examina cada elemento de la estructura uno por uno hasta encontrar el objetivo.',
      complexity: 'O(n)',
      icon: ArrowRight,
      path: 'secuencial'
    },
    {
      id: 'binaria',
      name: 'Búsqueda Binaria',
      description: 'Divide el espacio de búsqueda por la mitad en cada iteración (requiere orden).',
      complexity: 'O(log n)',
      icon: Scissors,
      path: 'binaria'
    },
    {
      id: 'hash',
      name: 'Funciones Hash',
      description: 'Utiliza una función de hash para mapear claves a posiciones específicas.',
      complexity: 'O(1) promedio',
      icon: Hash,
      path: 'hash'
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
          <List className="section-icon" size={56} />
          <h1>Búsquedas Clásicas</h1>
          <p className="section-subtitle">
            Algoritmos fundamentales de búsqueda en estructuras lineales
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid">
            {classicMethods.map(method => renderMethodCard(method))}
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

export default ClassicSearchSection;