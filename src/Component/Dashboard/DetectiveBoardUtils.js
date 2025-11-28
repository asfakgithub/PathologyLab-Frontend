
// Helper functions for PatientDetectiveBoard components

export const getCardStyle = (isConnected, baseGradient, borderColor) => {
  const base = "relative p-6 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-lg";
  if (isConnected) {
    return `${base} ${baseGradient} scale-105 shadow-2xl border-4 ${borderColor}`;
  }
  return `${base} bg-slate-800/90 border-2 border-opacity-30 ${borderColor} hover:scale-102 shadow-xl`;
};

export const formatAddress = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const { street, city, state, zipCode, country } = addr;
    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
  }
  return String(addr);
};

export const renderValue = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  if (typeof v === 'object') {
    // Try common keys
    return v.name || v.subtestName || v.parameterName || v.parameter?.name || JSON.stringify(v);
  }
  return String(v);
};
