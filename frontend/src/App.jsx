import { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarNew from './components/SidebarNew';
import MainContent from './components/MainContent';
import WelcomeSection from './components/WelcomeSection';
import InternalSearchSection from './components/InternalSearchSection';
import ClassicSearchSection from './components/ClassicSearchSection';
import TreeSearchSection from './components/TreeSearchSection';
import SequentialSearchSection from './components/SequentialSearchSection';
import BinarySearchSection from './components/BinarySearchSection';
import InformationSection from './components/InformationSection';
import { useResponsive } from './hooks/useResponsive';
import { useSearch } from './hooks/useSearch';
import './styles/globals.css';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { isMobile } = useResponsive();
  const { generateTestData } = useSearch();

  // Ajustar visibilidad del sidebar según el dispositivo
  useEffect(() => {
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  const handleMenuToggle = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleNavigate = (section) => {
    // Verificar si hay cambios no guardados en búsqueda secuencial
    if (currentSection === 'secuencial' && window.sequentialSearchCheckUnsavedChanges) {
      window.sequentialSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    } 
    // Verificar si hay cambios no guardados en búsqueda binaria
    else if (currentSection === 'binaria' && window.binarySearchCheckUnsavedChanges) {
      window.binarySearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    } else {
      setCurrentSection(section);
      console.log('Navegando a:', section);
    }
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleSimulate = async (algorithm) => {
    try {
      // Generar datos de prueba
      const testData = generateTestData(algorithm, 15);
      const target = testData[Math.floor(Math.random() * testData.length)];
      
      console.log(`Simulando ${algorithm} con datos:`, testData);
      console.log('Buscando:', target);
      
      // Por ahora solo mostramos un alert
      // Aquí se conectará con el backend
      alert(`Iniciando simulación de ${algorithm}\nDatos: [${testData.slice(0, 5).join(', ')}...]\nBuscando: ${target}`);
      
      // TODO: Uncomment when backend is ready
      // const result = await simulateSearch(algorithm, testData, target);
      // console.log('Resultado:', result);
      
    } catch (error) {
      console.error('Error en simulación:', error);
      alert('Error al ejecutar la simulación: ' + error.message);
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <WelcomeSection onNavigate={handleNavigate} />;
      case 'internal-search':
        return (
          <InternalSearchSection 
            onNavigate={handleNavigate}
            onSimulate={handleSimulate}
          />
        );
      case 'clasicas':
        return (
          <ClassicSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'arboles':
        return (
          <TreeSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'secuencial':
        return (
          <SequentialSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'binaria':
        return (
          <BinarySearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'hash':
      case 'residuos':
      case 'digitales':
      case 'trie':
      case 'multiples':
      case 'huffman':
        // Aquí podríamos mostrar páginas específicas para cada algoritmo
        // Por ahora redirigimos a la sección correspondiente
        if (currentSection === 'hash') {
          return (
            <ClassicSearchSection 
              onNavigate={handleNavigate}
            />
          );
        } else {
          return (
            <TreeSearchSection 
              onNavigate={handleNavigate}
            />
          );
        }
      case 'external-search':
        return (
          <div className="section-container">
            <h1>Búsquedas Externas</h1>
            <p>Sección en desarrollo...</p>
          </div>
        );
      case 'information':
        return <InformationSection onNavigate={handleNavigate} />;
      default:
        return <WelcomeSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <Header 
        onMenuToggle={handleMenuToggle} 
        isMenuOpen={sidebarVisible}
      />
      
      <SidebarNew
        isVisible={sidebarVisible}
        onNavigate={handleNavigate}
        currentSection={currentSection}
        isMobile={isMobile}
        onClose={handleCloseSidebar}
      />
      
      <MainContent 
        sidebarVisible={sidebarVisible}
        isMobile={isMobile}
      >
        {renderCurrentSection()}
      </MainContent>
    </div>
  );
}

export default App;
