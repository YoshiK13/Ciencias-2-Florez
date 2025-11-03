import React from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function IndicesMultinivelSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Layers className="section-icon" size={56} />
          <h1>Índices Multinivel</h1>
          <p className="section-subtitle">
            Jerarquía de índices para optimizar acceso a grandes volúmenes de datos
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Estructura jerárquica de índices</li>
              <li>Búsqueda en múltiples niveles</li>
              <li>Visualización de árbol de índices</li>
              <li>Optimización para grandes bases de datos</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('indices')}
          >
            <ArrowLeft size={16} />
            Volver a Índices
          </button>
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

export default IndicesMultinivelSearchSection;
