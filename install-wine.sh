#!/bin/bash

echo "🍷 Instalando Wine para construir ejecutables de Windows..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar si ya está instalado
if command -v wine &> /dev/null; then
    echo -e "${GREEN}✓${NC} Wine ya está instalado"
    wine --version
    echo ""
else
    echo -e "${BLUE}📦 Instalando Wine...${NC}"
    echo ""
    
    # Agregar arquitectura de 32 bits
    echo "Agregando arquitectura i386..."
    sudo dpkg --add-architecture i386
    
    # Actualizar repositorios
    echo "Actualizando repositorios..."
    sudo apt-get update
    
    # Instalar Wine
    echo "Instalando Wine (esto puede tardar varios minutos)..."
    sudo apt-get install -y wine wine32 wine64 libwine
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Wine instalado exitosamente${NC}"
        wine --version
    else
        echo ""
        echo -e "${RED}❌ Error al instalar Wine${NC}"
        echo "Intenta instalar manualmente con:"
        echo "  sudo apt-get install -y wine wine32 wine64"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔧 Configurando Wine...${NC}"

# Inicializar Wine (crea el directorio .wine)
WINEARCH=win64 wineboot -u

echo ""
echo -e "${GREEN}✅ Wine configurado correctamente${NC}"
echo ""
echo -e "${BLUE}📝 Ahora puedes construir el ejecutable de Windows con:${NC}"
echo "  ./build-executables.sh"
echo ""
