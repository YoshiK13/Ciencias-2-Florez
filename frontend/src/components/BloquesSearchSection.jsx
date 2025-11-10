import React, { useState, useCallback } from 'react';
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

function BloquesSearchSection({ onNavigate }) {
  // Estados para la configuración
  const [structureSize, setStructureSize] = useState(20);
  const [keySize, setKeySize] = useState(4);
  const [hashFunction, setHashFunction] = useState('secuencial');
  const [collisionMethod, setCollisionMethod] = useState('secuencial');
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  // Estados específicos para bloques
  const [blocks, setBlocks] = useState([]); // Array de bloques, cada uno es un array de claves
  
  // Estados para la configuración actual de la estructura creada
  const [currentStructureConfig, setCurrentStructureConfig] = useState({
    hashFunction: 'mod',
    collisionMethod: 'secuencial',
    structureSize: 20,
    keySize: 4,
    numBlocks: 0,
    recordsPerBlock: 0
  });
  
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [insertKey, setInsertKey] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  
  // Estados de simulación
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Estado para los datos de la estructura
  const [memoryArray, setMemoryArray] = useState([]);
  
  // Estado para arreglos anidados (solo para método 'arreglos')
  const [nestedArrays, setNestedArrays] = useState([]);
  
  // Estados para visualización de búsqueda
  const [searchHighlights, setSearchHighlights] = useState({
    mainMemory: [], // Array de índices a iluminar en memoria principal
    nestedArrays: {}, // {arrayId: [índices]} para iluminar en arreglos anidados
    chainElements: {} // {posición: [índices de elementos]} para encadenamiento
  });
  
  // Estados para mensajes informativos
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Sistema de historial para deshacer/rehacer (últimas 15 acciones)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para zoom y pan del contenedor de visualización
  const [visualZoom, setVisualZoom] = useState(1.0); // Zoom de 0.3 (30%) a 3.0 (300%)
  const [visualPan, setVisualPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const visualContainerRef = React.useRef(null);
  
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
    window.bloquesSearchCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.bloquesSearchCheckUnsavedChanges;
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

  // ===== FUNCIONES ESPECÍFICAS PARA BLOQUES =====
  
  // Calcular cantidad de bloques: ceil(sqrt(structureSize))
  const calculateNumBlocks = (size) => {
    return Math.ceil(Math.sqrt(size));
  };

  // Calcular registros por bloque: ceil(structureSize / numBlocks)
  const calculateRecordsPerBlock = (size, blocks) => {
    return Math.ceil(size / blocks);
  };

  // Crear estructura de bloques vacía
  const createEmptyBlocks = (numBlocks, recordsPerBlock) => {
    const newBlocks = [];
    for (let i = 0; i < numBlocks; i++) {
      newBlocks.push(Array(recordsPerBlock).fill(null));
    }
    return newBlocks;
  };

  // Funciones para pan/arrastre del contenedor de visualización
  const handleVisualMouseDown = (e) => {
    // Solo arrastrar con botón izquierdo
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - visualPan.x,
      y: e.clientY - visualPan.y
    });
    e.preventDefault(); // Prevenir selección de texto
  };

  const handleVisualMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setVisualPan({ x: newX, y: newY });
  };

  const handleVisualMouseUp = () => {
    setIsDragging(false);
  };

  const handleVisualMouseLeave = () => {
    setIsDragging(false);
  };

  const centerVisualView = useCallback(() => {
    if (!visualContainerRef.current) return;
    
    // Centrar la vista en el contenido
    const container = visualContainerRef.current;
    const contentWidth = container.scrollWidth;
    const contentHeight = container.scrollHeight;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calcular pan para centrar el contenido
    const centerX = (containerWidth - contentWidth * visualZoom) / 2;
    const centerY = (containerHeight - contentHeight * visualZoom) / 2;
    
    setVisualPan({ x: centerX, y: centerY });
  }, [visualZoom]);

  const resetVisualView = () => {
    setVisualZoom(1.0); // Resetear a 100%
    setVisualPan({ x: 0, y: 0 }); // Resetear pan
  };

  // Efecto para centrar la vista cuando se crea o actualiza la estructura
  React.useEffect(() => {
    if (isStructureCreated && visualContainerRef.current) {
      // Pequeño delay para asegurar que el contenido se haya renderizado
      const timer = setTimeout(() => {
        centerVisualView();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isStructureCreated, memoryArray, nestedArrays, centerVisualView]);

  // Funciones Hash
  const hashFunctions = {
    mod: (key, size) => {
      // La función MOD ya genera un índice válido directamente
      return parseInt(key) % size;
    },
    cuadrado: (key, size) => {
      const squared = Math.pow(parseInt(key), 2);
      const str = squared.toString();
      
      // Calcular cuántos dígitos tomar según el tamaño de la estructura
      const digitsNeeded = Math.floor(Math.log10(size)) + 1;
      
      // Tomar dígitos centrales
      const startIndex = Math.max(0, Math.floor((str.length - digitsNeeded) / 2));
      const extracted = str.substring(startIndex, startIndex + digitsNeeded);
      
      const result = parseInt(extracted || '0');
      
      // Si el resultado es mayor o igual al tamaño, aplicar la función hash nuevamente
      if (result >= size) {
        return hashFunctions.cuadrado(result.toString(), size);
      }
      
      return result;
    },
    truncamiento: (key, size) => {
      // Definir posiciones específicas a tomar (siempre las mismas para todas las claves)
      const positions = [0, 2]; // Tomar posiciones 0 y 2 (primera y tercera)
      let extracted = '';
      
      positions.forEach(pos => {
        if (pos < key.length) {
          extracted += key[pos];
        }
      });
      
      // Si no se pudo extraer nada, usar '0'
      if (extracted === '') {
        extracted = '0';
      }
      
      const result = parseInt(extracted);
      
      // Si el resultado es mayor o igual al tamaño, aplicar la función hash nuevamente
      if (result >= size) {
        return hashFunctions.truncamiento(result.toString(), size);
      }
      
      return result;
    },
    plegamiento: (key, size) => {
      // Calcular tamaño de cada parte (dividir en 2 partes iguales)
      const partSize = Math.floor(key.length / 2);
      let sum = 0;
      let parts = [];
      
      // Dividir la clave en partes iguales
      for (let i = 0; i < key.length; i += partSize) {
        const part = key.substring(i, i + partSize);
        if (part.length > 0) {
          parts.push(part);
          sum += parseInt(part);
        }
      }
      
      // Si el resultado es mayor o igual al tamaño, aplicar la función hash nuevamente
      if (sum >= size) {
        return hashFunctions.plegamiento(sum.toString(), size);
      }
      
      return sum;
    }
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'BLF', // Bloques File
      version: '1.0',
      sectionType: 'bloques-search',
      sectionName: 'Búsqueda por Bloques',
      timestamp: new Date().toISOString(),
      configuration: {
        structureSize: structureSize,
        keySize: keySize,
        hashFunction: currentStructureConfig.hashFunction,
        collisionMethod: currentStructureConfig.collisionMethod,
        numBlocks: currentStructureConfig.numBlocks,
        recordsPerBlock: currentStructureConfig.recordsPerBlock
      },
      data: {
        memoryArray: [...memoryArray],
        blocks: blocks.map(block => [...block]), // Guardar estructura de bloques
        isStructureCreated: isStructureCreated
      },
      metadata: {
        elementsCount: memoryArray.filter(item => item !== null).length,
        description: `Estructura de ${currentStructureConfig.numBlocks} bloques con ${currentStructureConfig.recordsPerBlock} registros por bloque`
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
      ? currentFileName.replace('.blf', '')
      : `busqueda-bloques-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.blf`,
          types: [{
            description: 'Archivos de Funciones Hash',
            accept: {
              'application/json': ['.blf']
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

        const finalFileName = fileName.endsWith('.blf') ? fileName : `${fileName}.blf`;
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
              description: 'Archivos de Funciones Hash',
              accept: {
                'application/json': ['.blf']
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
          input.accept = '.blf';
          
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

        if (!file || !fileName.endsWith('.blf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .blf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'BLF') {
          showMessage('Archivo no válido: no es un archivo BLF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'bloques-search') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        setStructureSize(loadedData.configuration.structureSize);
        setKeySize(loadedData.configuration.keySize);
        setHashFunction(loadedData.configuration.hashFunction || 'secuencial');
        setCollisionMethod(loadedData.configuration.collisionMethod || 'secuencial');
        
        // Si hay estructura creada, guardar también la configuración y bloques
        if (loadedData.data.isStructureCreated) {
          setCurrentStructureConfig({
            structureSize: loadedData.configuration.structureSize,
            keySize: loadedData.configuration.keySize,
            hashFunction: loadedData.configuration.hashFunction || 'secuencial',
            collisionMethod: loadedData.configuration.collisionMethod || 'secuencial',
            numBlocks: loadedData.configuration.numBlocks,
            recordsPerBlock: loadedData.configuration.recordsPerBlock
          });
        }
        
        // Cargar datos
        setMemoryArray(loadedData.data.memoryArray || []);
        setBlocks(loadedData.data.blocks || []); // Cargar estructura de bloques
        setIsStructureCreated(loadedData.data.isStructureCreated || false);
        
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
  const updateStructureVisualization = () => {
    // Esta función ya no necesita hacer nada porque renderizamos directamente desde blocks
    // Se mantiene para compatibilidad con el código existente
  };

  const handleCreateStructure = () => {
    // Verificar cambios no guardados
    if (hasUnsavedChanges) {
      const confirm = window.confirm('¿Está seguro de crear una nueva estructura? Se perderán los cambios no guardados.');
      if (!confirm) return;
    }

    if (structureSize >= 10 && keySize >= 2) {
      // ===== CALCULAR BLOQUES =====
      // Cantidad de bloques: ceil(sqrt(structureSize))
      const calculatedNumBlocks = calculateNumBlocks(structureSize);
      
      // Registros por bloque: ceil(structureSize / numBlocks)
      const calculatedRecordsPerBlock = calculateRecordsPerBlock(structureSize, calculatedNumBlocks);
      
      // Crear estructura de bloques vacía
      const emptyBlocks = createEmptyBlocks(calculatedNumBlocks, calculatedRecordsPerBlock);
      
      // Actualizar estados de bloques
      setBlocks(emptyBlocks);
      
      // Guardar la configuración actual para la estructura
      setCurrentStructureConfig({
        hashFunction: hashFunction,
        collisionMethod: collisionMethod,
        structureSize: structureSize,
        keySize: keySize,
        numBlocks: calculatedNumBlocks,
        recordsPerBlock: calculatedRecordsPerBlock
      });
      
      setIsStructureCreated(true);
      
      // Crear array plano para visualización (compatibilidad con visualización actual)
      const emptyArray = Array(structureSize).fill(null);
      setMemoryArray(emptyArray);
      
      // Inicializar arreglos anidados vacíos
      setNestedArrays([]);
      
      updateStructureVisualization(emptyArray);
      setHistory([]);
      setHistoryIndex(-1);
      setMessage({ text: '', type: '' });
      setHasUnsavedChanges(true);
      setCurrentFileName(null);
      
      showMessage(
        `Estructura de bloques creada: ${calculatedNumBlocks} bloques con ${calculatedRecordsPerBlock} registros cada uno (Total: ${structureSize} posiciones)`,
        'success'
      );
    }
  };

  const handleInsert = () => {
    if (!insertKey.trim() || !isStructureCreated) return;

    const key = insertKey.trim();
    const formattedKey = formatKey(key);
    
    // Validar clave
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Verificar si la clave ya existe en los bloques
    let keyExists = false;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      if (blocks[blockIndex].includes(formattedKey)) {
        keyExists = true;
        break;
      }
    }
    
    if (keyExists) {
      showMessage('No se aceptan claves repetidas', 'error');
      return;
    }

    // Contar total de elementos insertados
    let totalElements = 0;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      totalElements += blocks[blockIndex].filter(k => k !== null).length;
    }
    
    if (totalElements >= currentStructureConfig.structureSize) {
      showMessage('La estructura está llena', 'error');
      return;
    }

    let newBlocks;
    let newMemoryArray;
    let insertedBlockIndex = -1;
    let insertedPositionInBlock = -1;
    let globalPosition = -1;

    // Si la función es secuencial, ordenar todas las claves
    if (currentStructureConfig.hashFunction === 'secuencial') {
      // Recolectar todas las claves existentes
      const allKeys = [];
      for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        for (let pos = 0; pos < blocks[blockIndex].length; pos++) {
          if (blocks[blockIndex][pos] !== null) {
            allKeys.push(blocks[blockIndex][pos]);
          }
        }
      }
      
      // Agregar la nueva clave
      allKeys.push(formattedKey);
      
      // Ordenar todas las claves de menor a mayor
      allKeys.sort((a, b) => a.localeCompare(b));
      
      // Crear nueva estructura de bloques ordenada
      newBlocks = blocks.map(block => block.map(() => null));
      let keyIndex = 0;
      
      for (let blockIndex = 0; blockIndex < newBlocks.length; blockIndex++) {
        for (let pos = 0; pos < newBlocks[blockIndex].length; pos++) {
          if (keyIndex < allKeys.length) {
            newBlocks[blockIndex][pos] = allKeys[keyIndex];
            if (allKeys[keyIndex] === formattedKey) {
              insertedBlockIndex = blockIndex;
              insertedPositionInBlock = pos;
              globalPosition = (blockIndex * currentStructureConfig.recordsPerBlock) + pos;
            }
            keyIndex++;
          }
        }
      }
      
      // Actualizar array plano para visualización
      newMemoryArray = Array(currentStructureConfig.structureSize).fill(null);
      keyIndex = 0;
      for (let i = 0; i < newMemoryArray.length && keyIndex < allKeys.length; i++) {
        newMemoryArray[i] = allKeys[keyIndex];
        keyIndex++;
      }
    } else {
      // Búsqueda secuencial normal (sin ordenar)
      newBlocks = blocks.map(block => [...block]);
      
      for (let blockIndex = 0; blockIndex < newBlocks.length; blockIndex++) {
        for (let pos = 0; pos < newBlocks[blockIndex].length; pos++) {
          if (newBlocks[blockIndex][pos] === null) {
            newBlocks[blockIndex][pos] = formattedKey;
            insertedBlockIndex = blockIndex;
            insertedPositionInBlock = pos;
            break;
          }
        }
        if (insertedBlockIndex !== -1) break;
      }

      if (insertedBlockIndex === -1) {
        showMessage('Error: No se pudo insertar la clave', 'error');
        return;
      }

      // Actualizar array plano para visualización (mantener compatibilidad)
      newMemoryArray = [...memoryArray];
      globalPosition = (insertedBlockIndex * currentStructureConfig.recordsPerBlock) + insertedPositionInBlock;
      if (globalPosition < newMemoryArray.length) {
        newMemoryArray[globalPosition] = formattedKey;
      }
    }

    // Actualizar bloques y memoria
    setBlocks(newBlocks);
    setMemoryArray(newMemoryArray);
    updateStructureVisualization(newMemoryArray);

    // Agregar al historial
    addToHistory({
      type: 'insert',
      key: formattedKey,
      blockIndex: insertedBlockIndex,
      positionInBlock: insertedPositionInBlock,
      globalPosition: globalPosition,
      previousBlocks: blocks,
      newBlocks: newBlocks,
      previousMemory: memoryArray,
      newMemory: newMemoryArray
    });

    showMessage(
      `Clave "${formattedKey}" insertada en Bloque ${insertedBlockIndex + 1}, Posición ${insertedPositionInBlock + 1} (Posición global: ${globalPosition + 1})`,
      'success'
    );
    
    setInsertKey('');
    markAsChanged();
  };
  const handleSearch = async () => {
    if (!searchKey.trim() || !isStructureCreated || isSimulating) return;

    const key = searchKey.trim();
    const formattedKey = formatKey(key);
    
    // Validar clave
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    setIsSimulating(true);
    setSearchHighlights({ mainMemory: [], nestedArrays: {}, chainElements: {} });

    const delays = [2000, 1500, 1000, 600, 300];
    const delay = delays[simulationSpeed - 1];

    let found = false;
    let foundBlockIndex = -1;
    let foundPositionInBlock = -1;
    let foundGlobalPosition = -1;
    let steps = 0;

    // Buscar en cada bloque secuencialmente
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      for (let pos = 0; pos < blocks[blockIndex].length; pos++) {
        steps++;
        const globalPos = (blockIndex * currentStructureConfig.recordsPerBlock) + pos;
        
        // Iluminar posición actual
        if (globalPos < memoryArray.length) {
          setSearchHighlights({
            mainMemory: [globalPos],
            nestedArrays: {},
            chainElements: {}
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));

        if (blocks[blockIndex][pos] === formattedKey) {
          found = true;
          foundBlockIndex = blockIndex;
          foundPositionInBlock = pos;
          foundGlobalPosition = globalPos;
          break;
        }
      }
      if (found) break;
    }

    // Limpiar highlights
    setSearchHighlights({ mainMemory: [], nestedArrays: {}, chainElements: {} });

    if (found) {
      showMessage(
        `Clave "${formattedKey}" encontrada en Bloque ${foundBlockIndex + 1}, Posición ${foundPositionInBlock + 1} ` +
        `(Posición global: ${foundGlobalPosition + 1}) después de ${steps} pasos`,
        'success'
      );
    } else {
      showMessage(
        `Clave "${formattedKey}" no encontrada después de buscar en ${steps} posiciones`,
        'error'
      );
    }

    setIsSimulating(false);
  };

  const handleDelete = () => {
    if (!deleteKey.trim() || !isStructureCreated) return;

    const key = deleteKey.trim();
    const formattedKey = formatKey(key);
    
    // Validar clave
    const validation = validateKey(formattedKey);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Buscar la clave en los bloques
    let found = false;
    let foundBlockIndex = -1;
    let foundPositionInBlock = -1;
    let foundGlobalPosition = -1;

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const posInBlock = blocks[blockIndex].indexOf(formattedKey);
      if (posInBlock !== -1) {
        found = true;
        foundBlockIndex = blockIndex;
        foundPositionInBlock = posInBlock;
        foundGlobalPosition = (blockIndex * currentStructureConfig.recordsPerBlock) + posInBlock;
        break;
      }
    }

    if (!found) {
      showMessage(`La clave "${formattedKey}" no se encuentra en la estructura`, 'error');
      return;
    }

    // Guardar estado anterior
    const previousBlocks = blocks.map(block => [...block]);
    const previousMemory = [...memoryArray];
    
    let newBlocks;
    let newArray;
    
    // Si la función es secuencial, reorganizar las claves
    if (currentStructureConfig.hashFunction === 'secuencial') {
      // Recolectar todas las claves existentes excepto la eliminada
      const allKeys = [];
      for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        for (let pos = 0; pos < blocks[blockIndex].length; pos++) {
          if (blocks[blockIndex][pos] !== null && blocks[blockIndex][pos] !== formattedKey) {
            allKeys.push(blocks[blockIndex][pos]);
          }
        }
      }
      
      // Las claves ya deben estar ordenadas, pero aseguramos el orden
      allKeys.sort((a, b) => a.localeCompare(b));
      
      // Crear nueva estructura de bloques ordenada
      newBlocks = blocks.map(block => block.map(() => null));
      let keyIndex = 0;
      
      for (let blockIndex = 0; blockIndex < newBlocks.length; blockIndex++) {
        for (let pos = 0; pos < newBlocks[blockIndex].length; pos++) {
          if (keyIndex < allKeys.length) {
            newBlocks[blockIndex][pos] = allKeys[keyIndex];
            keyIndex++;
          }
        }
      }
      
      // Actualizar array plano para visualización
      newArray = Array(currentStructureConfig.structureSize).fill(null);
      keyIndex = 0;
      for (let i = 0; i < newArray.length && keyIndex < allKeys.length; i++) {
        newArray[i] = allKeys[keyIndex];
        keyIndex++;
      }
    } else {
      // Eliminación normal (sin reordenar)
      newBlocks = blocks.map(block => [...block]);
      newBlocks[foundBlockIndex][foundPositionInBlock] = null;
      
      // Actualizar memoryArray para visualización
      newArray = [...memoryArray];
      newArray[foundGlobalPosition] = null;
    }
    
    setBlocks(newBlocks);
    setMemoryArray(newArray);
    updateStructureVisualization(newArray);
    
    // Agregar al historial
    addToHistory({
      type: 'delete',
      key: formattedKey,
      position: foundGlobalPosition,
      previousState: previousMemory,
      newState: newArray,
      previousBlocks: previousBlocks,
      newBlocks: newBlocks
    });

    showMessage(
      `Clave "${formattedKey}" eliminada` + 
      (currentStructureConfig.hashFunction === 'secuencial' ? ' y estructura reorganizada' : ` de Bloque ${foundBlockIndex + 1}, Posición ${foundPositionInBlock + 1}`),
      'success'
    );
    setDeleteKey('');
    markAsChanged();
  };

  // Funciones de deshacer y rehacer
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setMemoryArray(action.previousState);
      updateStructureVisualization(action.previousState);
      
      // Restaurar estado de bloques si existe
      if (action.previousBlocks) {
        setBlocks(action.previousBlocks);
      }
      
      setHistoryIndex(historyIndex - 1);
      showMessage(`Acción ${action.type} deshecha`, 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      setMemoryArray(action.newState);
      updateStructureVisualization(action.newState);
      
      // Restaurar estado de bloques si existe
      if (action.newBlocks) {
        setBlocks(action.newBlocks);
      }
      
      setHistoryIndex(historyIndex + 1);
      showMessage(`Acción ${action.type} rehecha`, 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // Función para renderizar un solo bloque
  const renderBlock = (blockIndex) => {
    if (!blocks[blockIndex]) return null;

    const block = blocks[blockIndex];
    const searchHighlightedPositions = searchHighlights.mainMemory || [];
    
    // Determinar qué posiciones del bloque mostrar
    const positionsToShow = new Set();
    positionsToShow.add(0); // Primera posición del bloque
    if (block.length > 1) {
      positionsToShow.add(block.length - 1); // Última posición del bloque
    }
    
    // Agregar posiciones ocupadas
    block.forEach((value, index) => {
      if (value !== null) {
        positionsToShow.add(index);
      }
    });
    
    // Agregar posiciones resaltadas por búsqueda
    block.forEach((value, index) => {
      const globalPos = (blockIndex * currentStructureConfig.recordsPerBlock) + index;
      if (searchHighlightedPositions.includes(globalPos)) {
        positionsToShow.add(index);
      }
    });
    
    const sortedPositions = Array.from(positionsToShow).sort((a, b) => a - b);
    
    return (
      <div className="block-table" style={{ 
        marginBottom: '20px',
        border: '2px solid #7f8c8d',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div className="table-header" style={{
          backgroundColor: '#34495e',
          borderBottom: '2px solid #7f8c8d'
        }}>
          <span className="header-memory">Bloque {blockIndex + 1}</span>
        </div>
        
        <div className="table-body">
          {sortedPositions.map((posInBlock, arrayIndex) => {
            const value = block[posInBlock];
            const globalPos = (blockIndex * currentStructureConfig.recordsPerBlock) + posInBlock;
            const nextPos = sortedPositions[arrayIndex + 1];
            const hasGap = nextPos !== undefined && (nextPos - posInBlock) > 1;
            
            const isSearchHighlighted = searchHighlightedPositions.includes(globalPos);
            
            return (
              <React.Fragment key={posInBlock}>
                <div className={`table-row ${isSearchHighlighted ? 'highlighted' : ''}`}>
                  <span className="row-number">{globalPos + 1}</span>
                  <span className={`cell-memory ${!value ? 'empty' : ''}`}>
                    {value || '—'}
                  </span>
                </div>
                
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

  // Función para renderizar todos los bloques
  const renderStructureTable = () => {
    if (!isStructureCreated || blocks.length === 0) {
      return null;
    }

    // Determinar qué bloques mostrar
    const blocksToShow = new Set();
    blocksToShow.add(0); // Primer bloque
    if (blocks.length > 1) {
      blocksToShow.add(blocks.length - 1); // Último bloque
    }
    
    // Agregar bloques que tienen datos
    blocks.forEach((block, index) => {
      const hasData = block.some(value => value !== null);
      if (hasData) {
        blocksToShow.add(index);
      }
    });
    
    // Agregar bloques que están siendo resaltados por búsqueda
    const searchHighlightedPositions = searchHighlights.mainMemory || [];
    searchHighlightedPositions.forEach(globalPos => {
      const blockIndex = Math.floor(globalPos / currentStructureConfig.recordsPerBlock);
      if (blockIndex < blocks.length) {
        blocksToShow.add(blockIndex);
      }
    });
    
    const sortedBlocks = Array.from(blocksToShow).sort((a, b) => a - b);
    
    return (
      <div className="structure-table">
        <div className="table-header">
          <span className="header-memory">Memoria</span>
        </div>
        
        <div className="blocks-container" style={{ padding: '10px' }}>
          {sortedBlocks.map((blockIndex, arrayIndex) => {
            const nextBlockIndex = sortedBlocks[arrayIndex + 1];
            const hasGap = nextBlockIndex !== undefined && (nextBlockIndex - blockIndex) > 1;
            
            return (
              <React.Fragment key={blockIndex}>
                {renderBlock(blockIndex)}
                
                {hasGap && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '10px', 
                    color: '#666',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    ⋮
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar tabla de arreglo anidado con highlights de búsqueda
  return (
    <div className="sequential-search-section">
      <div className="section-header">
        <h1>Búsqueda por Bloques</h1>
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
            <label htmlFor="hashFunction">Función Hash</label>
            <select
              id="hashFunction"
              value={hashFunction}
              onChange={(e) => setHashFunction(e.target.value)}
              className="config-select"
            >
              <option value="secuencial">Ninguna (secuencial)</option>
              <option value="mod">Mod</option>
              <option value="cuadrado">Cuadrado</option>
              <option value="truncamiento">Truncamiento</option>
              <option value="plegamiento">Plegamiento</option>
            </select>
            <small>Método para calcular el índice hash</small>
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
              <option value="cuadratica">Cuadrática</option>
              <option value="hashmod">Hash Mod</option>
              <option value="arreglos">Arreglos</option>
              <option value="encadenamiento">Encadenamiento</option>
            </select>
            <small>Método para resolver colisiones</small>
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
            title="Cargar estructura desde archivo .blf"
          >
            <FolderOpen size={18} />
            <span>Abrir</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleUndo}
            disabled={historyIndex < 0}
          >
            <Undo size={18} />
            <span>Deshacer</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
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
                <p><strong>Estructura:</strong> {isStructureCreated ? (
                  `${currentStructureConfig.numBlocks} bloques de ${currentStructureConfig.recordsPerBlock} registros cada uno (Total: ${currentStructureConfig.structureSize} posiciones)`
                ) : (
                  `Tamaño ${structureSize}`
                )}</p>
                <p><strong>Función Mod:</strong> {isStructureCreated ? currentStructureConfig.hashFunction : hashFunction}</p>
                <p><strong>Método de Colisión:</strong> {isStructureCreated ? currentStructureConfig.collisionMethod : collisionMethod}</p>
                <p><strong>Tipo de Clave:</strong> Numérica de {isStructureCreated ? currentStructureConfig.keySize : keySize} dígitos</p>
                <p><strong>Elementos:</strong> {
                  (() => {
                    const count = memoryArray.filter(item => item !== null).length;
                    return `${count}/${isStructureCreated ? currentStructureConfig.structureSize : structureSize}`;
                  })()
                }</p>
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
                    onClick={resetVisualView}
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
                  height: '420px',
                  minHeight: '420px',
                  maxHeight: '420px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
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
                    gap: '40px',
                    alignItems: 'flex-start',
                    padding: '20px',
                    minWidth: 'max-content',
                    userSelect: 'none'
                  }}
                >
                  <div className="main-memory-container">
                    {renderStructureTable()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BloquesSearchSection;