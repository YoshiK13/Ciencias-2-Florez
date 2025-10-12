// Utility functions for the search algorithms

class SearchUtils {
  // Generar array aleatorio
  static generateRandomArray(size = 10, min = 1, max = 100) {
    return Array.from({ length: size }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }

  // Verificar si un array está ordenado
  static isSorted(array) {
    for (let i = 1; i < array.length; i++) {
      if (array[i] < array[i - 1]) {
        return false;
      }
    }
    return true;
  }

  // Ordenar array manteniendo índices originales
  static sortWithOriginalIndices(array) {
    return array
      .map((value, originalIndex) => ({ value, originalIndex }))
      .sort((a, b) => a.value - b.value);
  }

  // Validar entrada para búsquedas
  static validateSearchInput(array, target) {
    if (!Array.isArray(array)) {
      throw new Error('El primer parámetro debe ser un array');
    }
    
    if (array.length === 0) {
      throw new Error('El array no puede estar vacío');
    }
    
    if (target === undefined || target === null) {
      throw new Error('El target es requerido');
    }
    
    return true;
  }

  // Formatear tiempo de ejecución
  static formatExecutionTime(startTime, endTime) {
    const executionTime = endTime - startTime;
    return {
      milliseconds: executionTime,
      formatted: `${executionTime.toFixed(2)}ms`
    };
  }

  // Generar estadísticas de búsqueda
  static generateSearchStats(result) {
    return {
      algorithm: result.algorithm,
      found: result.found,
      comparisons: result.comparisons,
      timeComplexity: result.timeComplexity,
      spaceComplexity: result.spaceComplexity,
      efficiency: result.comparisons <= 10 ? 'Alta' : 
                 result.comparisons <= 50 ? 'Media' : 'Baja'
    };
  }

  // Crear visualización simple de pasos
  static createVisualization(steps) {
    return steps.map((step, index) => ({
      stepNumber: index + 1,
      description: this.generateStepDescription(step),
      data: step
    }));
  }

  // Generar descripción de paso
  static generateStepDescription(step) {
    if (step.operation === 'insert') {
      return `Insertar ${step.value} en posición ${step.hashIndex || step.position}`;
    }
    
    if (step.operation === 'search') {
      return `Buscar ${step.target} en posición calculada ${step.hashIndex}`;
    }
    
    if (step.comparison) {
      return `Comparar: ${step.comparison}`;
    }
    
    return 'Paso de búsqueda';
  }

  // Validar configuración de algoritmo
  static validateAlgorithmConfig(algorithm, config = {}) {
    const validAlgorithms = [
      'secuencial', 'binaria', 'hash', 'residuos', 
      'digitales', 'trie', 'multiples', 'huffman'
    ];
    
    if (!validAlgorithms.includes(algorithm.toLowerCase())) {
      throw new Error(`Algoritmo '${algorithm}' no es válido. Algoritmos válidos: ${validAlgorithms.join(', ')}`);
    }
    
    return true;
  }

  // Generar palabras aleatorias para Trie
  static generateRandomWords(count = 10) {
    const prefixes = ['pre', 'pro', 'sub', 'super', 'anti', 'auto', 'co', 'de', 'dis', 'en'];
    const suffixes = ['tion', 'ing', 'er', 'ed', 'ly', 'ness', 'ment', 'able', 'ful', 'less'];
    const roots = ['test', 'work', 'play', 'run', 'jump', 'write', 'read', 'sing', 'dance', 'cook'];
    
    return Array.from({ length: count }, () => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const root = roots[Math.floor(Math.random() * roots.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      
      return `${prefix}${root}${suffix}`;
    });
  }

  // Calcular métricas de rendimiento
  static calculatePerformanceMetrics(results) {
    const totalComparisons = results.reduce((sum, result) => sum + (result.comparisons || 0), 0);
    const averageComparisons = totalComparisons / results.length;
    
    return {
      totalTests: results.length,
      totalComparisons,
      averageComparisons: Math.round(averageComparisons * 100) / 100,
      successRate: (results.filter(r => r.found).length / results.length) * 100,
      algorithms: [...new Set(results.map(r => r.algorithm))]
    };
  }

  // Crear dataset de prueba
  static createTestDataset(algorithm, size = 20) {
    switch (algorithm.toLowerCase()) {
      case 'trie':
        return this.generateRandomWords(size);
      case 'binaria':
        return this.generateRandomArray(size).sort((a, b) => a - b);
      default:
        return this.generateRandomArray(size);
    }
  }
}

module.exports = SearchUtils;