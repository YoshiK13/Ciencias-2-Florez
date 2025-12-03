#!/bin/bash

echo "🚀 Construyendo ejecutables de Simulador Ciencias 2..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paso 1: Construir frontend
echo -e "${BLUE}📦 Paso 1/3: Construyendo frontend...${NC}"
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir el frontend${NC}"
    exit 1
fi

cd ..
echo -e "${GREEN}✓${NC} Frontend construido"
echo ""

# Paso 2: Construir ejecutables
echo -e "${BLUE}📦 Paso 2/3: Construyendo ejecutables...${NC}"
echo -e "${YELLOW}⏳ Esto puede tardar 5-10 minutos...${NC}"
echo ""

npm run build:all

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir ejecutables${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} Ejecutables construidos"
echo ""

# Paso 3: Mostrar resultados
echo -e "${BLUE}📦 Paso 3/3: Verificando archivos generados...${NC}"
echo ""

if [ -d "dist-electron" ]; then
    echo -e "${GREEN}✅ Ejecutables generados en dist-electron/${NC}"
    echo ""
    ls -lh dist-electron/ | grep -E '\.(exe|AppImage)$' || echo "Listando todos los archivos..."
    ls -lh dist-electron/
    echo ""
    
    # Contar archivos
    EXE_COUNT=$(find dist-electron -name "*.exe" 2>/dev/null | wc -l)
    APPIMAGE_COUNT=$(find dist-electron -name "*.AppImage" 2>/dev/null | wc -l)
    
    echo "📊 Resumen:"
    echo "   Windows (.exe): $EXE_COUNT archivo(s)"
    echo "   Linux (AppImage): $APPIMAGE_COUNT archivo(s)"
    echo ""
    
    if [ $EXE_COUNT -gt 0 ] || [ $APPIMAGE_COUNT -gt 0 ]; then
        echo -e "${GREEN}🎉 ¡Build completado exitosamente!${NC}"
        echo ""
        echo "📤 Puedes distribuir estos archivos:"
        find dist-electron -type f \( -name "*.exe" -o -name "*.AppImage" \) 2>/dev/null
    else
        echo -e "${YELLOW}⚠️  Los ejecutables se generaron pero no se encontraron .exe o .AppImage${NC}"
        echo "   Revisa el contenido de dist-electron/"
    fi
else
    echo -e "${RED}❌ No se encontró la carpeta dist-electron/${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📖 Para probar:${NC}"
echo "   Windows: Ejecuta el .exe desde dist-electron/"
echo "   Linux: chmod +x <archivo>.AppImage && ./<archivo>.AppImage"
echo ""
