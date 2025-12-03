import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Undo, 
  Redo, 
  Play,
  Plus,
  Trash2
} from 'lucide-react';
import '../styles/SequentialSearchSection.css';

function EntreGrafosSection({ onNavigate }) { // eslint-disable-line no-unused-vars
  // Estados para la configuración
  const graphType = 'no-dirigido'; // Fijo: siempre no dirigido
  const [isStructureCreated, setIsStructureCreated] = useState(false);
  
  // Estados para las operaciones
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [operationType, setOperationType] = useState('union'); // union, interseccion, cartesiano, tensorial, composicion
  const [activeGraph, setActiveGraph] = useState('A'); // A o B - indica cuál grafo está activo
  const [newVertices, setNewVertices] = useState('');
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [edgeCounter, setEdgeCounter] = useState(1);
  
  // Estados para dos grafos (A y B)
  const [graphA, setGraphA] = useState({
    nodes: [],
    edges: [],
    adjacencyList: {},
    edgeCounter: 1
  });
  
  const [graphB, setGraphB] = useState({
    nodes: [],
    edges: [],
    adjacencyList: {},
    edgeCounter: 1
  });
  
  // Grafo resultante de operaciones
  const [resultGraph, setResultGraph] = useState({
    nodes: [],
    edges: [],
    adjacencyList: {},
    operation: null
  });
  
  // Estados para mensajes informativos
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Sistema de historial
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para zoom y pan del grafo
  const [graphZoom, setGraphZoom] = useState(1.0);
  const baseScale = 1.0;
  const [graphPan, setGraphPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const graphContainerRef = React.useRef(null);
  
  // Estado para tabs de visualización (A, B, o Resultado)
  const [activeTab, setActiveTab] = useState('A');
  
  // Estados para control de cambios y guardado
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Función para mostrar mensajes
  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  // Función para marcar cambios no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Obtener el grafo activo
  const getActiveGraph = () => {
    return activeGraph === 'A' ? graphA : graphB;
  };

  // Actualizar el grafo activo
  const updateActiveGraph = (updates) => {
    if (activeGraph === 'A') {
      setGraphA({ ...graphA, ...updates });
    } else {
      setGraphB({ ...graphB, ...updates });
    }
  };

  // Crear objeto de datos para guardar
  const createSaveData = () => {
    return {
      fileType: 'EGF', // Entre Grafos File
      version: '1.0',
      sectionType: 'entre-grafos',
      sectionName: 'Operaciones entre Múltiples Grafos',
      timestamp: new Date().toISOString(),
      configuration: {
        graphType: graphType
      },
      data: {
        graphA: JSON.parse(JSON.stringify(graphA)),
        graphB: JSON.parse(JSON.stringify(graphB)),
        resultGraph: JSON.parse(JSON.stringify(resultGraph)),
        edgeCounter: edgeCounter,
        isStructureCreated: isStructureCreated
      },
      metadata: {
        graphANodesCount: graphA.nodes.length,
        graphAEdgesCount: graphA.edges.length,
        graphBNodesCount: graphB.nodes.length,
        graphBEdgesCount: graphB.edges.length,
        description: `Grafos ${graphType} - A: ${graphA.nodes.length} nodos, B: ${graphB.nodes.length} nodos`
      }
    };
  };

  // Guardar archivo
  const handleSave = async () => {
    if (!isStructureCreated) {
      showMessage('No hay estructura para guardar', 'error');
      return;
    }

    if (graphA.nodes.length === 0 && graphB.nodes.length === 0) {
      showMessage('Los grafos no tienen vértices para guardar', 'error');
      return;
    }

    const defaultName = currentFileName 
      ? currentFileName.replace('.egf', '')
      : `entre-grafos-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

    const dataToSave = createSaveData();
    const jsonString = JSON.stringify(dataToSave, null, 2);

    try {
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.egf`,
          types: [{
            description: 'Archivos de Operaciones entre Grafos',
            accept: {
              'application/json': ['.egf']
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
        const fileName = prompt('Ingrese el nombre del archivo:', defaultName);
        if (!fileName) return;

        const finalFileName = fileName.endsWith('.egf') ? fileName : `${fileName}.egf`;
        const blob = new Blob([jsonString], { type: 'application/json' });
        
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

  // Cargar archivo
  const handleLoad = async () => {
    const executeLoad = async () => {
      try {
        let file = null;
        let fileName = '';
        let content = '';

        if ('showOpenFilePicker' in window) {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [{
              description: 'Archivos de Operaciones entre Grafos',
              accept: {
                'application/json': ['.egf']
              }
            }],
            multiple: false
          });
          
          file = await fileHandle.getFile();
          fileName = file.name;
          content = await file.text();
        } else {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.egf';
          
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

        if (!file || !fileName.endsWith('.egf')) {
          if (file) {
            showMessage('Por favor seleccione un archivo .egf válido', 'error');
          }
          return;
        }

        const loadedData = JSON.parse(content);
        
        if (!loadedData.fileType || loadedData.fileType !== 'EGF') {
          showMessage('Archivo no válido: no es un archivo EGF', 'error');
          return;
        }

        if (!loadedData.sectionType || loadedData.sectionType !== 'entre-grafos') {
          showMessage('Este archivo pertenece a otra sección del simulador', 'error');
          return;
        }

        if (!loadedData.data || !loadedData.configuration) {
          showMessage('Archivo corrupto: faltan datos esenciales', 'error');
          return;
        }

        // Validar que sea grafo no dirigido
        const loadedGraphType = loadedData.configuration.graphType;
        if (loadedGraphType !== 'no-dirigido') {
          showMessage('Este archivo contiene grafos dirigidos. Solo se permiten grafos no dirigidos en esta sección.', 'error');
          return;
        }
        
        setGraphA(loadedData.data.graphA || { nodes: [], edges: [], adjacencyList: {}, edgeCounter: 1 });
        setGraphB(loadedData.data.graphB || { nodes: [], edges: [], adjacencyList: {}, edgeCounter: 1 });
        setResultGraph(loadedData.data.resultGraph || { nodes: [], edges: [], adjacencyList: {}, operation: null });
        setEdgeCounter(loadedData.data.edgeCounter || 1);
        setIsStructureCreated(loadedData.data.isStructureCreated || false);

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

    if (hasUnsavedChanges) {
      setPendingAction({ execute: executeLoad, description: 'cargar archivo' });
      setShowUnsavedWarning(true);
      return;
    }

    executeLoad();
  };

  // Confirmar pérdida de progreso
  const confirmUnsavedChanges = async (action) => {
    const currentPendingAction = pendingAction;
    
    setShowUnsavedWarning(false);
    setPendingAction(null);
    
    try {
      if (action === 'cancel') {
        return;
      } else if (action === 'continue' && currentPendingAction) {
        setHasUnsavedChanges(false);
        if (currentPendingAction.execute) {
          currentPendingAction.execute();
        }
      } else if (action === 'save' && currentPendingAction) {
        await handleSave();
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

  // Crear nueva estructura
  const handleNewGraph = () => {
    const executeNew = () => {
      setGraphA({ nodes: [], edges: [], adjacencyList: {}, edgeCounter: 1 });
      setGraphB({ nodes: [], edges: [], adjacencyList: {}, edgeCounter: 1 });
      setResultGraph({ nodes: [], edges: [], adjacencyList: {}, operation: null });
      setEdgeCounter(1);
      setIsStructureCreated(true);
      setSourceNode('');
      setTargetNode('');
      setNewVertices('');
      
      setHistory([]);
      setHistoryIndex(-1);
      
      setHasUnsavedChanges(true);
      setCurrentFileName(null);
      
      showMessage('Nuevos grafos no dirigidos creados', 'success');
    };
    
    if (hasUnsavedChanges) {
      setPendingAction({ 
        execute: executeNew, 
        description: 'crear nuevos grafos' 
      });
      setShowUnsavedWarning(true);
    } else {
      executeNew();
    }
  };
  


  // Agregar al historial
  const addToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    if (newHistory.length > 15) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Agregar vértices al grafo activo
  const handleAddVertices = () => {
    if (!newVertices.trim() || !isStructureCreated) {
      showMessage('Por favor ingrese al menos un vértice', 'error');
      return;
    }

    const currentGraph = getActiveGraph();
    const inputVertices = newVertices
      .toUpperCase()
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    const validVertices = [];
    const invalidVertices = [];
    const duplicateVertices = [];
    
    inputVertices.forEach(vertex => {
      if (!/^[A-Z]+$/.test(vertex)) {
        invalidVertices.push(vertex);
      } else if (currentGraph.nodes.includes(vertex)) {
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
    
    const previousState = {
      graph: activeGraph,
      nodes: [...currentGraph.nodes],
      adjacencyList: JSON.parse(JSON.stringify(currentGraph.adjacencyList))
    };
    
    const newNodesList = [...currentGraph.nodes, ...validVertices];
    const newAdjList = { ...currentGraph.adjacencyList };
    validVertices.forEach(vertex => {
      newAdjList[vertex] = [];
    });
    
    updateActiveGraph({
      nodes: newNodesList,
      adjacencyList: newAdjList
    });
    
    addToHistory({
      type: 'add-vertices',
      graph: activeGraph,
      vertices: validVertices,
      previousState: previousState,
      newState: {
        nodes: newNodesList,
        adjacencyList: newAdjList
      }
    });

    let message = `Vértice(s) agregado(s) al Grafo ${activeGraph}: ${validVertices.join(', ')}`;
    if (duplicateVertices.length > 0) {
      message += ` (duplicados ignorados: ${duplicateVertices.join(', ')})`;
    }
    showMessage(message, 'success');
    setNewVertices('');
    markAsChanged();
  };

  // Agregar arista al grafo activo
  const handleAddEdge = () => {
    if (!sourceNode || !targetNode || !isStructureCreated) {
      showMessage('Por favor ingrese nodos de origen y destino válidos', 'error');
      return;
    }

    const currentGraph = getActiveGraph();
    if (!currentGraph.nodes.includes(sourceNode) || !currentGraph.nodes.includes(targetNode)) {
      showMessage('Los vértices deben existir en el grafo activo', 'error');
      return;
    }

    const existingEdge = currentGraph.adjacencyList[sourceNode]?.find(edge => edge.to === targetNode);
    if (existingEdge) {
      showMessage('La arista ya existe', 'error');
      return;
    }

    const previousState = {
      graph: activeGraph,
      adjacencyList: JSON.parse(JSON.stringify(currentGraph.adjacencyList)),
      edges: [...currentGraph.edges],
      edgeCounter: currentGraph.edgeCounter
    };
    
    const newEdgeLabel = `${sourceNode}${targetNode}`;
    const newEdge = { from: sourceNode, to: targetNode, label: newEdgeLabel };
    
    const newAdjList = { ...currentGraph.adjacencyList };
    newAdjList[sourceNode] = [...newAdjList[sourceNode], { to: targetNode, label: newEdgeLabel }];
    
    if (graphType === 'no-dirigido') {
      newAdjList[targetNode] = [...newAdjList[targetNode], { to: sourceNode, label: newEdgeLabel }];
    }
    
    const newEdgesList = [...currentGraph.edges, newEdge];
    
    updateActiveGraph({
      adjacencyList: newAdjList,
      edges: newEdgesList,
      edgeCounter: currentGraph.edgeCounter + 1
    });
    
    setEdgeCounter(edgeCounter + 1);
    
    addToHistory({
      type: 'add-edge',
      graph: activeGraph,
      source: sourceNode,
      target: targetNode,
      label: newEdgeLabel,
      previousState: previousState,
      newState: {
        adjacencyList: newAdjList,
        edges: newEdgesList,
        edgeCounter: currentGraph.edgeCounter + 1
      }
    });

    showMessage(`Arista agregada al Grafo ${activeGraph}: ${sourceNode} → ${targetNode}`, 'success');
    setSourceNode('');
    setTargetNode('');
    markAsChanged();
  };

  // Operación de Unión
  const handleUnion = () => {
    if (!isStructureCreated) {
      showMessage('Primero cree la estructura de grafos', 'error');
      return;
    }

    if (graphA.nodes.length === 0 && graphB.nodes.length === 0) {
      showMessage('Ambos grafos están vacíos', 'error');
      return;
    }

    // Unión: combinar todos los vértices y aristas
    const unionNodes = [...new Set([...graphA.nodes, ...graphB.nodes])];
    const unionAdjList = {};
    
    // Inicializar lista de adyacencia
    unionNodes.forEach(node => {
      unionAdjList[node] = [];
    });
    
    // Agregar aristas del grafo A
    Object.entries(graphA.adjacencyList).forEach(([node, edges]) => {
      if (unionAdjList[node]) {
        unionAdjList[node] = [...edges];
      }
    });
    
    // Agregar aristas del grafo B (evitando duplicados)
    Object.entries(graphB.adjacencyList).forEach(([node, edges]) => {
      if (unionAdjList[node]) {
        edges.forEach(edge => {
          const exists = unionAdjList[node].some(e => e.to === edge.to && e.label === edge.label);
          if (!exists) {
            unionAdjList[node].push(edge);
          }
        });
      }
    });
    
    // Crear lista de aristas para visualización
    const unionEdges = [];
    Object.entries(unionAdjList).forEach(([from, edges]) => {
      edges.forEach(edge => {
        const exists = unionEdges.some(e => e.from === from && e.to === edge.to && e.label === edge.label);
        if (!exists) {
          unionEdges.push({ from, to: edge.to, label: edge.label });
        }
      });
    });
    
    setResultGraph({
      nodes: unionNodes,
      edges: unionEdges,
      adjacencyList: unionAdjList,
      operation: 'union'
    });
    
    showMessage(`Unión realizada: ${unionNodes.length} vértices, ${unionEdges.length} aristas`, 'success');
    markAsChanged();
  };

  // Operación de Intersección
  const handleIntersection = () => {
    if (!isStructureCreated) {
      showMessage('Primero cree la estructura de grafos', 'error');
      return;
    }

    if (graphA.nodes.length === 0 || graphB.nodes.length === 0) {
      showMessage('Ambos grafos deben tener vértices', 'error');
      return;
    }

    // Intersección: solo vértices y aristas comunes
    const intersectionNodes = graphA.nodes.filter(node => graphB.nodes.includes(node));
    
    if (intersectionNodes.length === 0) {
      setResultGraph({
        nodes: [],
        edges: [],
        adjacencyList: {},
        operation: 'interseccion'
      });
      showMessage('Intersección realizada: grafo vacío (sin vértices comunes)', 'info');
      return;
    }
    
    const intersectionAdjList = {};
    intersectionNodes.forEach(node => {
      intersectionAdjList[node] = [];
    });
    
    // Solo aristas que existen en ambos grafos
    intersectionNodes.forEach(from => {
      const edgesA = graphA.adjacencyList[from] || [];
      const edgesB = graphB.adjacencyList[from] || [];
      
      edgesA.forEach(edgeA => {
        if (intersectionNodes.includes(edgeA.to)) {
          const edgeInB = edgesB.find(edgeB => edgeB.to === edgeA.to);
          if (edgeInB) {
            intersectionAdjList[from].push({ to: edgeA.to, label: edgeA.label });
          }
        }
      });
    });
    
    const intersectionEdges = [];
    Object.entries(intersectionAdjList).forEach(([from, edges]) => {
      edges.forEach(edge => {
        intersectionEdges.push({ from, to: edge.to, label: edge.label });
      });
    });
    
    setResultGraph({
      nodes: intersectionNodes,
      edges: intersectionEdges,
      adjacencyList: intersectionAdjList,
      operation: 'interseccion'
    });
    
    showMessage(`Intersección realizada: ${intersectionNodes.length} vértices, ${intersectionEdges.length} aristas`, 'success');
    markAsChanged();
  };

  // Operación de Producto Cartesiano (A × B)
  const handleCartesianProduct = () => {
    if (!isStructureCreated) {
      showMessage('Primero cree la estructura de grafos', 'error');
      return;
    }

    if (graphA.nodes.length === 0 || graphB.nodes.length === 0) {
      showMessage('Ambos grafos deben tener vértices', 'error');
      return;
    }

    // Producto Cartesiano: vértices = A × B (pares ordenados)
    // Aristas: ((u1,v1), (u2,v2)) si (u1,u2) ∈ E(A) o (v1,v2) ∈ E(B)
    const cartesianNodes = [];
    graphA.nodes.forEach(nodeA => {
      graphB.nodes.forEach(nodeB => {
        cartesianNodes.push(`${nodeA},${nodeB}`);
      });
    });

    const cartesianAdjList = {};
    cartesianNodes.forEach(node => {
      cartesianAdjList[node] = [];
    });

    const cartesianEdges = [];

    // Crear aristas según la definición del producto cartesiano
    graphA.nodes.forEach(u1 => {
      graphB.nodes.forEach(v1 => {
        const node1 = `${u1},${v1}`;

        // Caso 1: (u1,u2) ∈ E(A), v1 = v2
        const edgesFromU1 = graphA.adjacencyList[u1] || [];
        edgesFromU1.forEach(edgeA => {
          const u2 = edgeA.to;
          const node2 = `${u2},${v1}`;
          
          if (cartesianNodes.includes(node2)) {
            const exists = cartesianAdjList[node1].some(e => e.to === node2);
            if (!exists) {
              const edgeLabel = `${node1}${node2}`;
              cartesianAdjList[node1].push({ to: node2, label: edgeLabel });
              cartesianEdges.push({ from: node1, to: node2, label: edgeLabel });
            }
          }
        });

        // Caso 2: u1 = u2, (v1,v2) ∈ E(B)
        const edgesFromV1 = graphB.adjacencyList[v1] || [];
        edgesFromV1.forEach(edgeB => {
          const v2 = edgeB.to;
          const node2 = `${u1},${v2}`;
          
          if (cartesianNodes.includes(node2)) {
            const exists = cartesianAdjList[node1].some(e => e.to === node2);
            if (!exists) {
              const edgeLabel = `${node1}${node2}`;
              cartesianAdjList[node1].push({ to: node2, label: edgeLabel });
              cartesianEdges.push({ from: node1, to: node2, label: edgeLabel });
            }
          }
        });
      });
    });

    setResultGraph({
      nodes: cartesianNodes,
      edges: cartesianEdges,
      adjacencyList: cartesianAdjList,
      operation: 'cartesiano'
    });

    showMessage(`Producto Cartesiano (A × B): ${cartesianNodes.length} vértices, ${cartesianEdges.length} aristas`, 'success');
    markAsChanged();
    setActiveTab('resultado');
  };

  // Operación de Producto Tensorial (A ⊗ B)
  const handleTensorialProduct = () => {
    if (!isStructureCreated) {
      showMessage('Primero cree la estructura de grafos', 'error');
      return;
    }

    if (graphA.nodes.length === 0 || graphB.nodes.length === 0) {
      showMessage('Ambos grafos deben tener vértices', 'error');
      return;
    }

    // Producto Tensorial: vértices = A × B
    // Aristas: ((u1,v1), (u2,v2)) si (u1,u2) ∈ E(A) Y (v1,v2) ∈ E(B)
    const tensorialNodes = [];
    graphA.nodes.forEach(nodeA => {
      graphB.nodes.forEach(nodeB => {
        tensorialNodes.push(`${nodeA},${nodeB}`);
      });
    });

    const tensorialAdjList = {};
    tensorialNodes.forEach(node => {
      tensorialAdjList[node] = [];
    });

    const tensorialEdges = [];

    // Crear aristas solo cuando HAY aristas en AMBOS grafos
    graphA.nodes.forEach(u1 => {
      graphB.nodes.forEach(v1 => {
        const node1 = `${u1},${v1}`;
        
        const edgesFromU1 = graphA.adjacencyList[u1] || [];
        
        edgesFromU1.forEach(edgeA => {
          const u2 = edgeA.to;
          const edgesFromV1 = graphB.adjacencyList[v1] || [];
          
          edgesFromV1.forEach(edgeB => {
            const v2 = edgeB.to;
            const node2 = `${u2},${v2}`;
            
            if (tensorialNodes.includes(node2)) {
              const exists = tensorialAdjList[node1].some(e => e.to === node2);
              if (!exists) {
                const edgeLabel = `${node1}${node2}`;
                tensorialAdjList[node1].push({ to: node2, label: edgeLabel });
                tensorialEdges.push({ from: node1, to: node2, label: edgeLabel });
              }
            }
          });
        });
      });
    });

    setResultGraph({
      nodes: tensorialNodes,
      edges: tensorialEdges,
      adjacencyList: tensorialAdjList,
      operation: 'tensorial'
    });

    showMessage(`Producto Tensorial (A ⊗ B): ${tensorialNodes.length} vértices, ${tensorialEdges.length} aristas`, 'success');
    markAsChanged();
    setActiveTab('resultado');
  };

  // Operación de Producto Composición (A ∘ B)
  const handleCompositionProduct = () => {
    if (!isStructureCreated) {
      showMessage('Primero cree la estructura de grafos', 'error');
      return;
    }

    if (graphA.nodes.length === 0 || graphB.nodes.length === 0) {
      showMessage('Ambos grafos deben tener vértices', 'error');
      return;
    }

    // Producto Composición: vértices = A × B
    // Aristas: ((u1,v1), (u2,v2)) si:
    // 1. (u1,u2) ∈ E(A), o
    // 2. u1 = u2 Y (v1,v2) ∈ E(B)
    const compositionNodes = [];
    graphA.nodes.forEach(nodeA => {
      graphB.nodes.forEach(nodeB => {
        compositionNodes.push(`${nodeA},${nodeB}`);
      });
    });

    const compositionAdjList = {};
    compositionNodes.forEach(node => {
      compositionAdjList[node] = [];
    });

    const compositionEdges = [];

    graphA.nodes.forEach(u1 => {
      graphB.nodes.forEach(v1 => {
        const node1 = `${u1},${v1}`;

        graphA.nodes.forEach(u2 => {
          graphB.nodes.forEach(v2 => {
            const node2 = `${u2},${v2}`;
            
            if (node1 === node2) return;

            let shouldConnect = false;

            // Condición 1: (u1,u2) ∈ E(A)
            const edgesFromU1 = graphA.adjacencyList[u1] || [];
            const hasEdgeInA = edgesFromU1.some(e => e.to === u2);
            if (hasEdgeInA) {
              shouldConnect = true;
            }

            // Condición 2: u1 = u2 Y (v1,v2) ∈ E(B)
            if (u1 === u2) {
              const edgesFromV1 = graphB.adjacencyList[v1] || [];
              const hasEdgeInB = edgesFromV1.some(e => e.to === v2);
              if (hasEdgeInB) {
                shouldConnect = true;
              }
            }

            if (shouldConnect) {
              const exists = compositionAdjList[node1].some(e => e.to === node2);
              if (!exists) {
                const edgeLabel = `${node1}${node2}`;
                compositionAdjList[node1].push({ to: node2, label: edgeLabel });
                compositionEdges.push({ from: node1, to: node2, label: edgeLabel });
              }
            }
          });
        });
      });
    });

    setResultGraph({
      nodes: compositionNodes,
      edges: compositionEdges,
      adjacencyList: compositionAdjList,
      operation: 'composicion'
    });

    showMessage(`Producto Composición (A ∘ B): ${compositionNodes.length} vértices, ${compositionEdges.length} aristas`, 'success');
    markAsChanged();
    setActiveTab('resultado');
  };

  // Ejecutar operación según tipo seleccionado
  const handleExecuteOperation = () => {
    if (operationType === 'union') {
      handleUnion();
      setActiveTab('resultado');
    } else if (operationType === 'interseccion') {
      handleIntersection();
      setActiveTab('resultado');
    } else if (operationType === 'cartesiano') {
      handleCartesianProduct();
    } else if (operationType === 'tensorial') {
      handleTensorialProduct();
    } else if (operationType === 'composicion') {
      handleCompositionProduct();
    }
  };

  // Funciones de deshacer y rehacer
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      
      if (action.type === 'add-vertices') {
        if (action.graph === 'A') {
          setGraphA({
            ...graphA,
            nodes: action.previousState.nodes,
            adjacencyList: action.previousState.adjacencyList
          });
        } else {
          setGraphB({
            ...graphB,
            nodes: action.previousState.nodes,
            adjacencyList: action.previousState.adjacencyList
          });
        }
      } else if (action.type === 'add-edge') {
        if (action.graph === 'A') {
          setGraphA({
            ...graphA,
            adjacencyList: action.previousState.adjacencyList,
            edges: action.previousState.edges,
            edgeCounter: action.previousState.edgeCounter
          });
        } else {
          setGraphB({
            ...graphB,
            adjacencyList: action.previousState.adjacencyList,
            edges: action.previousState.edges,
            edgeCounter: action.previousState.edgeCounter
          });
        }
      }
      
      setHistoryIndex(historyIndex - 1);
      showMessage('Acción deshecha', 'info');
      markAsChanged();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      
      if (action.type === 'add-vertices') {
        if (action.graph === 'A') {
          setGraphA({
            ...graphA,
            nodes: action.newState.nodes,
            adjacencyList: action.newState.adjacencyList
          });
        } else {
          setGraphB({
            ...graphB,
            nodes: action.newState.nodes,
            adjacencyList: action.newState.adjacencyList
          });
        }
      } else if (action.type === 'add-edge') {
        if (action.graph === 'A') {
          setGraphA({
            ...graphA,
            adjacencyList: action.newState.adjacencyList,
            edges: action.newState.edges,
            edgeCounter: action.newState.edgeCounter
          });
        } else {
          setGraphB({
            ...graphB,
            adjacencyList: action.newState.adjacencyList,
            edges: action.newState.edges,
            edgeCounter: action.newState.edgeCounter
          });
        }
      }
      
      setHistoryIndex(historyIndex + 1);
      showMessage('Acción rehecha', 'info');
      markAsChanged();
    }
  };

  const speedLabels = ['Muy Lento', 'Lento', 'Normal', 'Rápido', 'Muy Rápido'];

  // Funciones para pan del grafo
  const handleGraphMouseDown = (e) => {
    e.preventDefault();
    if (e.button === 0) {
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
    setGraphZoom(1.0);
    setGraphPan({ x: 0, y: 0 });
  };

  // Función para renderizar un grafo con layout adaptativo
  const renderGraph = (graph, title, color = '#4a90e2') => {
    if (!isStructureCreated || graph.nodes.length === 0) {
      return (
        <div className="empty-tree">
          <p>{title} vacío</p>
        </div>
      );
    }

    const centerX = 500;
    const centerY = 375;
    const nodes = graph.nodes;
    const adjacencyList = graph.adjacencyList;
    const edges = graph.edges || [];
    
    const nodePositions = {};
    
    // Detectar si es un grafo producto (nodos con formato "X,Y")
    const isProductGraph = nodes.length > 0 && nodes[0].includes(',') && !nodes[0].includes('(');
    
    // Layout adaptativo según cantidad de nodos (igual que SobreGrafoSection)
    if (nodes.length === 1) {
      nodePositions[nodes[0]] = { x: centerX, y: centerY };
    } else if (nodes.length === 2) {
      nodePositions[nodes[0]] = { x: centerX - 150, y: centerY };
      nodePositions[nodes[1]] = { x: centerX + 150, y: centerY };
    } else if (nodes.length === 3) {
      nodePositions[nodes[0]] = { x: centerX, y: centerY - 130 };
      nodePositions[nodes[1]] = { x: centerX - 130, y: centerY + 65 };
      nodePositions[nodes[2]] = { x: centerX + 130, y: centerY + 65 };
    } else if (nodes.length === 4 && !isProductGraph) {
      nodePositions[nodes[0]] = { x: centerX - 130, y: centerY - 130 };
      nodePositions[nodes[1]] = { x: centerX + 130, y: centerY - 130 };
      nodePositions[nodes[2]] = { x: centerX + 130, y: centerY + 130 };
      nodePositions[nodes[3]] = { x: centerX - 130, y: centerY + 130 };
    } else if (isProductGraph) {
      // Layout especial para grafos productos: organizar por filas
      // Extraer dimensiones del producto (contar nodos únicos de A y B)
      const nodesA = new Set();
      const nodesB = new Set();
      
      nodes.forEach(node => {
        const parts = node.split(',');
        if (parts.length === 2) {
          nodesA.add(parts[0]);
          nodesB.add(parts[1]);
        }
      });
      
      const numNodesA = nodesA.size;
      const numNodesB = nodesB.size;
      
      // Organizar en filas: cada nodo de A genera una fila con sus combinaciones con B
      const rows = numNodesA;
      const cols = numNodesB;
      
      const baseSpacing = 140;
      const adaptiveSpacing = Math.max(100, baseSpacing - Math.max(rows, cols) * 3);
      
      const totalWidth = (cols - 1) * adaptiveSpacing;
      const totalHeight = (rows - 1) * adaptiveSpacing;
      
      const startX = centerX - totalWidth / 2;
      const startY = centerY - totalHeight / 2;
      
      // Asignar posiciones manteniendo el orden original de creación
      nodes.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        nodePositions[node] = {
          x: startX + col * adaptiveSpacing,
          y: startY + row * adaptiveSpacing
        };
      });
    } else {
      // Layout tipo Matriz organizado por conectividad
      const nodeDegrees = {};
      nodes.forEach(node => {
        const outgoing = adjacencyList[node]?.length || 0;
        const incoming = Object.values(adjacencyList).reduce((count, edgesList) => 
          count + edgesList.filter(e => e.to === node).length, 0);
        nodeDegrees[node] = outgoing + incoming;
      });

      const sortedNodes = [...nodes].sort((a, b) => nodeDegrees[b] - nodeDegrees[a]);
      
      const cols = Math.ceil(Math.sqrt(nodes.length * 1.5));
      const rows = Math.ceil(nodes.length / cols);
      
      const baseSpacing = 140;
      const adaptiveSpacing = Math.max(100, baseSpacing - nodes.length * 2);
      
      const totalWidth = (cols - 1) * adaptiveSpacing;
      const totalHeight = (rows - 1) * adaptiveSpacing;
      
      const startX = centerX - totalWidth / 2;
      const startY = centerY - totalHeight / 2;
      
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);
      
      const positions = [];
      const visited = new Set();
      
      const addPosition = (row, col) => {
        const key = `${row},${col}`;
        if (row >= 0 && row < rows && col >= 0 && col < cols && !visited.has(key)) {
          visited.add(key);
          positions.push({ row, col });
          return true;
        }
        return false;
      };
      
      addPosition(centerRow, centerCol);
      let distance = 1;
      while (positions.length < nodes.length && distance < Math.max(rows, cols)) {
        for (let c = centerCol - distance; c <= centerCol + distance; c++) {
          addPosition(centerRow - distance, c);
        }
        for (let r = centerRow - distance + 1; r <= centerRow + distance; r++) {
          addPosition(r, centerCol + distance);
        }
        for (let c = centerCol + distance - 1; c >= centerCol - distance; c--) {
          addPosition(centerRow + distance, c);
        }
        for (let r = centerRow + distance - 1; r > centerRow - distance; r--) {
          addPosition(r, centerCol - distance);
        }
        distance++;
      }
      
      sortedNodes.forEach((node, index) => {
        if (index < positions.length) {
          const { row, col } = positions[index];
          nodePositions[node] = {
            x: startX + col * adaptiveSpacing,
            y: startY + row * adaptiveSpacing
          };
        }
      });
      
      // Ajuste fino por conectividad
      const adjustmentIterations = 20;
      for (let iter = 0; iter < adjustmentIterations; iter++) {
        const adjustments = {};
        nodes.forEach(node => {
          adjustments[node] = { x: 0, y: 0, count: 0 };
        });
        
        edges.forEach(edge => {
          if (edge.from !== edge.to && nodePositions[edge.from] && nodePositions[edge.to]) {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const strength = 0.08;
            adjustments[edge.from].x += dx * strength / distance;
            adjustments[edge.from].y += dy * strength / distance;
            adjustments[edge.from].count++;
            
            adjustments[edge.to].x -= dx * strength / distance;
            adjustments[edge.to].y -= dy * strength / distance;
            adjustments[edge.to].count++;
          }
        });
        
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
            <h4>{title}</h4>
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
          <div className="simulation-info">
            <p><strong>Tipo:</strong> No Dirigido</p>
            <p><strong>Vértices:</strong> S = {'{'}{nodes.length > 0 ? nodes.join(', ') : '∅'}{'}'}</p>
            <p><strong>Aristas:</strong> A = {'{'}{edges.length > 0 ? edges.map(e => e.label).sort((a, b) => a - b).join(', ') : '∅'}{'}'}</p>
          </div>
          <div className="tree-legend">
            <div className="legend-item">
              <div className="legend-circle" style={{
                backgroundColor: color,
                border: `2px solid ${color === '#4a90e2' ? '#1e40af' : color === '#e53e3e' ? '#b91c1c' : color === '#10b981' ? '#047857' : '#1e40af'}`
              }}></div>
              <span>Vértice</span>
            </div>
            <div className="legend-item">
              <svg width="40" height="20">
                <line x1="5" y1="10" x2="35" y2="10" stroke="#1f1f1f" strokeWidth="2.5" />
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
            <defs>
              <marker
                id={`arrowhead-${title}`}
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#1f1f1f" />
              </marker>
            </defs>

            {/* Renderizar aristas como líneas rectas */}
            {Object.entries(adjacencyList).map(([source, edgesList]) => 
                edgesList.map((edge, idx) => {
                  const sourcePos = nodePositions[source];
                  const targetPos = nodePositions[edge.to];
                  
                  if (!sourcePos || !targetPos) return null;
                  
                  const isLoop = source === edge.to;
                  const nodeRadius = 30;
                  
                  if (graphType === 'no-dirigido' && source > edge.to) {
                    return null;
                  }
                  
                  if (isLoop) {
                    const loopsCount = edgesList.filter(e => e.to === source).length;
                    const loopIndex = edgesList.slice(0, idx).filter(e => e.to === source).length;
                    
                    const loopRadius = 25;
                    const angleOffset = (loopIndex - (loopsCount - 1) / 2) * 0.6;
                    const loopAngle = -Math.PI / 2 + angleOffset;
                    
                    const loopCenterX = sourcePos.x + (nodeRadius + loopRadius) * Math.cos(loopAngle) * 0.7;
                    const loopCenterY = sourcePos.y + (nodeRadius + loopRadius) * Math.sin(loopAngle) * 0.7;
                    
                    return (
                      <g key={`edge-${source}-${edge.to}-${idx}`}>
                        <circle
                          cx={loopCenterX}
                          cy={loopCenterY}
                          r={loopRadius}
                          fill="none"
                          stroke="#1f1f1f"
                          strokeWidth="2.5"
                          markerEnd={graphType === 'dirigido' ? `url(#arrowhead-${title})` : ""}
                        />
                      </g>
                    );
                  }
                  
                  // Todas las aristas son líneas rectas
                  const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
                  
                  const startX = sourcePos.x + nodeRadius * Math.cos(angle);
                  const startY = sourcePos.y + nodeRadius * Math.sin(angle);
                  const endX = targetPos.x - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.cos(angle);
                  const endY = targetPos.y - (nodeRadius + (graphType === 'dirigido' ? 8 : 0)) * Math.sin(angle);
                  
                  const pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
                
                  return (
                    <g key={`edge-${source}-${edge.to}-${idx}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#3a3a3a"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#1f1f1f"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        markerEnd={graphType === 'dirigido' ? `url(#arrowhead-${title})` : ""}
                      />
                    </g>
                  );
                })
              )}

            {/* Renderizar nodos con efectos mejorados */}
            {nodes.map((node) => {
              const pos = nodePositions[node];
              
              // Determinar color de borde más oscuro y saturado según el grafo
              let strokeColor;
              if (color === '#4a90e2') { // Azul del grafo A
                strokeColor = '#1e40af'; // Azul más oscuro y saturado
              } else if (color === '#e53e3e') { // Rojo del grafo B
                strokeColor = '#b91c1c'; // Rojo más oscuro y saturado
              } else if (color === '#10b981') { // Verde del resultado
                strokeColor = '#047857'; // Verde más oscuro y saturado
              } else {
                strokeColor = '#1e40af'; // Default azul oscuro
              }
              
              return (
                <g key={`node-${node}`} className="tree-node-group">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="32"
                    fill={strokeColor}
                    opacity="0.3"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="30"
                    fill={color}
                    stroke={strokeColor}
                    strokeWidth="3"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 7}
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill="white"
                    style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
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
        <h1>Operaciones entre Múltiples Grafos</h1>
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
            title="Cargar estructura desde archivo .egf"
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

      {/* Área de Mensajes */}
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

      {/* Modal de advertencia */}
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

      {/* Área Principal */}
      <div className="simulation-area">
        {/* Panel de Control */}
        <div className="options-panel">
          <h3>Manejo y Operaciones</h3>
          
          <div className="control-group">
            <button 
              onClick={handleNewGraph}
              className="new-tree-btn"
              title="Crear nuevos grafos"
            >
              Nuevos Grafos
            </button>
          </div>

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

          <div className="control-group">
            <label>Grafo Activo</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`graph-selector-btn ${activeGraph === 'A' ? 'active' : ''}`}
                onClick={() => {
                  setActiveGraph('A');
                  setActiveTab('A');
                }}
                disabled={!isStructureCreated}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: activeGraph === 'A' ? '#4a90e2' : '#e2e8f0',
                  color: activeGraph === 'A' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isStructureCreated ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Grafo A
              </button>
              <button
                className={`graph-selector-btn ${activeGraph === 'B' ? 'active' : ''}`}
                onClick={() => {
                  setActiveGraph('B');
                  setActiveTab('B');
                }}
                disabled={!isStructureCreated}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: activeGraph === 'B' ? '#e53e3e' : '#e2e8f0',
                  color: activeGraph === 'B' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isStructureCreated ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Grafo B
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Agregar Vértice(s) al Grafo {activeGraph}</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newVertices}
                onChange={(e) => setNewVertices(e.target.value.toUpperCase())}
                placeholder="Ej: A, B, C"
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
          </div>

          <div className="control-group">
            <label>Agregar Arista al Grafo {activeGraph}</label>
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
          </div>

          <div className="control-group">
            <label>Operación entre Grafos</label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
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
              <option value="union">Unión (A ∪ B)</option>
              <option value="interseccion">Intersección (A ∩ B)</option>
              <option value="cartesiano">Producto Cartesiano (A × B)</option>
              <option value="tensorial">Producto Tensorial (A ⊗ B)</option>
              <option value="composicion">Producto Composición (A ∘ B)</option>
            </select>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              {operationType === 'union' && 'Combina todos los vértices y aristas de ambos grafos.'}
              {operationType === 'interseccion' && 'Solo los vértices y aristas comunes a ambos grafos.'}
              {operationType === 'cartesiano' && 'Pares ordenados (u,v) con aristas si (u₁,u₂)∈E(A) o (v₁,v₂)∈E(B).'}
              {operationType === 'tensorial' && 'Pares ordenados (u,v) con aristas si (u₁,u₂)∈E(A) Y (v₁,v₂)∈E(B).'}
              {operationType === 'composicion' && 'Pares ordenados (u,v) con aristas si (u₁,u₂)∈E(A) o (u₁=u₂ Y (v₁,v₂)∈E(B)).'}
            </small>
          </div>

          <div className="control-group">
            <button 
              onClick={handleExecuteOperation}
              className="operation-btn"
              disabled={!isStructureCreated}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isStructureCreated ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Play size={18} />
              Ejecutar Operación
            </button>
          </div>
        </div>

        {/* Visualización de Grafos con Sistema de Tabs */}
        <div className="visualization-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs de navegación */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <button
              onClick={() => {
                setActiveTab('A');
                setActiveGraph('A');
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: activeTab === 'A' ? '#4a90e2' : '#f7fafc',
                color: activeTab === 'A' ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === 'A' ? '4px solid #2c5282' : '2px solid transparent',
                transform: activeTab === 'A' ? 'translateY(2px)' : 'none'
              }}
            >
              Grafo A
            </button>
            <button
              onClick={() => {
                setActiveTab('B');
                setActiveGraph('B');
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: activeTab === 'B' ? '#e53e3e' : '#f7fafc',
                color: activeTab === 'B' ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === 'B' ? '4px solid #9b2c2c' : '2px solid transparent',
                transform: activeTab === 'B' ? 'translateY(2px)' : 'none'
              }}
            >
              Grafo B
            </button>
            {resultGraph.operation && (
              <button
                onClick={() => setActiveTab('resultado')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'resultado' ? '#10b981' : '#f7fafc',
                  color: activeTab === 'resultado' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  borderBottom: activeTab === 'resultado' ? '4px solid #047857' : '2px solid transparent',
                  transform: activeTab === 'resultado' ? 'translateY(2px)' : 'none'
                }}
              >
                Resultado {
                  resultGraph.operation === 'union' ? '(A ∪ B)' :
                  resultGraph.operation === 'interseccion' ? '(A ∩ B)' :
                  resultGraph.operation === 'cartesiano' ? '(A × B)' :
                  resultGraph.operation === 'tensorial' ? '(A ⊗ B)' :
                  resultGraph.operation === 'composicion' ? '(A ∘ B)' :
                  ''
                }
              </button>
            )}
          </div>
          
          {/* Contenido del tab activo */}
          <div style={{ flex: 1 }}>
            {activeTab === 'A' && renderGraph(graphA, 'Grafo A', '#4a90e2')}
            {activeTab === 'B' && renderGraph(graphB, 'Grafo B', '#e53e3e')}
            {activeTab === 'resultado' && resultGraph.operation && renderGraph(
              resultGraph, 
              `Resultado: ${
                resultGraph.operation === 'union' ? 'Unión (A ∪ B)' :
                resultGraph.operation === 'interseccion' ? 'Intersección (A ∩ B)' :
                resultGraph.operation === 'cartesiano' ? 'Producto Cartesiano (A × B)' :
                resultGraph.operation === 'tensorial' ? 'Producto Tensorial (A ⊗ B)' :
                resultGraph.operation === 'composicion' ? 'Producto Composición (A ∘ B)' :
                'Operación'
              }`, 
              '#10b981'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntreGrafosSection;
