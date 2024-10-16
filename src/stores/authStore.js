import { defineStore } from 'pinia';

// Define an auth store to handle authentication states
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('authToken') || null
    }),
    actions: {
        setToken(token) {
            this.token = token;
            localStorage.setItem('authToken', token);
        },
        removeToken() {
            this.token = null;
            localStorage.removeItem('authToken');
        }
    }
});
