import React from 'react';
import { ArrowLeft, Key } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function IndicesPrimariosSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Key className="section-icon" size={56} />
          <h1>Índices Primarios</h1>
          <p className="section-subtitle">
            Índice sobre la clave primaria ordenada de los registros
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Estructura de índice primario</li>
              <li>Búsqueda binaria sobre índice</li>
              <li>Visualización de bloques de datos e índice</li>
              <li>Operaciones de mantenimiento del índice</li>
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

export default IndicesPrimariosSearchSection;
