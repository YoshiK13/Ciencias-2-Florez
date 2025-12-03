# 🎓 Tutorial Paso a Paso - Primer Build con Electron

Este tutorial te guiará desde cero hasta tener tus ejecutables listos para distribuir.

## 📋 Antes de Empezar

**Tiempo estimado**: 15-20 minutos  
**Nivel**: Principiante  
**Requisitos**: Node.js y npm instalados

---

## Paso 1️⃣: Verificar el Setup (2 min)

### ¿Qué vamos a hacer?
Asegurarnos de que todas las dependencias estén instaladas correctamente.

### Comandos

```bash
# Navega al directorio del proyecto
cd /workspaces/Ciencias-2-Florez

# Instala todas las dependencias
npm run install:all
```

### ✅ ¿Cómo sé que funcionó?

Deberías ver:
```
✔ Dependencies installed successfully
✔ Backend dependencies installed
✔ Frontend dependencies installed
```

### ⚠️ Si algo falla

```bash
# Limpia e intenta de nuevo
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

---

## Paso 2️⃣: Agregar un Ícono (5 min) - OPCIONAL

### ¿Qué vamos a hacer?
Agregar un ícono personalizado para tu aplicación.

### Opción A: Usar la plantilla incluida

1. **Abre el archivo SVG**
   ```bash
   # Abre en tu navegador
   xdg-open frontend/public/icon-template.svg
   # O en Windows
   start frontend/public/icon-template.svg
   ```

2. **Conviértelo a PNG**
   - Ve a: https://cloudconvert.com/svg-to-png
   - Sube `icon-template.svg`
   - Configura: 512x512 píxeles
   - Descarga el PNG

3. **Guarda el ícono**
   ```bash
   # Mueve el PNG descargado al proyecto
   mv ~/Downloads/icon.png frontend/public/icon.png
   ```

### Opción B: Usar tu propio diseño

1. Crea o descarga un PNG de 512x512px
2. Guárdalo como: `frontend/public/icon.png`

### Opción C: Saltar este paso

**Sin problema!** El build usará el ícono predeterminado de Electron.

### ✅ Verificar

```bash
ls -lh frontend/public/icon.png
# Debería mostrar: -rw-r--r-- ... icon.png
```

---

## Paso 3️⃣: Probar con Electron (3 min)

### ¿Qué vamos a hacer?
Ejecutar la aplicación en modo desarrollo para asegurarnos de que todo funciona.

### Comandos

```bash
npm run electron:start
```

### ✅ ¿Qué debería pasar?

1. Se abrirá una ventana de Electron
2. La aplicación cargará (puede tardar 10-15 segundos la primera vez)
3. Verás tu aplicación funcionando

### 🧪 Prueba rápida

- ✅ ¿La ventana se abre?
- ✅ ¿La aplicación carga sin errores?
- ✅ ¿Puedes navegar entre secciones?
- ✅ ¿Los algoritmos funcionan?

### 🛑 Cerrar la aplicación

Simplemente cierra la ventana o presiona `Ctrl+C` en la terminal.

### ⚠️ Si algo falla

**Error: "Cannot find module"**
```bash
npm run install:all
```

**Error: "Port 5173 already in use"**
```bash
# Encuentra y mata el proceso
lsof -ti:5173 | xargs kill -9
# O cambia el puerto en frontend/vite.config.js
```

---

## Paso 4️⃣: Construir el Ejecutable (5-10 min)

### ¿Qué vamos a hacer?
Crear los ejecutables finales para distribuir.

### Opción A: Script Interactivo (Recomendado)

```bash
# Da permisos al script
chmod +x build-electron.sh

# Ejecuta el script
./build-electron.sh
```

**El script te preguntará:**
```
¿Para qué plataformas deseas construir?
1) Windows (.exe)
2) Linux (AppImage)
3) Ambas
Selecciona una opción (1-3):
```

Selecciona `3` para construir ambas.

### Opción B: Comandos Directos

**Para Windows:**
```bash
npm run build:win
```

**Para Linux:**
```bash
npm run build:linux
```

**Para ambas:**
```bash
npm run build:all
```

### ⏱️ Tiempo de Construcción

- Primera vez: 5-10 minutos
- Builds subsecuentes: 3-5 minutos

### ✅ ¿Cómo sé que funcionó?

Verás mensajes como:
```
• building        target=nsis file=dist-electron/Simulador Ciencias 2-1.0.0-Setup.exe
• building        target=AppImage file=dist-electron/Simulador Ciencias 2-1.0.0.AppImage
```

Al final:
```
✅ ¡Construcción completada exitosamente!

Los ejecutables se encuentran en: ./dist-electron/
```

---

## Paso 5️⃣: Verificar los Ejecutables (2 min)

### ¿Qué vamos a hacer?
Confirmar que los archivos se crearon correctamente.

### Comandos

```bash
# Listar los archivos generados
ls -lh dist-electron/
```

### ✅ Deberías ver

```
total 280M
-rw-r--r-- 1 user user 150M ... Simulador Ciencias 2-1.0.0-Setup.exe
-rw-r--r-- 1 user user 135M ... Simulador Ciencias 2-1.0.0.AppImage
```

### 📊 Información de los Archivos

| Archivo | Tipo | Plataforma | Tamaño |
|---------|------|------------|--------|
| `...-Setup.exe` | Instalador NSIS | Windows 7+ | ~120-150 MB |
| `....AppImage` | AppImage | Linux | ~130-160 MB |

---

## Paso 6️⃣: Probar el Ejecutable (5 min)

### ¿Qué vamos a hacer?
Ejecutar el ejecutable para asegurarnos de que funciona.

### En Linux

```bash
cd dist-electron

