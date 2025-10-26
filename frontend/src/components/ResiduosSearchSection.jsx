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

function ResiduosSearchSection({ onNavigate }) {
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
    window.residuosSearchCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.residuosSearchCheckUnsavedChanges;
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

  // Función para convertir carácter a código ASCII binario de 8 bits
  const charToAscii = (char) => {
    return char.charCodeAt(0);
  };

  // Función para convertir ASCII a binario de 8 bits
  const asciiToBinary = (ascii) => {
    return ascii.toString(2).padStart(8, '0');
  };

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'RBF', // Residuos Binary File
      version: '1.0',
      sectionType: 'residuos-search',
      sectionName: 'Árboles por Residuos',
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
        description: `Árbol por residuos con ${keysData.length} elementos`
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
      ? currentFileName.replace('.rbf', '')
      : `busqueda-residuos-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.rbf`,
          types: [{
            description: 'Archivos de Búsqueda por Residuos',
            accept: {
              'application/json': ['.rbf']
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

        const finalFileName = fileName.endsWith('.rbf') ? fileName : `${fileName}.rbf`;
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
              description: 'Archivos de Búsqueda por Residuos',
              accept: {
                'application/json': ['.rbf']
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
          input.accept = '.rbf';
          
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

        if (!file || !fileName.endsWith('.rbf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .rbf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'RBF') {
          showMessage('Archivo no válido: no es un archivo RBF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'residuos-search') {
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

  // Función para insertar una clave en el árbol binario
  const insertIntoTree = (key, binaryCode) => {
    const newTree = { ...treeStructure };
    let currentPath = '';
    
    // Recorrer los 8 bits para crear/navegar el árbol
    for (let i = 0; i < 8; i++) {
      const bit = binaryCode[i];
      currentPath += bit;
      
      if (!newTree[currentPath]) {
        newTree[currentPath] = {
          bit: bit,
          level: i + 1,
          path: currentPath,
          isLeaf: false,
          key: null
        };
      }
    }
    
    // En el noveno nivel (después de 8 aristas), guardar la clave
    const leafPath = currentPath;
    newTree[leafPath].isLeaf = true;
    newTree[leafPath].key = key;
    
    return newTree;
  };

  // Función para construir árbol desde cero (sin depender del estado actual)
  const buildTreeFromScratch = (keysArray) => {
    const newTree = {};
    
    keysArray.forEach(item => {
      let currentPath = '';
      
      // Recorrer los 8 bits para crear/navegar el árbol
      for (let i = 0; i < 8; i++) {
        const bit = item.binary[i];
        currentPath += bit;
        
        if (!newTree[currentPath]) {
          newTree[currentPath] = {
            bit: bit,
            level: i + 1,
            path: currentPath,
            isLeaf: false,
            key: null
          };
        }
      }
      
      // En el noveno nivel (después de 8 aristas), guardar la clave
      const leafPath = currentPath;
      newTree[leafPath].isLeaf = true;
      newTree[leafPath].key = item.key;
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

    // Obtener código ASCII y binario
    const ascii = charToAscii(key);
    const binary = asciiToBinary(ascii);

    // Guardar estado anterior para el historial
    const previousKeysData = [...keysData];
    const previousTree = { ...treeStructure };
    
    // Agregar a la tabla de claves
    const newKeysData = [...keysData, { key, ascii, binary }];
    setKeysData(newKeysData);

    // Insertar en el árbol
    const newTree = insertIntoTree(key, binary);
    setTreeStructure(newTree);
    
    // Agregar al historial
    addToHistory({
      type: 'insert',
      key: key,
      previousState: { keysData: previousKeysData, tree: previousTree },
      newState: { keysData: newKeysData, tree: newTree }
    });

    showMessage(`Clave "${key}" insertada (ASCII: ${ascii}, Binario: ${binary})`, 'success');
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
    const ascii = charToAscii(key);
    const binary = asciiToBinary(ascii);

    // Simular el recorrido del árbol bit por bit
    let currentPath = '';
    const pathArray = [];
    
    showMessage(`Buscando "${key}" (ASCII: ${ascii}, Binario: ${binary})...`, 'info');
    
    // Recorrer cada bit del código binario
    for (let i = 0; i < 8; i++) {
      const bit = binary[i];
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
      showMessage(`¡Clave "${key}" encontrada! (ASCII: ${ascii}, Binario: ${binary})`, 'success');
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
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      setKeysData(action.previousState.keysData);
      setTreeStructure(action.previousState.tree);
      setHistoryIndex(historyIndex - 1);
      showMessage(`Acción ${action.type} deshecha`, 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      setKeysData(action.newState.keysData);
      setTreeStructure(action.newState.tree);
      setHistoryIndex(historyIndex + 1);
      showMessage(`Acción ${action.type} rehecha`, 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // ===== SISTEMA DE ZOOM DESDE CERO =====
  // Manejador de zoom con la rueda del mouse
  const handleWheelZoom = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calcular el cambio de zoom basado en el deltaY
    const zoomSensitivity = 0.002;
    const delta = -e.deltaY * zoomSensitivity;
    
    setTreeZoom(prevZoom => {
      // Calcular nuevo zoom: 0.5 (50%) a 3.0 (300%)
      const newZoom = prevZoom + delta;
      
      // Limitar el zoom entre 0.5 y 3.0
      const clampedZoom = Math.max(0.5, Math.min(3.0, newZoom));
      
      // Log para debug (se puede remover después)
      console.log('Zoom:', Math.round(clampedZoom * 100) + '%');
      
      return clampedZoom;
    });
  }, []);

  // Efecto para agregar el listener de zoom al contenedor del árbol
  React.useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    // Agregar el listener con passive: false para poder hacer preventDefault
    container.addEventListener('wheel', handleWheelZoom, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelZoom);
    };
  }, [handleWheelZoom]);

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

  const resetTreeView = () => {
    setTreeZoom(1.0); // Resetear a 1.0 (100%)
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
          <span className="header-col">ASCII</span>
          <span className="header-col">Código Binario</span>
        </div>
        
        <div className="keys-table-body">
          {keysData.map((item, index) => (
            <div key={index} className="keys-table-row">
              <span className="keys-cell key-cell">{item.key}</span>
              <span className="keys-cell ascii-cell">{item.ascii}</span>
              <span className="keys-cell binary-cell">{item.binary}</span>
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
    const levelHeight = 100;
    const nodeRadius = 25;
    const svgHeight = (maxLevel + 1) * levelHeight + 100;
    
    // ======= ALGORITMO SIMPLE Y ROBUSTO DE POSICIONAMIENTO =======
    
    // Primero, asignar índices horizontales a todos los nodos hoja (nivel 8)
    // Esto garantiza que todas las hojas estén espaciadas uniformemente
    const leafNodes = nodesByLevel[maxLevel] || [];
    const numLeaves = leafNodes.length;
    
    // Espaciado entre hojas - ajustado para mejor visualización al 100%
    const minLeafSpacing = 150; // Espacio mínimo entre hojas
    const totalLeafWidth = Math.max(numLeaves - 1, 0) * minLeafSpacing;
    const svgWidth = Math.max(1200, totalLeafWidth + 400); // Canvas más compacto para mejor vista al 100%
    
    // Asignar posiciones X a las hojas primero
    const nodePositions = new Map();
    const leftMargin = (svgWidth - totalLeafWidth) / 2;
    
    leafNodes.forEach((node, index) => {
      const x = leftMargin + (index * minLeafSpacing);
      nodePositions.set(node.path, { x, level: node.level });
    });

    // Ahora calcular posiciones de nodos internos (niveles 1-7)
    // La posición X de un nodo interno es el promedio de sus hijos
    for (let level = maxLevel - 1; level >= 1; level--) {
      const nodesInLevel = nodesByLevel[level] || [];
      
      nodesInLevel.forEach(node => {
        // Encontrar los hijos de este nodo
        const leftChildPath = node.path + '0';
        const rightChildPath = node.path + '1';
        
        const leftChild = nodePositions.get(leftChildPath);
        const rightChild = nodePositions.get(rightChildPath);
        
        let x;
        if (leftChild && rightChild) {
          // Si tiene ambos hijos, posicionar en el centro
          x = (leftChild.x + rightChild.x) / 2;
        } else if (leftChild) {
          // Solo hijo izquierdo
          x = leftChild.x;
        } else if (rightChild) {
          // Solo hijo derecho
          x = rightChild.x;
        } else {
          // No tiene hijos (caso raro), centrar
          x = svgWidth / 2;
        }
        
        nodePositions.set(node.path, { x, level: node.level });
      });
    }
    
    // Crear estructura de nodos con posiciones finales
    const nodesWithPositions = [];
    Object.values(treeStructure).forEach(node => {
      const position = nodePositions.get(node.path);
      if (position) {
        const y = node.level * levelHeight + 50;
        nodesWithPositions.push({
          ...node,
          x: position.x,
          y
        });
      }
    });

    // Crear aristas mejoradas con información de dirección
    const edges = [];
    nodesWithPositions.forEach(node => {
      if (node.level > 1) {
        // Encontrar el nodo padre (path sin el último bit)
        const parentPath = node.path.slice(0, -1);
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
            <h4>Árbol Binario de Residuos</h4>
            <div className="tree-controls">
              <button 
                className="tree-control-btn"
                onClick={resetTreeView}
                title="Restablecer zoom y posición"
              >
                Resetear Zoom
              </button>
              <span className="zoom-indicator">Zoom: {Math.round(treeZoom * 100)}%</span>
            </div>
          </div>
          <div className="tree-legend">
            <div className="legend-item">
              <div className="legend-circle connection-circle"></div>
              <span>Nodo interno</span>
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
            <p><strong>Arrastrar:</strong> Click y mantén para mover | <strong>Zoom:</strong> Rueda del mouse</p>
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
              transform: `translate(${treePan.x}px, ${treePan.y}px) scale(${treeZoom})`,
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
                  
                  {/* Texto del nodo - letra en nodos hoja, punto en nodos internos */}
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
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      fill="white"
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                  
                  {/* Mostrar el path binario debajo de nodos hoja */}
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
                      {node.path}
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
        <h1>Árboles por Residuos</h1>
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
            title="Cargar estructura desde archivo .rbf"
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
                <p><strong>Método:</strong> Árbol binario basado en código ASCII (8 bits)</p>
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

export default ResiduosSearchSection;
