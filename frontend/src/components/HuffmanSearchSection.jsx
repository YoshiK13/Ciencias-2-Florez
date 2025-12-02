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

function HuffmanSearchSection({ onNavigate }) {
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [inputMessage, setInputMessage] = useState('');
  const [searchKey, setSearchKey] = useState('');
  
  // Estados de simulación
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Estados para visualización de búsqueda
  const [searchPath, setSearchPath] = useState([]); // Camino actual de búsqueda
  const [currentSearchNode, setCurrentSearchNode] = useState(null); // Nodo actual en búsqueda
  const [searchResult, setSearchResult] = useState(null); // Resultado de búsqueda
  
  // Estado para los datos de la estructura
  const [keysData, setKeysData] = useState([]); // Array de objetos {key, frequency, huffmanCode}
  const [treeStructure, setTreeStructure] = useState({}); // Árbol binario de Huffman
  const [structureSize, setStructureSize] = useState(20);
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  const [originalMessage, setOriginalMessage] = useState(''); // Mensaje original codificado
  
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
    window.huffmanSearchCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.huffmanSearchCheckUnsavedChanges;
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

  // Función para manejar entrada de mensaje (solo letras)
  const handleMessageInput = (e) => {
    const value = e.target.value;
    // Solo permitir letras y convertir a mayúsculas
    const letterValue = value.replace(/[^A-Za-z]/g, '').toUpperCase();
    setInputMessage(letterValue);
  };

  // Función para manejar entrada de búsqueda (letra única)
  const handleLetterInput = (e, setter) => {
    const value = e.target.value;
    // Solo permitir letras y convertir a mayúsculas
    const letterValue = value.replace(/[^A-Za-z]/g, '').toUpperCase();
    // Limitar a 1 carácter
    const limitedValue = letterValue.slice(0, 1);
    setter(limitedValue);
  };

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'HBF', // Huffman Binary File
      version: '1.0',
      sectionType: 'huffman-search',
      sectionName: 'Árboles de Huffman',
      timestamp: new Date().toISOString(),
      configuration: {
        structureSize: structureSize
      },
      data: {
        keysData: [...keysData],
        treeStructure: {...treeStructure},
        isStructureCreated: isStructureCreated,
        originalMessage: originalMessage
      },
      metadata: {
        elementsCount: keysData.length,
        description: `Árbol de Huffman con ${keysData.length} elementos`
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
      ? currentFileName.replace('.hbf', '')
      : `busqueda-huffman-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.hbf`,
          types: [{
            description: 'Archivos de Búsqueda de Huffman',
            accept: {
              'application/json': ['.hbf']
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

        const finalFileName = fileName.endsWith('.hbf') ? fileName : `${fileName}.hbf`;
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
              description: 'Archivos de Búsqueda de Huffman',
              accept: {
                'application/json': ['.hbf']
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
          input.accept = '.hbf';
          
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

        if (!file || !fileName.endsWith('.hbf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .hbf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'HBF') {
          showMessage('Archivo no válido: no es un archivo HBF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'huffman-search') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Cargar configuración
        setStructureSize(loadedData.configuration.structureSize);
        
        // Cargar datos
        setKeysData(loadedData.data.keysData || []);
        setTreeStructure(loadedData.data.treeStructure || {});
        setIsStructureCreated(loadedData.data.isStructureCreated || false);
        setOriginalMessage(loadedData.data.originalMessage || '');

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
      setInputMessage('');
      setSearchKey('');
      setOriginalMessage('');
      
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
      
      showMessage('Árbol limpiado. Puede ingresar un nuevo mensaje.', 'success');
    };

    // Si hay cambios sin guardar, preguntar primero
    if (hasUnsavedChanges) {
      checkForUnsavedChanges(null, performNew);
    } else {
      performNew();
    }
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

  // Nodo para el algoritmo de Huffman
  class HuffmanNode {
    static counter = 0; // Contador global para orden de creación
    
    constructor(char, freq, left = null, right = null, order = 0) {
      this.char = char;
      this.freq = freq;
      this.left = left;
      this.right = right;
      this.order = order; // Orden de aparición en el mensaje original
      this.timestamp = HuffmanNode.counter++; // Orden de creación del nodo
    }
  }

  // Función para construir el árbol de Huffman siguiendo las reglas correctas
  const buildHuffmanTree = (messageText) => {
    if (!messageText || messageText.length === 0) {
      return null;
    }

    // Reset contador
    HuffmanNode.counter = 0;

    // 1. Calcular frecuencias manteniendo el orden de aparición
    const freqMap = {};
    const orderMap = {}; // Guardar orden de primera aparición
    let order = 0;
    
    for (const char of messageText) {
      if (!freqMap[char]) {
        freqMap[char] = 0;
        orderMap[char] = order++;
      }
      freqMap[char]++;
    }

    // 2. Crear nodos hoja y ordenarlos como min-heap
    const nodes = Object.keys(freqMap).map(char => 
      new HuffmanNode(char, freqMap[char], null, null, orderMap[char])
    );

    // Ordenar por (frecuencia, timestamp)
    nodes.sort((a, b) => {
      if (a.freq !== b.freq) {
        return a.freq - b.freq; // MENOR frecuencia primero
      }
      return a.timestamp - b.timestamp; // MENOR timestamp primero
    });

    // 3. Construir árbol usando algoritmo estándar de Huffman (min-heap)
    while (nodes.length > 1) {
      // Extraer los 2 primeros (menores frecuencias)
      const left = nodes.shift();
      const right = nodes.shift();
      
      // Crear nodo padre: izq=menor, der=mayor (ya ordenados)
      const parent = new HuffmanNode(
        null, 
        left.freq + right.freq, 
        left,
        right,
        Math.min(left.order, right.order)
      );
      
      // Insertar manteniendo orden de heap (por frecuencia, luego timestamp)
      let inserted = false;
      for (let i = 0; i < nodes.length; i++) {
        if (parent.freq < nodes[i].freq || 
           (parent.freq === nodes[i].freq && parent.timestamp < nodes[i].timestamp)) {
          nodes.splice(i, 0, parent);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        nodes.push(parent); // Insertar al final si es el mayor
      }
    }

    return nodes[0]; // Raíz del árbol
  };

  // Función para generar los códigos de Huffman
  const generateHuffmanCodes = (root, code = '', codes = {}) => {
    if (!root) return codes;

    // Si es un nodo hoja (tiene carácter)
    if (root.char !== null) {
      codes[root.char] = code || '0'; // Si solo hay un carácter, usar '0'
      return codes;
    }

    // Recorrer hijo izquierdo con '0'
    if (root.left) {
      generateHuffmanCodes(root.left, code + '0', codes);
    }

    // Recorrer hijo derecho con '1'
    if (root.right) {
      generateHuffmanCodes(root.right, code + '1', codes);
    }

    return codes;
  };

  // Función para convertir el árbol de Huffman a estructura visualizable
  // Cada bit del código representa un nivel del árbol
  const convertTreeToStructure = (node, path = '', level = 0) => {
    const structure = {};
    
    if (!node) return structure;

    // Crear entrada para este nodo (incluyendo la raíz con path vacío)
    const nodeKey = path || 'root';
    structure[nodeKey] = {
      bit: path ? path[path.length - 1] : null,
      level: level,
      path: nodeKey,
      isLeaf: node.char !== null,
      key: node.char,
      frequency: node.freq
    };

    // Recorrer hijos
    if (node.left) {
      const leftStructure = convertTreeToStructure(node.left, path + '0', level + 1);
      Object.assign(structure, leftStructure);
    }

    if (node.right) {
      const rightStructure = convertTreeToStructure(node.right, path + '1', level + 1);
      Object.assign(structure, rightStructure);
    }

    return structure;
  };

  // Función principal para codificar el mensaje
  const handleEncodeMessage = () => {
    if (!inputMessage.trim()) {
      showMessage('Por favor ingrese un mensaje para codificar', 'error');
      return;
    }

    const messageText = inputMessage.trim().toUpperCase();
    const totalChars = messageText.length;

    // Guardar estado anterior para el historial
    const previousKeysData = [...keysData];
    const previousTree = { ...treeStructure };
    
    // Construir árbol de Huffman
    const huffmanRoot = buildHuffmanTree(messageText);
    
    if (!huffmanRoot) {
      showMessage('Error al construir el árbol de Huffman', 'error');
      return;
    }

    // Generar códigos de Huffman
    const huffmanCodes = generateHuffmanCodes(huffmanRoot);

    // Calcular frecuencias
    const freqMap = {};
    for (const char of messageText) {
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    // Crear datos de la tabla
    const newKeysData = Object.keys(freqMap)
      .sort() // Ordenar alfabéticamente
      .map(char => ({
        key: char,
        frequency: `${freqMap[char]}/${totalChars}`,
        huffmanCode: huffmanCodes[char]
      }));

    setKeysData(newKeysData);

    // Convertir árbol a estructura visualizable (ahora incluye la raíz)
    const newTree = convertTreeToStructure(huffmanRoot);
    setTreeStructure(newTree);
    setIsStructureCreated(true);
    setOriginalMessage(messageText);
    
    // Agregar al historial
    addToHistory({
      type: 'encode',
      message: messageText,
      previousState: { keysData: previousKeysData, tree: previousTree, originalMessage: originalMessage },
      newState: { keysData: newKeysData, tree: newTree, originalMessage: messageText }
    });

    showMessage(`Mensaje "${messageText}" codificado exitosamente`, 'success');
    markAsChanged();
  };

  const handleSearch = async () => {
    if (!searchKey.trim() || isSimulating) return;

    const key = searchKey.trim().toUpperCase();
    
    // Validar que la clave sea una letra
    if (!/^[A-Z]$/.test(key)) {
      showMessage('La clave debe ser una letra mayúscula', 'error');
      return;
    }

    // Verificar que la clave existe en el árbol
    const keyData = keysData.find(item => item.key === key);
    if (!keyData) {
      showMessage(`La letra "${key}" no está en el mensaje codificado`, 'error');
      return;
    }

    setIsSimulating(true);
    setSearchPath([]);
    setCurrentSearchNode(null);
    setSearchResult(null);

    // Obtener código de Huffman de la clave
    const huffmanCode = keyData.huffmanCode;

    // Simular el recorrido del árbol bit por bit
    let currentPath = '';
    const pathArray = [];
    
    showMessage(`Buscando "${key}" (Código Huffman: ${huffmanCode})...`, 'info');
    
    // Recorrer cada bit del código de Huffman
    for (let i = 0; i < huffmanCode.length; i++) {
      const bit = huffmanCode[i];
      currentPath += bit;
      pathArray.push(currentPath);
      
      // Actualizar visualización
      setSearchPath([...pathArray]);
      setCurrentSearchNode(currentPath);
      
      // Pausa para visualización
      await new Promise(resolve => setTimeout(resolve, 800 / simulationSpeed));
      
      // Verificar si el nodo existe
      if (!treeStructure[currentPath]) {
        setSearchResult('not-found');
        showMessage(`Clave "${key}" no encontrada en el árbol`, 'error');
        setIsSimulating(false);
        
        // Limpiar después de 2 segundos
        setTimeout(() => {
          setSearchPath([]);
          setCurrentSearchNode(null);
          setSearchResult(null);
        }, 2000);
        return;
      }
    }
    
    // Verificar si la clave está en el nodo final
    const finalNode = treeStructure[currentPath];
    if (finalNode && finalNode.isLeaf && finalNode.key === key) {
      setSearchResult('found');
      showMessage(`¡Clave "${key}" encontrada! (Código Huffman: ${huffmanCode}, Frecuencia: ${keyData.frequency})`, 'success');
    } else {
      setSearchResult('not-found');
      showMessage(`Clave "${key}" no se encuentra en el árbol`, 'error');
    }

    setIsSimulating(false);
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
      setSearchPath([]);
      setCurrentSearchNode(null);
      setSearchResult(null);
    }, 3000);
  };

  // Funciones de deshacer y rehacer
  // Funciones de deshacer y rehacer
  const getActionName = (type) => {
    const actionNames = {
      'encode': 'Codificación de mensaje',
      'insert': 'Inserción',
      'delete': 'Eliminación'
    };
    return actionNames[type] || type;
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setKeysData(action.previousState.keysData);
      setTreeStructure(action.previousState.tree);
      setOriginalMessage(action.previousState.originalMessage || '');
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
      setOriginalMessage(action.newState.originalMessage || '');
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
    const MIN_HORIZONTAL_SPACING = 100;
    const estimatedTreeWidth = Math.max(1200, leafCount * MIN_HORIZONTAL_SPACING + 400);

    const widthScale = (containerWidth * 0.90) / estimatedTreeWidth;
    const heightScale = (containerHeight * 0.90) / treeHeight;

    let optimalScale = Math.min(widthScale, heightScale);

    // Aumentados ~66% especialmente en resoluciones pequeñas
    if (containerWidth < 600) {
      optimalScale = optimalScale * 1.99;
    } else if (containerWidth < 900) {
      optimalScale = optimalScale * 1.90;
    } else {
      optimalScale = optimalScale * 1.66;
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
          <span className="header-col">Frecuencia</span>
          <span className="header-col">Código Huffman</span>
        </div>
        
        <div className="keys-table-body">
          {keysData.map((item, index) => (
            <div key={index} className="keys-table-row">
              <span className="keys-cell key-cell">{item.key}</span>
              <span className="keys-cell ascii-cell">{item.frequency}</span>
              <span className="keys-cell binary-cell">{item.huffmanCode}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para renderizar el árbol binario con visualización gráfica mejorada
  const renderBinaryTree = () => {
    if (Object.keys(treeStructure).length === 0) {
      return (
        <div className="empty-tree">
          <p>El árbol se mostrará aquí cuando agregues claves</p>
        </div>
      );
    }

    // Organizar nodos por nivel
    const nodesByLevel = {};
    Object.values(treeStructure).forEach(node => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
    });

    // Ordenar nodos en cada nivel por su path (orden binario)
    Object.keys(nodesByLevel).forEach(level => {
      nodesByLevel[level].sort((a, b) => {
        // Comparar paths como strings binarios directamente
        if (a.path < b.path) return -1;
        if (a.path > b.path) return 1;
        return 0;
      });
    });

    // Calcular dimensiones del SVG
    const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number));
    const levelHeight = 100; // Altura entre niveles
    const nodeRadius = 25;
    const svgHeight = (maxLevel + 1) * levelHeight + 100;
    
    // ======= NUEVO ALGORITMO: POSICIONAMIENTO POR SUBTREE WIDTH =======
    // Sistema que calcula el ancho de cada subárbol recursivamente
    
    const MIN_HORIZONTAL_SPACING = 100; // Espacio mínimo entre nodos hermanos
    
    // Clase para almacenar información de ancho de subárbol
    class TreeNode {
      constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.width = 1; // Ancho en "unidades" (hojas)
        this.x = 0;
        this.y = 0;
      }
    }
    
    // Construir árbol de objetos TreeNode desde treeStructure
    const buildTreeObjects = (path = 'root') => {
      const nodeData = treeStructure[path];
      if (!nodeData) return null;
      
      const node = new TreeNode(nodeData);
      
      const leftPath = path === 'root' ? '0' : path + '0';
      const rightPath = path === 'root' ? '1' : path + '1';
      
      node.left = buildTreeObjects(leftPath);
      node.right = buildTreeObjects(rightPath);
      
      return node;
    };
    
    // Calcular el ancho de cada subárbol (número de hojas)
    const calculateSubtreeWidth = (node) => {
      if (!node) return 0;
      
      // Si es hoja, su ancho es 1
      if (node.data.isLeaf) {
        node.width = 1;
        return 1;
      }
      
      // Si es nodo interno, su ancho es la suma de los anchos de sus hijos
      const leftWidth = calculateSubtreeWidth(node.left);
      const rightWidth = calculateSubtreeWidth(node.right);
      
      node.width = leftWidth + rightWidth;
      return node.width;
    };
    
    // Asignar posiciones X basadas en el ancho de subárboles
    const assignPositions = (node, startX = 0) => {
      if (!node) return;
      
      if (node.data.isLeaf) {
        // Hoja: posición exacta en startX
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
    
    // Extraer posiciones en un mapa
    const extractPositions = (node, posMap = new Map()) => {
      if (!node) return posMap;
      
      posMap.set(node.data.path, { x: node.x, y: node.y });
      
      extractPositions(node.left, posMap);
      extractPositions(node.right, posMap);
      
      return posMap;
    };
    
    // Ejecutar el algoritmo
    const rootNode = buildTreeObjects('root');
    if (rootNode) {
      calculateSubtreeWidth(rootNode);
      assignPositions(rootNode, 0);
    }
    
    const nodePositions = extractPositions(rootNode);
    
    // Calcular dimensiones del canvas basadas en las posiciones reales
    let minX = Infinity, maxX = -Infinity;
    nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
    });
    
    const treeWidth = maxX - minX;
    const svgWidth = Math.max(1200, treeWidth + 400);
    const offsetX = (svgWidth - treeWidth) / 2 - minX;
    
    // Aplicar offset para centrar el árbol
    nodePositions.forEach((pos) => {
      pos.x += offsetX;
    });
    
    // Crear estructura de nodos con posiciones finales
    const nodesWithPositions = [];
    Object.values(treeStructure).forEach(node => {
      const position = nodePositions.get(node.path);
      if (position) {
        nodesWithPositions.push({
          ...node,
          x: position.x,
          y: position.y
        });
      }
    });

    // Crear aristas mejoradas con información de dirección
    const edges = [];
    nodesWithPositions.forEach(node => {
      if (node.level > 0) { // Cambiar de > 1 a > 0 para incluir nivel 1
        // Encontrar el nodo padre (path sin el último bit, o 'root' si es nivel 1)
        let parentPath;
        if (node.path.length === 1) {
          // Nodo en nivel 1 (como '0' o '1'), su padre es 'root'
          parentPath = 'root';
        } else {
          // Nodo en niveles más profundos
          parentPath = node.path.slice(0, -1);
        }
        
        const parent = nodesWithPositions.find(n => n.path === parentPath);
        
        if (parent) {
          // Determinar si es hijo izquierdo (0) o derecho (1)
          const isLeftChild = node.bit === '0';
          
          edges.push({
            x1: parent.x,
            y1: parent.y,
            x2: node.x,
            y2: node.y,
            bit: node.bit,
            isToLeaf: node.isLeaf,
            isLeftChild: isLeftChild,
            parentPath: parent.path,
            childPath: node.path
          });
        }
      }
    });

    return (
      <div className="binary-tree-visualization">
        <div className="tree-header">
          <div className="tree-title-section">
            <h4>Árbol de Huffman</h4>
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
              <div className="legend-circle connection-circle"></div>
              <span>Nodo enlace</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle leaf-circle"></div>
              <span>Nodo hoja (clave)</span>
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
              {/* Gradiente para aristas izquierdas (bit 0) */}
              <linearGradient id="leftEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4a90e2" stopOpacity="1" />
              </linearGradient>
              
              {/* Gradiente para aristas derechas (bit 1) */}
              <linearGradient id="rightEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e24a4a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e24a4a" stopOpacity="1" />
              </linearGradient>
              
              {/* Sombra para nodos */}
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
              
              {/* Flecha para indicar dirección */}
              <marker
                id="arrowLeft"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4a90e2" />
              </marker>
              
              <marker
                id="arrowRight"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e24a4a" />
              </marker>
            </defs>

            {/* Renderizar aristas con colores diferenciados y flechas */}
            {edges.map((edge, idx) => {
              // Calcular punto medio para la etiqueta
              const midX = (edge.x1 + edge.x2) / 2;
              const midY = (edge.y1 + edge.y2) / 2;
              
              // Offset para la etiqueta (hacia el lado correspondiente)
              const labelOffsetX = edge.isLeftChild ? -15 : 15;
              const labelOffsetY = -10;
              
              // Verificar si esta arista está en el camino de búsqueda
              const isInSearchPath = searchPath.includes(edge.childPath);
              const isCurrentEdge = currentSearchNode === edge.childPath;
              
              // Color y grosor basados en el tipo de arista y búsqueda
              let strokeColor = edge.isLeftChild ? "url(#leftEdgeGradient)" : "url(#rightEdgeGradient)";
              let strokeWidth = edge.isToLeaf ? "3.5" : "2.5";
              
              if (isCurrentEdge) {
                strokeColor = "#fbbf24"; // Amarillo brillante para arista actual
                strokeWidth = "5";
              } else if (isInSearchPath) {
                strokeColor = "#10b981"; // Verde para camino recorrido
                strokeWidth = "4";
              }
              
              const markerEnd = edge.isLeftChild ? "url(#arrowLeft)" : "url(#arrowRight)";
              
              return (
                <g key={`edge-${idx}`}>
                  {/* Línea de fondo (más gruesa y clara para destacar) */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1 + nodeRadius}
                    x2={edge.x2}
                    y2={edge.y2 - nodeRadius}
                    stroke={isInSearchPath || isCurrentEdge ? "#f0f0f0" : "#f0f0f0"}
                    strokeWidth={parseFloat(strokeWidth) + 2}
                    strokeLinecap="round"
                  />
                  
                  {/* Línea principal con color */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1 + nodeRadius}
                    x2={edge.x2}
                    y2={edge.y2 - nodeRadius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    markerEnd={markerEnd}
                    className={`tree-edge ${edge.isToLeaf ? 'edge-to-leaf' : ''} ${isCurrentEdge ? 'search-active' : ''} ${isInSearchPath ? 'search-visited' : ''}`}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Etiqueta del bit con fondo */}
                  <g>
                    {/* Círculo de fondo para la etiqueta */}
                    <circle
                      cx={midX + labelOffsetX}
                      cy={midY + labelOffsetY}
                      r="14"
                      fill={isCurrentEdge ? "#fef3c7" : "white"}
                      stroke={isCurrentEdge ? "#fbbf24" : (isInSearchPath ? "#10b981" : (edge.isLeftChild ? "#4a90e2" : "#e24a4a"))}
                      strokeWidth={isCurrentEdge || isInSearchPath ? "3" : "2"}
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    />
                    
                    {/* Texto del bit */}
                    <text
                      x={midX + labelOffsetX}
                      y={midY + labelOffsetY + 5}
                      className="edge-label"
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="700"
                      fill={isCurrentEdge ? "#92400e" : (isInSearchPath ? "#065f46" : (edge.isLeftChild ? "#2c5282" : "#742a2a"))}
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {edge.bit}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Renderizar nodos con sombras y mejores efectos */}
            {nodesWithPositions.map((node, idx) => {
              // Verificar si este nodo está en el camino de búsqueda
              const isInSearchPath = searchPath.includes(node.path);
              const isCurrentNode = currentSearchNode === node.path;
              const isResultNode = searchResult && node.path === currentSearchNode;
              
              // Determinar colores basados en el estado de búsqueda
              let nodeFill = node.isLeaf ? "#48bb78" : "#4a90e2";
              let nodeStroke = node.isLeaf ? "#2c7a3d" : "#2c5282";
              let borderOpacity = "0.3";
              let strokeWidth = "3";
              
              if (isCurrentNode && !isResultNode) {
                // Nodo actual durante la búsqueda (amarillo)
                nodeFill = "#fbbf24";
                nodeStroke = "#f59e0b";
                borderOpacity = "0.5";
                strokeWidth = "4";
              } else if (isResultNode && searchResult === 'found') {
                // Nodo encontrado (verde brillante)
                nodeFill = "#10b981";
                nodeStroke = "#059669";
                borderOpacity = "0.6";
                strokeWidth = "5";
              } else if (isResultNode && searchResult === 'not-found') {
                // Búsqueda fallida (rojo)
                nodeFill = "#ef4444";
                nodeStroke = "#dc2626";
                borderOpacity = "0.6";
                strokeWidth = "5";
              } else if (isInSearchPath) {
                // Nodo visitado en el camino (verde suave)
                nodeFill = node.isLeaf ? "#34d399" : "#60a5fa";
                nodeStroke = node.isLeaf ? "#10b981" : "#3b82f6";
                borderOpacity = "0.4";
                strokeWidth = "3.5";
              }
              
              return (
                <g key={`node-${idx}`} className="tree-node-group" filter="url(#nodeShadow)">
                  {/* Círculo exterior (borde) */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 2}
                    fill={nodeStroke}
                    opacity={borderOpacity}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Efecto de pulso para nodo actual */}
                  {isCurrentNode && !isResultNode && (
                    <circle
                      cx={node.x}
                      cy={node.y}
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
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    className={`tree-node-circle ${node.isLeaf ? 'leaf-node-circle' : 'connection-node-circle'}`}
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={strokeWidth}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Texto del nodo - letra en nodos hoja, frecuencia en nodos enlace */}
                  {node.isLeaf ? (
                    <text
                      x={node.x}
                      y={node.y + 7}
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
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={nodeStroke}
                      style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {`${node.frequency}/${originalMessage.length}`}
                    </text>
                  )}
                  
                  {/* Mostrar la frecuencia debajo de nodos hoja */}
                  {node.isLeaf && (
                    <text
                      x={node.x}
                      y={node.y + nodeRadius + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fill={isInSearchPath || isCurrentNode ? "#059669" : "#555"}
                      fontFamily="monospace"
                      fontWeight={isInSearchPath || isCurrentNode ? "bold" : "normal"}
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {`${node.frequency}/${originalMessage.length}`}
                    </text>
                  )}
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
        <h1>Árboles de Huffman</h1>
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
            title="Cargar estructura desde archivo .hbf"
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

          {/* Codificar Mensaje */}
          <div className="control-group">
            <label>Mensaje a Codificar</label>
            <div className="input-with-button">
              <input
                type="text"
                value={inputMessage}
                onChange={handleMessageInput}
                placeholder="Ej: ANA o MURCIELAGO"
                className="operation-input"
                style={{ flex: 1 }}
              />
              <button 
                onClick={handleEncodeMessage}
                className="operation-btn insert-btn"
                disabled={!inputMessage.trim()}
              >
                <Plus size={16} />
                Codificar
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
                placeholder="Ej: A"
                className="operation-input"
                disabled={isSimulating || !isStructureCreated}
                maxLength={1}
              />
              <button 
                onClick={handleSearch}
                className="operation-btn search-btn"
                disabled={!searchKey.trim() || isSimulating || !isStructureCreated}
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

          {/* Tabla de claves con frecuencia y código Huffman */}
          {keysData.length > 0 && (
            <div className="keys-table-container">
              <h4>Claves del Mensaje</h4>
              {originalMessage && (
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                  Mensaje: <strong>{originalMessage}</strong>
                </p>
              )}
              {renderKeysTable()}
            </div>
          )}
        </div>

        {/* Área de Simulación */}
        <div className="simulation-canvas">
          <h3>Área de Simulación</h3>
          {keysData.length === 0 ? (
            <div className="empty-state">
              <p>Ingrese un mensaje para codificarlo y visualizar el árbol de Huffman</p>
            </div>
          ) : (
            <div className="canvas-content">
              <div className="simulation-info">
                <p><strong>Mensaje Original:</strong> {originalMessage}</p>
                <p><strong>Caracteres Únicos:</strong> {keysData.length}</p>
                <p><strong>Método:</strong> Codificación de Huffman</p>
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

export default HuffmanSearchSection;
