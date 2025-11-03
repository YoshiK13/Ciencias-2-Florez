import React from 'react';
import { ArrowLeft, Link } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function IndicesSecundariosSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Link className="section-icon" size={56} />
          <h1>Índices Secundarios</h1>
          <p className="section-subtitle">
            Índices sobre campos no clave para búsquedas alternativas
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Índices sobre atributos no clave</li>
              <li>Búsqueda por campos alternativos</li>
              <li>Gestión de múltiples índices secundarios</li>
              <li>Visualización de relaciones índice-datos</li>
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

export default IndicesSecundariosSearchSection;
