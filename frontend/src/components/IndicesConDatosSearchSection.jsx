import React from 'react';
import { ArrowLeft, Database } from 'lucide-react';
import '../styles/SearchSection.css';
import '../styles/SequentialSearchSection.css';

function IndicesConDatosSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Database className="section-icon" size={56} />
          <h1>Índices Con Datos</h1>
          <p className="section-subtitle">
            Índices que almacenan los datos junto con las claves de búsqueda
          </p>
        </div>

        {/* Contenido temporal - En desarrollo */}
        <div className="subsection">
          <div className="info-box">
            <h3>🚧 Sección en Desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
            <p><strong>Características planeadas:</strong></p>
            <ul>
              <li>Almacenamiento de datos en el índice</li>
              <li>Acceso directo sin consultar archivo principal</li>
              <li>Visualización de estructura integrada</li>
              <li>Comparación con índices tradicionales</li>
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

export default IndicesConDatosSearchSection;
