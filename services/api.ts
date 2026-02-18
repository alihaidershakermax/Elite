import axios from 'axios';
import { Platform } from 'react-native';

// Use your local machine IP so physical devices and emulators can connect
const BASE_URL = 'https://eliteapi.vercel.app/api';




const api = axios.create({
    baseURL: BASE_URL,
});

export const memberService = {
    getAll: () => api.get('/members'),
    create: (data: any) => api.post('/members', data),
    delete: (id: string) => api.delete(`/members/${id}`),
};

export const activityService = {
    getAll: () => api.get('/activities'),
    create: (data: any) => api.post('/activities', data),
    update: (id: string, data: any) => api.put(`/activities/${id}`, data),
    delete: (id: string) => api.delete(`/activities/${id}`),
    register: (id: string) => api.post(`/activities/${id}/register`),
    unregister: (id: string) => api.delete(`/activities/${id}/register`),
};

export const taskService = {
    getAll: () => api.get('/tasks'),
    update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
    create: (data: any) => api.post('/tasks', data),
    delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const announcementService = {
    getAll: () => api.get('/announcements'),
    create: (data: any) => api.post('/announcements', data),
    update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
    delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const authService = {
    login: (data: any) => api.post('/login', data),
    signup: (data: any) => api.post('/signup', data),
};

export const userService = {
    updateProfile: (uid: string, data: any) => api.put(`/users/${uid}`, data),
};

export const adminService = {
    getAllMembers: () => api.get('/admin/members'),
    deleteMember: (uid: string) => api.delete(`/admin/members/${uid}`),
    updateMemberRole: (uid: string, role: string) => api.put(`/admin/members/${uid}/role`, { role }),
    updateRole: (uid: string, role: string) => api.put(`/admin/members/${uid}/role`, { role }),
    seedData: () => api.post('/admin/seed'),
    clearData: () => api.post('/admin/clear'),
};

export const committeeService = {
    getAll: () => api.get('/committees'),
    create: (data: any) => api.post('/committees', data),
    update: (id: string, data: any) => api.put(`/committees/${id}`, data),
    delete: (id: string) => api.delete(`/committees/${id}`),
    addMember: (committeeId: string, memberId: string) => api.post(`/committees/${committeeId}/members`, { memberId }),
    removeMember: (committeeId: string, memberId: string) => api.delete(`/committees/${committeeId}/members/${memberId}`),
};

export const storageService = {
    uploadFile: (file: any) => {
        const formData = new FormData();

        // Ensure URI is correctly formatted for the platform
        const uri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

        // @ts-ignore
        formData.append('file', {
            uri: file.uri, // Use original uri for FormData in Expo
            name: file.name || `upload_${Date.now()}.jpg`,
            type: file.type || 'image/jpeg',
        });

        // Use a separate axios instance or headers to allow automatic boundary
        return axios.post(`${BASE_URL}/upload`, formData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};

export default api;
