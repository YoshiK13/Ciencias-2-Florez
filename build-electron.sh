#!/bin/bash

# Script para construir los ejecutables de la aplicación

echo "🚀 Iniciando proceso de construcción de ejecutables..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) detectado"

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) detectado"
echo ""

# Verificar que las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC}  Las dependencias no están instaladas. Instalando..."
    npm run install:all
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Dependencias verificadas"
echo ""

# Verificar que existe el ícono (opcional)
if [ ! -f "frontend/public/icon.png" ]; then
    echo -e "${YELLOW}⚠${NC}  Advertencia: No se encontró el ícono en frontend/public/icon.png"
    echo "   Se usará el ícono predeterminado de Electron"
    echo ""
fi

# Construir el frontend
echo "📦 Construyendo el frontend..."
npm run build:frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir el frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend construido exitosamente"
echo ""

# Preguntar qué plataformas construir
echo "¿Para qué plataformas deseas construir?"
echo "1) Windows (.exe)"
echo "2) Linux (AppImage)"
echo "3) Ambas"
read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        echo ""
        echo "🏗️  Construyendo para Windows..."
        npm run build:win
        ;;
    2)
        echo ""
        echo "🏗️  Construyendo para Linux..."
        npm run build:linux
        ;;
    3)
        echo ""
        echo "🏗️  Construyendo para Windows y Linux..."
        npm run build:all
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ¡Construcción completada exitosamente!${NC}"
    echo ""
    echo "Los ejecutables se encuentran en: ./dist-electron/"
    echo ""
    ls -lh dist-electron/ 2>/dev/null | grep -E '\.(exe|AppImage)$'
    echo ""
    echo "📤 Puedes distribuir estos archivos a los usuarios finales"
else
    echo ""
    echo -e "${RED}❌ Error durante la construcción${NC}"
    exit 1
fi
