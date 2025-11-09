import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  FolderOpen, 
  Undo, 
  Redo, 
  Plus,
  Search,
  Trash2,
  Settings,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import '../styles/SequentialSearchSection.css';

function DinamicasCompletasSearchSection() {
  // ===== ESTADOS DE CONFIGURACIÓN =====
  const [buckets, setBuckets] = useState(2);
  const [records, setRecords] = useState(2);
  const [expansionThreshold] = useState(75);
  const [reductionThreshold] = useState(25);
  const [keySize, setKeySize] = useState(2);
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  const [currentStructureConfig, setCurrentStructureConfig] = useState({
    buckets: 2,
    records: 2,
    expansionThreshold: 75,
    reductionThreshold: 25,
    keySize: 2,
    initialBuckets: 2
  });
  
  // ===== ESTADOS DE OPERACIONES =====
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [insertKey, setInsertKey] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // ===== ESTADOS DE DATOS =====
  const [memoryMatrix, setMemoryMatrix] = useState([]);
  const [collisions, setCollisions] = useState({});
  const [insertionHistory, setInsertionHistory] = useState([]);
  const [currentBuckets, setCurrentBuckets] = useState(2);
  const [currentRecords, setCurrentRecords] = useState(2);
  
  // ===== ESTADOS DE VISUALIZACIÓN =====
  const [searchHighlights, setSearchHighlights] = useState({
    matrix: [],
    collisions: {}
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // ===== ESTADOS DE HISTORIAL =====
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // ===== ESTADOS DE ZOOM Y PAN =====
  const [visualZoom, setVisualZoom] = useState(1.0);
  const [visualPan, setVisualPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const visualContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // ===== CONTROL DE CAMBIOS NO GUARDADOS =====
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fileName, setFileName] = useState('');

  // ===== DELAYS PARA SIMULACIÓN =====
  const delays = [1200, 800, 500, 300, 150];

  // ===== FUNCIONES DE UTILIDAD =====
  
  // Función para manejar input numérico con padding
  const handleNumericInput = (e, setter) => {
    const value = e.target.value;
    // Solo permitir dígitos
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  // Función para formatear con padding de ceros
  const padKey = (key, size) => {
    return key.padStart(size, '0');
  };
  
  const hashFunction = (key, totalBuckets) => {
    const numKey = parseInt(key);
    if (isNaN(numKey)) return -1;
    return numKey % totalBuckets;
  };

  const calculateOccupancy = (matrix, collisionsData = collisions) => {
    let occupied = 0;
    // Contar elementos en la matriz
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== null && matrix[row][col] !== undefined && matrix[row][col] !== '') {
          occupied++;
        }
      }
    }
    // Sumar elementos en colisiones
    const collisionCount = Object.values(collisionsData).reduce((sum, arr) => sum + arr.length, 0);
    occupied += collisionCount;
    
    const totalCells = matrix.length * matrix[0].length;
    return (occupied / totalCells) * 100;
  };

  const validateKey = (key, size) => {
    if (!key || key.trim() === '') return false;
    const trimmed = key.trim();
    if (trimmed.length > size) return false;
    if (!/^\d+$/.test(trimmed)) return false;
    return true;
  };

  const checkKeyExists = (key) => {
    for (let row = 0; row < memoryMatrix.length; row++) {
      for (let col = 0; col < memoryMatrix[row].length; col++) {
        if (memoryMatrix[row][col] === key) {
          return true;
        }
      }
    }
    for (let bucketIndex in collisions) {
      if (collisions[bucketIndex].includes(key)) {
        return true;
      }
    }
    return false;
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  // ===== FUNCIONES DE GESTIÓN DE MATRIZ =====

  const handleCreateStructure = () => {
    // Verificar si hay una estructura previa y cambios no guardados
    if (isStructureCreated && hasUnsavedChanges) {
      const confirmCreate = window.confirm(
        'Ya existe una estructura con cambios no guardados. ¿Desea crear una nueva estructura? ' +
        'Se perderá todo el progreso no guardado.'
      );
      if (!confirmCreate) {
        return;
      }
    }
    
    if (buckets < 2 || records < 2) {
      showMessage('Las cubetas y registros deben ser al menos 2', 'error');
      return;
    }
    if (buckets % 2 !== 0) {
      showMessage('La cantidad de cubetas debe ser par', 'error');
      return;
    }
    if (expansionThreshold < 50 || expansionThreshold > 90) {
      showMessage('El umbral de expansión debe estar entre 50% y 90%', 'error');
      return;
    }
    if (reductionThreshold < 25) {
      showMessage('El umbral de reducción debe ser al menos 25%', 'error');
      return;
    }
    if ((expansionThreshold - reductionThreshold) < 15) {
      showMessage('La diferencia entre expansión y reducción debe ser al menos 15%', 'error');
      return;
    }
    
    const newMatrix = Array(records).fill(null).map(() => Array(buckets).fill(null));
    setMemoryMatrix(newMatrix);
    setCurrentBuckets(buckets);
    setCurrentRecords(records);
    setCollisions({});
    setInsertionHistory([]);
    setCurrentStructureConfig({
      buckets,
      records,
      expansionThreshold,
      reductionThreshold,
      keySize,
      initialBuckets: buckets
    });
    setIsStructureCreated(true);
    setHasUnsavedChanges(false);
    setHistory([]);
    setHistoryIndex(-1);
    showMessage('Estructura creada exitosamente', 'success');
  };

  const saveToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...action, timestamp: Date.now() });
    if (newHistory.length > 15) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const expandStructure = async (keys, delay) => {
    const newBuckets = currentBuckets * 2;
    await new Promise(resolve => setTimeout(resolve, delay * 0.3));
    
    const newMatrix = Array(currentRecords).fill(null).map(() => Array(newBuckets).fill(null));
    const newCollisions = {};
    
    // Reinsertar todas las claves una por una con la función hash actualizada (clave % newBuckets)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const bucketIndex = hashFunction(key, newBuckets); // Hash actualizado con nuevo número de cubetas
      
      let inserted = false;
      for (let row = 0; row < currentRecords; row++) {
        if (newMatrix[row][bucketIndex] === null) {
          newMatrix[row][bucketIndex] = key;
          inserted = true;
          setSearchHighlights({ matrix: [{ row, col: bucketIndex }], collisions: {} });
          break;
        }
      }
      if (!inserted) {
        if (!newCollisions[bucketIndex]) {
          newCollisions[bucketIndex] = [];
        }
        newCollisions[bucketIndex].push(key);
      }
      
      // Delay muy rápido para visualizar la reinserción
      await new Promise(resolve => setTimeout(resolve, Math.min(delay * 0.15, 100)));
    }
    
    setMemoryMatrix(newMatrix);
    setCurrentBuckets(newBuckets);
    setCollisions(newCollisions);
    setSearchHighlights({ matrix: [], collisions: {} });
    const occupancy = calculateOccupancy(newMatrix, newCollisions);
    showMessage(`Expansión completada: ${currentBuckets / 2} → ${newBuckets} cubetas. Nueva densidad: ${occupancy.toFixed(2)}%`, 'success');
    await new Promise(resolve => setTimeout(resolve, delay * 0.3));
  };

  const reduceStructure = async (keys, delay) => {
    const newBuckets = currentBuckets / 2;
    if (newBuckets < currentStructureConfig.initialBuckets) {
      showMessage('No se puede reducir por debajo del tamaño inicial', 'warning');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay * 0.3));
    
    const newMatrix = Array(currentRecords).fill(null).map(() => Array(newBuckets).fill(null));
    const newCollisions = {};
    
    // Reinsertar todas las claves una por una con la función hash actualizada (clave % newBuckets)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const bucketIndex = hashFunction(key, newBuckets); // Hash actualizado con nuevo número de cubetas
      
      let inserted = false;
      for (let row = 0; row < currentRecords; row++) {
        if (newMatrix[row][bucketIndex] === null) {
          newMatrix[row][bucketIndex] = key;
          inserted = true;
          setSearchHighlights({ matrix: [{ row, col: bucketIndex }], collisions: {} });
          break;
        }
      }
      if (!inserted) {
        if (!newCollisions[bucketIndex]) {
          newCollisions[bucketIndex] = [];
        }
        newCollisions[bucketIndex].push(key);
      }
      
      // Delay muy rápido para visualizar la reinserción
      await new Promise(resolve => setTimeout(resolve, Math.min(delay * 0.15, 100)));
    }
    
    setMemoryMatrix(newMatrix);
    setCurrentBuckets(newBuckets);
    setCollisions(newCollisions);
    setSearchHighlights({ matrix: [], collisions: {} });
    const occupancy = calculateOccupancy(newMatrix, newCollisions);
    showMessage(`Reducción completada: ${currentBuckets * 2} → ${newBuckets} cubetas. Nueva densidad: ${occupancy.toFixed(2)}%`, 'success');
    await new Promise(resolve => setTimeout(resolve, delay * 0.3));
  };

  const handleInsert = async () => {
    if (!isStructureCreated) {
      showMessage('Debe crear la estructura primero', 'error');
      return;
    }
    if (isSimulating) {
      showMessage('Ya hay una simulación en curso', 'warning');
      return;
    }
    if (!validateKey(insertKey, currentStructureConfig.keySize)) {
      showMessage(`La clave debe tener hasta ${currentStructureConfig.keySize} dígitos`, 'error');
      return;
    }
    
    const key = padKey(insertKey.trim(), currentStructureConfig.keySize);
    if (checkKeyExists(key)) {
      showMessage('La clave ya existe en la estructura', 'error');
      return;
    }
    
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      const bucketIndex = hashFunction(key, currentBuckets);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let inserted = false;
      let insertionRow = -1;
      const newMatrix = memoryMatrix.map(row => [...row]);
      
      for (let row = 0; row < currentRecords; row++) {
        if (newMatrix[row][bucketIndex] === null || newMatrix[row][bucketIndex] === '') {
          newMatrix[row][bucketIndex] = key;
          inserted = true;
          insertionRow = row;
          setSearchHighlights({ matrix: [{ row, col: bucketIndex }], collisions: {} });
          await new Promise(resolve => setTimeout(resolve, delay));
          break;
        }
      }
      
      const newCollisions = { ...collisions };
      if (!inserted) {
        if (!newCollisions[bucketIndex]) {
          newCollisions[bucketIndex] = [];
        }
        newCollisions[bucketIndex].push(key);
        setCollisions(newCollisions);
      }
      
      const newHistory = [...insertionHistory, key];
      setInsertionHistory(newHistory);
      setMemoryMatrix(newMatrix);
      
      saveToHistory({
        type: 'insert',
        key,
        matrix: newMatrix,
        collisions: newCollisions,
        insertionHistory: newHistory,
        buckets: currentBuckets,
        records: currentRecords
      });
      
      const occupancy = calculateOccupancy(newMatrix, newCollisions);
      
      // Verificar si hay expansión
      if (occupancy >= currentStructureConfig.expansionThreshold) {
        showMessage(`Clave ${key} insertada. Densidad ${occupancy.toFixed(2)}% ≥ ${currentStructureConfig.expansionThreshold}%. Expandiendo estructura...`, 'warning');
        await new Promise(resolve => setTimeout(resolve, delay));
        await expandStructure(newHistory, delay);
      } else {
        // Mensaje único según el resultado
        if (inserted) {
          showMessage(`Clave ${key} insertada en cubeta ${bucketIndex}, registro ${insertionRow + 1}. Densidad: ${occupancy.toFixed(2)}%`, 'success');
        } else {
          showMessage(`Clave ${key} insertada en colisión de cubeta ${bucketIndex}. Densidad: ${occupancy.toFixed(2)}%`, 'warning');
        }
      }
      
      setInsertKey('');
      setSearchHighlights({ matrix: [], collisions: {} });
      setHasUnsavedChanges(true);
    } catch (error) {
      showMessage('Error durante la inserción', 'error');
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSearch = async () => {
    if (!isStructureCreated) {
      showMessage('Debe crear la estructura primero', 'error');
      return;
    }
    if (isSimulating) {
      showMessage('Ya hay una simulación en curso', 'warning');
      return;
    }
    if (!validateKey(searchKey, currentStructureConfig.keySize)) {
      showMessage(`La clave debe tener hasta ${currentStructureConfig.keySize} dígitos`, 'error');
      return;
    }
    
    const key = padKey(searchKey.trim(), currentStructureConfig.keySize);
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      const bucketIndex = hashFunction(key, currentBuckets);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let found = false;
      let foundRow = -1;
      const highlights = { matrix: [], collisions: {} };
      
      for (let row = 0; row < currentRecords; row++) {
        highlights.matrix.push({ row, col: bucketIndex });
        setSearchHighlights(highlights);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (memoryMatrix[row][bucketIndex] === key) {
          found = true;
          foundRow = row;
          break;
        }
      }
      
      if (!found && collisions[bucketIndex]?.includes(key)) {
        highlights.collisions[bucketIndex] = collisions[bucketIndex].map((k, idx) => k === key ? idx : -1).filter(i => i >= 0);
        setSearchHighlights(highlights);
        showMessage(`Clave ${key} encontrada en colisión de cubeta ${bucketIndex}`, 'success');
        found = true;
      } else if (found) {
        showMessage(`Clave ${key} encontrada en cubeta ${bucketIndex}, registro ${foundRow + 1}`, 'success');
      } else {
        showMessage(`Clave ${key} no encontrada`, 'error');
      }
      
      setSearchKey('');
    } catch (error) {
      showMessage('Error durante la búsqueda', 'error');
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDelete = async () => {
    if (!isStructureCreated) {
      showMessage('Debe crear la estructura primero', 'error');
      return;
    }
    if (isSimulating) {
      showMessage('Ya hay una simulación en curso', 'warning');
      return;
    }
    if (!validateKey(deleteKey, currentStructureConfig.keySize)) {
      showMessage(`La clave debe tener hasta ${currentStructureConfig.keySize} dígitos`, 'error');
      return;
    }
    
    const key = padKey(deleteKey.trim(), currentStructureConfig.keySize);
    if (!checkKeyExists(key)) {
      showMessage('La clave no existe en la estructura', 'error');
      return;
    }
    
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      const bucketIndex = hashFunction(key, currentBuckets);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let deleted = false;
      let deletedRow = -1;
      let wasCollision = false;
      const newMatrix = memoryMatrix.map(row => [...row]);
      
      for (let row = 0; row < currentRecords; row++) {
        setSearchHighlights({ matrix: [{ row, col: bucketIndex }], collisions: {} });
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (newMatrix[row][bucketIndex] === key) {
          newMatrix[row][bucketIndex] = null;
          deleted = true;
          deletedRow = row;
          break;
        }
      }
      
      const newCollisions = { ...collisions };
      if (!deleted && newCollisions[bucketIndex]) {
        const collisionIndex = newCollisions[bucketIndex].indexOf(key);
        if (collisionIndex !== -1) {
          newCollisions[bucketIndex].splice(collisionIndex, 1);
          if (newCollisions[bucketIndex].length === 0) {
            delete newCollisions[bucketIndex];
          }
          deleted = true;
          wasCollision = true;
        }
      }
      
      if (!deleted) {
        showMessage(`Clave ${key} no encontrada`, 'error');
      } else {
        const newHistory = insertionHistory.filter(k => k !== key);
        setInsertionHistory(newHistory);
        setMemoryMatrix(newMatrix);
        setCollisions(newCollisions);
        
        saveToHistory({
          type: 'delete',
          key,
          matrix: newMatrix,
          collisions: newCollisions,
          insertionHistory: newHistory,
          buckets: currentBuckets,
          records: currentRecords
        });
        
        const occupancy = calculateOccupancy(newMatrix, newCollisions);
        
        // Verificar si hay reducción
        if (occupancy <= currentStructureConfig.reductionThreshold && currentBuckets > currentStructureConfig.initialBuckets) {
          showMessage(`Clave ${key} eliminada. Densidad ${occupancy.toFixed(2)}% ≤ ${currentStructureConfig.reductionThreshold}%. Reduciendo estructura...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, delay));
          await reduceStructure(newHistory, delay);
        } else {
          // Mensaje único según el resultado
          if (wasCollision) {
            showMessage(`Clave ${key} eliminada de colisión de cubeta ${bucketIndex}. Densidad: ${occupancy.toFixed(2)}%`, 'success');
          } else {
            showMessage(`Clave ${key} eliminada de cubeta ${bucketIndex}, registro ${deletedRow + 1}. Densidad: ${occupancy.toFixed(2)}%`, 'success');
          }
        }
        
        setDeleteKey('');
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      showMessage('Error durante la eliminación', 'error');
      console.error(error);
    } finally {
      setIsSimulating(false);
      setSearchHighlights({ matrix: [], collisions: {} });
    }
  };

  // Variables para deshabilitar botones undo/redo
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex < 0) {
      showMessage('No hay acciones para deshacer', 'warning');
      return;
    }
    const previousState = history[historyIndex - 1];
    if (previousState) {
      setMemoryMatrix(previousState.matrix);
      setCollisions(previousState.collisions);
      setInsertionHistory(previousState.insertionHistory);
      setCurrentBuckets(previousState.buckets);
      setCurrentRecords(previousState.records);
      setHistoryIndex(historyIndex - 1);
      showMessage('Acción deshecha', 'info');
    } else {
      const newMatrix = Array(currentStructureConfig.records).fill(null).map(() => Array(currentStructureConfig.buckets).fill(null));
      setMemoryMatrix(newMatrix);
      setCollisions({});
      setInsertionHistory([]);
      setCurrentBuckets(currentStructureConfig.buckets);
      setCurrentRecords(currentStructureConfig.records);
      setHistoryIndex(-1);
      showMessage('Estructura restaurada al estado inicial', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) {
      showMessage('No hay acciones para rehacer', 'warning');
      return;
    }
    const nextState = history[historyIndex + 1];
    setMemoryMatrix(nextState.matrix);
    setCollisions(nextState.collisions);
    setInsertionHistory(nextState.insertionHistory);
    setCurrentBuckets(nextState.buckets);
    setCurrentRecords(nextState.records);
    setHistoryIndex(historyIndex + 1);
    showMessage('Acción rehecha', 'info');
  };

  const handleSave = async () => {
    if (!isStructureCreated) {
      showMessage('No hay estructura para guardar', 'error');
      return;
    }
    try {
      const dataToSave = {
        config: currentStructureConfig,
        matrix: memoryMatrix,
        collisions,
        insertionHistory,
        currentBuckets,
        currentRecords,
        version: '1.0'
      };
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName || 'dinamicas_completas.dcf',
        types: [{ description: 'Dinámicas Completas File', accept: { 'application/json': ['.dcf'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      setFileName(handle.name);
      setHasUnsavedChanges(false);
      showMessage('Estructura guardada exitosamente', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        showMessage('Error al guardar el archivo', 'error');
        console.error(error);
      }
    }
  };

  const loadFromData = (data) => {
    if (!data.config || !data.matrix) {
      showMessage('Formato de archivo inválido', 'error');
      return;
    }
    setCurrentStructureConfig(data.config);
    setMemoryMatrix(data.matrix);
    setCollisions(data.collisions || {});
    setInsertionHistory(data.insertionHistory || []);
    setCurrentBuckets(data.currentBuckets || data.config.buckets);
    setCurrentRecords(data.currentRecords || data.config.records);
    setIsStructureCreated(true);
    setFileName(data.fileName || 'archivo.dcf');
    setHasUnsavedChanges(false);
    setHistory([]);
    setHistoryIndex(-1);
    showMessage('Estructura cargada exitosamente', 'success');
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleVisualMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - visualPan.x, y: e.clientY - visualPan.y });
    }
  };

  const handleVisualMouseMove = (e) => {
    if (isDragging) {
      setVisualPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleVisualMouseUp = () => {
    setIsDragging(false);
  };

  const handleVisualMouseLeave = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setVisualZoom(1.0);
    setVisualPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const checkUnsavedChanges = (targetSection, callback) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm('Hay cambios no guardados. ¿Desea salir sin guardar?');
        if (confirmLeave) {
          setHasUnsavedChanges(false);
          callback();
        }
      } else {
        callback();
      }
    };
    window.dinamicasCompletasCheckUnsavedChanges = checkUnsavedChanges;
    return () => {
      delete window.dinamicasCompletasCheckUnsavedChanges;
    };
  }, [hasUnsavedChanges]);

  return (
    <div className="hash-container">
      <div className="section-header">
        <h1>Expansiones Dinámicas Completas</h1>
      </div>

      {/* Sección de Configuración */}
      <div className="configuration-section">
        <h2>
          <Settings size={20} />
          Configuración de la Estructura
        </h2>
        <div className="config-controls">
          <div className="config-group">
            <label htmlFor="buckets">Cubetas Iniciales</label>
            <input
              id="buckets"
              type="number"
              min="2"
              step="2"
              value={buckets}
              onChange={(e) => setBuckets(Math.max(2, parseInt(e.target.value) || 2))}
              className="config-input"
            />
            <small>Mínimo: 2 (debe ser par)</small>
          </div>

          <div className="config-group">
            <label htmlFor="records">Registros por Cubeta</label>
            <input
              id="records"
              type="number"
              min="2"
              value={records}
              onChange={(e) => setRecords(Math.max(2, parseInt(e.target.value) || 2))}
              className="config-input"
            />
            <small>Mínimo: 2</small>
          </div>

          <div className="config-group">
            <label htmlFor="keySize">Tamaño de Clave</label>
            <input
              id="keySize"
              type="number"
              min="2"
              max="8"
              value={keySize}
              onChange={(e) => setKeySize(Math.min(8, Math.max(2, parseInt(e.target.value) || 2)))}
              className="config-input"
            />
            <small>Dígitos de la clave (2-8)</small>
          </div>

          <div className="config-group">
            <label htmlFor="expansionThreshold">Umbral de Expansión (%)</label>
            <input
              id="expansionThreshold"
              type="number"
              min="50"
              max="90"
              value={expansionThreshold}
              disabled
              className="config-input config-input-small"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <small>Duplicar cubetas (Fijo: 75%)</small>
          </div>

          <div className="config-group">
            <label htmlFor="reductionThreshold">Umbral de Reducción (%)</label>
            <input
              id="reductionThreshold"
              type="number"
              min="25"
              max="50"
              value={reductionThreshold}
              disabled
              className="config-input config-input-small"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <small>Reducir cubetas (Fijo: 25%)</small>
          </div>

          <div className="button-container">
            <button 
              className="create-structure-btn"
              onClick={handleCreateStructure}
              disabled={buckets < 2 || records < 2}
            >
              {isStructureCreated ? 'Crear Nueva Estructura' : 'Crear Estructura'}
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
            title="Cargar estructura desde archivo .dcf"
          >
            <FolderOpen size={18} />
            <span>Abrir</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Deshacer última acción"
          >
            <Undo size={18} />
            <span>Deshacer</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Rehacer acción deshecha"
          >
            <Redo size={18} />
            <span>Rehacer</span>
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const data = JSON.parse(event.target?.result);
                  loadFromData(data);
                } catch {
                  setMessage({ type: 'error', text: 'Error al cargar el archivo' });
                }
              };
              reader.readAsText(file);
            }
          }}
          accept=".dcf"
          style={{ display: 'none' }}
        />
      </div>

      {message && message.text && (
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
                disabled={!isStructureCreated || isSimulating}
              />
              <span className="speed-label">
                {simulationSpeed === 1 ? 'Muy Lenta' : 
                 simulationSpeed === 2 ? 'Lenta' : 
                 simulationSpeed === 3 ? 'Normal' : 
                 simulationSpeed === 4 ? 'Rápida' : 'Muy Rápida'}
              </span>
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
                placeholder={`Ej: ${'0'.repeat(currentStructureConfig.keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated || isSimulating}
                maxLength={currentStructureConfig.keySize}
              />
              <button 
                onClick={handleInsert}
                className="operation-btn insert-btn"
                disabled={!isStructureCreated || !insertKey.trim() || isSimulating}
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
                placeholder={`Ej: ${'1'.repeat(currentStructureConfig.keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated || isSimulating}
                maxLength={currentStructureConfig.keySize}
              />
              <button 
                onClick={handleSearch}
                className="operation-btn search-btn"
                disabled={!isStructureCreated || !searchKey.trim() || isSimulating}
              >
                <Search size={16} />
                Buscar
              </button>
            </div>
          </div>

          {/* Eliminar Clave */}
          <div className="control-group">
            <label>Eliminar Clave</label>
            <div className="input-with-button">
              <input
                type="text"
                value={deleteKey}
                onChange={(e) => handleNumericInput(e, setDeleteKey)}
                placeholder={`Ej: ${'2'.repeat(currentStructureConfig.keySize)}`}
                className="operation-input"
                disabled={!isStructureCreated || isSimulating}
                maxLength={currentStructureConfig.keySize}
              />
              <button 
                onClick={handleDelete}
                className="operation-btn delete-btn"
                disabled={!isStructureCreated || !deleteKey.trim() || isSimulating}
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
                <p><strong>Estructura:</strong> Matriz {currentBuckets} cubetas × {currentRecords} registros</p>
                <p><strong>Función Hash:</strong> MOD (clave % {currentBuckets})</p>
                <p><strong>Tamaño de Clave:</strong> {currentStructureConfig.keySize} dígitos</p>
                <p><strong>Elementos:</strong> {insertionHistory.length}/{currentBuckets * currentRecords}</p>
                <p><strong>Densidad:</strong> {calculateOccupancy(memoryMatrix, collisions).toFixed(2)}%</p>
                <p><strong>Colisiones:</strong> {Object.values(collisions).reduce((sum, arr) => sum + arr.length, 0)} claves</p>
              </div>
              
              {/* Instrucciones de uso y Controles de vista */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                {/* Instrucciones a la izquierda */}
                <div className="tree-instructions">
                  <p style={{ margin: 0 }}><strong>Arrastrar:</strong> Click y mantén para mover la vista | <strong>Zoom:</strong> Control de zoom en la ventana</p>
                </div>
                
                {/* Controles a la derecha */}
                <div className="tree-controls" style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center'
                }}>
                  <button 
                    className="tree-control-btn"
                    onClick={handleResetView}
                    title="Restablecer zoom y posición"
                  >
                    Resetear Vista
                  </button>
                  <input
                    type="number"
                    className="zoom-input"
                    value={Math.round(visualZoom * 100)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 100;
                      const clampedValue = Math.max(30, Math.min(200, value));
                      setVisualZoom(clampedValue / 100);
                    }}
                    min="30"
                    max="200"
                    step="10"
                  />
                  <span className="zoom-label">%</span>
                </div>
              </div>
              
              {/* Visualización de la estructura de datos con sistema de arrastre mejorado */}
              <div 
                  ref={visualContainerRef}
                  className="data-structure-view"
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    overflow: 'auto',
                    position: 'relative',
                    height: '500px',
                    minHeight: '500px',
                    maxHeight: '500px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc'
                  }}
                  onMouseDown={handleVisualMouseDown}
                  onMouseMove={handleVisualMouseMove}
                  onMouseUp={handleVisualMouseUp}
                  onMouseLeave={handleVisualMouseLeave}
                >
                  <div 
                    style={{
                      transform: `translate(${visualPan.x}px, ${visualPan.y}px) scale(${visualZoom})`,
                      transformOrigin: '0 0',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      alignItems: 'flex-start',
                      padding: '20px',
                      minWidth: 'max-content',
                      userSelect: 'none',
                      willChange: 'transform'
                    }}
                  >
                    {/* Tabla de Matriz */}
                    <div className="structure-table" style={{
                      border: '2px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'auto',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      maxWidth: '100%',
                      backgroundColor: 'white'
                    }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        textAlign: 'center'
                      }}>Memoria</div>
                      
                      <div className="table-body" style={{
                        overflowX: 'auto',
                        minWidth: '100%'
                      }}>
                        <div className="table-row header-row" style={{
                          display: 'grid',
                          gridTemplateColumns: `50px repeat(${currentBuckets}, 90px)`,
                          gap: '0',
                          backgroundColor: '#f1f5f9',
                          borderBottom: '2px solid #cbd5e1',
                          minWidth: 'max-content'
                        }}>
                          <div style={{
                            padding: '10px 8px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            borderRight: '2px solid #cbd5e1',
                            textAlign: 'center',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}></div>
                          {Array.from({ length: currentBuckets }, (_, i) => (
                            <div key={i} style={{
                              padding: '10px 8px',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              textAlign: 'center',
                              borderRight: i < currentBuckets - 1 ? '1px solid #e2e8f0' : 'none',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {i}
                            </div>
                          ))}
                        </div>
                        
                        {memoryMatrix.map((row, rowIndex) => (
                          <div 
                            key={rowIndex} 
                            className="table-row"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `50px repeat(${currentBuckets}, 90px)`,
                              gap: '0',
                              borderBottom: rowIndex < memoryMatrix.length - 1 ? '1px solid #e2e8f0' : 'none',
                              backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9fafb',
                              minWidth: 'max-content'
                            }}
                          >
                            <div style={{
                              padding: '10px 8px',
                              fontWeight: '700',
                              color: '#64748b',
                              backgroundColor: '#f8fafc',
                              borderRight: '2px solid #cbd5e1',
                              textAlign: 'center',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {rowIndex + 1}
                            </div>
                            {row.map((cell, colIndex) => {
                              const isHighlighted = searchHighlights.matrix.some(
                                h => h.row === rowIndex && h.col === colIndex
                              );
                              return (
                                <div
                                  key={colIndex}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRight: colIndex < currentBuckets - 1 ? '1px solid #e2e8f0' : 'none',
                                    padding: '0',
                                    minHeight: '38px',
                                    position: 'relative'
                                  }}
                                >
                                  <div
                                    className={`cell-memory ${!cell ? 'empty' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                    style={{
                                      width: '85%',
                                      padding: '6px 4px',
                                      textAlign: 'center',
                                      fontFamily: "'Courier New', monospace",
                                      fontSize: '0.95rem',
                                      fontWeight: '600',
                                      backgroundColor: isHighlighted ? '#3b82f6' : (cell ? '#dbeafe' : 'transparent'),
                                      color: isHighlighted ? 'white' : (cell ? '#1e40af' : '#94a3b8'),
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      letterSpacing: '0.3px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'visible',
                                      borderRadius: '4px',
                                      minHeight: '30px',
                                      boxSizing: 'border-box',
                                      margin: '0 auto'
                                    }}
                                  >
                                    {cell || '—'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colisiones */}
                    {Object.keys(collisions).length > 0 && (
                      <div style={{ width: '100%' }}>
                        <h4 style={{
                          color: '#dc2626',
                          fontSize: '1rem',
                          fontWeight: '600',
                          marginBottom: '12px',
                          borderBottom: '2px solid #dc2626',
                          paddingBottom: '8px'
                        }}>Colisiones</h4>
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          {Array.from({ length: currentBuckets }, (_, i) => {
                            if (!collisions[i] || collisions[i].length === 0) return null;
                            return (
                              <div key={i} style={{
                                border: '2px dashed #dc2626',
                                borderRadius: '8px',
                                padding: '12px',
                                backgroundColor: '#fef2f2',
                                minWidth: '150px'
                              }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#991b1b',
                                  marginBottom: '8px',
                                  fontSize: '0.9rem'
                                }}>Cubeta {i}</div>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}>
                                  {collisions[i].map((key, keyIndex) => {
                                    const isHighlighted = 
                                      searchHighlights.collisions[i] &&
                                      searchHighlights.collisions[i].includes(keyIndex);
                                    return (
                                      <div
                                        key={keyIndex}
                                        style={{
                                          padding: '6px 12px',
                                          backgroundColor: isHighlighted ? '#fbbf24' : '#fee2e2',
                                          color: isHighlighted ? 'white' : '#991b1b',
                                          borderRadius: '4px',
                                          fontFamily: "'Courier New', monospace",
                                          fontSize: '0.85rem',
                                          fontWeight: isHighlighted ? '600' : '500',
                                          textAlign: 'center',
                                          transition: 'all 0.3s ease',
                                          border: isHighlighted ? '2px solid #f59e0b' : 'none'
                                        }}
                                      >
                                        {key}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DinamicasCompletasSearchSection;