# Da permisos de ejecución
chmod +x "Simulador Ciencias 2-1.0.0.AppImage"

# Ejecuta
./"Simulador Ciencias 2-1.0.0.AppImage"
```

### En Windows

1. Abre la carpeta `dist-electron`
2. Doble clic en `Simulador Ciencias 2-1.0.0-Setup.exe`
3. Sigue el instalador
4. Ejecuta la aplicación desde el menú inicio o escritorio

### ✅ ¿Qué debería pasar?

1. La aplicación se abre (puede tardar 5-10 segundos la primera vez)
2. Todo funciona igual que en desarrollo
3. No se requiere terminal ni comandos

### 🧪 Prueba Completa

- ✅ ¿La aplicación arranca?
- ✅ ¿Todos los algoritmos funcionan?
- ✅ ¿La interfaz se ve correcta?
- ✅ ¿No hay errores visibles?
- ✅ ¿El ícono es correcto? (si agregaste uno)

---

## Paso 7️⃣: Distribución (2 min)

### ¿Qué vamos a hacer?
Preparar los archivos para compartir con otros usuarios.

### Opciones de Distribución

#### Opción 1: Compartir Directamente

```bash
# Copia los ejecutables a una ubicación segura
cp dist-electron/*.exe ~/Descargas/
cp dist-electron/*.AppImage ~/Descargas/

# O comprímelos
zip -r simulador-ciencias2-v1.0.0.zip dist-electron/
```

#### Opción 2: Subir a GitHub Releases

```bash
# Crear un tag
git tag v1.0.0
git push origin v1.0.0

# Luego en GitHub:
# 1. Ve a "Releases"
# 2. "Create a new release"
# 3. Sube los ejecutables
```

#### Opción 3: Servidor Web

Sube los archivos a tu servidor web y comparte el enlace de descarga.

### 📝 Información para Usuarios

Cuando compartas los ejecutables, incluye:

**Para Windows:**
```
1. Descargar: Simulador Ciencias 2-1.0.0-Setup.exe
2. Ejecutar el instalador
3. Seguir las instrucciones
4. Ejecutar desde el menú inicio

Requisitos: Windows 7 o superior (64-bit)
```

**Para Linux:**
```
1. Descargar: Simulador Ciencias 2-1.0.0.AppImage
2. Dar permisos: chmod +x Simulador*.AppImage
3. Ejecutar: ./Simulador*.AppImage

Requisitos: Distribución Linux moderna
```

---

## 🎉 ¡Felicidades! Has completado el tutorial

### Lo que has logrado:

✅ Instalado todas las dependencias  
✅ Configurado Electron correctamente  
✅ Agregado un ícono (opcional)  
✅ Probado la aplicación en modo desarrollo  
✅ Construido ejecutables para Windows y Linux  
✅ Verificado que los ejecutables funcionan  
✅ Preparado archivos para distribución  

---

## 🎯 Próximos Pasos

### Para Actualizar la Aplicación

1. **Hacer cambios en el código**
2. **Incrementar versión en `package.json`**:
   ```json
   {
     "version": "1.1.0"
   }
   ```
3. **Reconstruir**:
   ```bash
   npm run build:all
   ```
4. **Distribuir nuevos ejecutables**

### Para Personalizar Más

Ver:
- `ELECTRON-README.md` - Configuración avanzada
- `ELECTRON-FAQ.md` - Preguntas comunes
- `package.json` - Sección `build` para opciones

---

## 📊 Resumen Visual

```
Inicio
  │
  ├─ Paso 1: npm run install:all ✅
  │
  ├─ Paso 2: Agregar ícono (opcional) ✅
  │
  ├─ Paso 3: npm run electron:start ✅
  │
  ├─ Paso 4: npm run build:all ✅
  │
  ├─ Paso 5: Verificar dist-electron/ ✅
  │
  ├─ Paso 6: Probar ejecutables ✅
  │
  └─ Paso 7: Distribuir ✅

Final: ¡Aplicación lista! 🎊
```

---

## 🆘 Ayuda Rápida

| Problema | Solución Rápida |
|----------|-----------------|
| Error de dependencias | `npm run install:all` |
| Error en build | `npm run build:frontend` primero |
| Ejecutable no arranca | Verificar que `frontend/dist/` existe |
| Ícono no aparece | Asegurarse de que `icon.png` existe |
| Puerto en uso | Cambiar puerto en `electron.js` |

**Más ayuda**: Ver `ELECTRON-FAQ.md`

---

## 📚 Documentación Adicional

- [ELECTRON-INDEX.md](ELECTRON-INDEX.md) - Índice completo
- [QUICK-START-ELECTRON.md](QUICK-START-ELECTRON.md) - Referencia rápida
- [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) - Checklist detallado
- [ELECTRON-FAQ.md](ELECTRON-FAQ.md) - Preguntas frecuentes

---

**¡Disfruta distribuyendo tu aplicación!** 🚀✨

**Fecha del tutorial**: Diciembre 3, 2025  
**Versión**: 1.0.0  
**Tiempo total**: 15-20 minutos
