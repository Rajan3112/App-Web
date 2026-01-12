const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    return response.json();
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return response.json();
  },
  
  getUsers: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  },
  
  getProjects: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  },
  
  getTasks: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  },
};

export default api;