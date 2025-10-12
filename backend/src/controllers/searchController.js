const searchService = require('../services/searchService');

class SearchController {
  // Obtener información de todos los métodos de búsqueda
  async getAllSearchMethods(req, res) {
    try {
      const methods = searchService.getAllSearchMethods();
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda secuencial
  async sequentialSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.sequentialSearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda Secuencial',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda binaria
  async binarySearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.binarySearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda Binaria',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda hash
  async hashSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.hashSearch(array, target);
      res.json({
        success: true,
        method: 'Funciones Hash',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda por residuos
  async residuesSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.residuesSearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda por Residuos',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda digital
  async digitalSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.digitalSearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda Digital',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda Trie
  async trieSearch(req, res) {
    try {
      const { words, target } = req.body;
      
      if (!words || !target) {
        return res.status(400).json({
          success: false,
          error: 'Words array y target son requeridos'
        });
      }

      const result = searchService.trieSearch(words, target);
      res.json({
        success: true,
        method: 'Búsqueda Trie',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda por residuos múltiples
  async multipleResiduesSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.multipleResiduesSearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda por Residuos Múltiples',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Búsqueda Huffman
  async huffmanSearch(req, res) {
    try {
      const { array, target } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.huffmanSearch(array, target);
      res.json({
        success: true,
        method: 'Búsqueda Huffman',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Simulación genérica de algoritmos
  async simulateSearch(req, res) {
    try {
      const { algorithm } = req.params;
      const { array, target, options } = req.body;
      
      if (!array || target === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Array y target son requeridos'
        });
      }

      const result = searchService.simulateSearch(algorithm, array, target, options);
      res.json({
        success: true,
        method: algorithm,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new SearchController();