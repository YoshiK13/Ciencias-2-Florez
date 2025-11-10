#!/bin/bash

echo "===== Verificación de canUndo/canRedo en todas las secciones ====="
echo ""

sections=(
  "SequentialSearchSection.jsx"
  "BinarySearchSection.jsx"
  "ResiduosSearchSection.jsx"
  "MultipleResiduosSearchSection.jsx"
  "DinamicasCompletasSearchSection.jsx"
  "DinamicasParcialesSearchSection.jsx"
  "TrieSearchSection.jsx"
  "DigitalSearchSection.jsx"
  "HuffmanSearchSection.jsx"
)

for section in "${sections[@]}"; do
  echo "=== $section ==="
  file="src/components/$section"
  
  # Verificar variables canUndo/canRedo
  if grep -q "const canUndo = historyIndex >= 0;" "$file" && \
     grep -q "const canRedo = historyIndex < history.length - 1;" "$file"; then
    echo "✓ Variables canUndo/canRedo declaradas correctamente"
  else
    echo "✗ Faltan variables canUndo/canRedo"
  fi
  
  # Verificar uso en botones
  if grep -q "disabled={!canUndo}" "$file" && \
     grep -q "disabled={!canRedo}" "$file"; then
    echo "✓ Botones usan canUndo/canRedo en disabled"
  else
    echo "✗ Botones NO usan canUndo/canRedo"
  fi
  
  # Verificar funciones handleUndo/handleRedo
  if grep -q "const handleUndo = () => {" "$file" && \
     grep -q "const handleRedo = () => {" "$file"; then
    echo "✓ Funciones handleUndo/handleRedo presentes"
  else
    echo "✗ Faltan funciones handleUndo/handleRedo"
  fi
  
  echo ""
done

echo "===== Verificación completada ====="
