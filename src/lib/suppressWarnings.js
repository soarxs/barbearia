// Suprimir warnings específicos do console
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Interceptar console.warn
console.warn = (...args) => {
  const message = args[0];
  
  // Suprimir warning específico do findDOMNode do Radix UI
  if (typeof message === 'string' && (
    message.includes('findDOMNode is deprecated') ||
    message.includes('Warning: findDOMNode')
  )) {
    return;
  }
  
  // Manter outros warnings
  originalConsoleWarn.apply(console, args);
};

// Interceptar console.error para warnings do React DevTools
console.error = (...args) => {
  const message = args[0];
  
  // Suprimir warning específico do findDOMNode do Radix UI
  if (typeof message === 'string' && (
    message.includes('findDOMNode is deprecated') ||
    message.includes('Warning: findDOMNode')
  )) {
    return;
  }
  
  // Manter outros erros
  originalConsoleError.apply(console, args);
};

// Suprimir warnings do React DevTools
if (typeof window !== 'undefined') {
  // Interceptar erros globais
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
      return true; // Suprimir o erro
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Interceptar eventos de erro não capturados
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && 
        event.error.message.includes('findDOMNode is deprecated')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
}

export default {};
