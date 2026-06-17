import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 // const API_BASE moved to config

 useEffect(() => {
 const storedUser = localStorage.getItem('nexhire_user');
 if (storedUser) {
 const parsedUser = JSON.parse(storedUser);
 setUser(parsedUser);
 // Set global auth headers for development
 axios.defaults.headers.common['x-user-id'] = parsedUser.UserID || parsedUser.userid;
 axios.defaults.headers.common['x-user-role'] = parsedUser.RoleID || parsedUser.roleid;
 } else {
 delete axios.defaults.headers.common['x-user-id'];
 delete axios.defaults.headers.common['x-user-role'];
 }
 setLoading(false);
 }, []);

 // Watch for user changes to sync headers (e.g., during login/logout)
 useEffect(() => {
 // Prevent deleting headers on initial mount before state catches up
 if (loading) return;

 if (user) {
 axios.defaults.headers.common['x-user-id'] = user.UserID || user.userid;
 axios.defaults.headers.common['x-user-role'] = user.RoleID || user.roleid;
 } else {
 delete axios.defaults.headers.common['x-user-id'];
 delete axios.defaults.headers.common['x-user-role'];
 }
 }, [user, loading]);

 const login = async (username, password) => {
 try {
 const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
 setUser(res.data);
 localStorage.setItem('nexhire_user', JSON.stringify(res.data));
 return res.data;
 } catch (err) {
 throw new Error(err.response?.data?.error || "Login failed");
 }
 };

 const logout = () => {
 setUser(null);
 localStorage.removeItem('nexhire_user');
 };

 return (
 <AuthContext.Provider value={{ user, login, logout, loading }}>
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => useContext(AuthContext);

/*
 * AuthContext: manages user authentication state across the app.
 * Stores user object in localStorage as 'nexhire_user'.
 * Sets x-user-id and x-user-role headers on all axios requests.
 * On logout: clears localStorage and removes headers.
 */

