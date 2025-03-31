import React from 'react';

const Spinner = ({ size = 'md', color = 'text-indigo-600' }) => {
  const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-[3px]', lg: 'h-10 w-10 border-4' };
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${color} border-t-transparent border-solid`}
      role="status"
    ><span className="sr-only">Načítavam...</span></div>
  );
};
export default Spinner;