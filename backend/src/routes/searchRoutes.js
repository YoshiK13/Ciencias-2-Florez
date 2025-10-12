const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Ruta para obtener información de todos los algoritmos
router.get('/', searchController.getAllSearchMethods);

// Rutas para búsquedas clásicas
router.post('/secuencial', searchController.sequentialSearch);
router.post('/binaria', searchController.binarySearch);
router.post('/hash', searchController.hashSearch);

// Rutas para búsquedas en árboles
router.post('/residuos', searchController.residuesSearch);
router.post('/digitales', searchController.digitalSearch);
router.post('/trie', searchController.trieSearch);
router.post('/multiples', searchController.multipleResiduesSearch);
router.post('/huffman', searchController.huffmanSearch);

// Ruta para simular cualquier algoritmo
router.post('/simulate/:algorithm', searchController.simulateSearch);

module.exports = router;