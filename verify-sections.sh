#!/bin/bash

# Script para verificar que todas las secciones tengan las funciones necesarias

echo "=== VERIFICACIÓN DE FUNCIONES EN SECCIONES DE BÚSQUEDA ==="
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
    
    # Verificar handleSave
    if grep -q "const handleSave" "$file"; then
      echo "  ✓ handleSave encontrado"
    else
      echo "  ✗ handleSave NO encontrado"
    fi
    
    # Verificar handleLoad
    if grep -q "const handleLoad\|const loadFromData" "$file"; then
      echo "  ✓ handleLoad encontrado"
    else
      echo "  ✗ handleLoad NO encontrado"
    fi
    
    # Verificar handleUndo
    if grep -q "const handleUndo" "$file"; then
      echo "  ✓ handleUndo encontrado"
    else
      echo "  ✗ handleUndo NO encontrado"
    fi
    
    # Verificar handleRedo
    if grep -q "const handleRedo" "$file"; then
      echo "  ✓ handleRedo encontrado"
    else
      echo "  ✗ handleRedo NO encontrado"
    fi
    
    # Verificar historial
    if grep -q "history.*useState\|const \[history" "$file"; then
      echo "  ✓ Estado history encontrado"
    else
      echo "  ✗ Estado history NO encontrado"
    fi
    
    # Verificar historyIndex
    if grep -q "historyIndex.*useState\|const \[historyIndex" "$file"; then
      echo "  ✓ Estado historyIndex encontrado"
    else
      echo "  ✗ Estado historyIndex NO encontrado"
    fi
    
    # Verificar extensión de archivo
    extension=$(grep -oP "'\.\w{2,5}'" "$file" | head -1)
    if [ -n "$extension" ]; then
      echo "  ✓ Extensión de archivo: $extension"
    else
      echo "  ✗ Extensión de archivo NO encontrada"
    fi
    
    echo ""
  else
    echo "⚠️  $section - Archivo no encontrado"
    echo ""
  fi
done

echo "=== FIN DE VERIFICACIÓN ==="
