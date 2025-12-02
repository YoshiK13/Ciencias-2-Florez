#!/bin/bash

echo "==================================="
echo "Verificación de Índices Multinivel"
echo "==================================="
echo ""

echo "1. Verificando que el archivo existe..."
if [ -f "/workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx" ]; then
    echo "✓ Archivo encontrado"
else
    echo "✗ Archivo no encontrado"
    exit 1
fi

echo ""
echo "2. Verificando correcciones de código..."

# Verificar que multilevelIndexArray se asigna correctamente
if grep -q "multilevelIndexArray = blockFirstIndices;" /workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx; then
    echo "✓ multilevelIndexArray se asigna como números directamente"
else
    echo "✗ multilevelIndexArray no se asigna correctamente"
fi

# Verificar que se genera blockFirstIndices
if grep -q "const blockFirstIndices = Array.from" /workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx; then
    echo "✓ blockFirstIndices se genera correctamente"
else
    echo "✗ blockFirstIndices no se genera"
fi

# Verificar visualización del valor directo
if grep -q "{indexValue}" /workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx; then
    echo "✓ Visualización muestra el valor directo (no referencia)"
else
    echo "✗ Visualización no muestra el valor correctamente"
fi

# Verificar sistema de puntos suspensivos nivel 2
if grep -q "getVisibleMultilevelBlocks" /workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx; then
    echo "✓ Sistema de puntos suspensivos para nivel 2 implementado"
else
    echo "✗ Sistema de puntos suspensivos para nivel 2 no implementado"
fi

# Verificar información en configuración
if grep -q "Cantidad de Índices Nivel 2" /workspaces/Ciencias-2-Florez/frontend/src/components/IndicesSearchSection.jsx; then
    echo "✓ Información de multinivel en configuración"
else
    echo "✗ Información de multinivel falta en configuración"
fi

echo ""
echo "3. Compilando el proyecto..."
cd /workspaces/Ciencias-2-Florez/frontend
npm run build 2>&1 | tail -20

echo ""
echo "==================================="
echo "Verificación completada"
echo "==================================="
