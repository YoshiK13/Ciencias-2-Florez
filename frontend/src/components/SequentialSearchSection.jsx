import React, { useState } from 'react';
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

function SequentialSearchSection({ onNavigate }) {
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
  const [memoryArray, setMemoryArray] = useState([]); // Array de claves ordenadas
  
  // Estados para mensajes informativos
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Sistema de historial para deshacer/rehacer (últimas 15 acciones)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estado temporal para la visualización de la estructura
  const [structureData, setStructureData] = useState([]);
  
  // Estados para control de cambios y guardado
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Sistema mejorado de navegación sin bloqueo
  const checkForUnsavedChanges = React.useCallback((targetSection, callback) => {
    if (hasUnsavedChanges && !showUnsavedWarning) {
      setPendingAction({ 
        execute: callback || (() => onNavigate && onNavigate(targetSection)), 
        description: `navegar a ${targetSection}` 
      });
      setShowUnsavedWarning(true);
    } else if (!hasUnsavedChanges) {
      if (callback) {
        callback();
      } else if (onNavigate) {
        onNavigate(targetSection);
      }
    }
  }, [hasUnsavedChanges, onNavigate, showUnsavedWarning]);

  // Interceptar intentos de navegación del componente padre
  React.useEffect(() => {
    window.sequentialSearchCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.sequentialSearchCheckUnsavedChanges;
    };
  }, [checkForUnsavedChanges]);

  // Función para verificar cambios no guardados antes de salir
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hay cambios sin guardar que se perderán si sale de la página.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Función para mostrar mensajes
  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  // Función para manejar entrada de solo números
  const handleNumericInput = (e, setter) => {
    const value = e.target.value;
    // Solo permitir dígitos
    const numericValue = value.replace(/\D/g, '');
    // Limitar al tamaño máximo de clave
    const limitedValue = numericValue.slice(0, keySize);
    setter(limitedValue);
  };

  // Función para formatear clave con ceros a la izquierda
  const formatKey = (key) => {
    return key.padStart(keySize, '0');
  };

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'SBF', // Sequential Binary File
      version: '1.0',
      sectionType: 'sequential-search',
      sectionName: 'Búsqueda Secuencial',
      timestamp: new Date().toISOString(),
      configuration: {
        structureSize: structureSize,
        keySize: keySize,
        collisionMethod: collisionMethod
      },
      data: {
        memoryArray: [...memoryArray],
        isStructureCreated: isStructureCreated
      },
      metadata: {
        elementsCount: memoryArray.length,
        description: `Estructura de búsqueda secuencial con ${memoryArray.length} elementos`
      }
    };
  };

  // Función para guardar archivo con selector de ubicación
  const handleSave = async () => {
    if (!isStructureCreated) {
      showMessage('No hay estructura para guardar', 'error');
      return;
    }

    const defaultName = currentFileName 
      ? currentFileName.replace('.sbf', '')
      : `busqueda-secuencial-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.sbf`,
          types: [{
            description: 'Archivos de Búsqueda Secuencial',
            accept: {
              'application/json': ['.sbf']
            }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();

        setHasUnsavedChanges(false);
        setCurrentFileName(fileHandle.name);
        showMessage(`Archivo guardado como: ${fileHandle.name}`, 'success');
      } else {
        // Fallback para navegadores que no soportan File System Access API
        const fileName = prompt('Ingrese el nombre del archivo:', defaultName);
        if (!fileName) {
          return; // Usuario canceló
        }

        const finalFileName = fileName.endsWith('.sbf') ? fileName : `${fileName}.sbf`;
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setHasUnsavedChanges(false);
        setCurrentFileName(finalFileName);
        showMessage(`Archivo guardado como: ${finalFileName}`, 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showMessage('Error al guardar el archivo', 'error');
        console.error('Error saving file:', error);
      }
    }
  };

  // Función para cargar archivo con selector mejorado
  const handleLoad = async () => {
    // Función que ejecuta la carga real
    const executeLoad = async () => {
      try {
        let file = null;
        let fileName = '';
        let content = '';

        // Intentar usar la File System Access API moderna si está disponible
        if ('showOpenFilePicker' in window) {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [{
              description: 'Archivos de Búsqueda Secuencial',
              accept: {
                'application/json': ['.sbf']
              }
            }],
            multiple: false
          });
          
          file = await fileHandle.getFile();
          fileName = file.name;
          content = await file.text();
        } else {
          // Fallback para navegadores que no soportan File System Access API
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.sbf';
          
          await new Promise((resolve) => {
            input.onchange = (e) => {
              file = e.target.files[0];
              if (file) {
                fileName = file.name;
                const reader = new FileReader();
                reader.onload = (e) => {
                  content = e.target.result;
                  resolve();
                };
                reader.readAsText(file);
              } else {
                resolve();
              }
            };
            input.click();
          });
        }

        if (!file || !fileName.endsWith('.sbf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .sbf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'SBF') {
          showMessage('Archivo no válido: no es un archivo SBF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'sequential-search') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        setStructureSize(loadedData.configuration.structureSize);
        setKeySize(loadedData.configuration.keySize);
        setCollisionMethod(loadedData.configuration.collisionMethod);
        
        // Cargar datos
        setMemoryArray(loadedData.data.memoryArray || []);
        setIsStructureCreated(loadedData.data.isStructureCreated || false);
        
        // Actualizar visualización
        if (loadedData.data.isStructureCreated) {
          const newStructure = Array(loadedData.configuration.structureSize).fill(null).map((_, index) => ({
            position: index + 1,
            value: loadedData.data.memoryArray[index] || null,
            isHighlighted: false
          }));
          setStructureData(newStructure);
        }

        // Limpiar historial y estados
        setHistory([]);
        setHistoryIndex(-1);
        setHasUnsavedChanges(false);
        setCurrentFileName(fileName);
        
        showMessage(`Archivo cargado exitosamente: ${fileName}`, 'success');
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          showMessage('Error al cargar el archivo: ' + (error.message || 'formato inválido'), 'error');
          console.error('Error loading file:', error);
        }
      }
    };

    // Verificar cambios no guardados
    if (hasUnsavedChanges) {
      setPendingAction({ execute: executeLoad, description: 'cargar archivo' });
      setShowUnsavedWarning(true);
      return;
    }

    // Ejecutar directamente si no hay cambios
    executeLoad();
  };

  // Función mejorada para confirmar pérdida de progreso
  const confirmUnsavedChanges = async (action) => {
    const currentPendingAction = pendingAction;
    
    // Cerrar el modal
    setShowUnsavedWarning(false);
    setPendingAction(null);
    
    try {
      if (action === 'cancel') {
        // Solo cerrar el modal, no hacer nada más
        return;
        
      } else if (action === 'continue' && currentPendingAction) {
        // Continuar sin guardar - limpiar cambios y ejecutar acción
        setHasUnsavedChanges(false);
        
        // Ejecutar la acción pendiente
        if (currentPendingAction.execute) {
          currentPendingAction.execute();
        }
        
      } else if (action === 'save' && currentPendingAction) {
        // Guardar primero, luego continuar
        await handleSave();
        
        // Ejecutar la acción después de un breve delay
        setTimeout(() => {
          if (currentPendingAction.execute) {
            currentPendingAction.execute();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error en confirmUnsavedChanges:', error);
      showMessage('Error al procesar la acción', 'error');
    }
  };

  // Función para validar la clave (numérica y tamaño correcto)
  const validateKey = (key) => {
    // Verificar que sea solo números
    if (!/^\d+$/.test(key)) {
      return { isValid: false, message: 'La clave debe contener solo números' };
    }
    
    // Verificar tamaño exacto
    if (key.length !== keySize) {
      return { isValid: false, message: `La clave debe tener exactamente ${keySize} dígitos` };
    }
    
    return { isValid: true, message: '' };
  };

  // Función para agregar acción al historial
  const addToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    if (newHistory.length > 15) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Función para actualizar la visualización de la estructura
  const updateStructureVisualization = (array) => {
    const newStructure = Array(structureSize).fill(null).map((_, index) => ({
      position: index + 1,
      value: array[index] || null,
      isHighlighted: false
    }));
    setStructureData(newStructure);
  };

  const handleCreateStructure = () => {
    // Verificar cambios no guardados
    if (hasUnsavedChanges) {
      const confirm = window.confirm('¿Está seguro de crear una nueva estructura? Se perderán los cambios no guardados.');
      if (!confirm) return;
    }

    if (structureSize >= 10 && keySize >= 2) {
      setIsStructureCreated(true);
      const emptyArray = [];
      setMemoryArray(emptyArray);
      updateStructureVisualization(emptyArray);
      setHistory([]);
      setHistoryIndex(-1);
      setMessage({ text: '', type: '' });
      setHasUnsavedChanges(true);
      setCurrentFileName(null);
      showMessage(`Estructura creada con tamaño ${structureSize} y claves de ${keySize} caracteres`, 'success');
    }
  };

  const handleInsert = () => {
    if (!insertKey.trim() || !isStructureCreated) return;

    const key = insertKey.trim();
    
    // Formatear clave con ceros a la izquierda si es necesario
    const formattedKey = formatKey(key);
    
    // Validar clave (numérica y tamaño correcto)
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Verificar si la estructura está llena
    if (memoryArray.length >= structureSize) {
      showMessage('La estructura de memoria está llena', 'error');
      return;
    }

    // Verificar si la clave ya existe
    if (memoryArray.includes(formattedKey)) {
      showMessage('No se aceptan claves repetidas', 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = [...memoryArray];
    
    // Insertar y ordenar numéricamente
    const newArray = [...memoryArray, formattedKey].sort((a, b) => parseInt(a) - parseInt(b));
    setMemoryArray(newArray);
    updateStructureVisualization(newArray);
    
    // Agregar al historial
    addToHistory({
      type: 'insert',
      key: formattedKey,
      previousState: previousState,
      newState: newArray
    });

    showMessage(`Clave "${formattedKey}" insertada correctamente en la posición ${newArray.indexOf(formattedKey) + 1}`, 'success');
    setInsertKey('');
    markAsChanged();
  };

  const handleSearch = async () => {
    if (!searchKey.trim() || !isStructureCreated || isSimulating) return;

    const key = searchKey.trim();
    
    // Formatear clave con ceros a la izquierda si es necesario
    const formattedKey = formatKey(key);
    
    // Validar clave (numérica y tamaño correcto)
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    setIsSimulating(true);
    let steps = 0;
    let found = false;
    let position = -1;

    // Velocidades estándar (en ms): Muy Lento, Lento, Normal, Rápido, Muy Rápido
    const delays = [2000, 1500, 1000, 600, 300];
    const delay = delays[simulationSpeed - 1];

    // Simular búsqueda secuencial paso a paso
    for (let i = 0; i < memoryArray.length; i++) {
      steps++;
      
      // Destacar posición actual
      const highlightedStructure = structureData.map((item, index) => ({
        ...item,
        isHighlighted: index === i && item.value !== null
      }));
      setStructureData(highlightedStructure);

      // Pausa para visualización
      await new Promise(resolve => setTimeout(resolve, delay));

      if (memoryArray[i] === formattedKey) {
        found = true;
        position = i + 1;
        break;
      }
    }

    // Quitar destacado
    const finalStructure = structureData.map(item => ({
      ...item,
      isHighlighted: false
    }));
    setStructureData(finalStructure);

    // Mostrar resultado
    if (found) {
      showMessage(`Clave "${formattedKey}" encontrada en la posición ${position} después de ${steps} pasos`, 'success');
    } else {
      showMessage(`Clave "${formattedKey}" no se encuentra en la estructura después de ${steps} pasos`, 'error');
    }

    setIsSimulating(false);
  };

  const handleDelete = () => {
    if (!deleteKey.trim() || !isStructureCreated) return;

    const key = deleteKey.trim();
    
    // Formatear clave con ceros a la izquierda si es necesario
    const formattedKey = formatKey(key);
    
    // Validar clave (numérica y tamaño correcto)
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Verificar si la clave existe
    const keyIndex = memoryArray.indexOf(formattedKey);
    if (keyIndex === -1) {
      showMessage(`La clave "${formattedKey}" no se encuentra en la estructura`, 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = [...memoryArray];
    
    // Eliminar clave (el array se mantiene ordenado automáticamente)
    const newArray = memoryArray.filter(item => item !== formattedKey);
    setMemoryArray(newArray);
    updateStructureVisualization(newArray);
    
    // Agregar al historial
    addToHistory({
      type: 'delete',
      key: formattedKey,
      previousState: previousState,
      newState: newArray
    });

    showMessage(`Clave "${formattedKey}" eliminada correctamente`, 'success');
    setDeleteKey('');
    markAsChanged();
  };

  // Funciones de deshacer y rehacer
  // Funciones de deshacer y rehacer
  const getActionName = (type) => {
    const actionNames = {
      'insert': 'Inserción',
      'delete': 'Eliminación'
    };
    return actionNames[type] || type;
  };

  // Variables para deshabilitar botones undo/redo
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setMemoryArray(action.previousState);
      updateStructureVisualization(action.previousState);
      setHistoryIndex(historyIndex - 1);
      showMessage(`${getActionName(action.type)} deshecha`, 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      setMemoryArray(action.newState);
      updateStructureVisualization(action.newState);
      setHistoryIndex(historyIndex + 1);
      showMessage(`${getActionName(action.type)} rehecha`, 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // Función para renderizar la estructura optimizada
  const renderStructureTable = () => {
    if (!isStructureCreated || structureData.length === 0) {
      return null;
    }

    // Obtener todas las posiciones que necesitamos mostrar (primera, última, ocupadas, destacadas)
    const occupiedPositions = structureData
      .map((item, index) => ({ ...item, index }))
      .filter(item => item.value !== null);
    
    const highlightedPositions = structureData
      .map((item, index) => ({ ...item, index }))
      .filter(item => item.isHighlighted);
    
    // Crear lista de todas las posiciones a mostrar
    const positionsToShow = new Set();
    positionsToShow.add(0); // Primera posición
    if (structureData.length > 1) {
      positionsToShow.add(structureData.length - 1); // Última posición
    }
    
    // Agregar posiciones ocupadas
    occupiedPositions.forEach(item => positionsToShow.add(item.index));
    
    // Agregar posiciones destacadas
    highlightedPositions.forEach(item => positionsToShow.add(item.index));
    
    // Convertir a array ordenado
    const sortedPositions = Array.from(positionsToShow).sort((a, b) => a - b);
    
    return (
      <div className="structure-table" style={{
        border: '2px solid #7f8c8d',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div className="table-header">
          <span className="header-memory">Memoria</span>
        </div>
        
        <div className="table-body">
          {sortedPositions.map((currentIndex, arrayIndex) => {
            const item = structureData[currentIndex];
            const nextIndex = sortedPositions[arrayIndex + 1];
            const hasGap = nextIndex !== undefined && (nextIndex - currentIndex) > 1;
            
            return (
              <React.Fragment key={currentIndex}>
                {/* Fila actual */}
                <div className={`table-row ${item.isHighlighted ? 'highlighted' : ''}`}>
                  <span className="row-number">{item.position}</span>
                  <span className={`cell-memory ${!item.value ? 'empty' : ''}`}>
                    {item.value || '—'}
                  </span>
                </div>
                
                {/* Puntos suspensivos solo si hay un salto en las posiciones */}
                {hasGap && (
                  <div className="table-row ellipsis-row">
                    <span className="row-number">⋮</span>
                    <span className="cell-memory">⋮</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="sequential-search-section">
      <div className="section-header">
        <h1>Búsqueda Secuencial</h1>
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
              disabled
              title="Deshabilitado en búsqueda secuencial (no hay colisiones)"
            >
              <option value="secuencial">Secuencial</option>
              <option value="potencia2">Potencia 2</option>
              <option value="hashmod">Hash MOD</option>
              <option value="doble">Hash Doble</option>
              <option value="cuadratico">Sondeo Cuadrático</option>
            </select>
            <small style={{color: '#888', fontStyle: 'italic'}}>Deshabilitado en esta sección</small>
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

      {/* Sección de Archivo */}
      <div className="file-section">
        <div className="file-actions">
          <button 
            className={`action-btn ${hasUnsavedChanges ? 'unsaved-changes' : ''}`}
            onClick={handleSave}
            disabled={!isStructureCreated}
            title={hasUnsavedChanges ? "Hay cambios sin guardar" : "Guardar estructura"}
          >
            <Save size={18} />
            <span>Guardar{hasUnsavedChanges ? '*' : ''}</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleLoad}
            title="Cargar estructura desde archivo .sbf"
          >
            <FolderOpen size={18} />
            <span>Abrir</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <Undo size={18} />
            <span>Deshacer</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo size={18} />
            <span>Rehacer</span>
          </button>
        </div>
      </div>

      {/* Área de Mensajes Informativos */}
      {message.text && (
        <div className={`message-area ${message.type}`}>
          <p>{message.text}</p>
          <button 
            className="message-close-btn"
            onClick={() => setMessage({ text: '', type: '' })}
            title="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal de advertencia para cambios no guardados */}
      {showUnsavedWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Cambios no guardados</h3>
            <p>Hay cambios sin guardar que se perderán si continúa.</p>
            {pendingAction && (
              <p>Está intentando <strong>{pendingAction.description}</strong>.</p>
            )}
            <p>¿Qué desea hacer?</p>
            <div className="modal-buttons">
              <button 
                className="modal-btn cancel"
                onClick={() => confirmUnsavedChanges('cancel')}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn save"
                onClick={() => confirmUnsavedChanges('save')}
              >
                Guardar antes
              </button>
              <button 
                className="modal-btn continue"
                onClick={() => confirmUnsavedChanges('continue')}
              >
                Continuar sin guardar
              </button>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => handleNumericInput(e, setInsertKey)}
                placeholder={`Ej: ${'0'.repeat(keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated}
                maxLength={keySize}
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
                onChange={(e) => handleNumericInput(e, setSearchKey)}
                placeholder={`Ej: ${'1'.repeat(keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated || isSimulating}
                maxLength={keySize}
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
                onChange={(e) => handleNumericInput(e, setDeleteKey)}
                placeholder={`Ej: ${'2'.repeat(keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated}
                maxLength={keySize}
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
                <p><strong>Tipo de Clave:</strong> Numérica de {keySize} dígitos</p>
                <p><strong>Elementos:</strong> {memoryArray.length}/{structureSize}</p>
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