import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function DinamicasCompletasSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <CheckCircle className="section-icon" size={56} />
          <h1>Búsquedas Dinámicas Completas</h1>
          <p className="section-subtitle">
            Reorganización completa de la estructura tras cada modificación
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Reorganización completa tras inserciones/eliminaciones</li>
              <li>Mantenimiento del orden global</li>
              <li>Visualización de proceso de reorganización</li>
              <li>Análisis de complejidad temporal</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('dinamicas')}
          >
            <ArrowLeft size={16} />
            Volver a Dinámicas
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

export default DinamicasCompletasSearchSection;
