# Guía de Empaquetado con Electron

Este proyecto está configurado para crear ejecutables de escritorio usando Electron.

## 📦 Requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- Para Windows: Windows 7 o superior
- Para Linux: Cualquier distribución moderna

## 🚀 Instalación

```bash
# Instalar todas las dependencias
npm run install:all
```

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
# Ejecutar en modo desarrollo con Electron
npm run electron:start
```

Este comando:
1. Inicia el servidor de desarrollo de Vite (frontend)
2. Espera a que el servidor esté listo
3. Abre la aplicación Electron con hot reload

### Construcción de Ejecutables

```bash
# Construir para la plataforma actual
npm run build

# Construir solo para Windows (.exe)
npm run build:win

# Construir solo para Linux (AppImage)
npm run build:linux

# Construir para ambas plataformas
npm run build:all
```

## 📁 Estructura del Proyecto

```
.
├── electron.js          # Proceso principal de Electron
├── preload.js          # Script de precarga para seguridad
├── package.json        # Configuración de electron-builder
├── backend/            # Servidor Express
├── frontend/           # Aplicación React + Vite
│   ├── dist/          # Build del frontend (generado)
│   └── public/        # Recursos estáticos (agregar icon.png aquí)
└── dist-electron/     # Ejecutables generados (output)
```

## 🖼️ Ícono de la Aplicación

**IMPORTANTE**: Debes agregar un ícono para tu aplicación:

1. Crea o descarga un ícono en formato PNG
2. Guárdalo como `icon.png` en `frontend/public/`
3. Tamaño recomendado: 512x512 píxeles o mayor
4. Fondo transparente (opcional pero recomendado)

Si no agregas un ícono, el build usará el ícono predeterminado de Electron.

## 📤 Resultados del Build

Los ejecutables se generan en la carpeta `dist-electron/`:

### Windows
- `Simulador Ciencias 2-1.0.0-Setup.exe` - Instalador NSIS
  - Permite elegir directorio de instalación
  - Crea atajos en escritorio y menú inicio

### Linux
- `Simulador Ciencias 2-1.0.0.AppImage` - AppImage portable
  - No requiere instalación
  - Se puede ejecutar directamente
  - Portable (se puede copiar a cualquier lugar)

## 🔧 Configuración Personalizada

Puedes modificar la configuración de electron-builder en `package.json`:

```json
{
  "build": {
    "appId": "com.ciencias2florez.app",
    "productName": "Simulador Ciencias 2",
    // ... más configuraciones
  }
}
```

### Opciones comunes:

- **appId**: Identificador único de la aplicación
- **productName**: Nombre mostrado al usuario
- **directories.output**: Carpeta de salida de los builds
- **win.target**: Formato para Windows (nsis, portable, etc.)
- **linux.target**: Formato para Linux (AppImage, deb, rpm, etc.)

## 🐛 Solución de Problemas

### El build falla

1. Asegúrate de que todas las dependencias estén instaladas:
   ```bash
   npm run install:all
   ```

2. Construye el frontend primero:
   ```bash
   npm run build:frontend
   ```

3. Verifica que no haya errores en el código.

### Error de ícono no encontrado

Agrega un archivo `icon.png` en `frontend/public/` o comenta las líneas de ícono en el `package.json`:

```json
"win": {
  // "icon": "frontend/public/icon.png",  // Comenta esta línea
},
"linux": {
  // "icon": "frontend/public/icon.png",  // Comenta esta línea
}
```

### El ejecutable no arranca

1. Verifica los logs en la carpeta de instalación
2. Asegúrate de que el backend esté incluido en el build
3. Verifica que `frontend/dist` exista y tenga contenido

## 📝 Notas Adicionales

- Los ejecutables incluyen todo lo necesario: Node.js, dependencias, frontend y backend
- El tamaño del ejecutable será de ~100-200 MB debido a Electron y dependencias
- La primera ejecución puede tardar un poco mientras se inicializa
- El backend se ejecuta en el puerto 3001 dentro de la aplicación
- En producción, la aplicación carga el frontend desde el servidor local integrado

## 🎯 Distribución

Para distribuir tu aplicación:

1. Ejecuta `npm run build:all`
2. Los ejecutables estarán en `dist-electron/`
3. Puedes compartir estos archivos directamente con los usuarios
4. No es necesario instalar Node.js ni dependencias en la máquina del usuario

### Windows (.exe)
- Usuarios simplemente ejecutan el instalador
- Se instala como cualquier aplicación de Windows
- Se puede desinstalar desde el Panel de Control

### Linux (AppImage)
- Hacer el archivo ejecutable: `chmod +x Simulador*.AppImage`
- Ejecutar directamente: `./Simulador*.AppImage`
- No requiere instalación ni permisos de administrador

## 📚 Recursos

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/)

---

**¡Tu aplicación está lista para ser empaquetada y distribuida!** 🎉
