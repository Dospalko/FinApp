import React from 'react';

const Alert = ({ type = 'error', message, onClose }) => {
  const base = "p-3 mb-4 text-sm rounded-lg border";
  const colors = {
    error: "bg-red-100 border-red-300 text-red-700",
    success: "bg-green-100 border-green-300 text-green-700",
    info: "bg-blue-100 border-blue-300 text-blue-700",
  };
  if (!message) return null;
  return (
    <div className={`${base} ${colors[type] || colors.info} flex justify-between items-center`} role="alert">
      <span>{message}</span>
      {onClose && (
         <button onClick={onClose} type="button" className="ml-auto -mx-1 -my-1 rounded-lg focus:ring-1 p-1 inline-flex h-6 w-6 hover:bg-opacity-20 focus:ring-current" aria-label="Close">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
         </button>
      )}
    </div>
  );
};
export default Alert;