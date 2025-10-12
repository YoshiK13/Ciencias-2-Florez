import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import '../styles/Header.css';

function Header({ onMenuToggle, isMenuOpen }) {
  return (
    <header className="header">
      <button 
        className="menu-toggle" 
        onClick={onMenuToggle}
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <h1 className="header-title">Simulador de Búsquedas</h1>
    </header>
  );
}

export default Header;