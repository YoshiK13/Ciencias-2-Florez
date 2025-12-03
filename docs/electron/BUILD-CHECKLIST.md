# ✅ Checklist - Antes de Crear los Ejecutables

Usa esta lista para asegurarte de que todo está listo antes de generar los ejecutables.

## 📋 Preparación

- [ ] **Dependencias instaladas**
  ```bash
  npm run install:all
  ```
  
- [ ] **Frontend compilado sin errores**
  ```bash
  npm run build:frontend
  # Verifica que se creó: frontend/dist/
  ```

- [ ] **Backend funciona correctamente**
  ```bash
  npm run dev:backend
  # Visita: http://localhost:3001/api/health
  ```

- [ ] **Aplicación funciona en modo desarrollo**
  ```bash
  npm run electron:start
  # La ventana de Electron debe abrirse sin errores
  ```

## 🎨 Personalización (Opcional)

- [ ] **Ícono agregado**
  - Archivo: `frontend/public/icon.png`
  - Tamaño recomendado: 512x512px
  - Formato: PNG con fondo transparente
  
- [ ] **Información del proyecto actualizada en `package.json`**
  - [ ] `name`: Nombre del paquete
  - [ ] `version`: Versión actual (ej: "1.0.0")
  - [ ] `description`: Descripción breve
  - [ ] `author`: Tu nombre o equipo
  - [ ] `build.productName`: Nombre mostrado al usuario
  - [ ] `build.appId`: ID único de la aplicación

## 🧪 Pruebas

- [ ] **Todas las funcionalidades probadas**
  - [ ] Búsquedas funcionan correctamente
  - [ ] Navegación entre secciones
  - [ ] Visualizaciones se muestran bien
  - [ ] No hay errores en la consola

- [ ] **Responsive design verificado**
  - [ ] Ventana maximizada
  - [ ] Ventana en tamaño mínimo (800x600)
  - [ ] Diferentes resoluciones

## 🔧 Configuración Final

- [ ] **Variables de entorno configuradas** (si aplica)
  - Archivo: `.env` o `.env.production`

- [ ] **Versión correcta en `package.json`**
  ```json
  {
    "version": "1.0.0"  // ⬅️ Actualiza esto
  }
  ```

- [ ] **Cambios importantes commiteados en Git** (recomendado)
  ```bash
  git add .
  git commit -m "Preparado para release v1.0.0"
  git tag v1.0.0
  ```

## 🚀 Build

Una vez completado el checklist, ejecuta:

### Para Windows (.exe):
```bash
npm run build:win
```

### Para Linux (AppImage):
```bash
npm run build:linux
```

### Para ambas plataformas:
```bash
npm run build:all
```

O usa el script interactivo:
```bash
chmod +x build-electron.sh
./build-electron.sh
```

## 📦 Después del Build

- [ ] **Ejecutables generados en `dist-electron/`**
  - [ ] Windows: `Simulador Ciencias 2-1.0.0-Setup.exe`
  - [ ] Linux: `Simulador Ciencias 2-1.0.0.AppImage`

- [ ] **Probar el ejecutable de Windows** (si aplica)
  - [ ] Instalación completa
  - [ ] La aplicación arranca sin errores
  - [ ] Todas las funcionalidades funcionan
  - [ ] Desinstalación limpia

- [ ] **Probar el AppImage de Linux** (si aplica)
  ```bash
  cd dist-electron
  chmod +x "Simulador Ciencias 2-1.0.0.AppImage"
  ./"Simulador Ciencias 2-1.0.0.AppImage"
  ```
  - [ ] La aplicación arranca sin errores
  - [ ] Todas las funcionalidades funcionan

## 📤 Distribución

- [ ] **Archivos listos para compartir**
  - [ ] Copiados a una ubicación segura
  - [ ] Respaldo creado

- [ ] **Documentación para usuarios finales** (opcional)
  - [ ] Instrucciones de instalación
  - [ ] Requisitos del sistema
  - [ ] Guía de uso básico

- [ ] **Subir a plataforma de distribución** (si aplica)
  - [ ] GitHub Releases
  - [ ] Servidor web
  - [ ] Drive compartido
  - [ ] etc.

## ⚠️ Problemas Comunes

Si algo falla, revisa:

1. **Error: "Cannot find module"**
   ```bash
   npm run install:all
   ```

2. **Error: "frontend/dist not found"**
   ```bash
   npm run build:frontend
   ```

3. **Error relacionado con el ícono**
   - Comenta las líneas de `icon` en `package.json`
   - O agrega el archivo `icon.png` en `frontend/public/`

4. **Build muy lento o falla**
   - Asegúrate de tener espacio suficiente en disco
   - Cierra otras aplicaciones pesadas
   - Intenta construir una plataforma a la vez

## 📊 Información del Build

**Tamaños esperados:**
- Windows (.exe): 120-150 MB
- Linux (AppImage): 130-160 MB

**Tiempo de construcción:**
- Primera vez: 5-10 minutos
- Builds subsecuentes: 3-5 minutos

**Requisitos de espacio en disco:**
- Al menos 2 GB libres (para node_modules + builds)

---

## 🎉 ¡Todo Listo!

Si completaste todos los items del checklist, tu aplicación está lista para ser distribuida.

**Comando final:**
```bash
npm run build:all
```

¡Buena suerte con tu distribución! 🚀
