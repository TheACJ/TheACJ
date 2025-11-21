/**
 * Admin Panel Utility Functions
 * Shared across all admin interface pages
 */

const AdminUtils = {
    // Utility functions
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    showAlert(message, type = 'info', duration = 5000) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.admin-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show admin-alert`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.style.maxWidth = '500px';
        alertDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${this.getAlertIcon(type)} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        document.body.appendChild(alertDiv);

        // Auto remove after duration
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);

        return alertDiv;
    },

    getAlertIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    },

    confirmAction(message, callback, title = 'Confirm Action') {
        if (confirm(message)) {
            callback();
        }
    },

    // API utility functions
    async apiRequest(url, options = {}) {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/admin/login';
            return;
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            this.showAlert('Network error. Please check your connection.', 'danger');
            throw error;
        }
    },

    // Form validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePassword(password, minLength = 6) {
        return password && password.length >= minLength;
    },

    // File handling
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // UI helper functions
    showLoading(element, text = 'Loading...') {
        element.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">${text}</p>
            </div>
        `;
    },

    hideLoading(element) {
        element.innerHTML = '';
    },

    // Data table utilities
    sortData(data, key, order = 'asc') {
        return data.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    filterData(data, filters) {
        return data.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = item[key];
                
                if (!filterValue) return true;
                if (typeof filterValue === 'string') {
                    return itemValue && itemValue.toLowerCase().includes(filterValue.toLowerCase());
                }
                return itemValue === filterValue;
            });
        });
    },

    // Pagination
    paginateData(data, page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: data.slice(start, end),
            total: data.length,
            pages: Math.ceil(data.length / limit),
            current: page,
            hasNext: end < data.length,
            hasPrev: page > 1
        };
    },

    // Search functionality
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Local storage utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    // Token management
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    },

    refreshTokenIfNeeded() {
        const token = localStorage.getItem('adminToken');
        const refreshToken = localStorage.getItem('adminRefreshToken');

        if (!token) return;

        if (this.isTokenExpired(token)) {
            if (refreshToken) {
                this.refreshToken(refreshToken);
            } else {
                this.handleAuthError();
            }
        }
    },

    async refreshToken(refreshToken) {
        try {
            const response = await fetch('/api/admin/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('adminToken', result.data.token);
                if (result.data.refreshToken) {
                    localStorage.setItem('adminRefreshToken', result.data.refreshToken);
                }
            } else {
                this.handleAuthError();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.handleAuthError();
        }
    },

    handleAuthError() {
        this.removeLocalStorage('adminToken');
        this.removeLocalStorage('adminRefreshToken');
        
        if (window.location.pathname !== '/admin/login') {
            this.showAlert('Session expired. Please log in again.', 'warning');
            setTimeout(() => {
                window.location.href = '/admin/login';
            }, 2000);
        }
    },

    // Color utilities
    getStatusColor(status) {
        const colors = {
            published: 'success',
            draft: 'warning',
            inactive: 'secondary',
            active: 'success',
            pending: 'info',
            completed: 'primary',
            failed: 'danger'
        };
        return colors[status] || 'secondary';
    },

    // URL utilities
    getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },

    setQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.pushState({}, '', url);
    },

    // Export utilities
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            this.showAlert('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    exportToJSON(data, filename = 'export.json') {
        if (!data) {
            this.showAlert('No data to export', 'warning');
            return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    // Notification management
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    showNotification(title, body, icon = null) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon || '/favicon.ico',
                tag: 'admin-notification'
            });
        } else {
            this.showAlert(`${title}: ${body}`, 'info', 8000);
        }
    },

    // Theme management
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
};

// Auto-refresh token if needed
setInterval(() => {
    AdminUtils.refreshTokenIfNeeded();
}, 60000); // Check every minute

// Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminUtils.loadTheme();
});

// Handle online/offline status
window.addEventListener('online', () => {
    AdminUtils.showAlert('Connection restored', 'success', 3000);
});

window.addEventListener('offline', () => {
    AdminUtils.showAlert('You are offline. Some features may not work.', 'warning', 5000);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    AdminUtils.showAlert('An unexpected error occurred', 'danger');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminUtils;
}