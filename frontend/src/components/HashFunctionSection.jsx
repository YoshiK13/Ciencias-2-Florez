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

function HashFunctionSection({ onNavigate }) {
  // Estados para la configuración
  const [structureSize, setStructureSize] = useState(20);
  const [keySize, setKeySize] = useState(4);
  const [hashFunction, setHashFunction] = useState('mod');
  const [collisionMethod, setCollisionMethod] = useState('secuencial');
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  // Estados para la configuración actual de la estructura creada
  const [currentStructureConfig, setCurrentStructureConfig] = useState({
    hashFunction: 'mod',
    collisionMethod: 'secuencial',
    structureSize: 20,
    keySize: 4
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
    window.hashFunctionCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.hashFunctionCheckUnsavedChanges;
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
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
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

  // Funciones Hash
  const hashFunctions = {
    mod: (key, size) => {
      return parseInt(key) % size;
    },
    cuadrado: (key, size) => {
      const squared = Math.pow(parseInt(key), 2);
      const str = squared.toString();
      
      // Calcular cuántos dígitos tomar según el tamaño de la estructura
      const digitsNeeded = Math.floor(Math.log10(size)) + 1;
      
      // Tomar dígitos centrales hacia la izquierda
      const startIndex = Math.max(0, Math.floor((str.length - digitsNeeded) / 2));
      const extracted = str.substring(startIndex, startIndex + digitsNeeded);
      
      // Sumar 1 al resultado y aplicar módulo para que quepa en la estructura
      return (parseInt(extracted || '0') + 1) % size;
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
      
      // Sumar 1 al resultado y aplicar módulo
      return (parseInt(extracted) + 1) % size;
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
      
      // Sumar 1 al resultado y aplicar módulo
      return (sum + 1) % size;
    }
  };

  // Función para aplicar función hash (usa la configuración actual de la estructura)
  const applyHashFunction = (key) => {
    const activeHashFunction = isStructureCreated ? currentStructureConfig.hashFunction : hashFunction;
    const activeStructureSize = isStructureCreated ? currentStructureConfig.structureSize : structureSize;
    return hashFunctions[activeHashFunction](key, activeStructureSize);
  };

  // Función para generar mensaje detallado de la función hash
  const getHashFunctionMessage = (key, result) => {
    const activeHashFunction = isStructureCreated ? currentStructureConfig.hashFunction : hashFunction;
    const activeStructureSize = isStructureCreated ? currentStructureConfig.structureSize : structureSize;
    
    switch (activeHashFunction) {
      case 'mod':
        return `Hash MOD: ${key} % ${activeStructureSize} = ${result}`;
      
      case 'cuadrado': {
        const squared = Math.pow(parseInt(key), 2);
        const str = squared.toString();
        const digitsNeeded = Math.floor(Math.log10(activeStructureSize)) + 1;
        const startIndex = Math.max(0, Math.floor((str.length - digitsNeeded) / 2));
        const extracted = str.substring(startIndex, startIndex + digitsNeeded);
        const beforeMod = parseInt(extracted || '0') + 1;
        return `Hash Cuadrado: ${key}² = ${squared} → dígitos centrales: ${extracted} → +1 = ${beforeMod} → ${beforeMod} % ${activeStructureSize} = ${result}`;
      }
      
      case 'truncamiento': {
        const positions = [0, 2];
        let extracted = '';
        positions.forEach(pos => {
          if (pos < key.length) {
            extracted += key[pos];
          }
        });
        if (extracted === '') extracted = '0';
        const beforeMod = parseInt(extracted) + 1;
        return `Hash Truncamiento: posiciones [${positions.join(', ')}] de ${key} = ${extracted} → +1 = ${beforeMod} → ${beforeMod} % ${activeStructureSize} = ${result}`;
      }
      
      case 'plegamiento': {
        const partSize = Math.floor(key.length / 2);
        let parts = [];
        let sum = 0;
        
        for (let i = 0; i < key.length; i += partSize) {
          const part = key.substring(i, i + partSize);
          if (part.length > 0) {
            parts.push(part);
            sum += parseInt(part);
          }
        }
        const beforeMod = sum + 1;
        return `Hash Plegamiento: ${parts.length} partes [${parts.join(', ')}] → suma = ${sum} → +1 = ${beforeMod} → ${beforeMod} % ${activeStructureSize} = ${result}`;
      }
      
      default:
        return `Hash: ${result}`;
    }
  };

  // Métodos de resolución de colisiones (usa la configuración actual de la estructura)
  const resolveCollision = (originalIndex, key, attempt = 0) => {
    const activeCollisionMethod = isStructureCreated ? currentStructureConfig.collisionMethod : collisionMethod;
    const activeStructureSize = isStructureCreated ? currentStructureConfig.structureSize : structureSize;
    
    switch (activeCollisionMethod) {
      case 'secuencial':
        return (originalIndex + attempt) % activeStructureSize;
      case 'cuadratica':
        return (originalIndex + Math.pow(attempt, 2)) % activeStructureSize;
      case 'hashmod': {
        const secondHash = 7 - (parseInt(key) % 7);
        return (originalIndex + attempt * secondHash) % activeStructureSize;
      }
      case 'arreglos':
        // Para arreglos, mantenemos el índice original y manejamos listas
        return originalIndex;
      case 'encadenamiento':
        // Similar a arreglos, mantenemos el índice original
        return originalIndex;
      default:
        return originalIndex;
    }
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'HHF', // Hash Hash File
      version: '1.0',
      sectionType: 'hash-function',
      sectionName: 'Funciones Hash',
      timestamp: new Date().toISOString(),
      configuration: {
        structureSize: structureSize,
        keySize: keySize,
        hashFunction: hashFunction,
        collisionMethod: collisionMethod
      },
      data: {
        memoryArray: [...memoryArray],
        isStructureCreated: isStructureCreated
      },
      metadata: {
        elementsCount: memoryArray.filter(item => item !== null).length,
        description: `Estructura hash con función ${hashFunction} y resolución ${collisionMethod}`
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
      ? currentFileName.replace('.hhf', '')
      : `funciones-hash-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.hhf`,
          types: [{
            description: 'Archivos de Funciones Hash',
            accept: {
              'application/json': ['.hhf']
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

        const finalFileName = fileName.endsWith('.hhf') ? fileName : `${fileName}.hhf`;
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
                'application/json': ['.hhf']
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
          input.accept = '.hhf';
          
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

        if (!file || !fileName.endsWith('.hhf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .hhf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'HHF') {
          showMessage('Archivo no válido: no es un archivo HHF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'hash-function') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        setStructureSize(loadedData.configuration.structureSize);
        setKeySize(loadedData.configuration.keySize);
        setHashFunction(loadedData.configuration.hashFunction);
        setCollisionMethod(loadedData.configuration.collisionMethod);
        
        // Si hay estructura creada, guardar también la configuración actual
        if (loadedData.data.isStructureCreated) {
          setCurrentStructureConfig({
            hashFunction: loadedData.configuration.hashFunction,
            collisionMethod: loadedData.configuration.collisionMethod,
            structureSize: loadedData.configuration.structureSize,
            keySize: loadedData.configuration.keySize
          });
        }
        
        // Cargar datos
        setMemoryArray(loadedData.data.memoryArray || []);
        setIsStructureCreated(loadedData.data.isStructureCreated || false);
        
        // Actualizar visualización
        if (loadedData.data.isStructureCreated) {
          const newStructure = Array(loadedData.configuration.structureSize).fill(null).map((_, index) => ({
            position: index + 1, // Numeración desde 1
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
      position: index + 1, // Numeración desde 1
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
      // Guardar la configuración actual para la estructura
      setCurrentStructureConfig({
        hashFunction: hashFunction,
        collisionMethod: collisionMethod,
        structureSize: structureSize,
        keySize: keySize
      });
      
      setIsStructureCreated(true);
      const emptyArray = Array(structureSize).fill(null);
      setMemoryArray(emptyArray);
      updateStructureVisualization(emptyArray);
      setHistory([]);
      setHistoryIndex(-1);
      setMessage({ text: '', type: '' });
      setHasUnsavedChanges(true);
      setCurrentFileName(null);
      showMessage(`Estructura hash creada con función ${hashFunction} y resolución de colisiones ${collisionMethod}`, 'success');
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

    // Verificar si la clave ya existe
    if (memoryArray.includes(formattedKey)) {
      showMessage('No se aceptan claves repetidas', 'error');
      return;
    }

    // Calcular posición hash
    const hashIndex = applyHashFunction(formattedKey);
    const hashMessage = getHashFunctionMessage(formattedKey, hashIndex);
    let finalIndex = hashIndex;
    let attempts = 0;
    
    // Resolver colisiones
    while (memoryArray[finalIndex] !== null && attempts < structureSize) {
      attempts++;
      finalIndex = resolveCollision(hashIndex, formattedKey, attempts);
      
      if (finalIndex < 0 || finalIndex >= structureSize) {
        finalIndex = finalIndex % structureSize;
      }
    }

    if (attempts >= structureSize) {
      showMessage('La estructura está llena', 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = [...memoryArray];
    
    // Insertar elemento
    const newArray = [...memoryArray];
    newArray[finalIndex] = formattedKey;
    setMemoryArray(newArray);
    updateStructureVisualization(newArray);
    
    // Agregar al historial
    addToHistory({
      type: 'insert',
      key: formattedKey,
      position: finalIndex,
      hashIndex: hashIndex,
      attempts: attempts,
      previousState: previousState,
      newState: newArray
    });

    const collisionMsg = attempts > 0 ? ` (${attempts} colisiones resueltas)` : '';
    showMessage(`${hashMessage} → Insertada en posición ${finalIndex + 1}${collisionMsg}`, 'success');
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
    let found = false;
    let position = -1;
    let steps = 0;

    // Calcular posición hash inicial
    const hashIndex = applyHashFunction(formattedKey);
    let currentIndex = hashIndex;
    
    do {
      steps++;
      
      // Destacar posición actual
      const highlightedStructure = structureData.map((item, index) => ({
        ...item,
        isHighlighted: index === currentIndex
      }));
      setStructureData(highlightedStructure);

      // Pausa para visualización
      await new Promise(resolve => setTimeout(resolve, 1000 / simulationSpeed));

      if (memoryArray[currentIndex] === formattedKey) {
        found = true;
        position = currentIndex;
        break;
      } else if (memoryArray[currentIndex] === null) {
        // Posición vacía, la clave no existe
        break;
      }

      // Aplicar resolución de colisiones para siguiente posición
      currentIndex = resolveCollision(hashIndex, formattedKey, steps);
      if (currentIndex < 0 || currentIndex >= structureSize) {
        currentIndex = currentIndex % structureSize;
      }

    } while (steps < structureSize && currentIndex !== hashIndex);

    // Quitar destacado
    const finalStructure = structureData.map(item => ({
      ...item,
      isHighlighted: false
    }));
    setStructureData(finalStructure);

    // Mostrar resultado
    if (found) {
      showMessage(`Clave "${formattedKey}" encontrada en la posición ${position + 1} después de ${steps} comparaciones`, 'success');
    } else {
      showMessage(`Clave "${formattedKey}" no se encuentra en la estructura después de ${steps} comparaciones`, 'error');
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

    // Buscar la clave en la estructura
    const keyIndex = memoryArray.indexOf(formattedKey);
    if (keyIndex === -1) {
      showMessage(`La clave "${formattedKey}" no se encuentra en la estructura`, 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = [...memoryArray];
    
    // Eliminar clave
    const newArray = [...memoryArray];
    newArray[keyIndex] = null;
    setMemoryArray(newArray);
    updateStructureVisualization(newArray);
    
    // Agregar al historial
    addToHistory({
      type: 'delete',
      key: formattedKey,
      position: keyIndex,
      previousState: previousState,
      newState: newArray
    });

    showMessage(`Clave "${formattedKey}" eliminada de la posición ${keyIndex + 1}`, 'success');
    setDeleteKey('');
    markAsChanged();
  };

  // Funciones de deshacer y rehacer
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setMemoryArray(action.previousState);
      updateStructureVisualization(action.previousState);
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
      setHistoryIndex(historyIndex + 1);
      showMessage(`Acción ${action.type} rehecha`, 'info');
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
      <div className="structure-table">
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
        <h1>Funciones Hash</h1>
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
            title="Cargar estructura desde archivo .hhf"
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
                <p><strong>Estructura:</strong> Tamaño {isStructureCreated ? currentStructureConfig.structureSize : structureSize}</p>
                <p><strong>Función Hash:</strong> {isStructureCreated ? currentStructureConfig.hashFunction : hashFunction}</p>
                <p><strong>Resolución de Colisiones:</strong> {isStructureCreated ? currentStructureConfig.collisionMethod : collisionMethod}</p>
                <p><strong>Tipo de Clave:</strong> Numérica de {isStructureCreated ? currentStructureConfig.keySize : keySize} dígitos</p>
                <p><strong>Elementos:</strong> {memoryArray.filter(item => item !== null).length}/{isStructureCreated ? currentStructureConfig.structureSize : structureSize}</p>
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

export default HashFunctionSection;