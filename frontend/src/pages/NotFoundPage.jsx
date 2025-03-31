import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="text-center py-20 px-4">
        <h1 className="text-4xl sm:text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-6">Stránka nenájdená.</p>
        <Link to="/" className="btn-primary">Návrat domov</Link>
    </div>
);
export default NotFoundPage;