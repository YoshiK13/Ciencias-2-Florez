import { render, screen } from '@testing-library/react';
import InformationSection from '../components/InformationSection';

// Mock de función onNavigate
const mockOnNavigate = jest.fn();

describe('InformationSection', () => {
  test('renderiza el contenido de información correctamente', () => {
    render(<InformationSection onNavigate={mockOnNavigate} />);
    
    // Verificar que el título principal esté presente
    expect(screen.getByText('Información del Proyecto')).toBeInTheDocument();
    
    // Verificar descripción del simulador
    expect(screen.getByText(/Este es un simulador para el manejo, guardado, búsqueda de información/)).toBeInTheDocument();
    expect(screen.getByText(/ciencias de la computación 2/)).toBeInTheDocument();
    expect(screen.getByText(/Este simulador solo busca ejemplificar/)).toBeInTheDocument();
    
    // Verificar información del docente
    expect(screen.getByText('Ing. Julio César Flórez Báez')).toBeInTheDocument();
    
    // Verificar información del estudiante
    expect(screen.getByText('Joshoa Alarcón Sánchez')).toBeInTheDocument();
    expect(screen.getByText('20221020013')).toBeInTheDocument();
  });
});