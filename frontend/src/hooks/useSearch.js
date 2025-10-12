import { useState, useCallback } from 'react';
import { SearchService } from '../services/searchService';

export function useSearch() {
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearResult = useCallback(() => {
    setSearchResult(null);
    setError(null);
  }, []);

  const simulateSearch = useCallback(async (algorithm, array, target, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (algorithm.toLowerCase()) {
        case 'secuencial':
          result = await SearchService.sequentialSearch(array, target);
          break;
        case 'binaria':
          result = await SearchService.binarySearch(array, target);
          break;
        case 'hash':
          result = await SearchService.hashSearch(array, target);
          break;
        case 'residuos':
          result = await SearchService.residuesSearch(array, target);
          break;
        case 'digitales':
          result = await SearchService.digitalSearch(array, target);
          break;
        case 'trie':
          result = await SearchService.trieSearch(array, target);
          break;
        case 'multiples':
          result = await SearchService.multipleResiduesSearch(array, target);
          break;
        case 'huffman':
          result = await SearchService.huffmanSearch(array, target);
          break;
        default:
          result = await SearchService.simulateSearch(algorithm, array, target, options);
      }
      
      setSearchResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTestData = useCallback((algorithm, size = 20) => {
    switch (algorithm.toLowerCase()) {
      case 'trie':
        return SearchService.generateRandomWords(size);
      case 'binaria':
        return SearchService.generateRandomArray(size).sort((a, b) => a - b);
      default:
        return SearchService.generateRandomArray(size);
    }
  }, []);

  return {
    searchResult,
    loading,
    error,
    simulateSearch,
    generateTestData,
    clearResult
  };
}