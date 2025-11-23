// views/assets/admin.js
/**
 * Enhanced Admin Panel System
 * Modern, feature-rich admin interface with advanced functionality
 */

class AdminSystem {
    constructor() {
        this.config = {
            apiUrl: '/api/admin',
            theme: localStorage.getItem('theme') || 'light',
            notifications: true,
            autoSave: true,
            autoSaveInterval: 30000,
            sessionTimeout: 3600000,
            refreshTokenInterval: 300000,
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm:ss',
            locale: 'en-US'
        };

        this.state = {
            user: null,
            isLoading: false,
            socket: null,
            autoSaveTimers: {},
            contextMenu: null,
            shortcuts: new Map(),
            undoStack: [],
            redoStack: [],
            filters: {},
            search: '',
            page: 1,
            limit: 10
        };

        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupTheme();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupWebSocket();
        this.setupNotifications();
        this.setupAutoRefresh();
        this.setupContextMenu();
        this.setupDragAndDrop();
        this.initializeCharts();
        this.loadUserPreferences();
    }

    // Authentication Methods
    async checkAuth() {
        const token = this.getToken();
        if (!token) {
            this.redirectToLogin();
            return false;
        }

        try {
            const response = await this.apiRequest('/auth/verify');
            if (response.success) {
                this.state.user = response.data.user;
                this.updateUserUI();
                return true;
            } else {
                this.handleAuthError();
                return false;
            }
        } catch (error) {
            this.handleAuthError();
            return false;
        }
    }

    getToken() {
        return localStorage.getItem('adminToken');
    }

