class SearchService {
  // Definición de todos los métodos de búsqueda
  getAllSearchMethods() {
    return {
      clasicas: [
        {
          id: 'secuencial',
          name: 'Búsqueda Secuencial',
          description: 'Examina cada elemento de la estructura uno por uno hasta encontrar el objetivo.',
          complexity: 'O(n)',
          icon: 'fas fa-arrow-right'
        },
        {
          id: 'binaria',
          name: 'Búsqueda Binaria',
          description: 'Divide el espacio de búsqueda por la mitad en cada iteración (requiere orden).',
          complexity: 'O(log n)',
          icon: 'fas fa-cut'
        },
        {
          id: 'hash',
          name: 'Funciones Hash',
          description: 'Utiliza una función de hash para mapear claves a posiciones específicas.',
          complexity: 'O(1) promedio',
          icon: 'fas fa-hashtag'
        }
      ],
      arboles: [
        {
          id: 'residuos',
          name: 'Residuos',
          description: 'Búsqueda basada en operaciones de módulo para distribución uniforme.',
          complexity: 'O(1) - O(n)',
          icon: 'fas fa-calculator'
        },
        {
          id: 'digitales',
          name: 'Digitales',
          description: 'Búsqueda basada en la representación digital de las claves.',
          complexity: 'O(k)',
          icon: 'fas fa-binary'
        },
        {
          id: 'trie',
          name: 'Residuos Trie',
          description: 'Estructura de árbol especializada para búsqueda de cadenas por prefijos.',
          complexity: 'O(m)',
          icon: 'fas fa-project-diagram'
        },
        {
          id: 'multiples',
          name: 'Residuos Múltiples',
          description: 'Utiliza múltiples funciones de hash para reducir colisiones.',
          complexity: 'O(1) - O(k)',
          icon: 'fas fa-layer-group'
        },
        {
          id: 'huffman',
          name: 'Huffman',
          description: 'Algoritmo de codificación que crea árboles binarios óptimos para búsqueda.',
          complexity: 'O(log n)',
          icon: 'fas fa-code-branch'
        }
      ]
    };
  }

