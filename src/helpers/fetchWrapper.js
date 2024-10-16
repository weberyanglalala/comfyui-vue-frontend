import { useAuthStore } from '@/stores/authStore'; // Import your Pinia store

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE'),
    upload: uploadFromForm
};

function handleResponse(response) {
    return response.text().then((text) => {
        const data = text && JSON.parse(text);

        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}

function request(method) {
    return (url, body) => {
        const authStore = useAuthStore(); // Use Pinia auth store
        const token = authStore.token || localStorage.getItem('authToken'); // Get the token from store or localStorage

        const requestOptions = {
            method,
            headers: {}
        };

        // Add Authorization header if token exists
        if (token) {
            requestOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }

        return fetch(url, requestOptions).then(handleResponse);
    };
}

function uploadFromForm(url, formData) {
    const authStore = useAuthStore(); // Use Pinia auth store
    const token = authStore.token || localStorage.getItem('authToken'); // Get the token from store or localStorage

    const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {}
    };

    // Add Authorization header if token exists
    if (token) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, requestOptions).then(handleResponse);
}
