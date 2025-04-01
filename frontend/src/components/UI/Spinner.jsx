import React from 'react';

const Spinner = ({ size = 'md', color = 'border-indigo-600' }) => { // Added color prop with default
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16',
    };

    const borderSizeClasses = {
        sm: 'border-2',
        md: 'border-2',
        lg: 'border-4',
        xl: 'border-4',
    }

    return (
        <div
            className={`
                inline-block animate-spin rounded-full
                ${sizeClasses[size] || sizeClasses.md}
                ${borderSizeClasses[size] || borderSizeClasses.md}
                border-solid border-current border-r-transparent align-[-0.125em]
                text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]
                ${color} // Apply the color class to the top border
            `}
            role="status"
        >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </div>
    );
};

export default Spinner;