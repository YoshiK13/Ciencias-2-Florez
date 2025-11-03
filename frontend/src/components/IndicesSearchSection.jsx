import { 
  ArrowLeft,
  Key,
  Link,
  Layers,
  Database,
  List
} from 'lucide-react';
import '../styles/SearchSection.css';

function IndicesSearchSection({ onNavigate }) {
  const indicesMethods = [
    {
      id: 'primarios',
      name: 'Índices Primarios',
      description: 'Índice basado en la clave primaria ordenada de los registros.',
      complexity: 'O(log n)',
      icon: Key,
      path: 'indices-primarios'
    },
    {
      id: 'secundarios',
      name: 'Índices Secundarios',
      description: 'Índice sobre campos no clave para búsquedas alternativas.',
      complexity: 'O(log n)',
      icon: Link,
      path: 'indices-secundarios'
    },
    {
      id: 'multinivel',
      name: 'Índices Multinivel',
      description: 'Estructura jerárquica de índices para optimizar acceso a grandes volúmenes.',
      complexity: 'O(log_b n)',
      icon: Layers,
      path: 'indices-multinivel'
    },
    {
      id: 'con-datos',
      name: 'Índices Con Datos',
      description: 'Índices que almacenan los datos junto con las claves.',
      complexity: 'O(log n)',
      icon: Database,
      path: 'indices-con-datos'
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
          <List className="section-icon" size={56} />
          <h1>Búsquedas por Índices</h1>
          <p className="section-subtitle">
            Estructuras de índices para acceso eficiente a datos en almacenamiento externo
          </p>
        </div>

        <div className="subsection">
          <div className="search-methods-grid-four">
            {indicesMethods.map(method => renderMethodCard(method))}
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

export default IndicesSearchSection;
