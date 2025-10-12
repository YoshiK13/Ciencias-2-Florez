#!/bin/bash

echo "🚀 Configurando proyecto Ciencias-2-Florez..."

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

echo "✅ ¡Instalación completada!"
echo ""
echo "Para ejecutar el proyecto:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"