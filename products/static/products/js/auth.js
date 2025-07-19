/**
 * Authentication Module for Product Review System
 * Handles token storage, login state, and authentication headers
 */

const Auth = {
    // Storage keys
    TOKEN_KEY: 'product_review_access_token',
    REFRESH_KEY: 'product_review_refresh_token',
    USER_KEY: 'product_review_user',

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    },

    // Get current user data
    getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    // Get access token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_KEY);
    },

    // Save auth data after login/registration
    setAuthData(accessToken, refreshToken, userData) {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_KEY, refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    },

    // Clear auth data on logout
    clearAuthData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    // Get headers with auth token for API requests
    getAuthHeaders() {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    },

    // Handle token refresh
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post('/api/token/refresh/', {
                refresh: refreshToken
            });

            if (response.data && response.data.access) {
                // Update only the access token
                localStorage.setItem(this.TOKEN_KEY, response.data.access);
                return response.data.access;
            } else {
                throw new Error('Invalid refresh response');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuthData();
            showAuthAlert('جلستك انتهت. الرجاء تسجيل الدخول مرة أخرى.', 'danger');
            return null;
        }
    },

    // Initialize axios interceptors for automatic token refresh
    setupAxiosInterceptors() {
        // Request interceptor
        axios.interceptors.request.use(
            config => {
                const token = this.getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        // Response interceptor for handling 401 errors
        axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                
                // If error is 401 and we haven't tried to refresh the token yet
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    const newToken = await this.refreshToken();
                    if (newToken) {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    }
                }
                
                return Promise.reject(error);
            }
        );
    }
};

// Function to show authentication alerts
function showAuthAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show auth-alert`;
    alertDiv.role = 'alert';
    
    // Add message
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Initialize auth system when the script loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.setupAxiosInterceptors();
    
    // Update UI based on auth status
    const updateAuthUI = () => {
        const isLoggedIn = Auth.isLoggedIn();
        const user = Auth.getUser();
        
        // Find auth-related elements and update them
        document.querySelectorAll('.auth-login-required').forEach(el => {
            el.style.display = isLoggedIn ? '' : 'none';
        });
        
        document.querySelectorAll('.auth-logout-required').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : '';
        });
        
        // Update username displays if they exist
        document.querySelectorAll('.auth-username').forEach(el => {
            if (user) {
                el.textContent = user.username;
            }
        });
    };
    
    // Initial UI update
    updateAuthUI();
});

// Export the Auth object for use in other scripts
window.Auth = Auth; 