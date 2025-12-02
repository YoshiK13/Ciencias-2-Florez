import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import WelcomeSection from './components/WelcomeSection';
import InternalSearchSection from './components/InternalSearchSection';
import ClassicSearchSection from './components/ClassicSearchSection';
import TreeSearchSection from './components/TreeSearchSection';
import SequentialSearchSection from './components/SequentialSearchSection';
import BinarySearchSection from './components/BinarySearchSection';
import HashFunctionSection from './components/HashFunctionSection';
import ResiduosSearchSection from './components/ResiduosSearchSection';
import MultipleResiduosSearchSection from './components/MultipleResiduosSearchSection';
import DigitalSearchSection from './components/DigitalSearchSection';
import TrieSearchSection from './components/TrieSearchSection';
import HuffmanSearchSection from './components/HuffmanSearchSection';
import ExternalSearchSection from './components/ExternalSearchSection';
import BloquesSearchSection from './components/BloquesSearchSection';
import DinamicasSearchSection from './components/DinamicasSearchSection';
import DinamicasCompletasSearchSection from './components/DinamicasCompletasSearchSection';
import DinamicasParcialesSearchSection from './components/DinamicasParcialesSearchSection';
import IndicesSearchSection from './components/IndicesSearchSection';
import GrafosSection from './components/GrafosSection';
import OperacionesGrafosSection from './components/OperacionesGrafosSection';
import ArbolesGrafosSection from './components/ArbolesGrafosSection';
import MatricesGrafosSection from './components/MatricesGrafosSection';
import SobreGrafoSection from './components/SobreGrafoSection';
import EntreGrafosSection from './components/EntreGrafosSection';
import ArbolGeneradorSection from './components/ArbolGeneradorSection';
import OperacionesArbolesSection from './components/OperacionesArbolesSection';
import FloydSection from './components/FloydSection';
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
    }
    // Verificar si hay cambios no guardados en funciones hash
    else if (currentSection === 'hash' && window.hashFunctionCheckUnsavedChanges) {
      window.hashFunctionCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en búsqueda por residuos
    else if (currentSection === 'residuos' && window.residuosSearchCheckUnsavedChanges) {
      window.residuosSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en árboles digitales
    else if (currentSection === 'digitales' && window.digitalSearchCheckUnsavedChanges) {
      window.digitalSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en árboles trie
    else if (currentSection === 'trie' && window.trieSearchCheckUnsavedChanges) {
      window.trieSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en residuos múltiples
    else if (currentSection === 'multiples' && window.multipleResiduosSearchCheckUnsavedChanges) {
      window.multipleResiduosSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Huffman
    else if (currentSection === 'huffman' && window.huffmanSearchCheckUnsavedChanges) {
      window.huffmanSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Dinámicas Totales
    else if (currentSection === 'dinamicas-totales' && window.dinamicasCompletasCheckUnsavedChanges) {
      window.dinamicasCompletasCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Dinámicas Parciales
    else if (currentSection === 'dinamicas-parciales' && window.dinamicasParcialesCheckUnsavedChanges) {
      window.dinamicasParcialesCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Búsqueda por Bloques
    else if (currentSection === 'bloques' && window.bloquesSearchCheckUnsavedChanges) {
      window.bloquesSearchCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Índices
    else if (currentSection === 'indices' && window.indicesCheckUnsavedChanges) {
      window.indicesCheckUnsavedChanges(section, () => {
        setCurrentSection(section);
        console.log('Navegando a:', section);
      });
    }
    // Verificar si hay cambios no guardados en Operaciones sobre Grafo
    else if (currentSection === 'sobre-grafo' && window.sobreGrafoCheckUnsavedChanges) {
      window.sobreGrafoCheckUnsavedChanges(section, () => {
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
        return (
          <HashFunctionSection 
            onNavigate={handleNavigate}
          />
        );
      case 'residuos':
        return (
          <ResiduosSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'digitales':
        return (
          <DigitalSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'trie':
        return (
          <TrieSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'multiples':
        return (
          <MultipleResiduosSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'huffman':
        return (
          <HuffmanSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'external-search':
        return (
          <ExternalSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'bloques':
        return (
          <BloquesSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'dinamicas':
        return (
          <DinamicasSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'dinamicas-totales':
        return (
          <DinamicasCompletasSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'dinamicas-parciales':
        return (
          <DinamicasParcialesSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'indices':
        return (
          <IndicesSearchSection 
            onNavigate={handleNavigate}
          />
        );
      case 'grafos':
        return (
          <GrafosSection 
            onNavigate={handleNavigate}
          />
        );
      case 'operaciones-grafos':
        return (
          <OperacionesGrafosSection 
            onNavigate={handleNavigate}
          />
        );
      case 'arboles-grafos':
        return (
          <ArbolesGrafosSection 
            onNavigate={handleNavigate}
          />
        );
      case 'matrices-grafos':
        return (
          <MatricesGrafosSection 
            onNavigate={handleNavigate}
          />
        );
      case 'sobre-grafo':
        return (
          <SobreGrafoSection 
            onNavigate={handleNavigate}
          />
        );
      case 'entre-grafos':
        return (
          <EntreGrafosSection 
            onNavigate={handleNavigate}
          />
        );
      case 'arbol-generador':
        return (
          <ArbolGeneradorSection 
            onNavigate={handleNavigate}
          />
        );
      case 'operaciones-arboles':
        return (
          <OperacionesArbolesSection 
            onNavigate={handleNavigate}
          />
        );
      case 'floyd':
        return (
          <FloydSection 
            onNavigate={handleNavigate}
          />
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
      
      <Sidebar
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
