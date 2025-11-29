import React from 'react';
import { getCardStyle, renderValue } from './DetectiveBoardUtils';

const ResultsCard = ({ patient, isConnected, onClick }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={getCardStyle(isConnected, 'bg-gradient-to-br from-teal-400 to-cyan-500', 'border-teal-400')}
      style={{
        transform: isConnected ? 'rotate(-1deg)' : 'none',
        boxShadow: isConnected ? '0 0 40px rgba(45, 212, 191, 0.6)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${isConnected ? 'text-slate-900' : 'text-teal-400'}`}>
          <span className="text-2xl">✓</span>
          Test Results
        </h3>
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isConnected ? 'bg-slate-900 text-white' : 'bg-teal-500 text-white'}`}>
            {patient.results.length}
          </span>
          <span className={`text-2xl ${isConnected ? 'text-slate-900' : 'text-teal-400'}`}>🔗</span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {(patient.results || []).map((result, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border"
            style={{
              background: isConnected ? 'rgba(var(--color-text-rgb), 0.06)' : 'rgba(var(--color-primary-rgb), 0.08)',
              borderColor: isConnected ? 'rgba(var(--color-text-rgb), 0.12)' : 'rgba(var(--color-primary-rgb), 0.14)'
            }}
          >
            <p className={`text-xs mb-1 ${isConnected ? 'text-slate-700' : 'text-gray-400'}`}>
              {result.testName}
            </p>
            <div className="flex justify-between items-center">
              <p className={`text-sm font-bold ${isConnected ? 'text-slate-900' : 'text-white'}`}>
                {renderValue(result.parameter)}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${isConnected ? 'text-slate-900' : 'text-teal-400'}`}>
                  {result.value}
                </p>
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  {result.flag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ResultsCard);
