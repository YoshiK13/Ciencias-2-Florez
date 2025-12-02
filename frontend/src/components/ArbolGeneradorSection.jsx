import { 
  ArrowLeft,
  TreeDeciduous
} from 'lucide-react';
import '../styles/SearchSection.css';

function ArbolGeneradorSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <TreeDeciduous className="section-icon" size={56} />
          <h1>Árbol Generador</h1>
          <p className="section-subtitle">
            Árboles que conectan todos los vértices de un grafo
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Conceptos de Árboles Generadores</h3>
            <p>
              Un árbol generador es un subgrafo que conecta todos los vértices con el mínimo número de aristas:
            </p>
            <ul>
              <li><strong>Árbol Generador Mínimo (MST):</strong> Árbol con el menor peso total posible</li>
              <li><strong>Algoritmo de Kruskal:</strong> Selecciona aristas en orden de peso creciente</li>
              <li><strong>Algoritmo de Prim:</strong> Construye el árbol desde un vértice inicial</li>
              <li><strong>Propiedades:</strong> Tiene exactamente V-1 aristas para V vértices</li>
              <li><strong>Aplicaciones:</strong> Redes de telecomunicaciones, diseño de circuitos</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('arboles-grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Árboles en Grafos
          </button>
          <button 
            className="back-btn" 
            onClick={() => onNavigate('grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Grafos
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

export default ArbolGeneradorSection;
