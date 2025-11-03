import React from 'react';
import { ArrowLeft, PieChart } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function DinamicasParcialesSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <PieChart className="section-icon" size={56} />
          <h1>Búsquedas Dinámicas Parciales</h1>
          <p className="section-subtitle">
            Reorganización localizada solo en áreas afectadas
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Reorganización parcial eficiente</li>
              <li>Actualización solo de sectores modificados</li>
              <li>Visualización de áreas afectadas</li>
              <li>Optimización de operaciones de escritura</li>
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

export default DinamicasParcialesSearchSection;
