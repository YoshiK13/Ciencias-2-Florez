#!/bin/bash

# Script para verificar detalles de implementación

echo "=== VERIFICACIÓN DETALLADA DE IMPLEMENTACIÓN ==="
echo ""

SECTIONS=(
  "ResiduosSearchSection.jsx"
  "MultipleResiduosSearchSection.jsx"
  "DinamicasCompletasSearchSection.jsx"
  "DinamicasParcialesSearchSection.jsx"
  "SequentialSearchSection.jsx"
  "BinarySearchSection.jsx"
  "TrieSearchSection.jsx"
  "DigitalSearchSection.jsx"
  "HuffmanSearchSection.jsx"
)

for section in "${SECTIONS[@]}"; do
  file="/workspaces/Ciencias-2-Florez/frontend/src/components/$section"
  
  if [ -f "$file" ]; then
    echo "📄 $section"
    echo "---"
    
    # Verificar canUndo
    if grep -q "canUndo" "$file"; then
      echo "  ✓ Variable canUndo encontrada"
    else
      echo "  ⚠️  Variable canUndo NO encontrada (verificar si disabled usa historyIndex)"
    fi
    
    # Verificar canRedo
    if grep -q "canRedo" "$file"; then
      echo "  ✓ Variable canRedo encontrada"
    else
      echo "  ⚠️  Variable canRedo NO encontrada (verificar si disabled usa historyIndex)"
    fi
    
    # Verificar hasUnsavedChanges
    if grep -q "hasUnsavedChanges" "$file"; then
      echo "  ✓ Estado hasUnsavedChanges encontrado"
    else
      echo "  ✗ Estado hasUnsavedChanges NO encontrado"
    fi
    
    # Verificar markAsChanged
    if grep -q "markAsChanged\|setHasUnsavedChanges" "$file"; then
      echo "  ✓ Función para marcar cambios encontrada"
    else
      echo "  ✗ Función para marcar cambios NO encontrada"
    fi
    
    # Verificar disabled en botón Undo
    if grep -q "disabled.*canUndo\|disabled.*historyIndex" "$file"; then
      echo "  ✓ Botón Undo tiene disabled"
    else
      echo "  ⚠️  Botón Undo podría no tener disabled"
    fi
    
    # Verificar disabled en botón Redo
    if grep -q "disabled.*canRedo\|disabled.*historyIndex.*history\.length" "$file"; then
      echo "  ✓ Botón Redo tiene disabled"
    else
      echo "  ⚠️  Botón Redo podría no tener disabled"
    fi
    
    # Verificar saveToHistory
    if grep -q "saveToHistory\|addToHistory" "$file"; then
      echo "  ✓ Función para guardar en historial encontrada"
    else
      echo "  ⚠️  Función para guardar en historial NO encontrada"
    fi
    
    echo ""
  fi
done

echo "=== FIN DE VERIFICACIÓN DETALLADA ==="
