import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
 const [theme, setTheme] = useState(() => {
 const savedTheme = localStorage.getItem('nexhire_theme');
 return savedTheme || 'dark'; // Default to dark as per existing design
 });

 useEffect(() => {
 const root = window.document.documentElement;
 if (theme === 'dark') {
 root.classList.add('dark');
 } else {
 root.classList.remove('dark');
 }
 localStorage.setItem('nexhire_theme', theme);
 }, [theme]);

 const toggleTheme = () => {
 setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
 };

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
};

export const useTheme = () => {
 const context = useContext(ThemeContext);
 if (!context) {
 throw new Error('useTheme must be used within a ThemeProvider');
 }
 return context;
};
