import React from 'react';
import { motion } from 'framer-motion';

const PingIndicator = ({ message = 'Server Status' }) => {
  // Basic styling, can be customized
  const indicatorStyle = "w-3 h-3 bg-green-500 rounded-full";
  const containerStyle = "flex items-center space-x-2 text-xs text-gray-500";

  return (
    <div className={containerStyle} title={message}>
      <motion.div
        className={indicatorStyle}
        animate={{ scale: [1, 1.2, 1] }} // Simple pulse effect
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Optional: Show a short text indicator */}
      {/* <span>Online</span> */}
    </div>
  );
};

export default PingIndicator;