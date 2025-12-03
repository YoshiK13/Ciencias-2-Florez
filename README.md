# Ciencias-2-Florez

Simulador de Ciencias de Computación 2 para la clase de Florez - Aplicación Full Stack

## 📋 Descripción

Este proyecto es un simulador educativo para la clase de Ciencias de Computación 2, diseñado para practicar y visualizar diferentes algoritmos y técnicas de búsqueda tanto internas como externas. La aplicación ha sido refactorizada de HTML/CSS/JS vanilla a una arquitectura moderna full-stack con React y Node.js.

## 🏗️ Arquitectura

- **Frontend**: React 18 + Vite + Lucide React (iconos)
- **Backend**: Node.js + Express + CORS
- **Comunicación**: REST API con Axios
- **Algoritmos implementados**:
  - Búsquedas Clásicas: Secuencial, Binaria, Hash
  - Búsquedas en Árboles: Residuos, Digitales, Trie, Residuos Múltiples, Huffman

## 📁 Estructura del Proyecto

```
Ciencias-2-Florez/
├── backend/                 # Servidor API Express
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades
│   │   └── index.js        # Punto de entrada del servidor
│   ├── package.json
│   └── .env
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   ├── styles/         # Estilos CSS
│   │   └── App.jsx         # Componente principal
│   ├── package.json
│   └── .env
├── package.json            # Scripts del proyecto principal
├── setup.sh               # Script de configuración
└── README.md
```

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js >= 16.0.0
- npm >= 8.0.0

### Instalación Rápida

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd Ciencias-2-Florez
   ```

2. **Ejecutar script de configuración:**
   ```bash
   ./setup.sh
   ```
   
   O manualmente:
   ```bash
   npm run install:all
   ```

### Instalación Manual

1. **Instalar dependencias del proyecto principal:**
   ```bash
   npm install
   ```

2. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Instalar dependencias del frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## 🔧 Ejecución

### Desarrollo (Recomendado)

Ejecutar backend y frontend simultáneamente:
```bash
npm run dev
```

### Ejecución Individual

**Backend solamente:**
```bash
npm run dev:backend
# O
cd backend && npm run dev
```

**Frontend solamente:**
```bash
npm run dev:frontend  
# O
cd frontend && npm run dev
```

### URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🔍 Funcionalidades

### Algoritmos de Búsqueda Implementados

#### Búsquedas Clásicas
- **Secuencial**: O(n) - Examina cada elemento linealmente
- **Binaria**: O(log n) - Divide y vence (requiere datos ordenados)
- **Hash**: O(1) promedio - Mapeo directo con función hash

#### Búsquedas en Árboles
- **Residuos**: O(1)-O(n) - Búsqueda por operaciones módulo
- **Digitales**: O(k) - Búsqueda por representación digital
- **Trie**: O(m) - Árbol de prefijos para cadenas
- **Residuos Múltiples**: O(k) - Múltiples funciones hash
- **Huffman**: O(log n) - Árbol binario óptimo

### Características

- 🎯 Simulación interactiva de algoritmos
- 📊 Visualización de pasos y comparaciones
- 📱 Diseño responsive (móvil y escritorio)
- 🔄 Generación automática de datos de prueba
- ⚡ Análisis de complejidad temporal y espacial
- 🎨 Interfaz moderna con animaciones

## 🛠️ API Endpoints

### Información General
- `GET /api/health` - Estado del servidor
- `GET /api/search` - Lista de métodos de búsqueda

### Simulaciones
- `POST /api/search/secuencial` - Búsqueda secuencial
- `POST /api/search/binaria` - Búsqueda binaria
- `POST /api/search/hash` - Funciones hash
- `POST /api/search/residuos` - Búsqueda por residuos
- `POST /api/search/digitales` - Búsqueda digital
- `POST /api/search/trie` - Búsqueda Trie
- `POST /api/search/multiples` - Residuos múltiples
- `POST /api/search/huffman` - Búsqueda Huffman

### Formato de Request
```json
{
  "array": [1, 2, 3, 4, 5],
  "target": 3
}
```

### Formato de Response
```json
{
  "success": true,
  "method": "Búsqueda Secuencial",
  "data": {
    "found": true,
    "index": 2,
    "comparisons": 3,
    "steps": [...],
    "algorithm": "Secuencial",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)"
  }
}
```

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 18**: Biblioteca de componentes
- **Vite**: Build tool y dev server
- **Lucide React**: Iconos SVG
- **Axios**: Cliente HTTP
- **CSS3**: Estilos con variables CSS y grid/flexbox

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **CORS**: Middleware para CORS
- **Helmet**: Middleware de seguridad
- **Morgan**: Logger HTTP
- **Dotenv**: Variables de entorno

## 💻 Ejecutables de Escritorio con Electron

Este proyecto puede exportarse como aplicación de escritorio para Windows (.exe) y Linux (AppImage).

### 🚀 Inicio Rápido Electron

```bash
# Probar con Electron
npm run electron:start

# Construir ejecutables
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:all      # Ambas plataformas
```

### 📚 Documentación Completa

- **[📍 Índice de Documentación](docs/electron/ELECTRON-INDEX.md)** - Punto de partida
- **[⚡ Inicio Rápido](docs/electron/ELECTRON-QUICK-SUMMARY.md)** - Comandos esenciales
- **[✅ Checklist](docs/electron/BUILD-CHECKLIST.md)** - Antes de construir
- **[❓ FAQ](docs/electron/ELECTRON-FAQ.md)** - Preguntas frecuentes

Los ejecutables se generan en `dist-electron/` con tamaño ~150MB e incluyen todo lo necesario (no requiere Node.js instalado).

## 🔧 Scripts Disponibles

```bash
# Proyecto principal
npm run dev          # Ejecutar backend y frontend
npm run dev:backend  # Solo backend
npm run dev:frontend # Solo frontend
npm run install:all  # Instalar todas las dependencias
npm run setup        # Ejecutar script de configuración

# Electron
npm run electron:start  # Modo desarrollo con Electron
npm run build:win       # Construir ejecutable Windows (.exe)
npm run build:linux     # Construir ejecutable Linux (AppImage)
npm run build:all       # Construir ambos ejecutables

# Backend
npm run dev          # Desarrollo con nodemon
npm start           # Producción

# Frontend  
npm run dev         # Servidor de desarrollo
npm run build       # Build para producción
npm run preview     # Preview del build
```

## 🌟 Mejoras Implementadas

1. **Arquitectura Moderna**: Separación completa frontend/backend
2. **Componentes Reutilizables**: Código más mantenible
3. **API RESTful**: Comunicación estándar
4. **Responsive Design**: Funciona en todos los dispositivos
5. **Performance**: Optimizaciones de React y Vite
6. **Escalabilidad**: Estructura preparada para crecimiento
7. **Developer Experience**: Hot reload, TypeScript ready

## 🚧 Próximas Mejoras

- [ ] Visualizaciones gráficas de algoritmos
- [ ] Persistencia de resultados
- [ ] Comparación entre algoritmos
- [ ] Tests automatizados
- [ ] Docker containerization
- [ ] Deploy automático

## 👥 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍🏫 Créditos

Proyecto desarrollado para la clase de **Ciencias de la Computación 2** del profesor **Florez**.

---

¡Disfruta explorando los algoritmos de búsqueda! 🔍✨