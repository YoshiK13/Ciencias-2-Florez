const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

let mainWindow;
let backendServer;

// Configuración del servidor backend
function startBackendServer() {
  const backendApp = express();
  const PORT = 3001;

  // Middleware
  backendApp.use(helmet({
    contentSecurityPolicy: false,
  }));
  backendApp.use(cors());
  backendApp.use(express.json());

  // Logger simple
  backendApp.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Importar rutas del backend
  try {
    const searchRoutes = require('./backend/src/routes/searchRoutes');
    backendApp.use('/api', searchRoutes);
    console.log('✓ Backend routes loaded successfully');
  } catch (error) {
    console.error('✗ Error loading backend routes:', error.message);
  }

  // Servidor de archivos estáticos para el frontend en producción
  const frontendPath = path.join(__dirname, 'frontend', 'dist');
  backendApp.use(express.static(frontendPath));

  // Ruta catch-all para SPA
  backendApp.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });

  backendServer = backendApp.listen(PORT, () => {
    console.log(`✓ Backend server running on http://localhost:${PORT}`);
  });

  return PORT;
}

function createWindow() {
  // Inicia el servidor backend
  const backendPort = startBackendServer();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'frontend', 'public', 'icon.png'),
    autoHideMenuBar: true,
    title: 'Simulador Ciencias 2 - Florez'
  });

  // En desarrollo, carga desde el servidor de desarrollo de Vite
  // En producción, carga el index.html del build
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${backendPort}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendServer) {
    backendServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
