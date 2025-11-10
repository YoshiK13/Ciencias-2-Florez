import { 
  ArrowLeft,
  CheckCircle,
  PieChart,
  Activity
} from 'lucide-react';
import '../styles/SearchSection.css';

function DinamicasSearchSection({ onNavigate }) {
  const dinamicasMethods = [
    {
      id: 'totales',
      name: 'Dinámicas Totales',
      description: 'Reorganización completa de la estructura de datos al insertar o eliminar.',
      complexity: 'O(n)',
      icon: CheckCircle,
      path: 'dinamicas-totales'
    },
    {
      id: 'parciales',
      name: 'Dinámicas Parciales',
      description: 'Reorganización parcial solo en las áreas afectadas por los cambios.',
      complexity: 'O(log n)',
      icon: PieChart,
      path: 'dinamicas-parciales'
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
        <p className="method-description">{method.description}</p>
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
          <Activity className="section-icon" size={56} />
          <h1>Búsquedas Dinámicas</h1>
          <p className="section-subtitle">
            Estructuras que se adaptan dinámicamente a cambios en los datos
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid">
            {dinamicasMethods.map(method => renderMethodCard(method))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('external-search')}
          >
            <ArrowLeft size={16} />
            Volver a Búsquedas Externas
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

export default DinamicasSearchSection;
