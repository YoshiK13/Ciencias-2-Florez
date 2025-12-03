#!/bin/bash

# Script para mover archivos de documentación de Electron a docs/electron/

echo "📦 Moviendo documentación de Electron..."

# Crear directorio si no existe
mkdir -p docs/electron

# Copiar archivos
cp BUILD-CHECKLIST.md docs/electron/ 2>/dev/null
cp ELECTRON-FAQ.md docs/electron/ 2>/dev/null
cp ELECTRON-INDEX.md docs/electron/ 2>/dev/null
cp ELECTRON-QUICK-SUMMARY.md docs/electron/ 2>/dev/null
cp ELECTRON-README.md docs/electron/ 2>/dev/null
cp ELECTRON-SETUP-COMPLETE.md docs/electron/ 2>/dev/null
cp ELECTRON-STEP-BY-STEP.md docs/electron/ 2>/dev/null
cp ELECTRON-VISUAL-SUMMARY.md docs/electron/ 2>/dev/null
cp QUICK-START-ELECTRON.md docs/electron/ 2>/dev/null

# Eliminar archivos originales
rm -f BUILD-CHECKLIST.md 2>/dev/null
rm -f ELECTRON-FAQ.md 2>/dev/null
rm -f ELECTRON-INDEX.md 2>/dev/null
rm -f ELECTRON-QUICK-SUMMARY.md 2>/dev/null
rm -f ELECTRON-README.md 2>/dev/null
rm -f ELECTRON-SETUP-COMPLETE.md 2>/dev/null
rm -f ELECTRON-STEP-BY-STEP.md 2>/dev/null
rm -f ELECTRON-VISUAL-SUMMARY.md 2>/dev/null
rm -f QUICK-START-ELECTRON.md 2>/dev/null

echo "✅ Archivos movidos a docs/electron/"
echo "📝 No olvides actualizar las referencias en los archivos MD"
