import { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Undo, 
  Redo, 
  Play, 
  Pause,
  Plus,
  Search,
  Trash2,
  Settings
} from 'lucide-react';
import '../styles/SequentialSearchSection.css';

function SequentialSearchSection({ onNavigate, onSimulate }) {
  // Estados para la configuración
  const [structureSize, setStructureSize] = useState(20);
  const [keySize, setKeySize] = useState(4);
  const [collisionMethod, setCollisionMethod] = useState('secuencial');
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [insertKey, setInsertKey] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  
  // Estados de simulación
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Estado para los datos de la estructura
  const [structureData, setStructureData] = useState([]);

  const handleCreateStructure = () => {
    if (structureSize >= 10 && keySize >= 2) {
      setIsStructureCreated(true);
      // Inicializar estructura con espacios vacíos
      const newStructure = Array(structureSize).fill(null).map((_, index) => ({
        position: index + 1,
        value: null,
        isHighlighted: false
      }));
      setStructureData(newStructure);
      console.log('Estructura creada:', { structureSize, keySize, collisionMethod });
    }
  };

  const handleInsert = () => {
    if (insertKey.trim() && isStructureCreated) {
      console.log('Insertar clave:', insertKey);
      setInsertKey('');
    }
  };

  const handleSearch = () => {
    if (searchKey.trim() && isStructureCreated) {
      console.log('Buscar clave:', searchKey);
      setIsSimulating(true);
      // Simular búsqueda
      setTimeout(() => {
        setIsSimulating(false);
      }, 2000);
    }
  };

  const handleDelete = () => {
    if (deleteKey.trim() && isStructureCreated) {
      console.log('Eliminar clave:', deleteKey);
      setDeleteKey('');
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // Función para renderizar la estructura optimizada
  const renderStructureTable = () => {
    if (!isStructureCreated || structureData.length === 0) {
      return null;
    }

    const occupiedPositions = structureData
      .map((item, index) => ({ ...item, index }))
      .filter(item => item.value !== null);
    
    // Obtener posiciones ocupadas en el medio (excluyendo primera y última)
    const middleOccupiedPositions = occupiedPositions.filter(
      item => item.index > 0 && item.index < structureData.length - 1
    );
    
    // Determinar si necesitamos mostrar puntos suspensivos
    const needsEllipsisAfterFirst = middleOccupiedPositions.length > 0 || structureData.length > 2;
    const needsEllipsisBeforeLast = middleOccupiedPositions.length > 0 && structureData.length > 2;

    return (
      <div className="structure-table">
        <div className="table-header">
          <span className="header-memory">Memoria</span>
        </div>
        
        <div className="table-body">
          {/* Primera posición */}
          <div className="table-row">
            <span className="row-number">{structureData[0].position}</span>
            <span className="cell-memory">
              {structureData[0].value || '—'}
            </span>
          </div>
          
          {/* Puntos suspensivos después de la primera posición si hay elementos ocultos */}
          {needsEllipsisAfterFirst && (
            <div className="table-row ellipsis-row">
              <span className="row-number">⋮</span>
              <span className="cell-memory">⋮</span>
            </div>
          )}
          
          {/* Posiciones ocupadas en el medio */}
          {middleOccupiedPositions.map(item => (
            <div key={item.index} className="table-row">
              <span className="row-number">{item.position}</span>
              <span className="cell-memory">{item.value}</span>
            </div>
          ))}
          
          {/* Puntos suspensivos antes de la última posición si hay elementos ocultos */}
          {needsEllipsisBeforeLast && middleOccupiedPositions.length > 0 && (
            <div className="table-row ellipsis-row">
              <span className="row-number">⋮</span>
              <span className="cell-memory">⋮</span>
            </div>
          )}
          
          {/* Última posición (si hay más de un elemento) */}
          {structureData.length > 1 && (
            <div className="table-row">
              <span className="row-number">{structureData[structureData.length - 1].position}</span>
              <span className="cell-memory">
                {structureData[structureData.length - 1].value || '—'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="sequential-search-section">
      <div className="section-header">
        <h1>Búsqueda Secuencial</h1>
      </div>

      {/* Sección de Archivo */}
      <div className="file-section">
        <div className="file-actions">
          <button className="action-btn">
            <Save size={18} />
            <span>Guardar</span>
          </button>
          <button className="action-btn">
            <FolderOpen size={18} />
            <span>Abrir</span>
          </button>
          <button className="action-btn">
            <Undo size={18} />
            <span>Deshacer</span>
          </button>
          <button className="action-btn">
            <Redo size={18} />
            <span>Rehacer</span>
          </button>
        </div>
      </div>

      {/* Sección de Configuración */}
      <div className="configuration-section">
        <h2>
          <Settings size={20} />
          Configuración de la Estructura
        </h2>
        <div className="config-controls">
          <div className="config-group">
            <label htmlFor="structureSize">Tamaño de Estructura</label>
            <input
              id="structureSize"
              type="number"
              min="10"
              value={structureSize}
              onChange={(e) => setStructureSize(Math.max(10, parseInt(e.target.value) || 10))}
              className="config-input"
            />
            <small>Mínimo: 10</small>
          </div>

          <div className="config-group">
            <label htmlFor="keySize">Tamaño de Clave</label>
            <input
              id="keySize"
              type="number"
              min="2"
              value={keySize}
              onChange={(e) => setKeySize(Math.max(2, parseInt(e.target.value) || 2))}
              className="config-input"
            />
            <small>Mínimo: 2</small>
          </div>

          <div className="config-group">
            <label htmlFor="collisionMethod">Método de Colisión</label>
            <select
              id="collisionMethod"
              value={collisionMethod}
              onChange={(e) => setCollisionMethod(e.target.value)}
              className="config-select"
            >
              <option value="secuencial">Secuencial</option>
              <option value="potencia2">Potencia 2</option>
              <option value="hashmod">Hash MOD</option>
              <option value="doble">Hash Doble</option>
              <option value="cuadratico">Sondeo Cuadrático</option>
            </select>
          </div>

          <div className="button-container">
            <button 
              className="create-structure-btn"
              onClick={handleCreateStructure}
              disabled={structureSize < 10 || keySize < 2}
            >
              Crear Estructura
            </button>
          </div>
        </div>
      </div>

      {/* Área Principal de Simulación */}
      <div className="simulation-area">
        {/* Panel de Opciones y Manejo */}
        <div className="options-panel">
          <h3>Opciones y Manejo</h3>
          
          {/* Velocidad de Simulación */}
          <div className="control-group">
            <label>Velocidad de Simulación</label>
            <div className="speed-control">
              <input
                type="range"
                min="1"
                max="5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                className="speed-slider"
                disabled={!isStructureCreated}
              />
              <span className="speed-label">{speedLabels[simulationSpeed - 1]}</span>
            </div>
          </div>

          {/* Insertar Clave */}
          <div className="control-group">
            <label>Insertar Clave</label>
            <div className="input-with-button">
              <input
                type="text"
                value={insertKey}
                onChange={(e) => setInsertKey(e.target.value)}
                placeholder="Ingrese la clave"
                className="operation-input"
                disabled={!isStructureCreated}
              />
              <button 
                onClick={handleInsert}
                className="operation-btn insert-btn"
                disabled={!isStructureCreated || !insertKey.trim()}
              >
                <Plus size={16} />
                Insertar
              </button>
            </div>
          </div>

          {/* Buscar Clave */}
          <div className="control-group">
            <label>Buscar Clave</label>
            <div className="input-with-button">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Ingrese la clave a buscar"
                className="operation-input"
                disabled={!isStructureCreated || isSimulating}
              />
              <button 
                onClick={handleSearch}
                className="operation-btn search-btn"
                disabled={!isStructureCreated || !searchKey.trim() || isSimulating}
              >
                {isSimulating ? (
                  <>
                    <Pause size={16} />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Borrar Clave */}
          <div className="control-group">
            <label>Borrar Clave</label>
            <div className="input-with-button">
              <input
                type="text"
                value={deleteKey}
                onChange={(e) => setDeleteKey(e.target.value)}
                placeholder="Ingrese la clave a borrar"
                className="operation-input"
                disabled={!isStructureCreated}
              />
              <button 
                onClick={handleDelete}
                className="operation-btn delete-btn"
                disabled={!isStructureCreated || !deleteKey.trim()}
              >
                <Trash2 size={16} />
                Borrar
              </button>
            </div>
          </div>
        </div>

        {/* Área de Simulación */}
        <div className="simulation-canvas">
          <h3>Área de Simulación</h3>
          {!isStructureCreated ? (
            <div className="empty-state">
              <p>Configure y cree una estructura para comenzar la simulación</p>
            </div>
          ) : (
            <div className="canvas-content">
              <div className="simulation-info">
                <p><strong>Estructura:</strong> Tamaño {structureSize}</p>
                <p><strong>Colisión:</strong> {collisionMethod}</p>
                <p><strong>Clave:</strong> Tamaño {keySize}</p>
              </div>
              
              {/* Visualización de la estructura de datos */}
              <div className="data-structure-view">
                {renderStructureTable()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SequentialSearchSection;