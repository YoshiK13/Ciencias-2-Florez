import '../styles/MainContent.css';

function MainContent({ children, sidebarVisible, isMobile }) {
  return (
    <main className={`main-content ${!sidebarVisible && !isMobile ? 'expanded' : ''}`}>
      {children}
    </main>
  );
}

export default MainContent;