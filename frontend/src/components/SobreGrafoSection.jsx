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

function SobreGrafoSection({ onNavigate }) {
  // Estados para la configuración
  const [graphType, setGraphType] = useState('dirigido'); // dirigido / no-dirigido
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [operationType, setOperationType] = useState('anadir'); // anadir, eliminar, fusion
  const [newVertices, setNewVertices] = useState(''); // Input para nuevos vértices
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [edgeLabel, setEdgeLabel] = useState(''); // Para eliminar aristas por etiqueta
  const [edgeCounter, setEdgeCounter] = useState(1); // Contador para etiquetas de aristas
  
  // Modal para nuevo grafo
  const [showNewGraphModal, setShowNewGraphModal] = useState(false);
  const [newGraphType, setNewGraphType] = useState('dirigido');
  
  // Estados de simulación
  // const [isSimulating, setIsSimulating] = useState(false);
  
  // Estados para visualización de operaciones
  const [visitedNodes, setVisitedNodes] = useState([]); // Nodos visitados durante operaciones
  const [currentNode, setCurrentNode] = useState(null); // Nodo actual en la operación
  // const [operationResult, setOperationResult] = useState(null); // Resultado de la operación
  
  // Estado para los datos de la estructura (grafo)
  const [adjacencyList, setAdjacencyList] = useState({}); // {nodeId: [{to: nodeId, label: number}]}
  const [nodes, setNodes] = useState([]); // Array de IDs de nodos
  const [edges, setEdges] = useState([]); // Array de {from, to, label} para tracking
  
  // Estados para mensajes informativos
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Sistema de historial para deshacer/rehacer (últimas 15 acciones)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para zoom y pan del grafo
  const [graphZoom, setGraphZoom] = useState(1.0); // 1.0 = 100% (escala de 0.5 a 3.0)
  const baseScale = 1.0; // Escala base calculada automáticamente
  const [graphPan, setGraphPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const graphContainerRef = React.useRef(null);
  
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
    window.sobreGrafoCheckUnsavedChanges = checkForUnsavedChanges;
    
    return () => {
      delete window.sobreGrafoCheckUnsavedChanges;
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

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Función para crear el objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'SGF', // Sobre Grafo File
      version: '1.0',
      sectionType: 'sobre-grafo',
      sectionName: 'Operaciones sobre un Grafo',
      timestamp: new Date().toISOString(),
      configuration: {
        graphType: graphType
      },
      data: {
        nodes: [...nodes],
        edges: [...edges],
        adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
        edgeCounter: edgeCounter,
        isStructureCreated: isStructureCreated
      },
      metadata: {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        description: `Grafo ${graphType} con ${nodes.length} nodos y ${edges.length} aristas`
      }
    };
  };

  // Función para guardar archivo con selector de ubicación
  const handleSave = async () => {
    if (!isStructureCreated) {
      showMessage('No hay estructura para guardar', 'error');
      return;
    }

    // Validar que hay datos para guardar
    if (nodes.length === 0) {
      showMessage('El grafo no tiene vértices para guardar', 'error');
      return;
    }

    const defaultName = currentFileName 
      ? currentFileName.replace('.sgf', '')
      : `sobre-grafo-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    
    // Verificar integridad de los datos antes de guardar
    if (!dataToSave.data || !dataToSave.configuration) {
      showMessage('Error al preparar los datos para guardar', 'error');
      console.error('Datos inválidos:', dataToSave);
      return;
    }
    
    const jsonString = JSON.stringify(dataToSave, null, 2);
    
    // Log para debugging (opcional, remover en producción)
    console.log('Guardando grafo:', {
      nodes: dataToSave.data.nodes,
      edges: dataToSave.data.edges.length,
      graphType: dataToSave.configuration.graphType
    });

    try {
      // Intentar usar la File System Access API moderna si está disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.sgf`,
          types: [{
            description: 'Archivos de Operaciones sobre Grafo',
            accept: {
              'application/json': ['.sgf']
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

        const finalFileName = fileName.endsWith('.sgf') ? fileName : `${fileName}.sgf`;
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
              description: 'Archivos de Operaciones sobre Grafo',
              accept: {
                'application/json': ['.sgf']
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
          input.accept = '.sgf';
          
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

        if (!file || !fileName.endsWith('.sgf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .sgf válido', 'error');
          }
          return;
        }

        // Procesar el contenido del archivo
        const loadedData = JSON.parse(content);
        
        // Validar formato del archivo
        if (!loadedData.fileType || loadedData.fileType !== 'SGF') {
          showMessage('Archivo no válido: no es un archivo SGF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'sobre-grafo') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        // Validar estructura de datos
        if (!loadedData.data || !loadedData.configuration) {
          showMessage('Archivo corrupto: faltan datos esenciales', 'error');
          return;
        }

        // Cargar configuración
        const newGraphType = loadedData.configuration.graphType;
        if (newGraphType !== 'dirigido' && newGraphType !== 'no-dirigido') {
          showMessage('Archivo inválido: tipo de grafo no reconocido', 'error');
          return;
        }
        setGraphType(newGraphType);
        
        // Cargar datos con validación
        const loadedNodes = loadedData.data.nodes || [];
        const loadedEdges = loadedData.data.edges || [];
        const loadedAdjList = loadedData.data.adjacencyList || {};
        
        // Validar integridad: todos los nodos en edges deben existir en nodes
        const invalidEdges = loadedEdges.filter(e => 
          !loadedNodes.includes(e.from) || !loadedNodes.includes(e.to)
        );
        
        if (invalidEdges.length > 0) {
          console.warn('Aristas con vértices inválidos encontradas:', invalidEdges);
          showMessage('Advertencia: Algunas aristas tienen vértices inválidos', 'warning');
        }
        
        setNodes(loadedNodes);
        setEdges(loadedEdges.filter(e => 
          loadedNodes.includes(e.from) && loadedNodes.includes(e.to)
        ));
        setAdjacencyList(loadedAdjList);
        setEdgeCounter(loadedData.data.edgeCounter || 1);
        setIsStructureCreated(loadedData.data.isStructureCreated || false);

        // Limpiar historial y estados
        setHistory([]);
        setHistoryIndex(-1);
        setHasUnsavedChanges(false);
        setCurrentFileName(fileName);
        
        // Log para debugging
        console.log('Grafo cargado:', {
          nodes: loadedNodes,
          edges: loadedEdges.length,
          graphType: newGraphType
        });
        
        showMessage(`Archivo cargado exitosamente: ${fileName} (${loadedNodes.length} vértices, ${loadedEdges.length} aristas)`, 'success');
        
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

  // Función para crear una nueva estructura (limpiar todo)
  const handleNewGraph = () => {
    // Si hay cambios sin guardar, preguntar primero
    if (hasUnsavedChanges) {
      checkForUnsavedChanges(null, () => {
        setShowNewGraphModal(true);
      });
    } else {
      setShowNewGraphModal(true);
    }
  };
  
  // Función para confirmar creación de nuevo grafo
  const confirmNewGraph = () => {
    // Limpiar todos los datos
    setNodes([]);
    setEdges([]);
    setAdjacencyList({});
    setEdgeCounter(1);
    setIsStructureCreated(true);
    setSourceNode('');
    setTargetNode('');
    setNewVertices('');
    setGraphType(newGraphType);
    
    // Limpiar historial
    setHistory([]);
    setHistoryIndex(-1);
    
    // Limpiar estados de visualización
    setVisitedNodes([]);
    setCurrentNode(null);
    
    // Marcar como con cambios y sin nombre de archivo
    setHasUnsavedChanges(true);
    setCurrentFileName(null);
    
    setShowNewGraphModal(false);
    showMessage(`Nuevo grafo ${newGraphType} creado`, 'success');
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

  // Función para agregar vértices
  const handleAddVertices = () => {
    if (!newVertices.trim() || !isStructureCreated) {
      showMessage('Por favor ingrese al menos un vértice', 'error');
      return;
    }

    // Procesar entrada: eliminar espacios, convertir a mayúsculas, dividir por comas
    const inputVertices = newVertices
      .toUpperCase()
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    // Validar que sean solo letras
    const validVertices = [];
    const invalidVertices = [];
    const duplicateVertices = [];
    
    inputVertices.forEach(vertex => {
      if (!/^[A-Z]+$/.test(vertex)) {
        invalidVertices.push(vertex);
      } else if (nodes.includes(vertex)) {
        duplicateVertices.push(vertex);
      } else if (!validVertices.includes(vertex)) {
        validVertices.push(vertex);
      }
    });
    
    if (invalidVertices.length > 0) {
      showMessage(`Vértices inválidos (solo letras): ${invalidVertices.join(', ')}`, 'error');
      return;
    }
    
    if (validVertices.length === 0) {
      if (duplicateVertices.length > 0) {
        showMessage(`Vértices duplicados: ${duplicateVertices.join(', ')}`, 'error');
      } else {
        showMessage('No hay vértices válidos para agregar', 'error');
      }
      return;
    }
    
    // Guardar estado anterior para el historial
    const previousState = {
      nodes: [...nodes],
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList))
    };
    
    // Agregar vértices
    const newNodesList = [...nodes, ...validVertices];
    setNodes(newNodesList);
    
    // Inicializar lista de adyacencia para nuevos nodos
    const newAdjList = { ...adjacencyList };
    validVertices.forEach(vertex => {
      newAdjList[vertex] = [];
    });
    setAdjacencyList(newAdjList);
    
    // Agregar al historial
    addToHistory({
      type: 'add-vertices',
      vertices: validVertices,
      previousState: previousState,
      newState: {
        nodes: newNodesList,
        adjacencyList: newAdjList
      }
    });

    let message = `Vértice(s) agregado(s): ${validVertices.join(', ')}`;
    if (duplicateVertices.length > 0) {
      message += ` (duplicados ignorados: ${duplicateVertices.join(', ')})`;
    }
    showMessage(message, 'success');
    setNewVertices('');
    markAsChanged();
  };

  // Función para agregar una arista
  const handleAddEdge = () => {
    if (!sourceNode || !targetNode || !isStructureCreated) {
      showMessage('Por favor ingrese nodos de origen y destino válidos', 'error');
      return;
    }

    if (!nodes.includes(sourceNode) || !nodes.includes(targetNode)) {
      showMessage('Los vértices deben existir en el grafo', 'error');
      return;
    }

    // Verificar si la arista ya existe
    const existingEdge = adjacencyList[sourceNode]?.find(edge => edge.to === targetNode);
    if (existingEdge) {
      showMessage('La arista ya existe', 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = {
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges],
      edgeCounter: edgeCounter
    };
    
    // Crear nueva arista con etiqueta automática
    const newEdgeLabel = edgeCounter;
    const newEdge = { from: sourceNode, to: targetNode, label: newEdgeLabel };
    
    // Agregar arista
    const newAdjList = { ...adjacencyList };
    newAdjList[sourceNode] = [...newAdjList[sourceNode], { to: targetNode, label: newEdgeLabel }];
    
    // Si es no dirigido, agregar arista inversa (con la misma etiqueta)
    if (graphType === 'no-dirigido') {
      newAdjList[targetNode] = [...newAdjList[targetNode], { to: sourceNode, label: newEdgeLabel }];
    }
    
    const newEdgesList = [...edges, newEdge];
    
    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);
    setEdgeCounter(edgeCounter + 1);
    
    // Agregar al historial
    addToHistory({
      type: 'add-edge',
      source: sourceNode,
      target: targetNode,
      label: newEdgeLabel,
      previousState: previousState,
      newState: {
        adjacencyList: newAdjList,
        edges: newEdgesList,
        edgeCounter: edgeCounter + 1
      }
    });

    showMessage(`Arista agregada: ${sourceNode} → ${targetNode} (etiqueta: ${newEdgeLabel})`, 'success');
    setSourceNode('');
    setTargetNode('');
    markAsChanged();
  };

  // Función para eliminar una arista (legacy - usar handleDeleteEdgeByLabel)
  // eslint-disable-next-line no-unused-vars
  const handleDeleteEdge = () => {
    if (!sourceNode || !targetNode || !isStructureCreated) {
      showMessage('Por favor ingrese vértices de origen y destino válidos', 'error');
      return;
    }

    // Verificar si la arista existe
    const existingEdge = adjacencyList[sourceNode]?.find(edge => edge.to === targetNode);
    if (!existingEdge) {
      showMessage('La arista no existe', 'error');
      return;
    }

    // Guardar estado anterior para el historial
    const previousState = {
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges]
    };
    
    const edgeLabel = existingEdge.label;
    
    // Eliminar arista
    const newAdjList = { ...adjacencyList };
    newAdjList[sourceNode] = newAdjList[sourceNode].filter(edge => edge.to !== targetNode);
    
    // Si es no dirigido, eliminar arista inversa
    if (graphType === 'no-dirigido') {
      newAdjList[targetNode] = newAdjList[targetNode].filter(edge => edge.to !== sourceNode);
    }
    
    // Eliminar de la lista de aristas
    const newEdgesList = edges.filter(e => !(e.from === sourceNode && e.to === targetNode));
    
    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);
    
    // Agregar al historial
    addToHistory({
      type: 'delete-edge',
      source: sourceNode,
      target: targetNode,
      label: edgeLabel,
      previousState: previousState,
      newState: {
        adjacencyList: newAdjList,
        edges: newEdgesList
      }
    });

    showMessage(`Arista eliminada: ${sourceNode} → ${targetNode} (etiqueta: ${edgeLabel})`, 'success');
    setSourceNode('');
    setTargetNode('');
    markAsChanged();
  };

  // Función para eliminar arista por etiqueta
  const handleDeleteEdgeByLabel = () => {
    if (!edgeLabel || !isStructureCreated) {
      showMessage('Por favor ingrese una etiqueta válida', 'error');
      return;
    }

    const labelNum = parseInt(edgeLabel);
    if (isNaN(labelNum)) {
      showMessage('La etiqueta debe ser un número', 'error');
      return;
    }

    // Buscar la arista con esa etiqueta
    const edge = edges.find(e => e.label === labelNum);
    if (!edge) {
      showMessage(`No existe una arista con etiqueta ${labelNum}`, 'error');
      return;
    }

    // Guardar estado anterior
    const previousState = {
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges]
    };

    // Eliminar arista
    const newAdjList = { ...adjacencyList };
    newAdjList[edge.from] = newAdjList[edge.from].filter(e => e.label !== labelNum);

    // Si es no dirigido, eliminar arista inversa
    if (graphType === 'no-dirigido') {
      newAdjList[edge.to] = newAdjList[edge.to].filter(e => e.to === edge.from);
    }

    const newEdgesList = edges.filter(e => e.label !== labelNum);

    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);

    // Agregar al historial
    addToHistory({
      type: 'delete-edge-label',
      label: labelNum,
      previousState: previousState,
      newState: {
        adjacencyList: newAdjList,
        edges: newEdgesList
      }
    });

    showMessage(`Arista eliminada: ${edge.from} → ${edge.to} (etiqueta: ${labelNum})`, 'success');
    setEdgeLabel('');
    markAsChanged();
  };

  // Función para eliminar vértice
  const handleDeleteVertex = () => {
    if (!sourceNode || !isStructureCreated) {
      showMessage('Por favor ingrese un vértice válido', 'error');
      return;
    }

    if (!nodes.includes(sourceNode)) {
      showMessage('El vértice no existe en el grafo', 'error');
      return;
    }

    // Guardar estado anterior
    const previousState = {
      nodes: [...nodes],
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges]
    };

    // Eliminar vértice de la lista
    const newNodesList = nodes.filter(n => n !== sourceNode);

    // Eliminar todas las aristas conectadas a este vértice
    const newAdjList = { ...adjacencyList };
    delete newAdjList[sourceNode]; // Eliminar aristas salientes

    // Eliminar aristas entrantes
    Object.keys(newAdjList).forEach(node => {
      newAdjList[node] = newAdjList[node].filter(edge => edge.to !== sourceNode);
    });

    // Actualizar lista de aristas
    const newEdgesList = edges.filter(e => e.from !== sourceNode && e.to !== sourceNode);

    setNodes(newNodesList);
    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);

    // Agregar al historial
    addToHistory({
      type: 'delete-vertex',
      vertex: sourceNode,
      previousState: previousState,
      newState: {
        nodes: newNodesList,
        adjacencyList: newAdjList,
        edges: newEdgesList
      }
    });

    showMessage(`Vértice eliminado: ${sourceNode}`, 'success');
    setSourceNode('');
    markAsChanged();
  };

  // Función para fusionar vértices
  const handleMergeVertices = () => {
    if (!sourceNode || !targetNode || !isStructureCreated) {
      showMessage('Por favor ingrese dos vértices válidos', 'error');
      return;
    }

    if (!nodes.includes(sourceNode) || !nodes.includes(targetNode)) {
      showMessage('Los vértices deben existir en el grafo', 'error');
      return;
    }

    if (sourceNode === targetNode) {
      showMessage('No se puede fusionar un vértice consigo mismo', 'error');
      return;
    }

    // Guardar estado anterior
    const previousState = {
      nodes: [...nodes],
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges],
      edgeCounter: edgeCounter
    };

    // Crear nombre compuesto para el vértice fusionado (formato: Base,Fusionado)
    const mergedNodeName = `${sourceNode},${targetNode}`;
    
    // Fusionar: sourceNode y targetNode se combinan en mergedNodeName
    const newNodesList = nodes
      .filter(n => n !== sourceNode && n !== targetNode)
      .concat(mergedNodeName);
    
    const newAdjList = { ...adjacencyList };
    
    // Combinar TODAS las aristas de ambos nodos hacia el nuevo nodo fusionado
    const sourceEdges = newAdjList[sourceNode] || [];
    const targetEdges = newAdjList[targetNode] || [];
    
    // Crear lista de aristas para el nodo fusionado
    newAdjList[mergedNodeName] = [];
    
    // Agregar TODAS las aristas del sourceNode
    // Las aristas que iban a targetNode ahora se convierten en bucles
    sourceEdges.forEach(edge => {
      if (edge.to === targetNode) {
        // Arista entre los dos vértices fusionados -> se convierte en bucle
        newAdjList[mergedNodeName].push({ ...edge, to: mergedNodeName });
      } else if (edge.to === sourceNode) {
        // Bucle en sourceNode -> se mantiene como bucle en el nodo fusionado
        newAdjList[mergedNodeName].push({ ...edge, to: mergedNodeName });
      } else {
        // Arista normal -> se mantiene
        newAdjList[mergedNodeName].push(edge);
      }
    });
    
    // Agregar TODAS las aristas del targetNode
    // EXCEPTO las que van a sourceNode (ya fueron agregadas arriba)
    targetEdges.forEach(edge => {
      if (edge.to === sourceNode) {
        // NO agregar: ya se procesó como bucle desde sourceNode
        // Esto evita duplicar bucles
      } else if (edge.to === targetNode) {
        // Bucle en targetNode -> se mantiene como bucle en el nodo fusionado
        newAdjList[mergedNodeName].push({ ...edge, to: mergedNodeName });
      } else {
        // Arista normal -> se mantiene
        newAdjList[mergedNodeName].push(edge);
      }
    });

    // Actualizar TODAS las aristas entrantes de sourceNode y targetNode al nodo fusionado
    Object.keys(newAdjList).forEach(node => {
      if (node !== sourceNode && node !== targetNode && node !== mergedNodeName) {
        newAdjList[node] = newAdjList[node].map(edge => {
          if (edge.to === sourceNode || edge.to === targetNode) {
            return { ...edge, to: mergedNodeName };
          }
          return edge;
        });
      }
    });

    // Eliminar nodos originales
    delete newAdjList[sourceNode];
    delete newAdjList[targetNode];

    // Actualizar lista de aristas
    // Filtrar aristas duplicadas cuando se crean bucles entre los vértices fusionados
    const seenBetweenFused = new Set();
    const newEdgesList = edges.filter(e => {
      // Determinar nuevos from/to después de fusión
      let willBeFrom = e.from;
      let willBeTo = e.to;
      
      if (e.from === sourceNode || e.from === targetNode) {
        willBeFrom = mergedNodeName;
      }
      if (e.to === sourceNode || e.to === targetNode) {
        willBeTo = mergedNodeName;
      }
      
      // Si la arista se convierte en bucle (ambos extremos son el nodo fusionado)
      if (willBeFrom === mergedNodeName && willBeTo === mergedNodeName) {
        // Verificar si es una arista entre sourceNode y targetNode (no bucles previos)
        const isBetweenFusedNodes = 
          (e.from === sourceNode && e.to === targetNode) ||
          (e.from === targetNode && e.to === sourceNode);
        
        if (isBetweenFusedNodes) {
          // Para aristas entre los vértices fusionados, solo mantener una por etiqueta
          const edgeKey = `between-${e.label}`;
          if (seenBetweenFused.has(edgeKey)) {
            return false; // Duplicado, eliminar
          }
          seenBetweenFused.add(edgeKey);
          return true;
        }
        
        // Bucles que ya existían (A->A o B->B) se mantienen siempre
        return true;
      }
      
      // Aristas normales se mantienen todas
      return true;
    }).map(e => {
      let newEdge = { ...e };
      if (e.from === sourceNode || e.from === targetNode) {
        newEdge.from = mergedNodeName;
      }
      if (e.to === sourceNode || e.to === targetNode) {
        newEdge.to = mergedNodeName;
      }
      return newEdge;
    });

    setNodes(newNodesList);
    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);

    // Agregar al historial
    addToHistory({
      type: 'merge-vertices',
      source: sourceNode,
      target: targetNode,
      mergedName: mergedNodeName,
      previousState: previousState,
      newState: {
        nodes: newNodesList,
        adjacencyList: newAdjList,
        edges: newEdgesList,
        edgeCounter: edgeCounter
      }
    });

    showMessage(`Vértices fusionados: ${mergedNodeName}`, 'success');
    setSourceNode('');
    setTargetNode('');
    markAsChanged();
  };

  // Función para contraer arista
  const handleContractEdge = () => {
    if (!edgeLabel || !isStructureCreated) {
      showMessage('Por favor ingrese una etiqueta de arista válida', 'error');
      return;
    }

    const labelNum = parseInt(edgeLabel);
    if (isNaN(labelNum)) {
      showMessage('La etiqueta debe ser un número', 'error');
      return;
    }

    // Buscar la arista
    const edge = edges.find(e => e.label === labelNum);
    if (!edge) {
      showMessage(`No existe una arista con etiqueta ${labelNum}`, 'error');
      return;
    }

    // Guardar estado anterior
    const previousState = {
      nodes: [...nodes],
      adjacencyList: JSON.parse(JSON.stringify(adjacencyList)),
      edges: [...edges],
      edgeCounter: edgeCounter
    };

    // Contraer arista: fusionar edge.from y edge.to (formato: Base,Fusionado)
    // La contracción de arista conlleva una fusión de vértices
    const sourceVertex = edge.from;
    const targetVertex = edge.to;
    const contractedNodeName = `${sourceVertex},${targetVertex}`;

    // Eliminar ambos vértices originales y agregar el nuevo
    const newNodesList = nodes
      .filter(n => n !== sourceVertex && n !== targetVertex)
      .concat(contractedNodeName);
    
    const newAdjList = { ...adjacencyList };

    // Crear lista de aristas para el nodo contraído
    newAdjList[contractedNodeName] = [];

    // Agregar TODAS las aristas salientes de sourceVertex (excepto la contraída)
    const sourceEdges = newAdjList[sourceVertex] || [];
    sourceEdges.forEach(e => {
      if (e.label !== labelNum) {
        if (e.to === targetVertex) {
          // Otra arista entre sourceVertex y targetVertex -> bucle
          newAdjList[contractedNodeName].push({ ...e, to: contractedNodeName });
        } else if (e.to === sourceVertex) {
          // Bucle en sourceVertex -> bucle en nodo fusionado
          newAdjList[contractedNodeName].push({ ...e, to: contractedNodeName });
        } else {
          // Arista normal
          newAdjList[contractedNodeName].push(e);
        }
      }
    });

    // Agregar TODAS las aristas salientes de targetVertex
    const targetEdges = newAdjList[targetVertex] || [];
    targetEdges.forEach(e => {
      if (e.to === sourceVertex) {
        // Arista de targetVertex a sourceVertex -> bucle
        newAdjList[contractedNodeName].push({ ...e, to: contractedNodeName });
      } else if (e.to === targetVertex) {
        // Bucle en targetVertex -> bucle en nodo fusionado
        newAdjList[contractedNodeName].push({ ...e, to: contractedNodeName });
      } else {
        // Arista normal
        newAdjList[contractedNodeName].push(e);
      }
    });

    // Actualizar TODAS las aristas entrantes de sourceVertex y targetVertex
    Object.keys(newAdjList).forEach(node => {
      if (node !== sourceVertex && node !== targetVertex && node !== contractedNodeName) {
        newAdjList[node] = newAdjList[node].map(e => {
          if (e.to === sourceVertex || e.to === targetVertex) {
            return { ...e, to: contractedNodeName };
          }
          return e;
        });
      }
    });

    // Eliminar nodos originales
    delete newAdjList[sourceVertex];
    delete newAdjList[targetVertex];

    // Actualizar lista de aristas
    // Eliminar solo la arista contraída, mantener todas las demás incluyendo bucles
    const newEdgesList = edges
      .filter(e => e.label !== labelNum) // Eliminar SOLO la arista contraída
      .map(e => {
        let newEdge = { ...e };
        if (e.from === sourceVertex || e.from === targetVertex) {
          newEdge.from = contractedNodeName;
        }
        if (e.to === sourceVertex || e.to === targetVertex) {
          newEdge.to = contractedNodeName;
        }
        return newEdge;
      });

    setNodes(newNodesList);
    setAdjacencyList(newAdjList);
    setEdges(newEdgesList);

    // Agregar al historial
    addToHistory({
      type: 'contract-edge',
      label: labelNum,
      previousState: previousState,
      newState: {
        nodes: newNodesList,
        adjacencyList: newAdjList,
        edges: newEdgesList,
        edgeCounter: edgeCounter
      }
    });

    showMessage(`Arista ${labelNum} contraída: nuevo vértice ${contractedNodeName}`, 'success');
    setEdgeLabel('');
    markAsChanged();
  };

  // Funciones de deshacer y rehacer
  const getActionName = (type) => {
    const actionNames = {
      'add-vertices': 'Agregar vértice(s)',
      'add-edge': 'Agregar arista',
      'delete-edge': 'Eliminar arista',
      'delete-edge-label': 'Eliminar arista por etiqueta',
      'delete-vertex': 'Eliminar vértice',
      'merge-vertices': 'Fusión de vértices',
      'contract-edge': 'Contracción de arista'
    };
    return actionNames[type] || type;
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      
      if (action.type === 'add-vertices' || action.type === 'delete-vertex' || action.type === 'merge-vertices') {
        setNodes(action.previousState.nodes);
        setAdjacencyList(action.previousState.adjacencyList);
        setEdges(action.previousState.edges);
        if (action.previousState.edgeCounter !== undefined) {
          setEdgeCounter(action.previousState.edgeCounter);
        }
      } else if (action.type === 'add-edge') {
        setAdjacencyList(action.previousState.adjacencyList);
        setEdges(action.previousState.edges);
        setEdgeCounter(action.previousState.edgeCounter);
      } else if (action.type === 'delete-edge' || action.type === 'delete-edge-label' || action.type === 'contract-edge') {
        setAdjacencyList(action.previousState.adjacencyList);
        setEdges(action.previousState.edges);
        if (action.previousState.nodes) {
          setNodes(action.previousState.nodes);
        }
        if (action.previousState.edgeCounter !== undefined) {
          setEdgeCounter(action.previousState.edgeCounter);
        }
      }
      
      setHistoryIndex(historyIndex - 1);
      showMessage(`${getActionName(action.type)} deshecha`, 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      
      if (action.type === 'add-vertices' || action.type === 'delete-vertex' || action.type === 'merge-vertices') {
        setNodes(action.newState.nodes);
        setAdjacencyList(action.newState.adjacencyList);
        setEdges(action.newState.edges);
        if (action.newState.edgeCounter !== undefined) {
          setEdgeCounter(action.newState.edgeCounter);
        }
      } else if (action.type === 'add-edge') {
        setAdjacencyList(action.newState.adjacencyList);
        setEdges(action.newState.edges);
        setEdgeCounter(action.newState.edgeCounter);
      } else if (action.type === 'delete-edge' || action.type === 'delete-edge-label' || action.type === 'contract-edge') {
        setAdjacencyList(action.newState.adjacencyList);
        setEdges(action.newState.edges);
        if (action.newState.nodes) {
          setNodes(action.newState.nodes);
        }
        if (action.newState.edgeCounter !== undefined) {
          setEdgeCounter(action.newState.edgeCounter);
        }
      }
      
      setHistoryIndex(historyIndex + 1);
      showMessage(`${getActionName(action.type)} rehecha`, 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // Funciones para pan del grafo
  const handleGraphMouseDown = (e) => {
    e.preventDefault();
    if (e.button === 0) { // Solo botón izquierdo
      setIsDragging(true);
      setDragStart({
        x: e.clientX - graphPan.x,
        y: e.clientY - graphPan.y
      });
    }
  };

  const handleGraphMouseMove = (e) => {
    e.preventDefault();
    if (isDragging) {
      setGraphPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleGraphMouseUp = () => {
    setIsDragging(false);
  };

  const handleGraphMouseLeave = () => {
    setIsDragging(false);
  };

  const resetGraphView = () => {
    setGraphZoom(1.0); // Resetear a 100%
    setGraphPan({ x: 0, y: 0 });
  };

  // Función para renderizar el grafo con estilo de Huffman
  const renderGraph = () => {
    if (!isStructureCreated || nodes.length === 0) {
      return (
        <div className="empty-tree">
          <p>El grafo se mostrará aquí cuando agregue vértices</p>
        </div>
      );
    }

    // Calcular posiciones de nodos en malla adaptativa
    const centerX = 500; // Centro horizontal del viewBox (1000/2)
    const centerY = 375; // Centro vertical del viewBox (750/2)
    
    const nodePositions = {};
    
    if (nodes.length === 1) {
      nodePositions[nodes[0]] = { x: centerX, y: centerY };
    } else if (nodes.length === 2) {
      nodePositions[nodes[0]] = { x: centerX - 150, y: centerY };
      nodePositions[nodes[1]] = { x: centerX + 150, y: centerY };
    } else if (nodes.length === 3) {
      // Triángulo equilátero
      nodePositions[nodes[0]] = { x: centerX, y: centerY - 130 };
      nodePositions[nodes[1]] = { x: centerX - 130, y: centerY + 65 };
      nodePositions[nodes[2]] = { x: centerX + 130, y: centerY + 65 };
    } else if (nodes.length === 4) {
      // Cuadrado perfecto
      nodePositions[nodes[0]] = { x: centerX - 130, y: centerY - 130 };
      nodePositions[nodes[1]] = { x: centerX + 130, y: centerY - 130 };
      nodePositions[nodes[2]] = { x: centerX + 130, y: centerY + 130 };
      nodePositions[nodes[3]] = { x: centerX - 130, y: centerY + 130 };
    } else {
      // Layout tipo Matriz organizado por conectividad
      
      // Calcular grado de conectividad de cada nodo
      const nodeDegrees = {};
      nodes.forEach(node => {
        const outgoing = adjacencyList[node]?.length || 0;
        const incoming = Object.values(adjacencyList).reduce((count, edges) => 
          count + edges.filter(e => e.to === node).length, 0);
        nodeDegrees[node] = outgoing + incoming;
      });

      // Ordenar nodos: primero los más conectados en el centro
      const sortedNodes = [...nodes].sort((a, b) => nodeDegrees[b] - nodeDegrees[a]);
      
      // Layout tipo matriz: calcular columnas y filas óptimas
      // Preferir más columnas que filas para mejor visualización horizontal
      const cols = Math.ceil(Math.sqrt(nodes.length * 1.5));
      const rows = Math.ceil(nodes.length / cols);
      
      // Espaciado adaptativo para viewBox 1000x750 (grafos grandes al 100%)
      const baseSpacing = 140; // Optimizado para viewBox reducido
      const adaptiveSpacing = Math.max(100, baseSpacing - nodes.length * 2);
      
      const totalWidth = (cols - 1) * adaptiveSpacing;
      const totalHeight = (rows - 1) * adaptiveSpacing;
      
      // Centrar la matriz
      const startX = centerX - totalWidth / 2;
      const startY = centerY - totalHeight / 2;
      
      // Posicionar nodos en matriz estricta
      // Los nodos más conectados van al centro de la matriz
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);
      
      // Crear posiciones en espiral desde el centro
      const positions = [];
      const visited = new Set();
      
      // Función para agregar posición si es válida
      const addPosition = (row, col) => {
        const key = `${row},${col}`;
        if (row >= 0 && row < rows && col >= 0 && col < cols && !visited.has(key)) {
          visited.add(key);
          positions.push({ row, col });
          return true;
        }
        return false;
      };
      
      // Empezar desde el centro y expandir en espiral
      addPosition(centerRow, centerCol);
      let distance = 1;
      while (positions.length < nodes.length && distance < Math.max(rows, cols)) {
        // Arriba
        for (let c = centerCol - distance; c <= centerCol + distance; c++) {
          addPosition(centerRow - distance, c);
        }
        // Derecha
        for (let r = centerRow - distance + 1; r <= centerRow + distance; r++) {
          addPosition(r, centerCol + distance);
        }
        // Abajo
        for (let c = centerCol + distance - 1; c >= centerCol - distance; c--) {
          addPosition(centerRow + distance, c);
        }
        // Izquierda
        for (let r = centerRow + distance - 1; r > centerRow - distance; r--) {
          addPosition(r, centerCol - distance);
        }
        distance++;
      }
      
      // Asignar posiciones a nodos ordenados
      sortedNodes.forEach((node, index) => {
        if (index < positions.length) {
          const { row, col } = positions[index];
          nodePositions[node] = {
            x: startX + col * adaptiveSpacing,
            y: startY + row * adaptiveSpacing
          };
        }
      });
      
      // Ajuste fino: mover nodos conectados más cerca (sin romper matriz)
      const adjustmentIterations = 20;
      for (let iter = 0; iter < adjustmentIterations; iter++) {
        const adjustments = {};
        nodes.forEach(node => {
          adjustments[node] = { x: 0, y: 0, count: 0 };
        });
        
        // Calcular ajustes basados en vecinos conectados
        edges.forEach(edge => {
          if (edge.from !== edge.to) {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Pequeño ajuste hacia vecinos conectados
            const strength = 0.08;
            adjustments[edge.from].x += dx * strength / distance;
            adjustments[edge.from].y += dy * strength / distance;
            adjustments[edge.from].count++;
            
            adjustments[edge.to].x -= dx * strength / distance;
            adjustments[edge.to].y -= dy * strength / distance;
            adjustments[edge.to].count++;
          }
        });
        
        // Aplicar ajustes suaves
        nodes.forEach(node => {
          if (adjustments[node].count > 0) {
            nodePositions[node].x += adjustments[node].x;
            nodePositions[node].y += adjustments[node].y;
          }
        });
      }
    }

    return (
      <div className="binary-tree-visualization">
        <div className="tree-header">
          <div className="tree-title-section">
            <h4>Grafo {graphType === 'dirigido' ? 'Dirigido' : 'No Dirigido'}</h4>
            <div className="tree-controls">
              <button 
                className="tree-control-btn"
                onClick={resetGraphView}
                title="Restablecer zoom y posición"
              >
                Resetear Vista
              </button>
              <input
                type="number"
                className="zoom-input"
                value={Math.round(graphZoom * 100)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 50;
                  const clampedValue = Math.max(50, Math.min(300, value));
                  setGraphZoom(clampedValue / 100);
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
              <div className="legend-circle" style={{backgroundColor: '#4a90e2', border: '2px solid #2c5282'}}></div>
              <span>Vértice</span>
            </div>
            <div className="legend-item">
              <svg width="40" height="20">
                <line x1="5" y1="10" x2="35" y2="10" stroke="#48bb78" strokeWidth="2.5" />
              </svg>
              <span>Arista</span>
            </div>
          </div>
          <div className="tree-instructions">
            <p><strong>Arrastrar:</strong> Click y mantén para mover | <strong>Zoom:</strong> Control de zoom en la ventana</p>
          </div>
        </div>
        <div 
          ref={graphContainerRef}
          className="tree-svg-container"
          onMouseDown={handleGraphMouseDown}
          onMouseMove={handleGraphMouseMove}
          onMouseUp={handleGraphMouseUp}
          onMouseLeave={handleGraphMouseLeave}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <svg 
            width="800" 
            height="600" 
            viewBox="0 0 1000 750"
            style={{
              transform: `translate(${graphPan.x}px, ${graphPan.y}px) scale(${baseScale * graphZoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Definir gradientes y efectos */}
            <defs>
              {/* Gradiente para aristas */}
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#48bb78" stopOpacity="1" />
                <stop offset="100%" stopColor="#38a169" stopOpacity="1" />
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
              
              {/* Flecha para grafos dirigidos */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#48bb78" />
              </marker>
            </defs>

            {/* Renderizar aristas con etiquetas */}
            {(() => {
              // Primero, analizar todas las aristas para detectar múltiples entre mismos vertices
              const edgeGroups = {}; // Agrupar aristas por pares de vértices
              
              Object.entries(adjacencyList).forEach(([source, edgesList]) => {
                edgesList.forEach((edge, idx) => {
                  const target = edge.to;
                  
                  // Para grafos no dirigidos, normalizar orden
                  let pairKey;
                  if (graphType === 'no-dirigido') {
                    pairKey = source < target ? `${source}-${target}` : `${target}-${source}`;
                  } else {
                    pairKey = `${source}-${target}`;
                  }
                  
                  if (!edgeGroups[pairKey]) {
                    edgeGroups[pairKey] = [];
                  }
                  edgeGroups[pairKey].push({ source, edge, idx });
                });
              });
              
              // Renderizar aristas con curvas adaptativas
              return Object.entries(adjacencyList).map(([source, edgesList]) => 
                edgesList.map((edge, idx) => {
                  const sourcePos = nodePositions[source];
                  const targetPos = nodePositions[edge.to];
                  
                  // Verificar si es un loop (arista de un nodo a sí mismo)
                  const isLoop = source === edge.to;
                  const nodeRadius = 30;
                  
                  // Para grafos no dirigidos, evitar dibujar aristas duplicadas
                  if (graphType === 'no-dirigido' && source > edge.to) {
                    return null; // Solo dibujar una vez para cada par de nodos
                  }
                  
                  if (isLoop) {
                    // Renderizar loops - calcular cuántos loops tiene este nodo
                    const loopsCount = edgesList.filter(e => e.to === source).length;
                    const loopIndex = edgesList.slice(0, idx).filter(e => e.to === source).length;
                    
                    // Distribuir loops alrededor del nodo
                    const loopRadius = 25;
                    const angleOffset = (loopIndex - (loopsCount - 1) / 2) * 0.6; // Distribuir loops
                    const loopAngle = -Math.PI / 2 + angleOffset; // -90° es arriba
                    
                    const loopCenterX = sourcePos.x + (nodeRadius + loopRadius) * Math.cos(loopAngle) * 0.7;
                    const loopCenterY = sourcePos.y + (nodeRadius + loopRadius) * Math.sin(loopAngle) * 0.7;
                    
                    return (
                      <g key={`edge-${source}-${edge.to}-${idx}`}>
                        {/* Círculo del loop */}
                        <circle
                          cx={loopCenterX}
                          cy={loopCenterY}
                          r={loopRadius}
                          fill="none"
                          stroke="#48bb78"
                          strokeWidth="2.5"
                          markerEnd={graphType === 'dirigido' ? "url(#arrowhead)" : ""}
                        />
                        
                        {/* Etiqueta del loop */}
                        <g>
                          <circle
                            cx={loopCenterX + loopRadius * Math.cos(loopAngle) * 1.3}
                            cy={loopCenterY + loopRadius * Math.sin(loopAngle) * 1.3}
                            r="14"
                            fill="white"
                            stroke="#48bb78"
                            strokeWidth="2"
                          />
                          <text
                            x={loopCenterX + loopRadius * Math.cos(loopAngle) * 1.3}
                            y={loopCenterY + loopRadius * Math.sin(loopAngle) * 1.3 + 5}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="700"
                            fill="#2f855a"
                          >
                            {edge.label}
                          </text>
                        </g>
                      </g>
                    );
                  }
                  
                  // Detectar aristas múltiples entre mismos vértices
                  let pairKey;
                  if (graphType === 'no-dirigido') {
                    pairKey = source < edge.to ? `${source}-${edge.to}` : `${edge.to}-${source}`;
                  } else {
                    pairKey = `${source}-${edge.to}`;
                  }
                  
                  const edgesInGroup = edgeGroups[pairKey];
                  const edgeIndexInGroup = edgesInGroup.findIndex(e => 
                    e.source === source && e.edge.label === edge.label && e.idx === idx
                  );
                  
                  // Lógica de aristas: RECTAS por defecto, curvas SOLO cuando necesario
                  let curveOffset = 0;
                  
                  // CASO 1: Múltiples aristas entre los mismos nodos
                  if (edgesInGroup.length > 1) {
                    // Distribuir aristas múltiples con curvas
                    const maxCurve = 40; // Curvatura moderada
                    const step = maxCurve / (edgesInGroup.length - 1);
                    curveOffset = -maxCurve / 2 + step * edgeIndexInGroup;
                  }
                  // CASO 2: Grafos dirigidos con aristas bidireccionales
                  else if (graphType === 'dirigido') {
                    const reverseKey = `${edge.to}-${source}`;
                    if (edgeGroups[reverseKey]) {
                      // Hay arista en sentido contrario, usar curva ligera
                      curveOffset = edgeIndexInGroup % 2 === 0 ? 15 : -15;
                    }
                  }
                  // CASO 3 y demás: LÍNEA RECTA (sin verificar colisiones)
                  // Las líneas rectas se adaptarán naturalmente con el espaciado adecuado
                  
                  // Calcular ángulo de la arista
                  const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
                  
                  // Calcular path con curva bezier adaptativa
                  let pathD;
                  let labelX, labelY;
                  
                  if (curveOffset !== 0) {
                    // Usar curva bezier cuadrática para aristas múltiples
                    const midX = (sourcePos.x + targetPos.x) / 2;
                    const midY = (sourcePos.y + targetPos.y) / 2;
                    const perpAngle = angle + Math.PI / 2;
                    const controlX = midX + curveOffset * Math.cos(perpAngle);
                    const controlY = midY + curveOffset * Math.sin(perpAngle);
                    
                    // Ajustar inicio y fin para que sigan la curva
                    const curveStartAngle = Math.atan2(controlY - sourcePos.y, controlX - sourcePos.x);
                    const curveEndAngle = Math.atan2(targetPos.y - controlY, targetPos.x - controlX);
                    
                    const startX = sourcePos.x + nodeRadius * Math.cos(curveStartAngle);
                    const startY = sourcePos.y + nodeRadius * Math.sin(curveStartAngle);
                    const endX = targetPos.x - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.cos(curveEndAngle);
                    const endY = targetPos.y - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.sin(curveEndAngle);
                    
                    pathD = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
                    
                    // Etiqueta en el punto medio de la curva bezier
                    const t = 0.5;
                    labelX = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
                    labelY = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
                  } else {
                    // Línea recta simple
                    const startX = sourcePos.x + nodeRadius * Math.cos(angle);
                    const startY = sourcePos.y + nodeRadius * Math.sin(angle);
                    const endX = targetPos.x - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.cos(angle);
                    const endY = targetPos.y - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.sin(angle);
                    
                    pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
                    labelX = (startX + endX) / 2;
                    labelY = (startY + endY) / 2;
                  }
                
                  const isVisited = visitedNodes.some(visit => 
                    visit.from === source && visit.to === edge.to
                  );
                  
                  return (
                    <g key={`edge-${source}-${edge.to}-${idx}`}>
                      {/* Path de la arista con curva adaptativa */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#e8f5e9"
                        strokeWidth={isVisited ? "5" : "4"}
                        strokeLinecap="round"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isVisited ? "#10b981" : "#48bb78"}
                        strokeWidth={isVisited ? "3" : "2.5"}
                        strokeLinecap="round"
                        markerEnd={graphType === 'dirigido' ? "url(#arrowhead)" : ""}
                        style={{
                          transition: 'all 0.3s ease'
                        }}
                      />
                      
                      {/* Etiqueta de la arista */}
                      <g>
                        {/* Círculo de fondo para la etiqueta */}
                        <circle
                          cx={labelX}
                          cy={labelY}
                          r="14"
                          fill="white"
                          stroke={isVisited ? "#10b981" : "#48bb78"}
                          strokeWidth={isVisited ? "3" : "2"}
                          style={{
                            transition: 'all 0.3s ease'
                          }}
                        />
                        
                        {/* Texto de la etiqueta */}
                        <text
                          x={labelX}
                          y={labelY + 5}
                          textAnchor="middle"
                          fontSize="13"
                          fontWeight="700"
                          fill={isVisited ? "#065f46" : "#2f855a"}
                          style={{
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {edge.label}
                        </text>
                      </g>
                    </g>
                  );
                })
              );
            })()}

            {/* Renderizar nodos con sombras y mejores efectos */}
            {nodes.map((node) => {
              const pos = nodePositions[node];
              const isVisited = visitedNodes.includes(node);
              const isCurrent = currentNode === node;
              
              // Determinar colores basados en el estado
              let nodeFill = "#4a90e2"; // Azul como Huffman
              let nodeStroke = "#2c5282";
              let borderOpacity = "0.3";
              let strokeWidth = "3";
              
              if (isCurrent) {
                nodeFill = "#fbbf24";
                nodeStroke = "#f59e0b";
                borderOpacity = "0.5";
                strokeWidth = "4";
              } else if (isVisited) {
                nodeFill = "#60a5fa";
                nodeStroke = "#3b82f6";
                borderOpacity = "0.4";
                strokeWidth = "3.5";
              }
              
              return (
                <g key={`node-${node}`} className="tree-node-group" filter="url(#nodeShadow)">
                  {/* Círculo exterior (borde) */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="32"
                    fill={nodeStroke}
                    opacity={borderOpacity}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Círculo del nodo */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="30"
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={strokeWidth}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Texto del nodo */}
                  <text
                    x={pos.x}
                    y={pos.y + 7}
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill="white"
                    style={{ 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {node}
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
        <h1>Operaciones sobre un Grafo</h1>
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
            title="Cargar estructura desde archivo .sgf"
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

      {/* Modal para configurar nuevo grafo */}
      {showNewGraphModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🆕 Crear Nuevo Grafo</h3>
            <p>Seleccione el tipo de grafo que desea crear:</p>
            <div className="config-group" style={{ margin: '20px 0' }}>
              <label>
                <input
                  type="radio"
                  value="dirigido"
                  checked={newGraphType === 'dirigido'}
                  onChange={(e) => setNewGraphType(e.target.value)}
                />
                <span style={{ marginLeft: '8px' }}>Grafo Dirigido</span>
              </label>
              <br />
              <label style={{ marginTop: '10px', display: 'inline-block' }}>
                <input
                  type="radio"
                  value="no-dirigido"
                  checked={newGraphType === 'no-dirigido'}
                  onChange={(e) => setNewGraphType(e.target.value)}
                />
                <span style={{ marginLeft: '8px' }}>Grafo No Dirigido</span>
              </label>
            </div>
            <div className="modal-buttons">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowNewGraphModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn save"
                onClick={confirmNewGraph}
              >
                Crear Grafo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área Principal de Simulación */}
      <div className="simulation-area">
        {/* Panel de Manejo y Operaciones */}
        <div className="options-panel">
          <h3>Manejo y Operaciones</h3>
          
          {/* Nuevo Grafo */}
          <div className="control-group">
            <button 
              onClick={handleNewGraph}
              className="new-tree-btn"
              title="Crear un nuevo grafo"
            >
              Nuevo Grafo
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

          {/* Tipo de Operación */}
          <div className="control-group">
            <label>Tipo de Operación</label>
            <select
              value={operationType}
              onChange={(e) => {
                setOperationType(e.target.value);
                setSourceNode('');
                setTargetNode('');
                setNewVertices('');
                setEdgeLabel('');
              }}
              className="operation-select"
              disabled={!isStructureCreated}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isStructureCreated ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="anadir">Añadir</option>
              <option value="eliminar">Eliminar</option>
              <option value="fusion">Fusión / Contracción</option>
            </select>
          </div>

          {/* Operaciones de Añadir */}
          {operationType === 'anadir' && (
            <>
              {/* Agregar Vértices */}
              <div className="control-group">
                <label>Agregar Vértice(s)</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={newVertices}
                    onChange={(e) => setNewVertices(e.target.value.toUpperCase())}
                    placeholder="Ej: A, B, C o A,B,C"
                    className="operation-input"
                    style={{ flex: 1 }}
                    disabled={!isStructureCreated}
                  />
                  <button 
                    onClick={handleAddVertices}
                    className="operation-btn insert-btn"
                    disabled={!isStructureCreated || !newVertices.trim()}
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Solo letras, automáticamente en mayúsculas. Separe múltiples con comas.
                </small>
              </div>

              {/* Agregar Arista */}
              <div className="control-group">
                <label>Agregar Arista</label>
                <div className="input-with-button" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value.toUpperCase())}
                    placeholder="De (Ej: A)"
                    className="operation-input"
                    style={{ flex: '1', minWidth: '60px' }}
                    disabled={!isStructureCreated}
                    maxLength={1}
                  />
                  <span style={{ alignSelf: 'center' }}>→</span>
                  <input
                    type="text"
                    value={targetNode}
                    onChange={(e) => setTargetNode(e.target.value.toUpperCase())}
                    placeholder="A (Ej: B)"
                    className="operation-input"
                    style={{ flex: '1', minWidth: '60px' }}
                    disabled={!isStructureCreated}
                    maxLength={1}
                  />
                  <button 
                    onClick={handleAddEdge}
                    className="operation-btn insert-btn"
                    disabled={!isStructureCreated || !sourceNode || !targetNode}
                    style={{ flex: '0 0 auto' }}
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Etiqueta asignada automáticamente. Permite loops (A→A).
                </small>
              </div>
            </>
          )}

          {/* Operaciones de Eliminar */}
          {operationType === 'eliminar' && (
            <>
              {/* Eliminar Vértice */}
              <div className="control-group">
                <label>Eliminar Vértice</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value.toUpperCase())}
                    placeholder="Vértice (Ej: A)"
                    className="operation-input"
                    style={{ flex: 1 }}
                    disabled={!isStructureCreated}
                    maxLength={1}
                  />
                  <button 
                    onClick={handleDeleteVertex}
                    className="operation-btn delete-btn"
                    disabled={!isStructureCreated || !sourceNode}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Elimina el vértice y todas sus aristas conectadas.
                </small>
              </div>

              {/* Eliminar Arista por Etiqueta */}
              <div className="control-group">
                <label>Eliminar Arista (por etiqueta)</label>
                <div className="input-with-button">
                  <input
                    type="number"
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    placeholder="Etiqueta (Ej: 1)"
                    className="operation-input"
                    style={{ flex: 1 }}
                    disabled={!isStructureCreated}
                    min="1"
                  />
                  <button 
                    onClick={handleDeleteEdgeByLabel}
                    className="operation-btn delete-btn"
                    disabled={!isStructureCreated || !edgeLabel}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Elimina la arista con la etiqueta especificada.
                </small>
              </div>
            </>
          )}

          {/* Operaciones de Fusión/Contracción */}
          {operationType === 'fusion' && (
            <>
              {/* Fusión de Vértices */}
              <div className="control-group">
                <label>Fusión de Vértices</label>
                <div className="input-with-button" style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="text"
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value.toUpperCase())}
                    placeholder="Base (Ej: A)"
                    className="operation-input"
                    style={{ flex: '1' }}
                    disabled={!isStructureCreated}
                    maxLength={1}
                  />
                  <span style={{ alignSelf: 'center' }}>←</span>
                  <input
                    type="text"
                    value={targetNode}
                    onChange={(e) => setTargetNode(e.target.value.toUpperCase())}
                    placeholder="Absorber (Ej: B)"
                    className="operation-input"
                    style={{ flex: '1' }}
                    disabled={!isStructureCreated}
                    maxLength={1}
                  />
                  <button 
                    onClick={handleMergeVertices}
                    className="operation-btn insert-btn"
                    disabled={!isStructureCreated || !sourceNode || !targetNode}
                    style={{ 
                      backgroundColor: (!isStructureCreated || !sourceNode || !targetNode) ? '#cbd5e0' : '#8b5cf6',
                      borderColor: (!isStructureCreated || !sourceNode || !targetNode) ? '#a0aec0' : '#7c3aed',
                      color: (!isStructureCreated || !sourceNode || !targetNode) ? '#718096' : 'white',
                      cursor: (!isStructureCreated || !sourceNode || !targetNode) ? 'not-allowed' : 'pointer',
                      opacity: (!isStructureCreated || !sourceNode || !targetNode) ? 0.6 : 1,
                      flex: '0 0 auto'
                    }}
                  >
                    Fusionar
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Fusiona el segundo vértice en el primero.
                </small>
              </div>

              {/* Contracción de Arista */}
              <div className="control-group">
                <label>Contracción de Arista</label>
                <div className="input-with-button">
                  <input
                    type="number"
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    placeholder="Etiqueta (Ej: 1)"
                    className="operation-input"
                    style={{ flex: 1 }}
                    disabled={!isStructureCreated}
                    min="1"
                  />
                  <button 
                    onClick={handleContractEdge}
                    className="operation-btn insert-btn"
                    disabled={!isStructureCreated || !edgeLabel}
                    style={{ 
                      backgroundColor: (!isStructureCreated || !edgeLabel) ? '#cbd5e0' : '#8b5cf6',
                      borderColor: (!isStructureCreated || !edgeLabel) ? '#a0aec0' : '#7c3aed',
                      color: (!isStructureCreated || !edgeLabel) ? '#718096' : 'white',
                      cursor: (!isStructureCreated || !edgeLabel) ? 'not-allowed' : 'pointer',
                      opacity: (!isStructureCreated || !edgeLabel) ? 0.6 : 1
                    }}
                  >
                    Contraer
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Contrae la arista fusionando sus vértices extremos.
                </small>
              </div>
            </>
          )}
        </div>

        {/* Área de Simulación */}
        <div className="simulation-canvas">
          <h3>Área de Simulación</h3>
          {!isStructureCreated ? (
            <div className="empty-state">
              <p>Cree un nuevo grafo para comenzar</p>
            </div>
          ) : (
            <div className="canvas-content">
              <div className="simulation-info">
                <p><strong>Tipo:</strong> {graphType === 'dirigido' ? 'Dirigido' : 'No Dirigido'}</p>
                <p><strong>Vértices:</strong> S = {'{'}{nodes.length > 0 ? nodes.join(', ') : '∅'}{'}'}</p>
                <p><strong>Aristas:</strong> A = {'{'}{edges.length > 0 ? edges.map(e => e.label).sort((a, b) => a - b).join(', ') : '∅'}{'}'}</p>
              </div>
              
              {/* Visualización del grafo */}
              <div className="graph-visualization-container">
                {renderGraph()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SobreGrafoSection;