    setToken(token, refreshToken = null) {
        localStorage.setItem('adminToken', token);
        if (refreshToken) {
            localStorage.setItem('adminRefreshToken', refreshToken);
        }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('adminRefreshToken');
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const result = await response.json();
            if (result.success) {
                this.setToken(result.data.token, result.data.refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    handleAuthError() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        this.redirectToLogin();
    }

    redirectToLogin() {
        if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
        }
    }

    async logout() {
        try {
            await this.apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            localStorage.clear();
            this.redirectToLogin();
        }
    }

    // API Methods
    async apiRequest(endpoint, options = {}) {
        const token = this.getToken();
        if (!token && endpoint !== '/auth/login') {
            this.redirectToLogin();
            return;
        }

        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        this.showLoadingBar();

        try {
            const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.apiRequest(endpoint, options);
                } else {
                    this.handleAuthError();
                    return;
                }
            }

            const result = await response.json();
            return result;
        } catch (error) {
            this.showToast('Network error occurred', 'error');
            throw error;
        } finally {
            this.hideLoadingBar();
        }
    }

    // UI Methods
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.config.theme);
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.config.theme);
        this.setupTheme();
        this.showToast(`Switched to ${this.config.theme} mode`, 'success');
    }

    updateThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = this.config.theme === 'light' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
        }
    }

    updateUserUI() {
        const elements = {
            userName: document.querySelectorAll('[data-user-name]'),
            userEmail: document.querySelectorAll('[data-user-email]'),
            userRole: document.querySelectorAll('[data-user-role]'),
            userAvatar: document.querySelectorAll('[data-user-avatar]')
        };

        elements.userName.forEach(el => {
            el.textContent = this.state.user?.fullName || this.state.user?.username || 'Admin';
        });

        elements.userEmail.forEach(el => {
            el.textContent = this.state.user?.email || '';
        });

        elements.userRole.forEach(el => {
            el.textContent = this.state.user?.role || '';
        });

        elements.userAvatar.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = this.state.user?.avatar || '/assets/img/default-avatar.png';
            }
        });
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 5000) {
        const container = this.getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast-modern toast-${type} fade-in`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-body">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    getToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Loading Bar
    showLoadingBar() {
        let bar = document.querySelector('.loading-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'loading-bar';
            document.body.appendChild(bar);
        }
        requestAnimationFrame(() => {
            bar.classList.add('active');
        });
    }

    hideLoadingBar() {
        const bar = document.querySelector('.loading-bar');
        if (bar) {
            bar.classList.remove('active');
        }
    }

    // Modal Methods
    showModal(options) {
        const {
            title = 'Modal',
            body = '',
            size = 'md',
            footer = '',
            onConfirm = null,
            onCancel = null
        } = options;

        const modal = document.createElement('div');
        modal.className = 'modal fade modal-modern';
        modal.innerHTML = `
            <div class="modal-dialog modal-${size}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${body}</div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        
        if (onConfirm) {
            const confirmBtn = modal.querySelector('[data-action="confirm"]');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    onConfirm();
                    bsModal.hide();
                });
            }
        }

        if (onCancel) {
            const cancelBtn = modal.querySelector('[data-action="cancel"]');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    onCancel();
                    bsModal.hide();
                });
            }
        }

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

        bsModal.show();
        return bsModal;
    }

    confirmAction(message, onConfirm, title = 'Confirm Action') {
        return this.showModal({
            title,
            body: `<p>${message}</p>`,
            footer: `
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-primary" data-action="confirm">Confirm</button>
            `,
            onConfirm
        });
    }

    // WebSocket Connection
    setupWebSocket() {
        if (!this.config.websocket) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.state.socket = new WebSocket(wsUrl);

        this.state.socket.onopen = () => {
            console.log('WebSocket connected');
            this.state.socket.send(JSON.stringify({
                type: 'auth',
                token: this.getToken()
            }));
        };

        this.state.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.state.socket.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.setupWebSocket(), 5000);
        };

        this.state.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'notification':
                this.showToast(data.message, data.level);
                break;
            case 'update':
                this.handleRealtimeUpdate(data);
                break;
            case 'stats':
                this.updateDashboardStats(data.stats);
                break;
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }

    handleRealtimeUpdate(data) {
        const updateHandlers = {
            'blog_post': () => this.updateBlogPostsList(),
            'contact': () => this.updateContactsList(),
            'user': () => this.updateUsersList()
        };

        const handler = updateHandlers[data.entity];
        if (handler) handler();
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        const shortcuts = {
            'ctrl+s': () => this.saveCurrentForm(),
            'ctrl+n': () => this.createNew(),
            'ctrl+f': () => this.focusSearch(),
            'ctrl+k': () => this.openCommandPalette(),
            'ctrl+z': () => this.undo(),
            'ctrl+y': () => this.redo(),
            'escape': () => this.closeModals(),
            'alt+d': () => this.gotoDashboard(),
            'alt+b': () => this.gotoBlogPosts(),
            'alt+c': () => this.gotoContacts(),
            'alt+t': () => this.toggleTheme()
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e);
            const handler = shortcuts[key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    getShortcutKey(event) {
        const keys = [];
        if (event.ctrlKey) keys.push('ctrl');
        if (event.altKey) keys.push('alt');
        if (event.shiftKey) keys.push('shift');
        if (event.key && event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift') {
            keys.push(event.key.toLowerCase());
        }
        return keys.join('+');
    }

    // Context Menu
    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-context-menu]');
            if (target) {
                e.preventDefault();
                this.showContextMenu(e, target);
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    showContextMenu(event, target) {
        const menuType = target.dataset.contextMenu;
        const menuItems = this.getContextMenuItems(menuType, target);

        if (!menuItems || menuItems.length === 0) return;

        let menu = document.querySelector('.context-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'context-menu';
            document.body.appendChild(menu);
        }

        menu.innerHTML = menuItems.map(item => `
            <div class="context-menu-item" data-action="${item.action}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </div>
        `).join('');

        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        menu.classList.add('show');

        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextAction(action, target);
                this.hideContextMenu();
            });
        });
    }

    hideContextMenu() {
        const menu = document.querySelector('.context-menu');
        if (menu) {
            menu.classList.remove('show');
        }
    }

    getContextMenuItems(type, target) {
        const menus = {
            'table-row': [
                { label: 'Edit', icon: 'fas fa-edit', action: 'edit' },
                { label: 'Duplicate', icon: 'fas fa-copy', action: 'duplicate' },
                { label: 'Delete', icon: 'fas fa-trash', action: 'delete' }
            ],
            'card': [
                { label: 'View Details', icon: 'fas fa-eye', action: 'view' },
                { label: 'Edit', icon: 'fas fa-edit', action: 'edit' },
                { label: 'Share', icon: 'fas fa-share', action: 'share' }
            ]
        };

        return menus[type] || [];
    }

    handleContextAction(action, target) {
        const id = target.dataset.id;
        const type = target.dataset.type;

        switch (action) {
            case 'edit':
                this.editItem(type, id);
                break;
            case 'delete':
                this.deleteItem(type, id);
                break;
            case 'duplicate':
                this.duplicateItem(type, id);
                break;
            case 'view':
                this.viewItem(type, id);
                break;
            case 'share':
                this.shareItem(type, id);
                break;
        }
    }

    // Drag and Drop
    setupDragAndDrop() {
        const dropZones = document.querySelectorAll('[data-drop-zone]');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragging');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragging');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragging');
                this.handleDrop(e, zone);
            });
        });

        const draggables = document.querySelectorAll('[draggable="true"]');
        draggables.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
                e.dataTransfer.setData('id', item.dataset.id);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
    }

    async handleDrop(event, zone) {
        const files = event.dataTransfer.files;
        const dropType = zone.dataset.dropZone;

        if (files.length > 0) {
            for (const file of files) {
                await this.uploadFile(file, dropType);
            }
        } else {
            const id = event.dataTransfer.getData('id');
            this.handleItemDrop(id, zone);
        }
    }

    async uploadFile(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch(`${this.config.apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(`File uploaded successfully`, 'success');
                this.refreshCurrentView();
            } else {
                this.showToast(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            this.showToast('Upload failed', 'error');
        }
    }

    // Auto Save
    setupAutoSave(formId, saveFunction, interval = 30000) {
        const form = document.getElementById(formId);
        if (!form) return;

        let hasChanges = false;

        form.addEventListener('input', () => {
            hasChanges = true;
        });

        this.state.autoSaveTimers[formId] = setInterval(() => {
            if (hasChanges && this.config.autoSave) {
                saveFunction();
                hasChanges = false;
                this.showToast('Auto-saved', 'info', 2000);
            }
        }, interval);
    }

    clearAutoSave(formId) {
        if (this.state.autoSaveTimers[formId]) {
            clearInterval(this.state.autoSaveTimers[formId]);
            delete this.state.autoSaveTimers[formId];
        }
    }

    // Undo/Redo
    addToUndoStack(action) {
        this.state.undoStack.push(action);
        this.state.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.state.undoStack.length === 0) return;

        const action = this.state.undoStack.pop();
        this.state.redoStack.push(action);
        this.executeUndoAction(action);
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.state.redoStack.length === 0) return;

        const action = this.state.redoStack.pop();
        this.state.undoStack.push(action);
        this.executeRedoAction(action);
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = this.state.undoStack.length === 0;
        }

        if (redoBtn) {
            redoBtn.disabled = this.state.redoStack.length === 0;
        }
    }

    // Charts
    initializeCharts() {
        this.charts = {};
        
        const chartElements = document.querySelectorAll('[data-chart]');
        chartElements.forEach(element => {
            const type = element.dataset.chartType;
            const endpoint = element.dataset.chartEndpoint;
            this.createChart(element, type, endpoint);
        });
    }

    async createChart(element, type, endpoint) {
        const data = await this.apiRequest(endpoint);
        
        if (!data.success) return;

        const ctx = element.getContext('2d');
        
        this.charts[element.id] = new Chart(ctx, {
            type: type,
            data: data.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    updateChart(chartId, newData) {
        const chart = this.charts[chartId];
        if (!chart) return;

        chart.data = newData;
        chart.update();
    }

    // Data Tables
    initializeDataTables() {
        const tables = document.querySelectorAll('[data-table]');
        
        tables.forEach(table => {
            this.enhanceTable(table);
        });
    }

    enhanceTable(table) {
        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(table, header);
            });
        });

        this.addTableSearch(table);
        this.addTablePagination(table);
        this.addTableExport(table);
    }

    sortTable(table, header) {
        const column = header.dataset.column;
        const currentOrder = header.dataset.order || 'asc';
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        
        header.dataset.order = newOrder;
        
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aVal = a.querySelector(`td[data-column="${column}"]`).textContent;
            const bVal = b.querySelector(`td[data-column="${column}"]`).textContent;
            
            if (newOrder === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
        
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }

    addTableSearch(table) {
        const searchBox = document.createElement('div');
        searchBox.className = 'search-box mb-3';
        searchBox.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="form-control" placeholder="Search..." data-table-search>
        `;
        
        table.parentNode.insertBefore(searchBox, table);
        
        const searchInput = searchBox.querySelector('input');
        searchInput.addEventListener('input', this.debounce(() => {
            this.searchTable(table, searchInput.value);
        }, 300));
    }

    searchTable(table, query) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const match = text.includes(query.toLowerCase());
            row.style.display = match ? '' : 'none';
        });
    }

    addTablePagination(table) {
        const pageSize = 10;
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        let currentPage = 1;
        
        const totalPages = Math.ceil(rows.length / pageSize);
        
        const pagination = document.createElement('nav');
        pagination.className = 'mt-3';
        pagination.innerHTML = `
            <ul class="pagination justify-content-center">
                <li class="page-item">
                    <button class="page-link" data-page="prev">Previous</button>
                </li>
                ${Array.from({ length: totalPages }, (_, i) => `
                    <li class="page-item ${i === 0 ? 'active' : ''}">
                        <button class="page-link" data-page="${i + 1}">${i + 1}</button>
                    </li>
                `).join('')}
                <li class="page-item">
                    <button class="page-link" data-page="next">Next</button>
                </li>
            </ul>
        `;
        
        table.parentNode.appendChild(pagination);
        
        pagination.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-page]');
            if (!btn) return;
            
            const page = btn.dataset.page;
            
            if (page === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (page === 'next' && currentPage < totalPages) {
                currentPage++;
            } else if (page !== 'prev' && page !== 'next') {
                currentPage = parseInt(page);
            }
            
            this.showTablePage(table, currentPage, pageSize);
            this.updatePaginationButtons(pagination, currentPage);
        });
        
        this.showTablePage(table, 1, pageSize);
    }

    showTablePage(table, page, pageSize) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        rows.forEach((row, index) => {
            row.style.display = index >= start && index < end ? '' : 'none';
        });
    }

    updatePaginationButtons(pagination, currentPage) {
        pagination.querySelectorAll('.page-item').forEach(item => {
            item.classList.remove('active');
            const btn = item.querySelector('[data-page]');
            if (btn && btn.dataset.page == currentPage) {
                item.classList.add('active');
            }
        });
    }

    addTableExport(table) {
        const exportBtn = document.createElement('div');
        exportBtn.className = 'mb-3';
        exportBtn.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-2" data-export="csv">
                <i class="fas fa-file-csv me-1"></i>Export CSV
            </button>
            <button class="btn btn-sm btn-outline-primary me-2" data-export="excel">
                <i class="fas fa-file-excel me-1"></i>Export Excel
            </button>
            <button class="btn btn-sm btn-outline-primary" data-export="pdf">
                <i class="fas fa-file-pdf me-1"></i>Export PDF
            </button>
        `;
        
        table.parentNode.insertBefore(exportBtn, table);
        
        exportBtn.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-export]');
            if (!btn) return;
            
            const format = btn.dataset.export;
            this.exportTable(table, format);
        });
    }

    exportTable(table, format) {
        const data = this.getTableData(table);
        
        switch (format) {
            case 'csv':
                this.exportToCSV(data, 'export.csv');
                break;
            case 'excel':
                this.exportToExcel(data, 'export.xlsx');
                break;
            case 'pdf':
                this.exportToPDF(data, 'export.pdf');
                break;
        }
    }

    getTableData(table) {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
        );
        
        return { headers, rows };
    }

    exportToCSV(data, filename) {
        const csvContent = [
            data.headers.join(','),
            ...data.rows.map(row => row.join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    async exportToExcel(data, filename) {
        // This would require a library like SheetJS
        this.showToast('Excel export requires additional library', 'info');
    }

    async exportToPDF(data, filename) {
        // This would require a library like jsPDF
        this.showToast('PDF export requires additional library', 'info');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Utility Methods
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
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    formatDate(date, format = null) {
        const d = new Date(date);
        const formatter = new Intl.DateTimeFormat(this.config.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        return formatter.format(d);
    }

    formatNumber(number) {
        return new Intl.NumberFormat(this.config.locale).format(number);
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.config.locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Form submissions
        document.querySelectorAll('form[data-ajax]').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });

        // Auto-save forms
        document.querySelectorAll('[data-autosave]').forEach(form => {
            this.setupAutoSave(form.id, () => this.handleFormSubmit(form));
        });

        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showToast('An unexpected error occurred', 'error');
        });

        // Handle online/offline
        window.addEventListener('online', () => {
            this.showToast('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline', 'warning');
        });
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const content = document.querySelector('.admin-content');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
        
        if (content) {
            content.classList.toggle('expanded');
        }
    }

    async handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const endpoint = form.dataset.endpoint;
        const method = form.dataset.method || 'POST';

        try {
            const response = await this.apiRequest(endpoint, {
                method: method,
                body: JSON.stringify(data)
            });

            if (response.success) {
                this.showToast('Saved successfully', 'success');
                if (form.dataset.redirect) {
                    window.location.href = form.dataset.redirect;
                }
            } else {
                this.showToast(response.error || 'Save failed', 'error');
            }
        } catch (error) {
            this.showToast('An error occurred', 'error');
        }
    }

    // Notifications
    setupNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
    }

    // Auto Refresh
    setupAutoRefresh() {
        setInterval(() => {
            this.checkAuth();
        }, this.config.refreshTokenInterval);

        // Refresh dashboard stats every minute
        if (window.location.pathname.includes('dashboard')) {
            setInterval(() => {
                this.refreshDashboardStats();
            }, 60000);
        }
    }

    async refreshDashboardStats() {
        const statsElements = document.querySelectorAll('[data-stat]');
        
        if (statsElements.length === 0) return;

        try {
            const response = await this.apiRequest('/dashboard/stats');
            
            if (response.success) {
                this.updateDashboardStats(response.data);
            }
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    }

    updateDashboardStats(stats) {
        Object.keys(stats).forEach(key => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                const oldValue = parseInt(element.textContent) || 0;
                const newValue = stats[key];
                
                if (oldValue !== newValue) {
                    this.animateNumber(element, oldValue, newValue);
                }
            }
        });
    }

    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const value = Math.floor(start + range * this.easeOutQuad(progress));
            element.textContent = this.formatNumber(value);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }

    // User Preferences
    loadUserPreferences() {
        const preferences = localStorage.getItem('userPreferences');
        if (preferences) {
            this.config = { ...this.config, ...JSON.parse(preferences) };
        }
    }

    saveUserPreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.config));
    }

    // Navigation helpers
    gotoDashboard() {
        window.location.href = '/admin/dashboard';
    }

    gotoBlogPosts() {
        window.location.href = '/admin/blog-posts';
    }

    gotoContacts() {
        window.location.href = '/admin/contacts';
    }

    // Form helpers
    saveCurrentForm() {
        const activeForm = document.querySelector('form:not([hidden])');
        if (activeForm) {
            this.handleFormSubmit(activeForm);
        }
    }

    createNew() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('blog-posts')) {
            window.location.href = '/admin/blog-posts/new';
        } else if (currentPath.includes('work-items')) {
            window.location.href = '/admin/work-items/new';
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('[data-search], [type="search"], .search-box input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    openCommandPalette() {
        this.showModal({
            title: 'Command Palette',
            body: `
                <input type="text" class="form-control" placeholder="Type a command..." id="commandInput">
                <div id="commandResults" class="mt-3"></div>
            `,
            size: 'lg'
        });

        const input = document.getElementById('commandInput');
        input?.focus();
        input?.addEventListener('input', this.debounce(() => {
            this.searchCommands(input.value);
        }, 300));
    }

    searchCommands(query) {
        const commands = [
            { name: 'Go to Dashboard', action: () => this.gotoDashboard() },
            { name: 'Go to Blog Posts', action: () => this.gotoBlogPosts() },
            { name: 'Go to Contacts', action: () => this.gotoContacts() },
            { name: 'Toggle Theme', action: () => this.toggleTheme() },
            { name: 'Logout', action: () => this.logout() }
        ];

        const results = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase())
        );

        const resultsDiv = document.getElementById('commandResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = results.map(cmd => `
                <div class="command-result p-2 border rounded mb-2 cursor-pointer" data-command="${cmd.name}">
                    ${cmd.name}
                </div>
            `).join('');

            resultsDiv.querySelectorAll('.command-result').forEach((el, index) => {
                el.addEventListener('click', () => {
                    results[index].action();
                    bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();
                });
            });
        }
    }

    closeModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
}

// Initialize Admin System
let adminSystem;
document.addEventListener('DOMContentLoaded', () => {
    adminSystem = new AdminSystem();
    
    // Make it globally available
    window.AdminSystem = adminSystem;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSystem;
}