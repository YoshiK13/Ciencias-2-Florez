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
  Trash2
} from 'lucide-react';
import '../styles/SequentialSearchSection.css';

function DigitalSearchSection({ onNavigate }) {
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [insertKey, setInsertKey] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  
  // Estados de simulación
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Estados para visualización de búsqueda
  const [searchPath, setSearchPath] = useState([]); // Camino actual de búsqueda
  const [currentSearchNode, setCurrentSearchNode] = useState(null); // Nodo actual en búsqueda
  const [searchResult, setSearchResult] = useState(null); // Resultado de búsqueda
  
  // Estado para los datos de la estructura
  const [keysData, setKeysData] = useState([]); // Array de objetos {key, ascii, binary}
  const [treeStructure, setTreeStructure] = useState({}); // Árbol binario
  const [structureSize, setStructureSize] = useState(20);
  const [keySize, setKeySize] = useState(1); // Cambio a 1 para letras individuales
  const [isStructureCreated, setIsStructureCreated] = useState(true); // Ahora siempre está creado
  
  // Estados para mensajes informativos
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Sistema de historial para deshacer/rehacer (últimas 15 acciones)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para zoom y pan del árbol
  const [treeZoom, setTreeZoom] = useState(1.0); // 1.0 = 100% (escala de 0.5 a 3.0)
  const [baseScale, setBaseScale] = useState(1.0); // Escala base calculada automáticamente
  const [treePan, setTreePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const treeContainerRef = React.useRef(null);
  
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
    window.digitalSearchCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.digitalSearchCheckUnsavedChanges;
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

  // Función para mostrar mensajes (permanentes hasta nueva acción)
  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  // Función para manejar entrada de solo letras
  const handleLetterInput = (e, setter) => {
    const value = e.target.value;
    // Solo permitir letras y convertir a mayúsculas
    const letterValue = value.replace(/[^A-Za-z]/g, '').toUpperCase();
    // Limitar a 1 carácter
    const limitedValue = letterValue.slice(0, 1);
    setter(limitedValue);
  };

  // Función para convertir carácter a número (A=1, Z=26)
  const charToNumber = (char) => {
    return char.charCodeAt(0) - 64; // A=65 en ASCII, así que 65-64=1
  };

  // Función para convertir número a binario de 5 bits
  const numberToBinary = (num) => {
    return num.toString(2).padStart(5, '0');
  };

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'DBF', // Digital Binary File
      version: '1.0',
      sectionType: 'digital-search',
      sectionName: 'Árboles Digitales',
      timestamp: new Date().toISOString(),
      configuration: {
        structureSize: structureSize,
        keySize: keySize
      },
      data: {
        keysData: [...keysData],
        treeStructure: {...treeStructure},
        isStructureCreated: isStructureCreated
      },
      metadata: {
        elementsCount: keysData.length,
        description: `Árbol digital con ${keysData.length} elementos`
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
      ? currentFileName.replace('.dbf', '')
      : `busqueda-digital-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.dbf`,
          types: [{
            description: 'Archivos de Búsqueda Digital',
            accept: {
              'application/json': ['.dbf']
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

        const finalFileName = fileName.endsWith('.dbf') ? fileName : `${fileName}.dbf`;
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
              description: 'Archivos de Búsqueda Digital',
              accept: {
                'application/json': ['.dbf']
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
          input.accept = '.dbf';
          
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

        if (!file || !fileName.endsWith('.dbf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .dbf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'DBF') {
          showMessage('Archivo no válido: no es un archivo DBF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'digital-search') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        setStructureSize(loadedData.configuration.structureSize);
        setKeySize(loadedData.configuration.keySize);
        
        // Cargar datos
        setKeysData(loadedData.data.keysData || []);
        setTreeStructure(loadedData.data.treeStructure || {});
        setIsStructureCreated(loadedData.data.isStructureCreated || true);

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

  // Función para crear un nuevo árbol (limpiar todo)
  const handleNewTree = () => {
    const performNew = () => {
      // Limpiar todos los datos
      setKeysData([]);
      setTreeStructure({});
      setIsStructureCreated(false);
      setInsertKey('');
      setSearchKey('');
      setDeleteKey('');
      
      // Limpiar historial
      setHistory([]);
      setHistoryIndex(-1);
      
      // Limpiar estados de búsqueda
      setSearchPath([]);
      setCurrentSearchNode(null);
      setSearchResult(null);
      
      // Marcar como sin cambios y sin nombre de archivo
      setHasUnsavedChanges(false);
      setCurrentFileName(null);
      
      showMessage('Árbol limpiado. Puede crear una nueva estructura.', 'success');
    };

    // Si hay cambios sin guardar, preguntar primero
    if (hasUnsavedChanges) {
      checkForUnsavedChanges(null, performNew);
    } else {
      performNew();
    }
  };

  // Función para validar la clave (letra única)
  const validateKey = (key) => {
    // Verificar que sea solo una letra
    if (!/^[A-Z]$/.test(key)) {
      return { isValid: false, message: 'La clave debe ser una letra mayúscula' };
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

  // Función para insertar una clave en el árbol digital (método de colisión)
  const insertIntoTree = (key, binaryCode, currentTree) => {
    const newTree = { ...currentTree };
    
    // Si el árbol está vacío, la primera clave va en la raíz
    if (Object.keys(newTree).length === 0) {
      newTree['root'] = {
        key: key,
        path: '',
        level: 0
      };
      return newTree;
    }
    
    // Si ya hay elementos, insertar según colisiones y código binario
    let currentPath = '';
    let currentNode = 'root';
    let bitIndex = 0;
    
    // Navegar el árbol siguiendo el código binario hasta encontrar un lugar libre
    while (newTree[currentNode] && newTree[currentNode].key !== null) {
      // Hay colisión, seguir navegando según el bit actual
      const bit = binaryCode[bitIndex];
      const childPath = currentPath + bit;
      const childNode = currentNode === 'root' ? bit : currentNode + '-' + bit;
      
      if (!newTree[childNode]) {
        // Encontramos un espacio libre, insertar aquí
        newTree[childNode] = {
          key: key,
          path: childPath,
          level: bitIndex + 1,
          bit: bit
        };
        
        return newTree;
      }
      
      // El nodo hijo existe, seguir navegando
      currentPath = childPath;
      currentNode = childNode;
      bitIndex++;
      
      // Si llegamos al final del código binario (5 bits) y aún hay colisión
      if (bitIndex >= 5) {
        console.error('No se puede insertar: código binario agotado');
        return currentTree;
      }
    }
    
    return newTree;
  };

  // Función para construir árbol desde cero (sin depender del estado actual)
  const buildTreeFromScratch = (keysArray) => {
    let newTree = {};
    
    keysArray.forEach(item => {
      newTree = insertIntoTree(item.key, item.binary, newTree);
    });
    
    return newTree;
  };

  const handleInsert = () => {
    if (!insertKey.trim()) return;

    const key = insertKey.trim().toUpperCase();
    
    // Validar clave (letra única)
    const validation = validateKey(key);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Verificar si la clave ya existe
    if (keysData.some(item => item.key === key)) {
      showMessage('No se aceptan claves repetidas', 'error');
      return;
    }

    // Obtener número (A=1, Z=26) y binario de 5 bits
    const number = charToNumber(key);
    const binary = numberToBinary(number);

    // Guardar estado anterior para el historial
    const previousKeysData = [...keysData];
    const previousTree = { ...treeStructure };
    
    // Agregar a la tabla de claves
    const newKeysData = [...keysData, { key, number, binary }];
    setKeysData(newKeysData);

    // Insertar en el árbol
    const newTree = insertIntoTree(key, binary, treeStructure);
    setTreeStructure(newTree);
    
    // Agregar al historial
    addToHistory({
      type: 'insert',
      key: key,
      previousState: { keysData: previousKeysData, tree: previousTree },
      newState: { keysData: newKeysData, tree: newTree }
    });

    showMessage(`Clave "${key}" insertada (Número: ${number}, Binario: ${binary})`, 'success');
    setInsertKey('');
    markAsChanged();
  };

  const handleSearch = async () => {
    if (!searchKey.trim() || isSimulating) return;

    const key = searchKey.trim().toUpperCase();
    
    // Validar clave (letra única)
    const validation = validateKey(key);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    setIsSimulating(true);
    setSearchPath([]);
    setCurrentSearchNode(null);
    setSearchResult(null);

    // Obtener código binario de la clave
    const number = charToNumber(key);
    const binary = numberToBinary(number);

    // Simular el recorrido del árbol siguiendo el método de colisión
    let currentNode = 'root';
    let currentPath = '';
    const pathArray = ['root'];
    let bitIndex = 0;
    
    showMessage(`Buscando "${key}" (Número: ${number}, Binario: ${binary})...`, 'info');
    
    // Verificar si el árbol tiene elementos
    if (!treeStructure['root']) {
      setSearchResult('not-found');
      showMessage(`Clave "${key}" no encontrada: árbol vacío`, 'error');
      setIsSimulating(false);
      
      setTimeout(() => {
        setSearchPath([]);
        setCurrentSearchNode(null);
        setSearchResult(null);
      }, 2000);
      return;
    }
    
    // Actualizar visualización inicial (raíz)
    setSearchPath([...pathArray]);
    setCurrentSearchNode(currentNode);
    await new Promise(resolve => setTimeout(resolve, 800 / simulationSpeed));
    
    // Verificar si la clave está en la raíz
    if (treeStructure[currentNode].key === key) {
      setSearchResult('found');
      showMessage(`¡Clave "${key}" encontrada en la raíz! (Número: ${number}, Binario: ${binary})`, 'success');
      setIsSimulating(false);
      
      setTimeout(() => {
        setSearchPath([]);
        setCurrentSearchNode(null);
        setSearchResult(null);
      }, 3000);
      return;
    }
    
    // Navegar el árbol siguiendo el código binario
    while (bitIndex < 5) {
      const bit = binary[bitIndex];
      const childPath = currentPath + bit;
      const childNode = currentNode === 'root' ? bit : currentNode + '-' + bit;
      
      // Verificar si el nodo hijo existe
      if (!treeStructure[childNode]) {
        setSearchResult('not-found');
        showMessage(`Clave "${key}" no encontrada en el árbol`, 'error');
        setIsSimulating(false);
        
        setTimeout(() => {
          setSearchPath([]);
          setCurrentSearchNode(null);
          setSearchResult(null);
        }, 2000);
        return;
      }
      
      // Actualizar visualización
      pathArray.push(childNode);
      setSearchPath([...pathArray]);
      setCurrentSearchNode(childNode);
      
      // Pausa para visualización
      await new Promise(resolve => setTimeout(resolve, 800 / simulationSpeed));
      
      // Verificar si encontramos la clave
      if (treeStructure[childNode].key === key) {
        setSearchResult('found');
        showMessage(`¡Clave "${key}" encontrada! (Número: ${number}, Binario: ${binary})`, 'success');
        setIsSimulating(false);
        
        setTimeout(() => {
          setSearchPath([]);
          setCurrentSearchNode(null);
          setSearchResult(null);
        }, 3000);
        return;
      }
      
      // Continuar navegando
      currentPath = childPath;
      currentNode = childNode;
      bitIndex++;
    }
    
    // Si llegamos aquí, no encontramos la clave
    setSearchResult('not-found');
    showMessage(`Clave "${key}" no se encuentra en el árbol`, 'error');
    setIsSimulating(false);
    
    setTimeout(() => {
      setSearchPath([]);
      setCurrentSearchNode(null);
      setSearchResult(null);
    }, 3000);
  };

  const handleDelete = () => {
    if (!deleteKey.trim()) return;

    const key = deleteKey.trim().toUpperCase();
    
    // Validar clave (letra única)
    const validation = validateKey(key);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Buscar la clave en la estructura
    const keyIndex = keysData.findIndex(item => item.key === key);
    if (keyIndex === -1) {
      showMessage(`La clave "${key}" no se encuentra en el árbol`, 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousKeysData = [...keysData];
    const previousTree = { ...treeStructure };
    
    // Eliminar clave de la tabla
    const newKeysData = keysData.filter(item => item.key !== key);
    setKeysData(newKeysData);

    // Reconstruir el árbol completamente desde cero sin esta clave
    const newTree = buildTreeFromScratch(newKeysData);
    setTreeStructure(newTree);
    
    // Agregar al historial
    addToHistory({
      type: 'delete',
      key: key,
      previousState: { keysData: previousKeysData, tree: previousTree },
      newState: { keysData: newKeysData, tree: newTree }
    });

    showMessage(`Clave "${key}" eliminada del árbol`, 'success');
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

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setKeysData(action.previousState.keysData);
      setTreeStructure(action.previousState.tree);
      setHistoryIndex(historyIndex - 1);
      showMessage(`${getActionName(action.type)} deshecha`, 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      setKeysData(action.newState.keysData);
      setTreeStructure(action.newState.tree);
      setHistoryIndex(historyIndex + 1);
      showMessage(`${getActionName(action.type)} rehecha`, 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // ===== SISTEMA DE ZOOM DESDE CERO =====
  // Zoom con rueda del mouse desactivado - se usa solo el control manual
  
  // ===== FIN SISTEMA DE ZOOM =====

  // Funciones para pan del árbol
  const handleTreeMouseDown = (e) => {
    e.preventDefault();
    if (e.button === 0) { // Solo botón izquierdo
      setIsDragging(true);
      setDragStart({
        x: e.clientX - treePan.x,
        y: e.clientY - treePan.y
      });
    }
  };

  const handleTreeMouseMove = (e) => {
    e.preventDefault();
    if (isDragging) {
      setTreePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleTreeMouseUp = () => {
    setIsDragging(false);
  };

  const handleTreeMouseLeave = () => {
    setIsDragging(false);
  };

  // Calcular escala base óptima basada en dimensiones del árbol
  const calculateOptimalBaseScale = React.useCallback(() => {
    if (Object.keys(treeStructure).length === 0 || !treeContainerRef.current) {
      return 1.0;
    }

    const containerWidth = treeContainerRef.current.clientWidth;
    const containerHeight = treeContainerRef.current.clientHeight;

    const maxLevel = Math.max(...Object.values(treeStructure).map(node => node.level));
    const levelHeight = 100;
    const treeHeight = (maxLevel + 1) * levelHeight + 100;

    const leafCount = Object.values(treeStructure).filter(node => node.isLeaf).length;
    const MIN_HORIZONTAL_SPACING = 120;
    const estimatedTreeWidth = Math.max(1200, leafCount * MIN_HORIZONTAL_SPACING + 400);

    const widthScale = (containerWidth * 0.90) / estimatedTreeWidth;
    const heightScale = (containerHeight * 0.90) / treeHeight;

    let optimalScale = Math.min(widthScale, heightScale);

    if (containerWidth < 600) {
      optimalScale = optimalScale * 1.2;
    } else if (containerWidth < 900) {
      optimalScale = optimalScale * 1.15;
    } else {
      optimalScale = optimalScale * 1.0;
    }

    return Math.max(0.3, Math.min(2.5, optimalScale));
  }, [treeStructure]);

  // Ajustar escala base automáticamente cuando se crea o modifica el árbol, o cuando cambia el tamaño del contenedor
  React.useEffect(() => {
    if (Object.keys(treeStructure).length > 0) {
      const optimalScale = calculateOptimalBaseScale();
      setBaseScale(optimalScale);
      setTreeZoom(1.0); // Resetear zoom del usuario a 100%
      setTreePan({ x: 0, y: 0 });
    }
  }, [treeStructure, calculateOptimalBaseScale]);

  // Observar cambios en el tamaño del contenedor para recalcular la escala adaptativa
  React.useEffect(() => {
    if (!treeContainerRef.current || Object.keys(treeStructure).length === 0) return;

    const resizeObserver = new ResizeObserver(() => {
      // Recalcular escala cuando cambie el tamaño del contenedor (ej: al cerrar/abrir sidebar)
      const optimalScale = calculateOptimalBaseScale();
      setBaseScale(optimalScale);
      setTreeZoom(1.0); // Resetear zoom del usuario a 100%
      setTreePan({ x: 0, y: 0 });
    });

    resizeObserver.observe(treeContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [treeStructure, calculateOptimalBaseScale]);

  const resetTreeView = () => {
    setTreeZoom(1.0); // Resetear a 100%
    setTreePan({ x: 0, y: 0 });
  };

  // Función para renderizar la tabla de claves
  const renderKeysTable = () => {
    if (keysData.length === 0) {
      return (
        <div className="empty-keys-table">
          <p>No hay claves insertadas aún</p>
        </div>
      );
    }

    return (
      <div className="keys-structure-table">
        <div className="keys-table-header">
          <span className="header-col">Clave</span>
          <span className="header-col">Número</span>
          <span className="header-col">Código Binario (5 bits)</span>
        </div>
        
        <div className="keys-table-body">
          {keysData.map((item, index) => (
            <div key={index} className="keys-table-row">
              <span className="keys-cell key-cell">{item.key}</span>
              <span className="keys-cell ascii-cell">{item.number}</span>
              <span className="keys-cell binary-cell">{item.binary}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para renderizar el árbol digital con visualización gráfica
  const renderBinaryTree = () => {
    if (Object.keys(treeStructure).length === 0) {
      return (
        <div className="empty-tree">
          <p>El árbol se mostrará aquí cuando agregues claves</p>
        </div>
      );
    }

    // Obtener todos los nodos y organizarlos
    const nodes = Object.entries(treeStructure).map(([id, node]) => ({
      id,
      ...node
    }));

    // Calcular dimensiones
    const maxLevel = Math.max(...nodes.map(n => n.level));
    const levelHeight = 100;
    const nodeRadius = 30;
    const svgHeight = (maxLevel + 1) * levelHeight + 100;
    
    // ======= ALGORITMO: POSICIONAMIENTO POR SUBTREE WIDTH =======
    // Sistema que calcula el ancho de cada subárbol recursivamente
    
    const MIN_HORIZONTAL_SPACING = 100; // Espacio mínimo entre nodos hermanos
    
    // Clase para almacenar información de ancho de subárbol
    class TreeNode {
      constructor(data, id) {
        this.data = data;
        this.id = id;
        this.left = null;
        this.right = null;
        this.width = 1; // Ancho en "unidades" (hojas)
        this.x = 0;
        this.y = 0;
      }
    }
    
    // Construir árbol de objetos TreeNode desde treeStructure
    const buildTreeObjects = (nodeId) => {
      const nodeData = treeStructure[nodeId];
      if (!nodeData) return null;
      
      const node = new TreeNode(nodeData, nodeId);
      
      // Calcular IDs de hijos según la estructura
      let leftId, rightId;
      if (nodeId === 'root') {
        leftId = '0';
        rightId = '1';
      } else {
        // Para nodos como '0', '1', '0-0', etc.
        leftId = nodeId + '-0';
        rightId = nodeId + '-1';
      }
      
      node.left = buildTreeObjects(leftId);
      node.right = buildTreeObjects(rightId);
      
      return node;
    };
    
    // Calcular el ancho de cada subárbol (número de hojas o nodos terminales)
    const calculateSubtreeWidth = (node) => {
      if (!node) return 0;
      
      // Si no tiene hijos, su ancho es 1
      if (!node.left && !node.right) {
        node.width = 1;
        return 1;
      }
      
      // Si es nodo interno, su ancho es la suma de los anchos de sus hijos
      const leftWidth = calculateSubtreeWidth(node.left);
      const rightWidth = calculateSubtreeWidth(node.right);
      
      node.width = Math.max(1, leftWidth + rightWidth);
      return node.width;
    };
    
    // Asignar posiciones X basadas en el ancho de subárboles
    const assignPositions = (node, startX = 0) => {
      if (!node) return;
      
      // Si no tiene hijos (nodo terminal con letra o sin letra)
      if (!node.left && !node.right) {
        node.x = startX * MIN_HORIZONTAL_SPACING;
        node.y = node.data.level * levelHeight + 50;
      } else {
        // Nodo interno: calcular posiciones de hijos primero
        const leftWidth = node.left ? node.left.width : 0;
        
        // Hijo izquierdo comienza en startX
        if (node.left) {
          assignPositions(node.left, startX);
        }
        
        // Hijo derecho comienza después del subárbol izquierdo
        if (node.right) {
          assignPositions(node.right, startX + leftWidth);
        }
        
        // Nodo interno: en el centro de sus hijos
        const leftX = node.left ? node.left.x : startX * MIN_HORIZONTAL_SPACING;
        const rightX = node.right ? node.right.x : startX * MIN_HORIZONTAL_SPACING;
        
        node.x = (leftX + rightX) / 2;
        node.y = node.data.level * levelHeight + 50;
      }
    };
    
    // Extraer posiciones en un objeto
    const extractPositions = (node, posMap = {}) => {
      if (!node) return posMap;
      
      posMap[node.id] = { x: node.x, y: node.y };
      
      extractPositions(node.left, posMap);
      extractPositions(node.right, posMap);
      
      return posMap;
    };
    
    // Ejecutar el algoritmo desde la raíz
    const rootNode = buildTreeObjects('root');
    
    const nodePositions = {};
    
    if (rootNode) {
      calculateSubtreeWidth(rootNode);
      assignPositions(rootNode, 0);
      extractPositions(rootNode, nodePositions);
    }
    
    // Calcular dimensiones del canvas basadas en las posiciones reales
    let minX = Infinity, maxX = -Infinity;
    Object.values(nodePositions).forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
    });
    
    const treeWidth = maxX - minX;
    const svgWidth = Math.max(1200, treeWidth + 400);
    const offsetX = (svgWidth - treeWidth) / 2 - minX;
    
    // Aplicar offset para centrar el árbol
    Object.values(nodePositions).forEach((pos) => {
      pos.x += offsetX;
    });

    // Crear aristas
    const edges = [];
    nodes.forEach(node => {
      if (node.id === 'root') return;
      
      // Encontrar el padre basándonos en la estructura del ID
      let parentId;
      let currentBit;
      
      if (node.path.length === 1) {
        // Si el path es de 1 bit, el padre es la raíz
        parentId = 'root';
        currentBit = node.path; // El bit es el path completo ('0' o '1')
      } else {
        // Si el path tiene más bits, el padre es el nodo con el path sin el último bit
        const parentPath = node.path.slice(0, -1);
        currentBit = node.path.slice(-1); // El último bit del path
        
        // Construir el ID del padre desde el path
        if (parentPath.length === 1) {
          parentId = parentPath;
        } else {
          parentId = parentPath.split('').join('-');
        }
      }
      
      // Verificar que existan ambas posiciones antes de crear la arista
      if (nodePositions[parentId] && nodePositions[node.id]) {
        edges.push({
          from: parentId,
          to: node.id,
          x1: nodePositions[parentId].x,
          y1: nodePositions[parentId].y,
          x2: nodePositions[node.id].x,
          y2: nodePositions[node.id].y,
          bit: currentBit,
          isLeft: currentBit === '0'
        });
      }
    });

    return (
      <div className="binary-tree-visualization">
        <div className="tree-header">
          <div className="tree-title-section">
            <h4>Árbol Digital Binario</h4>
            <div className="tree-controls">
              <button 
                className="tree-control-btn"
                onClick={resetTreeView}
                title="Restablecer zoom y posición"
              >
                Resetear Vista
              </button>
              <input
                type="number"
                className="zoom-input"
                value={Math.round(treeZoom * 100)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 50;
                  const clampedValue = Math.max(50, Math.min(300, value));
                  setTreeZoom(clampedValue / 100);
                }}
                min="50"
                max="300"
                step="10"
              />
              <span className="zoom-label">%</span>
            </div>
          </div>
          <div className="tree-legend">
            <div className="legend-item">
              <div className="legend-circle leaf-circle"></div>
              <span>Nodo con clave</span>
            </div>
            <div className="legend-item">
              <svg width="40" height="20">
                <line x1="5" y1="10" x2="35" y2="10" stroke="#4a90e2" strokeWidth="2.5" />
                <text x="20" y="8" fontSize="11" fill="#2c5282" textAnchor="middle" fontWeight="600">0</text>
              </svg>
              <span>Bit 0 (izquierda)</span>
            </div>
            <div className="legend-item">
              <svg width="40" height="20">
                <line x1="5" y1="10" x2="35" y2="10" stroke="#e24a4a" strokeWidth="2.5" />
                <text x="20" y="8" fontSize="11" fill="#742a2a" textAnchor="middle" fontWeight="600">1</text>
              </svg>
              <span>Bit 1 (derecha)</span>
            </div>
          </div>
          <div className="tree-instructions">
            <p><strong>Arrastrar:</strong> Click y mantén para mover | <strong>Zoom:</strong> Control de zoom en la ventana</p>
          </div>
        </div>
        <div 
          ref={treeContainerRef}
          className="tree-svg-container"
          onMouseDown={handleTreeMouseDown}
          onMouseMove={handleTreeMouseMove}
          onMouseUp={handleTreeMouseUp}
          onMouseLeave={handleTreeMouseLeave}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <svg 
            width="100%" 
            height={svgHeight} 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
              transform: `translate(${treePan.x}px, ${treePan.y}px) scale(${baseScale * treeZoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Definir gradientes y efectos */}
            <defs>
              <linearGradient id="leftEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4a90e2" stopOpacity="1" />
              </linearGradient>
              
              <linearGradient id="rightEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e24a4a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e24a4a" stopOpacity="1" />
              </linearGradient>
              
              <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Renderizar aristas */}
            {edges.map((edge, idx) => {
              const midX = (edge.x1 + edge.x2) / 2;
              const midY = (edge.y1 + edge.y2) / 2;
              const labelOffsetX = edge.isLeft ? -15 : 15;
              const labelOffsetY = -10;
              
              const isInSearchPath = searchPath.includes(edge.to);
              const isCurrentEdge = currentSearchNode === edge.to;
              
              let strokeColor = edge.isLeft ? "url(#leftEdgeGradient)" : "url(#rightEdgeGradient)";
              let strokeWidth = "2.5";
              
              if (isCurrentEdge) {
                strokeColor = "#fbbf24";
                strokeWidth = "5";
              } else if (isInSearchPath) {
                strokeColor = "#10b981";
                strokeWidth = "4";
              }
              
              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={edge.x1}
                    y1={edge.y1 + nodeRadius}
                    x2={edge.x2}
                    y2={edge.y2 - nodeRadius}
                    stroke="#f0f0f0"
                    strokeWidth={parseFloat(strokeWidth) + 2}
                    strokeLinecap="round"
                  />
                  
                  <line
                    x1={edge.x1}
                    y1={edge.y1 + nodeRadius}
                    x2={edge.x2}
                    y2={edge.y2 - nodeRadius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  <g>
                    <circle
                      cx={midX + labelOffsetX}
                      cy={midY + labelOffsetY}
                      r="14"
                      fill={isCurrentEdge ? "#fef3c7" : "white"}
                      stroke={isCurrentEdge ? "#fbbf24" : (isInSearchPath ? "#10b981" : (edge.isLeft ? "#4a90e2" : "#e24a4a"))}
                      strokeWidth={isCurrentEdge || isInSearchPath ? "3" : "2"}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    
                    <text
                      x={midX + labelOffsetX}
                      y={midY + labelOffsetY + 5}
                      className="edge-label"
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="700"
                      fill={isCurrentEdge ? "#92400e" : (isInSearchPath ? "#065f46" : (edge.isLeft ? "#2c5282" : "#742a2a"))}
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      {edge.bit}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Renderizar nodos */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const isInSearchPath = searchPath.includes(node.id);
              const isCurrentNode = currentSearchNode === node.id;
              const isResultNode = searchResult && node.id === currentSearchNode;
              
              let nodeFill = "#48bb78"; // Verde para todos los nodos
              let nodeStroke = "#2c7a3d";
              let borderOpacity = "0.3";
              let strokeWidth = "3";
              
              if (isCurrentNode && !isResultNode) {
                nodeFill = "#fbbf24";
                nodeStroke = "#f59e0b";
                borderOpacity = "0.5";
                strokeWidth = "4";
              } else if (isResultNode && searchResult === 'found') {
                nodeFill = "#10b981";
                nodeStroke = "#059669";
                borderOpacity = "0.6";
                strokeWidth = "5";
              } else if (isResultNode && searchResult === 'not-found') {
                nodeFill = "#ef4444";
                nodeStroke = "#dc2626";
                borderOpacity = "0.6";
                strokeWidth = "5";
              } else if (isInSearchPath) {
                nodeFill = "#34d399"; // Verde claro para camino visitado
                nodeStroke = "#10b981";
                borderOpacity = "0.4";
                strokeWidth = "3.5";
              }
              
              return (
                <g key={`node-${node.id}`} className="tree-node-group" filter="url(#nodeShadow)">
                  {/* Círculo exterior (borde) */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 2}
                    fill={nodeStroke}
                    opacity={borderOpacity}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  {/* Efecto de pulso para nodo actual */}
                  {isCurrentNode && !isResultNode && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 8}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        from={nodeRadius + 5}
                        to={nodeRadius + 15}
                        dur="1s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Círculo del nodo */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    className="tree-node-circle leaf-node-circle"
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={strokeWidth}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  {/* Texto del nodo - siempre muestra la letra */}
                  <text
                    x={pos.x}
                    y={pos.y + 7}
                    className="node-text-key"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill="white"
                    style={{ 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {node.key}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="sequential-search-section">
      <div className="section-header">
        <h1>Árboles Digitales</h1>
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
            title="Cargar estructura desde archivo .dbf"
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

          {/* Nuevo Árbol */}
          <div className="control-group">
            <button 
              onClick={handleNewTree}
              className="new-tree-btn"
              title="Limpiar árbol actual y comenzar uno nuevo"
            >
              Nuevo Árbol
            </button>
          </div>

          {/* Insertar Clave */}
          <div className="control-group">
            <label>Insertar Clave (Letra)</label>
            <div className="input-with-button">
              <input
                type="text"
                value={insertKey}
                onChange={(e) => handleLetterInput(e, setInsertKey)}
                placeholder="Ej: A"
                className="operation-input"
                maxLength={1}
              />
              <button 
                onClick={handleInsert}
                className="operation-btn insert-btn"
                disabled={!insertKey.trim()}
              >
                <Plus size={16} />
                Insertar
              </button>
            </div>
          </div>

          {/* Buscar Clave */}
          <div className="control-group">
            <label>Buscar Clave (Letra)</label>
            <div className="input-with-button">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => handleLetterInput(e, setSearchKey)}
                placeholder="Ej: B"
                className="operation-input"
                disabled={isSimulating}
                maxLength={1}
              />
              <button 
                onClick={handleSearch}
                className="operation-btn search-btn"
                disabled={!searchKey.trim() || isSimulating}
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
            <label>Borrar Clave (Letra)</label>
            <div className="input-with-button">
              <input
                type="text"
                value={deleteKey}
                onChange={(e) => handleLetterInput(e, setDeleteKey)}
                placeholder="Ej: C"
                className="operation-input"
                maxLength={1}
              />
              <button 
                onClick={handleDelete}
                className="operation-btn delete-btn"
                disabled={!deleteKey.trim()}
              >
                <Trash2 size={16} />
                Borrar
              </button>
            </div>
          </div>

          {/* Tabla de claves con ASCII y código binario - Ahora debajo de las opciones */}
          {keysData.length > 0 && (
            <div className="keys-table-container">
              <h4>Claves Insertadas</h4>
              {renderKeysTable()}
            </div>
          )}
        </div>

        {/* Área de Simulación */}
        <div className="simulation-canvas">
          <h3>Área de Simulación</h3>
          {keysData.length === 0 ? (
            <div className="empty-state">
              <p>Empiece a agregar claves para visualizar el árbol</p>
            </div>
          ) : (
            <div className="canvas-content">
              <div className="simulation-info">
                <p><strong>Tipo de Clave:</strong> Letra (A-Z)</p>
                <p><strong>Elementos:</strong> {keysData.length}</p>
                <p><strong>Método:</strong> Árbol digital con código binario de 5 bits (A=1, Z=26)</p>
                <p><strong>Inserción:</strong> Primera clave en raíz, siguientes por colisión y código binario</p>
              </div>
              
              {/* Visualización del árbol binario */}
              <div className="tree-visualization-container">
                {renderBinaryTree()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DigitalSearchSection;
