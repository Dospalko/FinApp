// src/components/UI/Card.jsx
import React from 'react';

// Jednoduchý Card komponent využívajúci Tailwind
const Card = ({ children, className = '' }) => {
  // Spojí defaultné triedy s tými, ktoré prídu cez props
  const cardClasses = `bg-white rounded-lg shadow-md p-4 ${className}`;

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;

// Potom by si mohol v ExpenseForm napríklad použiť:
// import Card from '../UI/Card';
// ...
// return (
//   <Card className="mb-6"> // Pridá 'mb-6' k defaultným triedam Card
//     <h2 ...>Pridať Nový Výdavok</h2>
//     <form ...> ... </form>
//   </Card>
// );