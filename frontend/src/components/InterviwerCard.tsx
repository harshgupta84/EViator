import React from 'react'

function InterviwerCrad({ name, isActive }: { name: string; isActive: boolean }) {
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
      isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
    }`}>
      {initials}
    </div>
  );
  
}

export default InterviwerCrad