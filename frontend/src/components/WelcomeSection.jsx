import { Search, Globe, Info } from 'lucide-react';
import '../styles/MainContent.css';

function WelcomeSection({ onNavigate }) {
  const features = [
    {
      icon: Search,
      title: 'Búsquedas Internas',
      description: 'Simula búsquedas dentro de memoria principal y en estructuras de arboles.',
      path: 'internal-search'
    },
    {
      icon: Globe,
      title: 'Búsquedas Externas',
      description: 'Practica búsquedas en memoria de almacenamiento, estructuras por bloques e indices.',
      path: 'external-search'
    },
    {
      icon: Info,
      title: 'Información',
      description: 'Consulta objetivo, responsables y información del aplicativo.',
      path: 'information'
    }
  ];

  const handleFeatureClick = (path) => {
    onNavigate(path);
  };

  return (
    <section className="welcome-section fade-in">
      <div className="welcome-container">
        <div className="welcome-header">
          <Search className="welcome-icon" size={64} />
          <h1>¡Bienvenido al Simulador de Búsquedas!</h1>
        </div>
        
        <div className="welcome-content">
          <p className="welcome-subtitle">
            Simulador de búsquedas para la clase de Ciencias de la Computación 2
          </p>
          
          <div className="welcome-description">
            <p>
              Este simulador está diseñado para practicar e ilustrar las técnicas de búsqueda 
              tanto internas como externas de manera eficiente y organizada. Aquí podrás:
            </p>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="feature-card"
                  onClick={() => handleFeatureClick(feature.path)}
                  style={{
                    animationDelay: `${(index + 1) * 0.1}s`
                  }}
                >
                  <feature.icon className="feature-card-icon" size={40} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WelcomeSection;