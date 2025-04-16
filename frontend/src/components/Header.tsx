import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    
    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };
    
    return (
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            E<span className="text-yellow-300">V</span>iator
                        </h1>
                    </div>
                    <nav className="flex space-x-6">
                        <Link 
                            to="/" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                            ${isActiveRoute('/') 
                                ? 'bg-indigo-800 text-white' 
                                : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}`}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/interview" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                            ${isActiveRoute('/interview') 
                                ? 'bg-indigo-800 text-white' 
                                : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}`}
                        >
                            Interview
                        </Link>
                        <Link 
                            to="/report" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                            ${isActiveRoute('/report') 
                                ? 'bg-indigo-800 text-white' 
                                : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}`}
                        >
                            Report
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;