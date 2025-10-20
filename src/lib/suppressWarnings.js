// Suprimir warnings específicos do console
const originalConsoleWarn = console.warn;

console.warn = (...args) => {
  const message = args[0];
  
  // Suprimir warning específico do findDOMNode do Radix UI
  if (typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
    return;
  }
  
  // Suprimir outros warnings conhecidos que não afetam funcionalidade
  if (typeof message === 'string' && (
    message.includes('findDOMNode is deprecated') ||
    message.includes('Warning: findDOMNode')
  )) {
    return;
  }
  
  // Manter outros warnings
  originalConsoleWarn.apply(console, args);
};

export default {};
