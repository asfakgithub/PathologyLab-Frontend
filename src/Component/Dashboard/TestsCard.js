import React from 'react';
import { getCardStyle, renderValue } from './DetectiveBoardUtils';

const TestsCard = ({ patient, isConnected, onClick }) => {
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
      className={getCardStyle(isConnected, 'bg-gradient-to-br from-cyan-500 to-blue-600', 'border-cyan-500')}
      style={{
        transform: isConnected ? 'rotate(-1deg)' : 'none',
        boxShadow: isConnected ? '0 0 40px rgba(6, 182, 212, 0.6)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${isConnected ? 'text-white' : 'text-cyan-400'}`}>
          <span className="text-2xl">🔬</span>
          Ordered Tests
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {patient.tests.length}
          </span>
          <span className={`text-2xl ${isConnected ? 'text-white' : 'text-cyan-400'}`}>🔗</span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {(patient.tests || []).map((test) => (
          <div
            key={test.id}
            className="p-3 rounded-lg border"
            style={{
              background: isConnected ? 'rgba(255,255,255,0.2)' : 'rgba(6, 182, 212, 0.1)',
              borderColor: isConnected ? 'rgba(255,255,255,0.3)' : 'rgba(6, 182, 212, 0.3)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-white'}`}>
                {test.name}
              </p>
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                {test.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(test.subtests || []).map((subtest, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    background: isConnected ? 'rgba(255,255,255,0.3)' : 'rgba(6, 182, 212, 0.2)',
                    color: isConnected ? 'white' : '#67e8f9'
                  }}
                >
                  {renderValue(subtest)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TestsCard);
