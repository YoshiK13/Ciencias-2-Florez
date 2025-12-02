#!/bin/bash

# Script para verificar que los inputs de configuración tienen validación automática
# en las secciones modificadas

echo "======================================"
echo "Verificación de Validación de Inputs"
echo "======================================"
echo ""

SUCCESS=0
FAIL=0

# Función para verificar contenido en un archivo
check_validation() {
    local file=$1
    local section_name=$2
    
    echo "Verificando: $section_name ($file)"
    
    # Verificar que los inputs tienen onChange con validación
    if grep -q "onChange={(e) => {" "$file" && \
       grep -q "const value = e.target.value;" "$file" && \
       grep -q "if (value === '' || value === '-')" "$file" && \
       grep -q "onBlur={(e) => {" "$file" && \
       grep -q "ajuste automático" "$file"; then
        echo "  ✓ Validación automática implementada"
        ((SUCCESS++))
    else
        echo "  ✗ Validación automática NO encontrada o incompleta"
        ((FAIL++))
    fi
    echo ""
}

# Verificar BinarySearchSection
check_validation \
    "frontend/src/components/BinarySearchSection.jsx" \
    "Búsqueda Binaria"

# Verificar DinamicasCompletasSearchSection
check_validation \
    "frontend/src/components/DinamicasCompletasSearchSection.jsx" \
    "Dinámicas Completas"

# Verificar DinamicasParcialesSearchSection
check_validation \
    "frontend/src/components/DinamicasParcialesSearchSection.jsx" \
    "Dinámicas Parciales"

# Verificar BloquesSearchSection
check_validation \
    "frontend/src/components/BloquesSearchSection.jsx" \
    "Búsquedas por Bloques"

echo "======================================"
echo "Resumen de Verificación"
echo "======================================"
echo "✓ Exitosas: $SUCCESS"
echo "✗ Fallidas:  $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✓ Todas las secciones tienen validación automática implementada"
    exit 0
else
    echo "✗ Algunas secciones no tienen validación completa"
    exit 1
fi
