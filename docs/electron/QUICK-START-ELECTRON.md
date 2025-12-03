# 🚀 Guía Rápida - Crear Ejecutables

## ⚡ Inicio Rápido

### 1. Asegurar que todo está instalado
```bash
npm run install:all
```

### 2. Probar la aplicación con Electron (modo desarrollo)
```bash
npm run electron:start
```

### 3. Construir ejecutables

#### Opción A: Usando el script interactivo (Recomendado)
```bash
chmod +x build-electron.sh
./build-electron.sh
```

#### Opción B: Usando comandos npm directamente

**Solo para Windows (.exe):**
```bash
npm run build:win
```

**Solo para Linux (AppImage):**
```bash
npm run build:linux
```

**Para ambas plataformas:**
```bash
npm run build:all
```

## 📁 Dónde encontrar los ejecutables

Los archivos generados estarán en: `dist-electron/`

- **Windows**: `Simulador Ciencias 2-1.0.0-Setup.exe`
- **Linux**: `Simulador Ciencias 2-1.0.0.AppImage`

## ⚠️ Importante: Ícono de la Aplicación

Antes de hacer el build final, agrega un ícono:

1. Crea o descarga un archivo PNG (512x512px recomendado)
2. Guárdalo como `frontend/public/icon.png`
3. Si no lo haces, se usará el ícono predeterminado de Electron

## 🐛 Solución rápida de problemas

### Error: "Cannot find module"
```bash
npm run install:all
```

### Error en el build
```bash
# Limpia y reconstruye
rm -rf dist-electron frontend/dist
npm run build:frontend
npm run build:linux  # o build:win
```

### El ejecutable no arranca
- Verifica que `frontend/dist` existe y tiene archivos
- Revisa que el backend esté sin errores
- Comprueba los logs de la aplicación

## 📊 Tamaños Aproximados

- **Ejecutable Windows**: ~120-150 MB
- **AppImage Linux**: ~130-160 MB

El tamaño es grande porque incluye:
- Electron/Chromium
- Node.js runtime
- Tu aplicación completa (frontend + backend)
- Todas las dependencias

## 🎯 Distribución

Una vez generados los ejecutables:

### Windows
- Comparte el archivo `.exe`
- El usuario solo ejecuta el instalador
- La aplicación se instala como cualquier programa de Windows

### Linux
- Comparte el archivo `.AppImage`
- El usuario debe hacer: `chmod +x Simulador*.AppImage`
- Luego ejecuta: `./Simulador*.AppImage`
- No requiere instalación

## 📖 Más Información

Para documentación completa, consulta: `ELECTRON-README.md`

---

**¡Listo para distribuir tu aplicación!** 🎉
