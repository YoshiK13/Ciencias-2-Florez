# ❓ Preguntas Frecuentes (FAQ) - Electron

## 📦 Sobre los Ejecutables

### ¿Por qué son tan grandes los ejecutables (~150MB)?

Los ejecutables incluyen:
- **Chromium completo**: El navegador que renderiza tu aplicación (~80-90MB)
- **Node.js runtime**: Para ejecutar el backend (~30-40MB)
- **Tu aplicación**: Frontend + Backend + dependencias (~20-30MB)

Esto es normal para aplicaciones Electron. Ejemplos:
- Visual Studio Code: ~150-200MB
- Discord: ~100-150MB
- Slack: ~150-200MB

### ¿Los usuarios necesitan instalar Node.js?

**No.** El ejecutable incluye todo lo necesario. Los usuarios solo necesitan:
- Windows 7+ (para .exe)
- Linux moderno (para AppImage)

### ¿Puedo hacer los ejecutables más pequeños?

Parcialmente. Opciones:
1. **Comprimir con UPX** (reduce ~30%):
   ```json
   "build": {
     "compression": "maximum"
   }
   ```
2. **Excluir archivos innecesarios**
3. **Usar Electron alternativas** (más complejo)

Pero el tamaño mínimo será siempre ~100MB por Chromium.

## 🔧 Desarrollo

### ¿Cómo pruebo la aplicación antes de construir?

```bash
npm run electron:start
```

Esto abre la aplicación en una ventana Electron con hot-reload.

### ¿Puedo seguir desarrollando normalmente?

**Sí.** El desarrollo normal no cambia:
```bash
npm run dev  # Frontend + Backend sin Electron
```

Usa Electron solo cuando quieras probar la aplicación empaquetada.

### ¿Cómo abro DevTools en Electron?

En modo desarrollo, DevTools se abre automáticamente.

Manualmente:
- **Windows/Linux**: `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`

O en el código (`electron.js`):
```javascript
mainWindow.webContents.openDevTools();
```

## 🖼️ Ícono

### ¿Es obligatorio el ícono?

**No**, pero es muy recomendado. Sin ícono:
- Se usa el ícono predeterminado de Electron
- La aplicación se ve menos profesional

### ¿Qué formato debe tener el ícono?

- **Formato**: PNG
- **Tamaño mínimo**: 256x256px
- **Tamaño recomendado**: 512x512px o 1024x1024px
- **Fondo**: Transparente (recomendado)

### ¿Puedo usar un ícono diferente para Windows y Linux?

**Sí**, en `package.json`:
```json
{
  "build": {
    "win": {
      "icon": "assets/icon-windows.png"
    },
    "linux": {
      "icon": "assets/icon-linux.png"
    }
  }
}
```

### ¿Dónde consigo un ícono gratis?

- **Flaticon**: https://www.flaticon.com/ (atribución requerida)
- **Icons8**: https://icons8.com/
- **Icon Kitchen**: https://icon.kitchen/ (generador)
- **Crear uno**: Canva, Figma, GIMP

## 🐛 Problemas Comunes

### Error: "Cannot find module 'express'"

**Solución**:
```bash
npm run install:all
```

### Error: "frontend/dist not found"

**Solución**:
```bash
npm run build:frontend
```

### Error: "icon.png not found"

**Opciones**:
1. Agregar el ícono en `frontend/public/icon.png`
2. Comentar las líneas de ícono en `package.json`:
   ```json
   "win": {
     // "icon": "frontend/public/icon.png",  // ⬅️ Comenta esto
   }
   ```

### El ejecutable no arranca

**Checklist**:
1. ¿Existe `frontend/dist/` con archivos?
2. ¿El backend compila sin errores?
3. ¿Todas las dependencias están instaladas?
4. Prueba en modo desarrollo: `npm run electron:start`

### La aplicación se ve mal / no carga estilos

**Problema**: Rutas absolutas en el build.

**Solución**: Verifica `vite.config.js`:
```javascript
export default defineConfig({
  base: './',  // ⬅️ Importante: rutas relativas
})
```

## 🚀 Build y Distribución

### ¿Cuánto tarda el build?

- **Primera vez**: 5-10 minutos
- **Builds subsecuentes**: 3-5 minutos
- **Depende de**: CPU, disco, plataformas

### ¿Puedo construir para Mac desde Windows/Linux?

**No fácilmente**. electron-builder requiere:
- **Para Windows**: Compilar en Windows o Linux/Mac con Wine
- **Para Mac**: Compilar en Mac (requiere Xcode)
- **Para Linux**: Compilar en cualquier plataforma

**Recomendación**: Usa GitHub Actions para compilación multiplataforma.

### ¿Dónde subo los ejecutables?

Opciones:
1. **GitHub Releases**: Gratis, fácil
   ```bash
   git tag v1.0.0
   git push --tags
   # Luego sube los archivos en GitHub > Releases
   ```
