import { Info, User, GraduationCap, BookOpen } from 'lucide-react';
import '../styles/InformationSection.css';

function InformationSection({ onNavigate }) {
  return (
    <section className="information-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Info className="section-icon" size={56} />
          <h1>Información del Proyecto</h1>
          <p className="section-subtitle">
            Detalles sobre el simulador y sus responsables
          </p>
        </div>

        <div className="information-content">
          {/* Descripción del Proyecto */}
          <div className="info-card">
            <div className="info-card-header">
              <BookOpen className="info-icon" size={32} />
              <h2>Acerca del Simulador</h2>
            </div>
            <div className="info-card-content">
              <p>
                Este es un simulador para el manejo, guardado, búsqueda de información en memoria 
                tanto principal como secundaria. Con el fin de ilustrar el manejo académico de los 
                conceptos de la asignatura de ciencias de la computación 2.
              </p>
              <p>
                Este simulador solo busca ejemplificar y no maneja registros completos como una base 
                de datos, pero mantiene el rigor de las técnicas para cada sección.
              </p>
            </div>
          </div>

          {/* Información del Docente */}
          <div className="info-card">
            <div className="info-card-header">
              <GraduationCap className="info-icon" size={32} />
              <h2>Docente a Cargo</h2>
            </div>
            <div className="info-card-content">
              <p>
                <strong>Ing. Julio César Flórez Báez</strong>
              </p>
              <p className="role-description">
                Profesor de Ciencias de la Computación
              </p>
            </div>
          </div>

          {/* Información del Estudiante */}
          <div className="info-card">
            <div className="info-card-header">
              <User className="info-icon" size={32} />
              <h2>Desarrollado por</h2>
            </div>
            <div className="info-card-content">
              <p>
                <strong>Joshoa Alarcón Sánchez</strong>
              </p>
              <p className="student-code">
                Código: <span className="code-highlight">20221020013</span>
              </p>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="info-card technical-info">
            <div className="info-card-header">
              <Info className="info-icon" size={32} />
              <h2>Información Técnica</h2>
            </div>
            <div className="info-card-content">
              <div className="tech-grid">
                <div className="tech-item">
                  <h4>Frontend</h4>
                  <p>React + Vite</p>
                </div>
                <div className="tech-item">
                  <h4>Backend</h4>
                  <p>Node.js + Express</p>
                </div>
                <div className="tech-item">
                  <h4>Algoritmos</h4>
                  <p>8 métodos de búsqueda</p>
                </div>
                <div className="tech-item">
                  <h4>Año</h4>
                  <p>2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('home')}
          >
            <Info size={16} />
            Volver al Inicio
          </button>
        </div>
      </div>
    </section>
  );
}

export default InformationSection;