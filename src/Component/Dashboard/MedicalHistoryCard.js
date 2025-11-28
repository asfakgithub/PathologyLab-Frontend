import React from 'react';
import { getCardStyle, renderValue } from './DetectiveBoardUtils';

const MedicalHistoryCard = ({ patient, isConnected, onClick }) => {
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
      className={getCardStyle(isConnected, 'bg-gradient-to-br from-pink-500 to-rose-600', 'border-pink-500')}
      style={{
        transform: isConnected ? 'rotate(1deg)' : 'none',
        boxShadow: isConnected ? '0 0 40px rgba(236, 72, 153, 0.6)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${isConnected ? 'text-white' : 'text-pink-400'}`}>
          <span className="text-2xl">🏥</span>
          Medical History
        </h3>
        <span className={`text-2xl ${isConnected ? 'text-white' : 'text-pink-400'}`}>🔗</span>
      </div>
      
      <div className="mt-4">
        <p className={`text-xs font-bold mb-2 ${isConnected ? 'text-white/90' : 'text-gray-400'}`}>
          ALLERGIES:
        </p>
        <div className="flex flex-wrap gap-2">
          {(patient.allergies || []).map((allergy, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-red-500/20 border border-red-400 rounded-full text-sm"
              style={{ color: isConnected ? 'white' : '#fca5a5' }}
            >
              {renderValue(allergy)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MedicalHistoryCard);