  // Búsqueda secuencial
  sequentialSearch(array, target) {
    const steps = [];
    let comparisons = 0;
    let found = false;
    let foundIndex = -1;

    for (let i = 0; i < array.length; i++) {
      comparisons++;
      steps.push({
        step: i + 1,
        currentIndex: i,
        currentValue: array[i],
        comparison: `${array[i]} === ${target}`,
        result: array[i] === target ? 'encontrado' : 'continuar'
      });

      if (array[i] === target) {
        found = true;
        foundIndex = i;
        break;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      algorithm: 'Secuencial',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    };
  }

  // Búsqueda binaria
  binarySearch(array, target) {
    // Verificar si el array está ordenado
    const sortedArray = [...array].sort((a, b) => a - b);
    const wasAlreadySorted = JSON.stringify(array) === JSON.stringify(sortedArray);
    
    const steps = [];
    let comparisons = 0;
    let left = 0;
    let right = sortedArray.length - 1;
    let found = false;
    let foundIndex = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      comparisons++;

      steps.push({
        step: steps.length + 1,
        left,
        right,
        mid,
        currentValue: sortedArray[mid],
        comparison: `${sortedArray[mid]} === ${target}`,
        result: sortedArray[mid] === target ? 'encontrado' : 
                sortedArray[mid] < target ? 'buscar derecha' : 'buscar izquierda'
      });

      if (sortedArray[mid] === target) {
        found = true;
        foundIndex = mid;
        break;
      } else if (sortedArray[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      algorithm: 'Binaria',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      originalArray: array,
      sortedArray,
      wasAlreadySorted,
      note: wasAlreadySorted ? null : 'Array fue ordenado para la búsqueda binaria'
    };
  }

  // Función hash simple
  simpleHash(key, size) {
    if (typeof key === 'string') {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash += key.charCodeAt(i);
      }
      return hash % size;
    }
    return Math.abs(key) % size;
  }

  // Búsqueda hash
  hashSearch(array, target) {
    const hashTableSize = Math.max(array.length, 7); // Tamaño mínimo 7
    const hashTable = new Array(hashTableSize).fill(null).map(() => []);
    const steps = [];
    let comparisons = 0;

    // Construir tabla hash
    for (let i = 0; i < array.length; i++) {
      const hashIndex = this.simpleHash(array[i], hashTableSize);
      hashTable[hashIndex].push({ value: array[i], originalIndex: i });
      
      steps.push({
        step: `Inserción ${i + 1}`,
        operation: 'insert',
        value: array[i],
        hashIndex,
        hashFunction: `hash(${array[i]}) = ${array[i]} % ${hashTableSize} = ${hashIndex}`,
        collision: hashTable[hashIndex].length > 1
      });
    }

    // Buscar target
    const targetHashIndex = this.simpleHash(target, hashTableSize);
    const bucket = hashTable[targetHashIndex];
    let found = false;
    let foundIndex = -1;

    steps.push({
      step: 'Búsqueda',
      operation: 'search',
      target,
      hashIndex: targetHashIndex,
      hashFunction: `hash(${target}) = ${target} % ${hashTableSize} = ${targetHashIndex}`,
      bucketSize: bucket.length
    });

    for (let i = 0; i < bucket.length; i++) {
      comparisons++;
      if (bucket[i].value === target) {
        found = true;
        foundIndex = bucket[i].originalIndex;
        break;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      hashTable: hashTable.map((bucket, index) => ({
        index,
        values: bucket.map(item => item.value)
      })),
      algorithm: 'Hash',
      timeComplexity: 'O(1) promedio, O(n) peor caso',
      spaceComplexity: 'O(n)'
    };
  }

  // Búsqueda por residuos
  residuesSearch(array, target) {
    const modulus = 7; // Usar módulo 7 como ejemplo
    const steps = [];
    let comparisons = 0;
    
    // Crear tabla de residuos
    const residueTable = new Array(modulus).fill(null).map(() => []);
    
    for (let i = 0; i < array.length; i++) {
      const residue = array[i] % modulus;
      residueTable[residue].push({ value: array[i], originalIndex: i });
      
      steps.push({
        step: `Inserción ${i + 1}`,
        value: array[i],
        residue,
        calculation: `${array[i]} % ${modulus} = ${residue}`
      });
    }

    // Buscar target
    const targetResidue = target % modulus;
    const bucket = residueTable[targetResidue];
    let found = false;
    let foundIndex = -1;

    for (let i = 0; i < bucket.length; i++) {
      comparisons++;
      if (bucket[i].value === target) {
        found = true;
        foundIndex = bucket[i].originalIndex;
        break;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      residueTable: residueTable.map((bucket, index) => ({
        residue: index,
        values: bucket.map(item => item.value)
      })),
      targetResidue,
      algorithm: 'Residuos',
      timeComplexity: 'O(1) - O(n)',
      spaceComplexity: 'O(n)'
    };
  }

  // Búsqueda digital (por dígitos)
  digitalSearch(array, target) {
    const steps = [];
    let comparisons = 0;
    
    // Convertir números a strings para trabajar con dígitos
    const stringArray = array.map((num, index) => ({
      value: num,
      stringValue: num.toString(),
      originalIndex: index
    }));
    
    const targetString = target.toString();
    const maxLength = Math.max(...stringArray.map(item => item.stringValue.length));
    
    // Búsqueda por cada posición de dígito
    for (let digitPos = 0; digitPos < maxLength; digitPos++) {
      const targetDigit = digitPos < targetString.length ? targetString[digitPos] : '0';
      
      steps.push({
        step: digitPos + 1,
        digitPosition: digitPos,
        targetDigit,
        candidates: []
      });
      
      for (let i = 0; i < stringArray.length; i++) {
        const currentDigit = digitPos < stringArray[i].stringValue.length ? 
                           stringArray[i].stringValue[digitPos] : '0';
        
        comparisons++;
        
        if (currentDigit === targetDigit) {
          steps[steps.length - 1].candidates.push({
            value: stringArray[i].value,
            originalIndex: stringArray[i].originalIndex,
            digit: currentDigit
          });
        }
      }
    }

    // Verificar coincidencia exacta
    let found = false;
    let foundIndex = -1;
    
    for (let i = 0; i < array.length; i++) {
      if (array[i] === target) {
        found = true;
        foundIndex = i;
        break;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      algorithm: 'Digital',
      timeComplexity: 'O(k * n)',
      spaceComplexity: 'O(1)'
    };
  }

  // Implementación básica de Trie
  trieSearch(words, target) {
    const steps = [];
    
    // Construir Trie
    const trie = {};
    
    for (let i = 0; i < words.length; i++) {
      let node = trie;
      const word = words[i].toLowerCase();
      
      for (let j = 0; j < word.length; j++) {
        const char = word[j];
        if (!node[char]) {
          node[char] = {};
        }
        node = node[char];
      }
      node.isWord = true;
      node.originalIndex = i;
      
      steps.push({
        step: `Inserción ${i + 1}`,
        word: words[i],
        operation: 'insert'
      });
    }

    // Buscar target
    let node = trie;
    const targetLower = target.toLowerCase();
    let found = false;
    let foundIndex = -1;

    for (let i = 0; i < targetLower.length; i++) {
      const char = targetLower[i];
      steps.push({
        step: `Búsqueda ${i + 1}`,
        character: char,
        position: i,
        found: !!node[char]
      });
      
      if (!node[char]) {
        break;
      }
      node = node[char];
    }

    if (node && node.isWord) {
      found = true;
      foundIndex = node.originalIndex;
    }

    return {
      found,
      index: foundIndex,
      steps,
      trie,
      algorithm: 'Trie',
      timeComplexity: 'O(m)',
      spaceComplexity: 'O(ALPHABET_SIZE * N * M)'
    };
  }

  // Búsqueda por residuos múltiples
  multipleResiduesSearch(array, target) {
    const moduli = [7, 11, 13]; // Múltiples módulos
    const steps = [];
    let comparisons = 0;
    
    // Crear tablas para cada módulo
    const tables = moduli.map(mod => {
      const table = new Array(mod).fill(null).map(() => []);
      
      for (let i = 0; i < array.length; i++) {
        const residue = array[i] % mod;
        table[residue].push({ value: array[i], originalIndex: i });
      }
      
      return { modulus: mod, table };
    });

    // Buscar con cada módulo
    let candidates = [];
    
    for (let t = 0; t < tables.length; t++) {
      const { modulus, table } = tables[t];
      const targetResidue = target % modulus;
      const bucket = table[targetResidue];
      
      steps.push({
        step: t + 1,
        modulus,
        targetResidue,
        candidatesFound: bucket.length
      });
      
      if (t === 0) {
        candidates = [...bucket];
      } else {
        // Intersección con candidatos anteriores
        candidates = candidates.filter(candidate => 
          bucket.some(item => item.value === candidate.value)
        );
      }
      
      comparisons += bucket.length;
    }

    // Verificar candidatos finales
    let found = false;
    let foundIndex = -1;
    
    for (let candidate of candidates) {
      if (candidate.value === target) {
        found = true;
        foundIndex = candidate.originalIndex;
        break;
      }
    }

    return {
      found,
      index: foundIndex,
      comparisons,
      steps,
      tables: tables.map(({ modulus, table }) => ({
        modulus,
        residues: table.map((bucket, index) => ({
          residue: index,
          values: bucket.map(item => item.value)
        }))
      })),
      finalCandidates: candidates.map(c => c.value),
      algorithm: 'Residuos Múltiples',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(n * k)'
    };
  }

  // Búsqueda Huffman (simplificada)
  huffmanSearch(array, target) {
    const steps = [];
    
    // Crear frecuencias
    const frequencies = {};
    array.forEach(val => {
      frequencies[val] = (frequencies[val] || 0) + 1;
    });

    // Crear nodos para Huffman
    const nodes = Object.entries(frequencies).map(([value, freq]) => ({
      value: parseInt(value),
      frequency: freq,
      left: null,
      right: null
    }));

    steps.push({
      step: 'Frecuencias',
      frequencies
    });

    // Construir árbol Huffman (simplificado)
    const sortedNodes = nodes.sort((a, b) => a.frequency - b.frequency);
    
    while (sortedNodes.length > 1) {
      const left = sortedNodes.shift();
      const right = sortedNodes.shift();
      
      const merged = {
        value: null,
        frequency: left.frequency + right.frequency,
        left,
        right
      };
      
      sortedNodes.push(merged);
      sortedNodes.sort((a, b) => a.frequency - b.frequency);
      
      steps.push({
        step: `Merge`,
        merged: `${left.value || 'node'} + ${right.value || 'node'}`,
        frequency: merged.frequency
      });
    }

    const root = sortedNodes[0];

    // Buscar target en el árbol
    let found = false;
    let foundIndex = -1;
    let searchPath = [];

    function searchInTree(node, target, path = '') {
      if (!node) return false;
      
      if (node.value === target) {
        searchPath = path.split('');
        return true;
      }
      
      return searchInTree(node.left, target, path + '0') ||
             searchInTree(node.right, target, path + '1');
    }

    found = searchInTree(root, target);
    
    if (found) {
      foundIndex = array.indexOf(target);
    }

    return {
      found,
      index: foundIndex,
      steps,
      frequencies,
      searchPath,
      algorithm: 'Huffman',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(n)'
    };
  }

  // Simulación genérica
  simulateSearch(algorithm, array, target, options = {}) {
    switch (algorithm.toLowerCase()) {
      case 'secuencial':
        return this.sequentialSearch(array, target);
      case 'binaria':
        return this.binarySearch(array, target);
      case 'hash':
        return this.hashSearch(array, target);
      case 'residuos':
        return this.residuesSearch(array, target);
      case 'digitales':
        return this.digitalSearch(array, target);
      case 'trie':
        return this.trieSearch(array, target);
      case 'multiples':
        return this.multipleResiduesSearch(array, target);
      case 'huffman':
        return this.huffmanSearch(array, target);
      default:
        throw new Error(`Algoritmo '${algorithm}' no reconocido`);
    }
  }
}

module.exports = new SearchService();