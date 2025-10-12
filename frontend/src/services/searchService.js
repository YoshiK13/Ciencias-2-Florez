import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class SearchService {
  // Verificar salud del servidor
  static async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('No se pudo conectar con el servidor');
    }
  }

  // Obtener información de todos los métodos de búsqueda
  static async getAllSearchMethods() {
    try {
      const response = await api.get('/search');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener métodos de búsqueda: ' + error.message);
    }
  }

  // Búsqueda secuencial
  static async sequentialSearch(array, target) {
    try {
      const response = await api.post('/search/secuencial', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda secuencial: ' + error.message);
    }
  }

  // Búsqueda binaria
  static async binarySearch(array, target) {
    try {
      const response = await api.post('/search/binaria', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda binaria: ' + error.message);
    }
  }

  // Funciones hash
  static async hashSearch(array, target) {
    try {
      const response = await api.post('/search/hash', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda hash: ' + error.message);
    }
  }

  // Búsqueda por residuos
  static async residuesSearch(array, target) {
    try {
      const response = await api.post('/search/residuos', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda por residuos: ' + error.message);
    }
  }

  // Búsqueda digital
  static async digitalSearch(array, target) {
    try {
      const response = await api.post('/search/digitales', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda digital: ' + error.message);
    }
  }

  // Búsqueda Trie
  static async trieSearch(words, target) {
    try {
      const response = await api.post('/search/trie', { words, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda Trie: ' + error.message);
    }
  }

  // Búsqueda por residuos múltiples
  static async multipleResiduesSearch(array, target) {
    try {
      const response = await api.post('/search/multiples', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda por residuos múltiples: ' + error.message);
    }
  }

  // Búsqueda Huffman
  static async huffmanSearch(array, target) {
    try {
      const response = await api.post('/search/huffman', { array, target });
      return response.data;
    } catch (error) {
      throw new Error('Error en búsqueda Huffman: ' + error.message);
    }
  }

  // Simulación genérica de algoritmos
  static async simulateSearch(algorithm, array, target, options = {}) {
    try {
      const response = await api.post(`/search/simulate/${algorithm}`, { 
        array, 
        target, 
        options 
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error en simulación de ${algorithm}: ` + error.message);
    }
  }

  // Métodos de utilidad para generar datos de prueba
  static generateRandomArray(size = 10, min = 1, max = 100) {
    return Array.from({ length: size }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }

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
}

export default SearchService;