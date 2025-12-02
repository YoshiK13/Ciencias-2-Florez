#!/bin/bash

# Script para verificar la estructura de la sección de Grafos
echo "======================================"
echo "Verificación de Sección de Grafos"
echo "======================================"
echo ""

# Verificar componentes principales
echo "✓ Verificando componentes principales..."
COMPONENTS=(
  "GrafosSection.jsx"
  "OperacionesGrafosSection.jsx"
  "ArbolesGrafosSection.jsx"
  "MatricesGrafosSection.jsx"
  "SobreGrafoSection.jsx"
  "EntreGrafosSection.jsx"
  "ArbolGeneradorSection.jsx"
  "OperacionesArbolesSection.jsx"
  "FloydSection.jsx"
)

MISSING=0
for component in "${COMPONENTS[@]}"; do
  if [ -f "frontend/src/components/$component" ]; then
    echo "  ✓ $component encontrado"
  else
    echo "  ✗ $component NO encontrado"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
echo "✓ Verificando importaciones en App.jsx..."
if grep -q "import GrafosSection" frontend/src/App.jsx && \
   grep -q "import OperacionesGrafosSection" frontend/src/App.jsx && \
   grep -q "import ArbolesGrafosSection" frontend/src/App.jsx; then
  echo "  ✓ Todas las importaciones encontradas"
else
  echo "  ✗ Faltan importaciones"
  MISSING=$((MISSING + 1))
fi

echo ""
echo "✓ Verificando rutas en App.jsx..."
ROUTES=(
  "case 'grafos':"
  "case 'operaciones-grafos':"
  "case 'arboles-grafos':"
  "case 'matrices-grafos':"
  "case 'sobre-grafo':"
  "case 'entre-grafos':"
  "case 'arbol-generador':"
  "case 'operaciones-arboles':"
  "case 'floyd':"
)

for route in "${ROUTES[@]}"; do
  if grep -q "$route" frontend/src/App.jsx; then
    echo "  ✓ Ruta $route encontrada"
  else
    echo "  ✗ Ruta $route NO encontrada"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
echo "✓ Verificando configuración del Sidebar..."
if grep -q "'operaciones-grafos'" frontend/src/components/Sidebar.jsx && \
   grep -q "'arboles-grafos'" frontend/src/components/Sidebar.jsx && \
   grep -q "'matrices-grafos'" frontend/src/components/Sidebar.jsx; then
  echo "  ✓ Sidebar configurado correctamente"
else
  echo "  ✗ Sidebar no está configurado correctamente"
  MISSING=$((MISSING + 1))
fi

echo ""
echo "======================================"
if [ $MISSING -eq 0 ]; then
  echo "✓ TODOS LOS ARCHIVOS VERIFICADOS"
  echo "✓ La sección de Grafos está completa"
else
  echo "✗ Faltan $MISSING elementos"
fi
echo "======================================"
