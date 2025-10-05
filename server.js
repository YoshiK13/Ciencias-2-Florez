const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenido al proyecto de Ciencias 2 - Florez',
        descripcion: 'Proyecto de manejo de busquedas'
    });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({
        status: 'ok',
        mensaje: 'El servidor está funcionando correctamente'
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
