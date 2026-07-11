import API from './axios';

export const registerUser = async (data) => {
    const response = await API.post('/users/register/', data);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await API.post('/users/login/', data);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};