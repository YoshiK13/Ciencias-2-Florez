import React from 'react';
import { ArrowLeft, HardDrive } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function BloquesSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <HardDrive className="section-icon" size={56} />
          <h1>Búsqueda por Bloques</h1>
          <p className="section-subtitle">
            Organización de datos en bloques de tamaño fijo para acceso eficiente en disco
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Organización de registros en bloques de disco</li>
              <li>Búsqueda secuencial por bloques</li>
              <li>Visualización de estructura de bloques</li>
              <li>Optimización de acceso a disco</li>
            </ul>
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

export default BloquesSearchSection;