2. **Google Drive / Dropbox**: Compartir enlace
3. **Servidor web propio**: Descargas directas
4. **Microsoft Store / Snapcraft**: Tiendas oficiales (más complejo)

### ¿Cómo actualizo la aplicación?

**Manual** (simple):
1. Incrementa versión en `package.json`
2. Reconstruye: `npm run build:all`
3. Distribuye nuevos ejecutables

**Automático** (avanzado):
- Usa `electron-updater`
- Configura servidor de actualizaciones
- Ver: https://www.electron.build/auto-update

## 🔐 Seguridad

### ¿Es seguro Electron?

**Sí**, si sigues buenas prácticas:
- ✅ `contextIsolation: true` (ya configurado)
- ✅ `nodeIntegration: false` (ya configurado)
- ✅ Usa `preload.js` para exponer APIs (ya configurado)
- ✅ Valida entradas de usuario
- ✅ No ejecutes código remoto no confiable

### ¿Puedo proteger mi código?

Parcialmente:
- **JavaScript**: Se puede ofuscar, pero no proteger 100%
- **Alternativas**:
  - Ofuscación: `javascript-obfuscator`
  - Compilar partes críticas a binarios nativos
  - Lógica sensible en servidor remoto

## 💾 Almacenamiento

### ¿Dónde guarda datos la aplicación?

**Electron proporciona**:
```javascript
const { app } = require('electron');
const userDataPath = app.getPath('userData');
// Windows: C:\Users\<user>\AppData\Roaming\<appName>
// Linux: ~/.config/<appName>
// Mac: ~/Library/Application Support/<appName>
```

### ¿Cómo guardo configuraciones del usuario?

**Opciones**:
1. **electron-store**: NPM package simple
   ```bash
   npm install electron-store
   ```
2. **localStorage**: En el frontend
3. **Archivos JSON**: En `userData` path

## 🌐 Red y Backend

### ¿El backend necesita conexión a internet?

**No.** El backend Express se ejecuta localmente en la misma máquina.
Conexión solo si tu app hace requests externos (APIs, etc).

### ¿Puedo cambiar el puerto del backend?

**Sí**, en `electron.js`:
```javascript
const PORT = 3001;  // ⬅️ Cambia esto
```

**Nota**: Si cambias el puerto, actualiza también el frontend:
```javascript
// frontend/src/services/searchService.js
const BASE_URL = 'http://localhost:3001/api';  // ⬅️ Actualiza aquí
```

### ¿Puedo conectar a un backend remoto en vez del local?

**Sí**, cambia la URL en el servicio del frontend:
```javascript
const BASE_URL = 'https://tu-servidor.com/api';
```

## 📱 Plataformas

### ¿Puedo crear una app móvil con esto?

**No directamente**. Electron es solo para desktop.

Para móvil, considera:
- **React Native**: Mismo React, diferente plataforma
- **Capacitor**: Convierte tu web app a móvil
- **Flutter**: Framework de Google

### ¿Puedo hacer que sea una app web también?

**Sí.** Tu aplicación ya es una web app (React + Express).
Solo despliega normalmente en un servidor web.

## 🛠️ Herramientas

### ¿Qué otras herramientas puedo usar?

**Alternativas a electron-builder**:
- **electron-forge**: Otra herramienta de empaquetado
- **electron-packager**: Más simple, menos features

**Útiles para desarrollo**:
- **electron-reload**: Hot reload automático
- **electron-devtools-installer**: DevTools de React, Redux, etc.
- **electron-log**: Logging mejorado

## 📊 Rendimiento

### ¿Por qué la aplicación usa mucha RAM?

Es normal para Electron (Chromium + Node.js).
Típicamente: 100-300MB de RAM base.

**Optimizaciones**:
- Cerrar DevTools en producción
- Optimizar código React (React.memo, useMemo, etc.)
- Lazy loading de componentes

### ¿Puedo mejorar el tiempo de inicio?

**Sí**:
1. **Minimiza el trabajo en startup**
2. **Usa lazy loading**
3. **Optimiza dependencias** (tree-shaking)
4. **V8 snapshots** (avanzado)

## 🎓 Aprendizaje

### ¿Dónde aprendo más sobre Electron?

- **Docs oficiales**: https://www.electronjs.org/docs
- **electron-builder docs**: https://www.electron.build/
- **Tutoriales**: YouTube, freeCodeCamp
- **Ejemplos**: https://github.com/electron/electron-quick-start

### ¿Proyectos de ejemplo?

Apps famosas hechas con Electron:
- Visual Studio Code
- Discord
- Slack
- Figma
- GitHub Desktop
- WhatsApp Desktop

---

## 🤝 Soporte

¿Más preguntas?

1. Revisa la documentación en los otros archivos MD
2. Consulta: https://www.electronjs.org/docs
3. Pregunta en: https://github.com/electron/electron/discussions

---

**Última actualización**: Diciembre 3, 2025
