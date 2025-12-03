const { contextBridge, ipcRenderer } = require('electron');

// Expone una API segura al contexto del renderizador
contextBridge.exposeInMainWorld('electronAPI', {
  // Puedes agregar métodos de comunicación aquí si lo necesitas
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
