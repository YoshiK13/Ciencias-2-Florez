import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

function SearchResult({ result, onClose }) {
  if (!result) return null;

  const { data, method, success } = result;
  const { found, index, comparisons, steps, algorithm, timeComplexity, spaceComplexity } = data;

  return (
    <div className="search-result-modal">
      <div className="search-result-content">
        <div className="result-header">
          <h2>Resultado: {method}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="result-summary">
          <div className={`result-status ${found ? 'found' : 'not-found'}`}>
            {found ? (
              <>
                <CheckCircle size={24} />
                <span>Elemento encontrado en posición {index}</span>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <span>Elemento no encontrado</span>
              </>
            )}
          </div>
          
          <div className="result-stats">
            <div className="stat">
              <Clock size={16} />
              <span>Comparaciones: {comparisons}</span>
            </div>
            <div className="stat">
              <Zap size={16} />
              <span>Complejidad: {timeComplexity}</span>
            </div>
          </div>
        </div>

        {steps && steps.length > 0 && (
          <div className="result-steps">
            <h3>Pasos del algoritmo:</h3>
            <div className="steps-list">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <span className="step-number">{index + 1}</span>
                  <div className="step-content">
                    {step.comparison && <p>Comparación: {step.comparison}</p>}
                    {step.result && <p className="step-result">Resultado: {step.result}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchResult;