/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from 'react';
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

function IndicesSearchSection({ onNavigate }) {
  // ===== ESTADOS DE CONFIGURACIÓN =====
  const [indexType, setIndexType] = useState('primario');
  const [recordCount, setRecordCount] = useState(100);
  const [blockSize, setBlockSize] = useState(512);
  const [recordLength, setRecordLength] = useState(64);
  const [indexRecordSize, setIndexRecordSize] = useState(16);
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  const [currentStructureConfig, setCurrentStructureConfig] = useState({
    indexType: 'primario',
    recordCount: 100,
    blockSize: 512,
    recordLength: 64,
    indexRecordSize: 16,
    indexCount: 0,
    indexRecordsPerBlock: 0,
    indexBlockCount: 0
  });
  
  // ===== ESTADOS DE OPERACIONES =====
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [insertKey, setInsertKey] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // ===== ESTADOS DE DATOS =====
  const [memoryMatrix, setMemoryMatrix] = useState([]);
  const [indexStructure, setIndexStructure] = useState([]); // Estructura de índices (nivel 1)
  const [multilevelIndexStructure, setMultilevelIndexStructure] = useState([]); // Estructura de índices multinivel (nivel 2)
  const [collisions, setCollisions] = useState({});
  const [insertionHistory, setInsertionHistory] = useState([]);
  
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
  
  // ===== CONTROL DE CAMBIOS NO GUARDADOS =====
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ===== DELAYS PARA SIMULACIÓN =====
  const delays = [1200, 800, 500, 300, 150];

  // ===== FUNCIONES DE UTILIDAD =====
  
  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  // ===== FUNCIONES DE GESTIÓN DE MATRIZ =====

  const handleCreateStructure = () => {
    // Función que ejecuta la creación real
    const executeCreate = () => {
      // Validaciones
      if (recordCount < 100) {
        showMessage('La cantidad de registros debe ser al menos 100', 'error');
        return;
      }
      if (recordCount % 10 !== 0) {
        showMessage('La cantidad de registros debe ser múltiplo de 10', 'error');
        return;
      }
      if (blockSize < 128) {
        showMessage('El tamaño de bloque debe ser de al menos 128 bytes', 'error');
        return;
      }

      if (recordLength < 32) {
        showMessage('La longitud del registro debe ser de al menos 32 bytes', 'error');
        return;
      }

      if (indexRecordSize < 8) {
        showMessage('El tamaño de registro índice debe ser de al menos 8 bytes', 'error');
        return;
      }
      
      if (recordLength > blockSize) {
        showMessage('La longitud del registro no puede ser mayor que el tamaño del bloque', 'error');
        return;
      }
      
      // Calcular registros por bloque (bfr = tamaño de bloque / longitud de registro, redondeado hacia abajo)
      const bfr = Math.floor(blockSize / recordLength); // bfr = registros por bloque
      // Calcular cuántos bloques se necesitan (cantidad de registros / registros por bloque, redondeado hacia arriba)
      const totalBlocks = Math.ceil(recordCount / bfr);
      const recordsPerBlock = bfr;
      
      // Calcular registros de índice por bloque PRIMERO
      const indexRecordsPerBlock = Math.floor(blockSize / indexRecordSize); // registros de índice por bloque
      
      // Calcular estructura de índices
      let indexCount;
      if (indexType === 'primario') {
        indexCount = totalBlocks; // Para índices primarios: cantidad de índices = cantidad de bloques
      } else {
        // Para índices secundarios: cantidad de índices = cantidad de registros
        indexCount = recordCount;
      }
      const indexBlockCount = Math.ceil(indexCount / indexRecordsPerBlock); // bloques de índices
      
      // Calcular índices multinivel (nivel 2) - solo para multinivel
      let multilevelIndexCount = 0;
      let multilevelIndexBlockCount = 0;
      let multilevelIndexArray = [];
      
      if (indexType === 'multinivel') {
        // Para multinivel: cantidad de índices nivel 2 = cantidad de bloques de índices secundarios
        multilevelIndexCount = indexBlockCount;
        // Bloques de índices nivel 2
        multilevelIndexBlockCount = Math.ceil(multilevelIndexCount / indexRecordsPerBlock);
        
        // Generar índices nivel 2: cada uno contiene el NÚMERO (valor) del primer índice de cada bloque en nivel 1
        // El valor es el mismo número del primer índice del bloque al que apunta
        // No están en orden y no se repiten
        const blockFirstIndices = Array.from({ length: indexBlockCount }, (_, i) => {
          return (i * indexRecordsPerBlock) + 1; // Número del primer índice de cada bloque
        });
        // Desordenar los valores
        for (let i = blockFirstIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [blockFirstIndices[i], blockFirstIndices[j]] = [blockFirstIndices[j], blockFirstIndices[i]];
        }
        multilevelIndexArray = blockFirstIndices; // Guardar como números directamente
      }
      
      // Crear estructura de índices (array simple numerado)
      let indexArray;
      if (indexType === 'primario') {
        // Primarios: secuencial del 1 al indexCount
        indexArray = Array.from({ length: indexCount }, (_, i) => (i + 1).toString());
      } else if (indexType === 'secundario' || indexType === 'multinivel') {
        // Secundarios y multinivel: apuntadores aleatorios a bloques (pueden repetirse)
        indexArray = Array.from({ length: indexCount }, () => {
          const randomBlock = Math.floor(Math.random() * totalBlocks) + 1;
          return randomBlock.toString();
        });
      }
      
      // Crear estructura de índice basada en bloques (matriz: filas=bloques, columnas=registros por bloque)
      const indexStructure = [];
      for (let i = 0; i < totalBlocks; i++) {
        const blockStart = i * recordsPerBlock;
        const blockEnd = Math.min((i + 1) * recordsPerBlock, recordCount);
        // Inicializar array de registros con la capacidad exacta (registros por bloque)
        const records = new Array(recordsPerBlock).fill(null);
        indexStructure.push({
          blockNumber: i,
          startRecord: blockStart,
          endRecord: blockEnd - 1,
          records: records,
          isFull: false
        });
      }
      
      setMemoryMatrix(indexStructure);
      setCollisions({});
      setInsertionHistory([]);
      setCurrentStructureConfig({
        indexType,
        recordCount,
        blockSize,
        recordLength,
        indexRecordSize,
        recordsPerBlock,
        totalBlocks,
        indexCount,
        indexRecordsPerBlock,
        indexBlockCount,
        multilevelIndexCount,
        multilevelIndexBlockCount
      });
      setIndexStructure(indexArray);
      setMultilevelIndexStructure(multilevelIndexArray);
      setIsStructureCreated(true);
      setHasUnsavedChanges(true);
      setHistory([]);
      setHistoryIndex(-1);
      setFileName('');
      showMessage(`Estructura de índice ${indexType} creada: ${totalBlocks} bloques de datos, ${indexBlockCount} bloques de índices`, 'success');
    };

    // Verificar si hay una estructura previa y cambios no guardados
    if (isStructureCreated && hasUnsavedChanges) {
      setPendingAction({ execute: executeCreate, description: 'crear nueva estructura' });
      setShowUnsavedWarning(true);
      return;
    }

    // Ejecutar directamente si no hay cambios
    executeCreate();
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

  const handleInsert = async () => {
    if (!isStructureCreated) {
      showMessage('Debe crear la estructura primero', 'error');
      return;
    }
    if (isSimulating) {
      showMessage('Ya hay una simulación en curso', 'warning');
      return;
    }
    if (!insertKey || insertKey.trim() === '') {
      showMessage('Debe ingresar una clave', 'error');
      return;
    }
    
    const key = insertKey.trim();
    
    // Verificar si la clave ya existe (buscar en todas las posiciones no-null)
    let keyExists = false;
    for (const block of memoryMatrix) {
      if (block.records && block.records.some(r => r === key)) {
        keyExists = true;
        break;
      }
    }
    
    if (keyExists) {
      showMessage('La clave ya existe en la estructura', 'error');
      return;
    }
    
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      const newMatrix = memoryMatrix.map(block => ({
        ...block,
        records: [...block.records]
      }));
      let inserted = false;
      let targetBlockIndex = -1;
      let targetColumnIndex = -1;
      
      // Buscar un bloque con espacio disponible (primera celda null)
      for (let i = 0; i < newMatrix.length; i++) {
        const block = newMatrix[i];
        
        // Buscar primera posición null en el array de registros
        for (let j = 0; j < block.records.length; j++) {
          if (block.records[j] === null) {
            block.records[j] = key;
            inserted = true;
            targetBlockIndex = i;
            targetColumnIndex = j;
            break;
          }
        }
        
        if (inserted) break;
      }
      
      if (!inserted) {
        showMessage('No hay espacio disponible en la estructura', 'error');
        setIsSimulating(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const newHistory = [...insertionHistory, key];
      setInsertionHistory(newHistory);
      setMemoryMatrix(newMatrix);
      
      saveToHistory({
        type: 'insert',
        key,
        matrix: newMatrix,
        insertionHistory: newHistory
      });
      
      showMessage(`Clave "${key}" insertada en bloque ${targetBlockIndex + 1}, registro ${targetColumnIndex + 1}`, 'success');
      setInsertKey('');
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
    if (!searchKey || searchKey.trim() === '') {
      showMessage('Debe ingresar una clave a buscar', 'error');
      return;
    }
    
    const key = searchKey.trim();
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      let found = false;
      let foundBlockIndex = -1;
      let foundColumnIndex = -1;
      
      // Buscar la clave en todos los bloques
      for (let i = 0; i < memoryMatrix.length; i++) {
        await new Promise(resolve => setTimeout(resolve, delay * 0.5));
        const block = memoryMatrix[i];
        
        if (block.records) {
          const columnIndex = block.records.indexOf(key);
          if (columnIndex !== -1) {
            found = true;
            foundBlockIndex = i;
            foundColumnIndex = columnIndex;
            break;
          }
        }
      }
      
      if (found) {
        showMessage(`Clave "${key}" encontrada en bloque ${foundBlockIndex + 1}, registro ${foundColumnIndex + 1}`, 'success');
      } else {
        showMessage(`Clave "${key}" no encontrada`, 'error');
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
    if (!deleteKey || deleteKey.trim() === '') {
      showMessage('Debe ingresar una clave a eliminar', 'error');
      return;
    }
    
    const key = deleteKey.trim();
    
    // Verificar si la clave existe (buscar en todas las posiciones no-null)
    let keyExists = false;
    for (const block of memoryMatrix) {
      if (block.records && block.records.some(r => r === key)) {
        keyExists = true;
        break;
      }
    }
    
    if (!keyExists) {
      showMessage('La clave no existe en la estructura', 'error');
      return;
    }
    
    setIsSimulating(true);
    const delay = delays[simulationSpeed - 1];
    
    try {
      const newMatrix = memoryMatrix.map(block => ({
        ...block,
        records: [...block.records]
      }));
      let deleted = false;
      let deletedBlockIndex = -1;
      let deletedColumnIndex = -1;
      
      // Buscar y eliminar la clave (poner null en su posición)
      for (let i = 0; i < newMatrix.length; i++) {
        const block = newMatrix[i];
        
        if (block.records) {
          const columnIndex = block.records.indexOf(key);
          if (columnIndex !== -1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            block.records[columnIndex] = null; // Marcar como vacío
            deleted = true;
            deletedBlockIndex = i;
            deletedColumnIndex = columnIndex;
            break;
          }
        }
      }
      
      if (deleted) {
        const newHistory = insertionHistory.filter(k => k !== key);
        setInsertionHistory(newHistory);
        setMemoryMatrix(newMatrix);
        
        saveToHistory({
          type: 'delete',
          key,
          matrix: newMatrix,
          insertionHistory: newHistory
        });
        
        showMessage(`Clave "${key}" eliminada del bloque ${deletedBlockIndex + 1}, registro ${deletedColumnIndex + 1}`, 'success');
        setDeleteKey('');
        setHasUnsavedChanges(true);
      } else {
        showMessage(`Clave "${key}" no encontrada`, 'error');
      }
    } catch (error) {
      showMessage('Error durante la eliminación', 'error');
      console.error(error);
    } finally {
      setIsSimulating(false);
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
      setInsertionHistory(previousState.insertionHistory);
      setHistoryIndex(historyIndex - 1);
      setHasUnsavedChanges(true);
      showMessage('Acción deshecha', 'info');
    } else {
      // Reinicializar estructura al estado inicial
      const indexStructure = [];
      const recordsPerBlock = currentStructureConfig.recordsPerBlock;
      const totalBlocks = currentStructureConfig.totalBlocks;
      
      for (let i = 0; i < totalBlocks; i++) {
        const blockStart = i * recordsPerBlock;
        const blockEnd = Math.min((i + 1) * recordsPerBlock, currentStructureConfig.recordCount);
        // Inicializar array de registros con la capacidad exacta
        const records = new Array(recordsPerBlock).fill(null);
        indexStructure.push({
          blockNumber: i,
          startRecord: blockStart,
          endRecord: blockEnd - 1,
          records: records,
          isFull: false
        });
      }
      
      setMemoryMatrix(indexStructure);
      setInsertionHistory([]);
      setHistoryIndex(-1);
      setHasUnsavedChanges(true);
      showMessage('Estructura restaurada al estado inicial', 'info');
    }
  };

  const handleRedo = async () => {
    if (historyIndex >= history.length - 1) {
      showMessage('No hay acciones para rehacer', 'warning');
      return;
    }
    
    const nextState = history[historyIndex + 1];
    setMemoryMatrix(nextState.matrix);
    setInsertionHistory(nextState.insertionHistory);
    setHistoryIndex(historyIndex + 1);
    setHasUnsavedChanges(true);
    showMessage('Acción rehecha', 'info');
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'IDF', // Indices File
      version: '2.0',
      sectionType: 'indices',
      sectionName: 'Índices',
      timestamp: new Date().toISOString(),
      configuration: {
        indexType: currentStructureConfig.indexType,
        recordCount: currentStructureConfig.recordCount,
        blockSize: currentStructureConfig.blockSize,
        recordLength: currentStructureConfig.recordLength,
        indexRecordSize: currentStructureConfig.indexRecordSize,
        recordsPerBlock: currentStructureConfig.recordsPerBlock,
        totalBlocks: currentStructureConfig.totalBlocks,
        indexCount: currentStructureConfig.indexCount,
        indexRecordsPerBlock: currentStructureConfig.indexRecordsPerBlock,
        indexBlockCount: currentStructureConfig.indexBlockCount,
        multilevelIndexCount: currentStructureConfig.multilevelIndexCount || 0,
        multilevelIndexBlockCount: currentStructureConfig.multilevelIndexBlockCount || 0
      },
      data: {
        memoryMatrix: memoryMatrix,
        indexStructure: indexStructure,
        multilevelIndexStructure: multilevelIndexStructure,
        insertionHistory: insertionHistory,
        isStructureCreated: isStructureCreated
      },
      metadata: {
        totalElements: insertionHistory.length,
        description: `Estructura de índice ${currentStructureConfig.indexType} con ${currentStructureConfig.totalBlocks} bloques`
      }
    };
  };

  // Función para guardar archivo con selector de ubicación
  const handleSave = async () => {
    if (!isStructureCreated) {
      showMessage('No hay estructura para guardar', 'error');
      return;
    }

    const defaultName = fileName 
      ? fileName.replace('.idf', '')
      : `indices-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.idf`,
          types: [{
            description: 'Archivos de Índices',
            accept: {
              'application/json': ['.idf']
            }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();

        setHasUnsavedChanges(false);
        setFileName(fileHandle.name);
        showMessage(`Archivo guardado como: ${fileHandle.name}`, 'success');
      } else {
        // Fallback para navegadores que no soportan File System Access API
        const userFileName = prompt('Ingrese el nombre del archivo:', defaultName);
        if (!userFileName) {
          return; // Usuario canceló
        }

        const finalFileName = userFileName.endsWith('.idf') ? userFileName : `${userFileName}.idf`;
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
        setFileName(finalFileName);
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
        let loadedFileName = '';
        let content = '';

        // Intentar usar la File System Access API moderna si está disponible
        if ('showOpenFilePicker' in window) {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [{
              description: 'Archivos de Índices',
              accept: {
                'application/json': ['.idf']
              }
            }],
            multiple: false
          });
          
          file = await fileHandle.getFile();
          loadedFileName = file.name;
          content = await file.text();
        } else {
          // Fallback para navegadores que no soportan File System Access API
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.idf';
          
          await new Promise((resolve) => {
            input.onchange = (e) => {
              file = e.target.files[0];
              if (file) {
                loadedFileName = file.name;
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

        if (!file || !loadedFileName.endsWith('.idf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .idf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || (loadedData.fileType !== 'IDF' && loadedData.fileType !== 'IPF')) {
          showMessage('Archivo no válido: formato no reconocido', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'indices') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        const config = loadedData.configuration || {
          indexType: 'primario',
          recordCount: 100,
          blockSize: 512,
          recordLength: 64,
          indexRecordSize: 16,
          recordsPerBlock: 8,
          totalBlocks: 13,
          indexCount: 13,
          indexRecordsPerBlock: 32,
          indexBlockCount: 1
        };
        
        setCurrentStructureConfig(config);
        
        // Actualizar campos de configuración
        setIndexType(config.indexType || 'primario');
        setRecordCount(config.recordCount || 100);
        setBlockSize(config.blockSize || 512);
        setRecordLength(config.recordLength || 64);
        setIndexRecordSize(config.indexRecordSize || 16);
        
        // Cargar datos
        setMemoryMatrix(loadedData.data.memoryMatrix || []);
        setIndexStructure(loadedData.data.indexStructure || []);
        setMultilevelIndexStructure(loadedData.data.multilevelIndexStructure || []);
        setInsertionHistory(loadedData.data.insertionHistory || []);
        setIsStructureCreated(loadedData.data.isStructureCreated || false);

        // Limpiar historial y estados
        setHistory([]);
        setHistoryIndex(-1);
        setHasUnsavedChanges(false);
        setFileName(loadedFileName);
        
        showMessage(`Archivo cargado exitosamente: ${loadedFileName}`, 'success');
        
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

  // Sistema mejorado de navegación sin bloqueo
  const checkForUnsavedChanges = useCallback((targetSection, callback) => {
    if (hasUnsavedChanges && !showUnsavedWarning) {
      setPendingAction({ 
        execute: () => {
          if (callback) {
            callback();
          } else if (onNavigate) {
            onNavigate(targetSection);
          }
        }, 
        description: `navegar a ${targetSection}` 
      });
      setShowUnsavedWarning(true);
      return true; // Indica que se mostró advertencia
    } else if (!hasUnsavedChanges) {
      if (callback) {
        callback();
      } else if (onNavigate) {
        onNavigate(targetSection);
      }
      return false; // No había cambios, se ejecutó directamente
    }
    return false;
  }, [hasUnsavedChanges, onNavigate, showUnsavedWarning]);

  // Interceptar intentos de navegación del componente padre
  useEffect(() => {
    window.indicesCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.indicesCheckUnsavedChanges;
    };
  }, [checkForUnsavedChanges]);

  // Función para verificar cambios no guardados antes de salir
  useEffect(() => {
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

  return (
    <div className="hash-container">
      <div className="section-header">
        <h1>Índices</h1>
      </div>

      {/* Sección de Configuración */}
      <div className="configuration-section">
        <h2>
          <Settings size={20} />
          Configuración de la Estructura
        </h2>
        <div className="config-controls">
          <div className="config-group">
            <label htmlFor="indexType">Tipo de Índice</label>
            <select
              id="indexType"
              value={indexType}
              onChange={(e) => setIndexType(e.target.value)}
              className="config-input"
            >
              <option value="primario">Primario</option>
              <option value="secundario">Secundario</option>
              <option value="multinivel">Multinivel</option>
            </select>
            <small>Tipo de estructura de índice</small>
          </div>

          <div className="config-group">
            <label htmlFor="recordCount">Cantidad de Registros</label>
            <input
              id="recordCount"
              type="number"
              value={recordCount}
              onChange={(e) => setRecordCount(e.target.value)}
              onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 100) {
                  value = 100;
                } else if (value % 10 !== 0) {
                  value = Math.round(value / 10) * 10;
                }
                setRecordCount(value);
              }}
              title={recordCount < 100 ? "Mínimo: 100" : (recordCount % 10 !== 0 ? "Debe ser múltiplo de 10" : "")}
              className="config-input"
              style={{
                borderColor: (recordCount < 100 || recordCount % 10 !== 0) ? '#ef4444' : undefined
              }}
            />
            <small>Mínimo: 100 (múltiplo de 10)</small>
          </div>

          <div className="config-group">
            <label htmlFor="blockSize">Tamaño de Bloque (bytes)</label>
            <input
              id="blockSize"
              type="number"
              value={blockSize}
              onChange={(e) => setBlockSize(e.target.value)}
              onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 128) {
                  value = 128;
                }
                setBlockSize(value);
              }}
              title={blockSize < 128 ? "Mínimo: 128" : ""}
              className="config-input"
              style={{
                borderColor: blockSize < 128 ? '#ef4444' : undefined
              }}
            />
            <small>Mínimo: 128</small>
          </div>

          <div className="config-group">
            <label htmlFor="recordLength">Longitud del Registro (bytes)</label>
            <input
              id="recordLength"
              type="number"
              value={recordLength}
              onChange={(e) => setRecordLength(e.target.value)}
              onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 32) {
                  value = 32;
                }
                setRecordLength(value);
              }}
              title={recordLength < 32 ? "Mínimo: 32" : ""}
              className="config-input"
              style={{
                borderColor: recordLength < 32 ? '#ef4444' : undefined
              }}
            />
            <small>Mínimo: 32</small>
          </div>

          <div className="config-group">
            <label htmlFor="indexRecordSize">Tamaño Registro Índice (bytes)</label>
            <input
              id="indexRecordSize"
              type="number"
              value={indexRecordSize}
              onChange={(e) => setIndexRecordSize(e.target.value)}
              onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 8) {
                  value = 8;
                }
                setIndexRecordSize(value);
              }}
              title={indexRecordSize < 8 ? "Mínimo: 8" : ""}
              className="config-input"
              style={{
                borderColor: indexRecordSize < 8 ? '#ef4444' : undefined
              }}
            />
            <small>Mínimo: 8</small>
          </div>

          <div className="button-container">
            <button 
              className="create-structure-btn"
              onClick={handleCreateStructure}
              disabled={recordCount < 100 || recordCount % 10 !== 0}
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
            title="Cargar estructura desde archivo .idf"
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

      {/* Área Principal de Simulación (SIN panel lateral) */}
      <div className="simulation-area" style={{ display: 'block' }}>
        {/* Área de Simulación (ocupando todo el espacio) */}
        <div className="simulation-canvas" style={{ width: '100%', maxWidth: '100%' }}>
          <h3>Área de Simulación</h3>
          {!isStructureCreated ? (
            <div className="empty-state">
              <p>Configure y cree una estructura para comenzar la simulación</p>
            </div>
          ) : (
            <div className="canvas-content">
              <div className="simulation-info">
                <p><strong>Tipo de Índice:</strong> {currentStructureConfig.indexType?.charAt(0).toUpperCase() + currentStructureConfig.indexType?.slice(1)}</p>
                <p><strong>Registros Totales:</strong> {currentStructureConfig.recordCount}</p>
                <p><strong>Bloques:</strong> {currentStructureConfig.totalBlocks}</p>
                <p><strong>Registros/Bloque:</strong> {currentStructureConfig.recordsPerBlock}</p>
                <p><strong>Tamaño de Bloque:</strong> {currentStructureConfig.blockSize} bytes</p>
                <p><strong>Longitud de Registro:</strong> {currentStructureConfig.recordLength} bytes</p>
                <p><strong>Tamaño Registro Índice:</strong> {currentStructureConfig.indexRecordSize} bytes</p>
                <p><strong>Cantidad de Índices{currentStructureConfig.indexType === 'multinivel' ? ' Nivel 1' : ''}:</strong> {currentStructureConfig.indexCount}</p>
                <p><strong>Bloques de Índices{currentStructureConfig.indexType === 'multinivel' ? ' Nivel 1' : ''}:</strong> {currentStructureConfig.indexBlockCount}</p>
                {currentStructureConfig.indexType === 'multinivel' && (
                  <>
                    <p><strong>Cantidad de Índices Nivel 2:</strong> {currentStructureConfig.multilevelIndexCount || 0}</p>
                    <p><strong>Bloques de Índices Nivel 2:</strong> {currentStructureConfig.multilevelIndexBlockCount || 0}</p>
                  </>
                )}
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
                    overflow: 'hidden',
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
                    {/* Contenedor flex para poner índices a la izquierda y datos a la derecha */}
                    <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                      {/* Tabla Multinivel (Nivel 2) - Solo para índices multinivel */}
                      {currentStructureConfig.indexType === 'multinivel' && multilevelIndexStructure.length > 0 && (
                        <div className="structure-table" style={{
                          border: '2px solid #7f8c8d',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flex: '0 0 auto',
                          backgroundColor: 'white'
                        }}>
                          <div className="table-header" style={{ backgroundColor: '#16a085' }}>
                            <span className="header-memory">Índices Nivel 2</span>
                          </div>
                          
                          <div className="blocks-container" style={{ padding: '10px' }}>
                            {(() => {
                              const totalMultilevelIndices = multilevelIndexStructure.length;
                              const indexRecordsPerBlock = currentStructureConfig.indexRecordsPerBlock || 1;
                              const multilevelIndexBlockCount = currentStructureConfig.multilevelIndexBlockCount || 1;
                              
                              // Sistema de puntos suspensivos para nivel 2: mostrar solo 6 índices TOTALES
                              // (2 primeros, 2 del medio, 2 últimos de TODOS los índices)
                              const getVisibleMultilevelIndices = () => {
                                if (totalMultilevelIndices <= 6) {
                                  // Si hay 6 o menos, mostrar todos
                                  return Array.from({ length: totalMultilevelIndices }, (_, i) => i);
                                }
                                // Mostrar 2 primeros, 2 del medio, 2 últimos
                                const centerIdx = Math.floor(totalMultilevelIndices / 2);
                                return [
                                  0, 1,
                                  -1, // gap
                                  centerIdx - 1, centerIdx,
                                  -2, // gap
                                  totalMultilevelIndices - 2, totalMultilevelIndices - 1
                                ];
                              };
                              
                              const visibleIndices = getVisibleMultilevelIndices();
                              
                              // Agrupar índices visibles por bloque
                              const blocksToShow = new Set();
                              visibleIndices.forEach(idx => {
                                if (idx !== -1 && idx !== -2) {
                                  const blockIdx = Math.floor(idx / indexRecordsPerBlock);
                                  blocksToShow.add(blockIdx);
                                }
                              });
                              
                              const sortedBlocks = Array.from(blocksToShow).sort((a, b) => a - b);
                              
                              return sortedBlocks.map((blockIndex, blockArrayIdx) => {
                                const startIdx = blockIndex * indexRecordsPerBlock;
                                const endIdx = Math.min(startIdx + indexRecordsPerBlock, totalMultilevelIndices);
                                
                                // Filtrar solo los índices visibles de este bloque
                                const indicesInBlock = visibleIndices.filter(idx => {
                                  if (idx === -1 || idx === -2) return false;
                                  return idx >= startIdx && idx < endIdx;
                                });
                                
                                // Determinar si hay gaps antes de este bloque
                                const prevBlock = sortedBlocks[blockArrayIdx - 1];
                                const hasGapBefore = prevBlock !== undefined && (blockIndex - prevBlock) > 1;
                                
                                // Determinar si hay gap después
                                const nextBlock = sortedBlocks[blockArrayIdx + 1];
                                const hasGapAfter = nextBlock !== undefined && (nextBlock - blockIndex) > 1;
                                
                                return (
                                  <React.Fragment key={blockIndex}>
                                    {/* Gap antes del bloque si es necesario */}
                                    {hasGapBefore && (
                                      <div style={{
                                        textAlign: 'center',
                                        padding: '10px',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: '#7f8c8d'
                                      }}>
                                        ⋮
                                      </div>
                                    )}
                                    
                                    <div className="block-table" style={{ 
                                      marginBottom: '15px',
                                      border: '2px solid #7f8c8d',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      maxWidth: '280px'
                                    }}>
                                      <div className="table-header" style={{
                                        backgroundColor: '#16a085',
                                        borderBottom: '2px solid #7f8c8d',
                                        padding: '8px',
                                        fontSize: '0.85rem'
                                      }}>
                                        <span className="header-memory">Bloque N2-{blockIndex + 1}</span>
                                      </div>
                                      
                                      <div className="table-body">
                                        {indicesInBlock.map((globalIdx, localIdx) => {
                                          // Manejar marcadores de gap
                                          if (globalIdx === -1 || globalIdx === -2) {
                                            return (
                                              <div key={`gap-${globalIdx}`} className="table-row ellipsis-row" style={{
                                                minHeight: '24px',
                                                height: '24px',
                                                display: 'grid',
                                                gridTemplateColumns: '40% 60%',
                                                gap: '2px'
                                              }}>
                                                <span className="cell-memory" style={{
                                                  padding: '2px',
                                                  margin: '0 4px 0 8px',
                                                  width: '100%'
                                                }}>⋮</span>
                                                <span className="cell-memory" style={{
                                                  padding: '2px',
                                                  margin: '0 8px 0 4px',
                                                  width: '100%'
                                                }}>⋮</span>
                                              </div>
                                            );
                                          }
                                          
                                          // El valor del índice nivel 2 apunta a un índice nivel 1
                                          const pointsToIndex = multilevelIndexStructure[globalIdx];
                                          // El número del índice nivel 2 ES el valor al que apunta
                                          const indexNumber = pointsToIndex;
                                          
                                          return (
                                            <React.Fragment key={globalIdx}>
                                              <div className="table-row" style={{
                                                display: 'grid',
                                                gridTemplateColumns: '40% 60%',
                                                gap: '2px',
                                                minHeight: '32px'
                                              }}>
                                                <span className="cell-memory" style={{
                                                  textAlign: 'center',
                                                  fontFamily: "'Courier New', monospace",
                                                  fontWeight: '600',
                                                  padding: '6px 4px',
                                                  fontSize: '0.85rem',
                                                  margin: '2px 4px 2px 8px',
                                                  width: '100%'
                                                }}>
                                                  {indexNumber}
                                                </span>
                                                
                                                <span className="cell-memory" style={{
                                                  textAlign: 'center',
                                                  fontFamily: "'Courier New', monospace",
                                                  fontWeight: '600',
                                                  padding: '6px 8px',
                                                  fontSize: '0.85rem',
                                                  margin: '2px 8px 2px 4px',
                                                  width: '100%'
                                                }}>
                                                  → i_1 {pointsToIndex}
                                                </span>
                                              </div>
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </React.Fragment>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                      
                      {/* Estructura Índices - Estilo similar a búsquedas internas clásicas */}
                      <div className="structure-table" style={{
                        border: '2px solid #7f8c8d',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flex: '0 0 auto',
                        backgroundColor: 'white'
                      }}>
                        <div className="table-header">
                          <span className="header-memory">
                            {currentStructureConfig.indexType === 'multinivel' ? 'Índices Nivel 1' : 'Estructura de Índices'}
                          </span>
                        </div>
                        
                        <div className="blocks-container" style={{ padding: '10px' }}>
                          {(() => {
                            const totalIndices = indexStructure.length;
                            const indexRecordsPerBlock = currentStructureConfig.indexRecordsPerBlock || 1;
                            const indexBlockCount = currentStructureConfig.indexBlockCount || 1;
                            
                            // Determinar qué índices mostrar globalmente (2 primeros, 2 del medio, 2 últimos)
                            const getVisibleIndices = () => {
                              if (totalIndices <= 12) {
                                return Array.from({ length: totalIndices }, (_, i) => i);
                              }
                              
                              const indexType = currentStructureConfig.indexType;
                              
                              if (indexType === 'secundario' || indexType === 'multinivel') {
                                // Secundarios y multinivel: 4 primeros, 4 del medio, 4 últimos
                                const centerIndex = Math.floor(totalIndices / 2);
                                return [
                                  0, 1, 2, 3,
                                  -1,
                                  centerIndex - 2, centerIndex - 1, centerIndex, centerIndex + 1,
                                  -2,
                                  totalIndices - 4, totalIndices - 3, totalIndices - 2, totalIndices - 1
                                ];
                              } else {
                                // Primarios: 2 primeros, 2 del medio, 2 últimos
                                const centerIndex = Math.floor(totalIndices / 2);
                                return [
                                  0, 1,
                                  -1,
                                  centerIndex - 1, centerIndex,
                                  -2,
                                  totalIndices - 2, totalIndices - 1
                                ];
                              }
                            };
                            
                            const visibleIndices = getVisibleIndices();
                            
                            // Agrupar índices por bloques solo para los índices visibles
                            const blocksToShow = new Set();
                            visibleIndices.forEach(idx => {
                              if (idx !== -1 && idx !== -2) {
                                const blockIdx = Math.floor(idx / indexRecordsPerBlock);
                                blocksToShow.add(blockIdx);
                              }
                            });
                            
                            const sortedBlocks = Array.from(blocksToShow).sort((a, b) => a - b);
                            
                            return sortedBlocks.map((blockIndex, blockArrayIdx) => {
                              // Calcular índices del bloque
                              const startIdx = blockIndex * indexRecordsPerBlock;
                              const endIdx = Math.min(startIdx + indexRecordsPerBlock, totalIndices);
                              
                              // Filtrar solo los índices visibles de este bloque
                              const blockVisibleIndices = visibleIndices.filter(idx => {
                                if (idx === -1 || idx === -2) return false;
                                return idx >= startIdx && idx < endIdx;
                              });
                              
                              // Determinar si necesitamos puntos suspensivos entre bloques
                              const nextBlock = sortedBlocks[blockArrayIdx + 1];
                              const hasGapAfter = nextBlock !== undefined && (nextBlock - blockIndex) > 1;
                              
                              return (
                                <React.Fragment key={blockIndex}>
                                  <div className="block-table" style={{ 
                                    marginBottom: '15px',
                                    border: '2px solid #7f8c8d',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    maxWidth: '280px'
                                  }}>
                                    {/* Cabecera del bloque - estilo exacto de bloques */}
                                    <div className="table-header" style={{
                                      backgroundColor: '#34495e',
                                      borderBottom: '2px solid #7f8c8d',
                                      padding: '8px',
                                      fontSize: '0.85rem'
                                    }}>
                                      <span className="header-memory">Bloque Índice {blockIndex + 1}</span>
                                    </div>
                                    
                                    {/* Cuerpo de la tabla */}
                                    <div className="table-body">
                                      {blockVisibleIndices.map((globalIdx, localIdx) => {
                                        const indexValue = indexStructure[globalIdx];
                                        // Para primarios: indexValue es secuencial (1, 2, 3...)
                                        // Para secundarios: indexValue es el apuntador al bloque (aleatorio)
                                        const referencedBlock = parseInt(indexValue, 10);
                                        const indexType = currentStructureConfig.indexType;
                                        const indexNumber = globalIdx + 1; // Número del índice (posición)
                                        
                                        // Verificar si hay gap después de este índice dentro del bloque
                                        const nextLocalIdx = blockVisibleIndices[localIdx + 1];
                                        const hasGapInside = nextLocalIdx !== undefined && (nextLocalIdx - globalIdx) > 1;
                                        
                                        return (
                                          <React.Fragment key={globalIdx}>
                                            <div className="table-row" style={{
                                              display: 'grid',
                                              gridTemplateColumns: '40% 60%',
                                              gap: '2px',
                                              minHeight: '32px'
                                            }}>
                                              {/* Columna izquierda: Número de índice */}
                                              <span className="cell-memory" style={{
                                                textAlign: 'center',
                                                fontFamily: "'Courier New', monospace",
                                                fontWeight: '600',
                                                padding: '6px 4px',
                                                fontSize: '0.85rem',
                                                margin: '2px 4px 2px 8px',
                                                width: '100%'
                                              }}>
                                                {(indexType === 'secundario' || indexType === 'multinivel') ? indexNumber : indexValue}
                                              </span>
                                              
                                              {/* Columna derecha: Referencia al bloque */}
                                              <span className="cell-memory" style={{
                                                textAlign: 'center',
                                                fontFamily: "'Courier New', monospace",
                                                fontWeight: '600',
                                                padding: '6px 8px',
                                                fontSize: '0.85rem',
                                                margin: '2px 8px 2px 4px',
                                                width: '100%'
                                              }}>
                                                → B.{referencedBlock}
                                              </span>
                                            </div>
                                            
                                            {/* Puntos suspensivos dentro del bloque si hay gap entre índices visibles */}
                                            {hasGapInside && (
                                              <div className="table-row ellipsis-row" style={{
                                                minHeight: '24px',
                                                height: '24px',
                                                display: 'grid',
                                                gridTemplateColumns: '40% 60%',
                                                gap: '2px'
                                              }}>
                                                <span className="cell-memory" style={{
                                                  padding: '2px',
                                                  margin: '0 4px 0 8px',
                                                  width: '100%'
                                                }}>⋮</span>
                                                <span className="cell-memory" style={{
                                                  padding: '2px',
                                                  margin: '0 8px 0 4px',
                                                  width: '100%'
                                                }}>⋮</span>
                                              </div>
                                            )}
                                          </React.Fragment>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  
                                  {/* Puntos suspensivos entre bloques */}
                                  {hasGapAfter && (
                                    <div style={{
                                      textAlign: 'center',
                                      padding: '8px',
                                      color: '#666',
                                      fontSize: '18px',
                                      fontWeight: 'bold'
                                    }}>
                                      ⋮
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    
                      {/* Estructura de Datos - Matriz de Bloques y Registros */}
                    <div className="structure-table" style={{
                      border: '2px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'visible',
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
                      }}>Estructura de Datos</div>
                      
                      <div className="table-body" style={{
                        overflowX: 'visible',
                        minWidth: '100%'
                      }}>
                        {(() => {
                          const recordsPerBlock = currentStructureConfig.recordsPerBlock || 0;
                          const totalBlocks = memoryMatrix.length;
                          
                          // Determinar qué columnas mostrar (2 primeras, 2 del centro, 2 últimas)
                          const getVisibleColumns = () => {
                            if (recordsPerBlock <= 6) {
                              return Array.from({ length: recordsPerBlock }, (_, i) => i);
                            }
                            
                            const centerIndex = Math.floor(recordsPerBlock / 2);
                            return [
                              0, 1,
                              -1,
                              centerIndex - 1, centerIndex,
                              -2,
                              recordsPerBlock - 2, recordsPerBlock - 1
                            ];
                          };
                          
                          // Determinar qué filas mostrar (2 primeras, 2 del centro, 2 últimas)
                          const getVisibleRows = () => {
                            if (totalBlocks <= 6) {
                              return Array.from({ length: totalBlocks }, (_, i) => i);
                            }
                            
                            const centerIndex = Math.floor(totalBlocks / 2);
                            return [
                              0, 1,
                              -1,
                              centerIndex - 1, centerIndex,
                              -2,
                              totalBlocks - 2, totalBlocks - 1
                            ];
                          };
                          
                          const visibleColumns = getVisibleColumns();
                          const visibleRows = getVisibleRows();
                          // Columna de números + columnas de registros
                          const gridColumns = `80px repeat(${visibleColumns.length}, 90px)`;
                          
                          return (
                            <div style={{ display: 'flex', gap: '0', minWidth: 'max-content' }}>
                              {/* Columna vertical con etiqueta "Bloques" que abarca todas las filas */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '40px',
                                borderRight: '2px solid #cbd5e1',
                                backgroundColor: '#f8fafc'
                              }}>
                                {/* Celda vacía superior para alinear con header de "Registros" - ahora uniforme */}
                                <div style={{
                                  backgroundColor: '#f8fafc',
                                  borderBottom: '2px solid #cbd5e1',
                                  minHeight: '42px'
                                }}></div>
                                
                                {/* Etiqueta "Bloques" que abarca todo el alto de la matriz */}
                                <div style={{
                                  flex: 1,
                                  padding: '20px 0',
                                  fontWeight: '700',
                                  fontSize: '0.9rem',
                                  textAlign: 'center',
                                  color: '#2563eb',
                                  backgroundColor: '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)'
                                }}>
                                  Bloques
                                </div>
                              </div>
                              
                              {/* Contenedor principal de la matriz */}
                              <div style={{ flex: 1 }}>
                                {/* Header superior con etiqueta "Registros" */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: gridColumns,
                                  gap: '0',
                                  minWidth: 'max-content',
                                  backgroundColor: '#f8fafc'
                                }}>
                                  {/* Celda para columna de números - esquina superior izquierda unificada */}
                                  <div style={{
                                    borderRight: '2px solid #cbd5e1',
                                    borderBottom: '2px solid #cbd5e1',
                                    backgroundColor: '#f8fafc',
                                    minHeight: '42px'
                                  }}></div>
                                  
                                  {/* Etiqueta "Registros" que abarca todas las columnas de datos */}
                                  <div style={{
                                    gridColumn: `2 / ${visibleColumns.length + 2}`,
                                    padding: '8px',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    textAlign: 'center',
                                    color: '#2563eb',
                                    backgroundColor: '#f1f5f9',
                                    borderBottom: '2px solid #cbd5e1'
                                  }}>
                                    Registros
                                  </div>
                                </div>
                                
                                {/* Header de la matriz con números de columna */}
                                <div className="table-row header-row" style={{
                                  display: 'grid',
                                  gridTemplateColumns: gridColumns,
                                  gap: '0',
                                  backgroundColor: '#f1f5f9',
                                  borderBottom: '2px solid #cbd5e1',
                                  minWidth: 'max-content'
                                }}>
                                  {/* Celda vacía para columna de números */}
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
                                {visibleColumns.map((colIndex, idx) => {
                                  if (colIndex === -1 || colIndex === -2) {
                                    return (
                                      <div key={`col-ellipsis-${idx}`} style={{
                                        padding: '10px 8px',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                        borderRight: idx < visibleColumns.length - 1 ? '1px solid #e2e8f0' : 'none',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        ...
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={colIndex} style={{
                                      padding: '10px 8px',
                                      fontWeight: '700',
                                      fontSize: '0.85rem',
                                      textAlign: 'center',
                                      borderRight: idx < visibleColumns.length - 1 ? '1px solid #e2e8f0' : 'none',
                                      color: '#2563eb',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      {colIndex + 1}
                                    </div>
                                  );
                                })}
                                </div>
                                
                                {/* Filas de la matriz (bloques) con puntos suspensivos */}
                                {visibleRows.map((blockIndex, rowIdx) => {
                                  // Si es un indicador de puntos suspensivos
                                  if (blockIndex === -1 || blockIndex === -2) {
                                    return (
                                      <div 
                                        key={`row-ellipsis-${rowIdx}`}
                                        className="table-row"
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: gridColumns,
                                          gap: '0',
                                          borderBottom: rowIdx < visibleRows.length - 1 ? '1px solid #e2e8f0' : 'none',
                                          backgroundColor: '#f9fafb',
                                          minWidth: 'max-content',
                                          minHeight: '38px'
                                        }}
                                      >
                                        {/* Columna de números con puntos suspensivos */}
                                        <div style={{
                                          padding: '10px 8px',
                                          fontWeight: '700',
                                          color: '#94a3b8',
                                          backgroundColor: '#f8fafc',
                                          borderRight: '2px solid #cbd5e1',
                                          textAlign: 'center',
                                          fontSize: '1.2rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}>
                                          ⋮
                                        </div>
                                      {visibleColumns.map((colIndex, idx) => (
                                        <div
                                          key={`ellipsis-cell-${idx}`}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRight: idx < visibleColumns.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            padding: '0',
                                            minHeight: '38px',
                                            color: '#94a3b8',
                                            fontSize: '1.2rem'
                                          }}
                                        >
                                          {colIndex === -1 || colIndex === -2 ? '...' : '⋮'}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                  
                                  const block = memoryMatrix[blockIndex];
                                  
                                  return (
                                    <div 
                                      key={blockIndex} 
                                      className="table-row"
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: gridColumns,
                                        gap: '0',
                                        borderBottom: rowIdx < visibleRows.length - 1 ? '1px solid #e2e8f0' : 'none',
                                        backgroundColor: blockIndex % 2 === 0 ? 'white' : '#f9fafb',
                                        minWidth: 'max-content'
                                      }}
                                    >
                                      {/* Número de bloque */}
                                      <div style={{
                                        padding: '10px 8px',
                                        fontWeight: '700',
                                        color: '#2563eb',
                                        backgroundColor: '#f8fafc',
                                        borderRight: '2px solid #cbd5e1',
                                        textAlign: 'center',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        {blockIndex + 1}
                                      </div>
                                    
                                    {/* Celdas de registros */}
                                    {visibleColumns.map((colIndex, idx) => {
                                      if (colIndex === -1 || colIndex === -2) {
                                        return (
                                          <div key={`ellipsis-${idx}`} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRight: idx < visibleColumns.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            padding: '0',
                                            minHeight: '38px',
                                            color: '#94a3b8',
                                            fontSize: '1.2rem'
                                          }}>
                                            ...
                                          </div>
                                        );
                                      }
                                      
                                      const record = block.records?.[colIndex];
                                      
                                      return (
                                        <div
                                          key={colIndex}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRight: idx < visibleColumns.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            padding: '0',
                                            minHeight: '38px',
                                            position: 'relative'
                                          }}
                                        >
                                          <div
                                            className={`cell-memory ${!record ? 'empty' : ''}`}
                                            style={{
                                              width: '85%',
                                              padding: '6px 4px',
                                              textAlign: 'center',
                                              fontFamily: "'Courier New', monospace",
                                              fontSize: '0.85rem',
                                              fontWeight: '600',
                                              backgroundColor: record ? '#dbeafe' : 'transparent',
                                              color: record ? '#1e40af' : '#94a3b8',
                                              transition: 'all 0.2s ease',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              letterSpacing: '0.3px',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              borderRadius: '4px',
                                              minHeight: '30px',
                                              boxSizing: 'border-box',
                                              margin: '0 auto'
                                            }}
                                            title={record || ''}
                                          >
                                            {record || '—'}
                                          </div>
                                        </div>
                                      );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    </div> {/* Cierre del contenedor flex */}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>

      {/* Modal de advertencia de cambios no guardados */}
      {showUnsavedWarning && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              confirmUnsavedChanges('cancel');
            }
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Cambios sin guardar</h3>
            </div>
            <div className="modal-body">
              <p>
                Tienes cambios sin guardar que se perderán si continúas.
                {pendingAction && (
                  <span className="modal-action-description">
                    <br />
                    <strong>Acción pendiente:</strong> {pendingAction.description}
                  </span>
                )}
              </p>
              <p className="modal-question">¿Qué deseas hacer?</p>
            </div>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => confirmUnsavedChanges('cancel')}
              >
                Cancelar
              </button>
              <button
                className="button button-success"
                onClick={() => confirmUnsavedChanges('save')}
              >
                <Save size={16} />
                <span>Guardar y continuar</span>
              </button>
              <button
                className="button button-danger"
                onClick={() => confirmUnsavedChanges('continue')}
              >
                Continuar sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndicesSearchSection;
