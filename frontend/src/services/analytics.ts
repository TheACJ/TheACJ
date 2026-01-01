import axios from 'axios';
import { API_URL } from './api';

// Ensure API_URL ends with /api for analytics endpoints
const getAnalyticsUrl = (endpoint: string) => {
  const baseUrl = API_URL || '';
  // If API_URL already includes /api, use it directly, otherwise append /api
  if (baseUrl.includes('/api')) {
    return `${baseUrl}/${endpoint}`;
  }
  return `${baseUrl}/api/${endpoint}`;
};

interface PageViewData {
  page: string;
  referrer?: string;
  userAgent: string;
  screenResolution: string;
  viewportSize?: { width: number; height: number };
  timezone: string;
  language: string;
  sessionId: string;
  connectionType?: string;
  timestamp: number;
}

interface ClickData {
  element: string;
  page: string;
  position: { x: number; y: number };
  sessionId: string;
  timestamp: number;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pages: string[];
  deviceType: string;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  deviceModel?: string;
  screenResolution?: string;
  viewportSize?: { width: number; height: number };
  connectionType?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
  userAgent?: string;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: number;
  private pageViews: string[] = [];
  private lastActivityTime: number;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const ua = navigator.userAgent;
    const match = ua.match(/(?:Chrome|Firefox|Safari|Edg|Opera|OPR)\/([\d.]+)/);
    return match ? match[1] : 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) {
      if (ua.includes('Windows NT 10.0')) return '10/11';
      if (ua.includes('Windows NT 6.3')) return '8.1';
      if (ua.includes('Windows NT 6.2')) return '8';
      if (ua.includes('Windows NT 6.1')) return '7';
      const match = ua.match(/Windows NT ([\d.]+)/);
      return match ? match[1] : 'Unknown';
    }
    if (ua.includes('Mac OS X')) {
      const match = ua.match(/Mac OS X ([\d_]+)/);
      return match ? match[1].replace(/_/g, '.') : 'Unknown';
    }
    if (ua.includes('Android')) {
      const match = ua.match(/Android ([\d.]+)/);
      return match ? match[1] : 'Unknown';
    }
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
      const match = ua.match(/OS ([\d_]+)/);
      return match ? match[1].replace(/_/g, '.') : 'Unknown';
    }
    return 'Unknown';
  }

  private getDeviceModel(): string {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) {
      const match = ua.match(/iPhone(\d+,\d+)?/);
      return match ? `iPhone ${match[1] || ''}` : 'iPhone';
    }
    if (ua.includes('iPad')) {
      return 'iPad';
    }
    if (ua.includes('Android')) {
      // Try to extract device model from user agent
      const match = ua.match(/Android.*?;\s*([^)]+)\)/);
      return match ? match[1].trim() : 'Android Device';
    }
    return 'Unknown';
  }

  private getConnectionType(): string {
    // @ts-ignore - navigator.connection may not be available in all browsers
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      // @ts-ignore
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[Analytics] Initializing analytics service...');

    try {
      // Track initial page view
      await this.trackPageView();

      // Set up event listeners
      this.setupEventListeners();

      // Start session tracking
      this.startSessionTracking();

      this.isInitialized = true;
      console.log('[Analytics] Analytics service initialized successfully');
    } catch (error) {
      console.error('[Analytics] Failed to initialize analytics:', error);
    }
  }

  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackSessionEnd();
      } else {
        this.trackSessionResume();
      }
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackScrollDepth(scrollDepth);
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  private startSessionTracking(): void {
    // Update activity every 30 seconds
    setInterval(() => {
      this.updateActivity();
    }, 30000);
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  async trackPageView(page?: string): Promise<void> {
    const pageViewData: PageViewData = {
      page: page || window.location.pathname,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      sessionId: this.sessionId,
      connectionType: this.getConnectionType(),
      timestamp: Date.now()
    };

    // Add to page views
    if (!this.pageViews.includes(pageViewData.page)) {
      this.pageViews.push(pageViewData.page);
    }

    console.log('[Analytics] Tracking page view:', pageViewData.page);

    try {
      await axios.post(getAnalyticsUrl('analytics/pageview'), pageViewData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Page view tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  private async trackClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Skip tracking clicks on certain elements
    if (target.tagName === 'HTML' || target.tagName === 'BODY') return;

    const clickData: ClickData = {
      element: target.tagName + (target.className ? '.' + target.className.split(' ')[0] : ''),
      page: window.location.pathname,
      position: { x: event.clientX, y: event.clientY },
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    console.log('[Analytics] Tracking click:', clickData.element, 'on', clickData.page);

    try {
      await axios.post(getAnalyticsUrl('analytics/click'), clickData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Click tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track click:', error);
    }
  }

  private async trackScrollDepth(depth: number): Promise<void> {
    console.log('[Analytics] Tracking scroll depth:', depth + '%');

    try {
      await axios.post(getAnalyticsUrl('analytics/scroll'), {
        depth,
        page: window.location.pathname,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Scroll depth tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track scroll depth:', error);
    }
  }

  private async trackSessionEnd(): Promise<void> {
    const sessionData: SessionData = {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      duration: Date.now() - this.sessionStartTime,
      pages: this.pageViews,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      browserVersion: this.getBrowserVersion(),
      os: this.getOS(),
      osVersion: this.getOSVersion(),
      deviceModel: this.getDeviceModel(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connectionType: this.getConnectionType(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent
    };

    console.log('[Analytics] Tracking session end:', {
      sessionId: sessionData.sessionId,
      duration: sessionData.duration ? Math.round(sessionData.duration / 1000) + 's' : 'unknown',
      pages: sessionData.pages.length
    });

    try {
      await axios.post(getAnalyticsUrl('analytics/session'), sessionData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Session end tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track session end:', error);
    }
  }

  private async trackSessionResume(): Promise<void> {
    console.log('[Analytics] Tracking session resume for:', this.sessionId);

    try {
      await axios.post(getAnalyticsUrl('analytics/session-resume'), {
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Session resume tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track session resume:', error);
    }
  }

  // Public methods for manual tracking
  async trackEvent(eventName: string, data: Record<string, unknown> = {}): Promise<void> {
    console.log('[Analytics] Tracking custom event:', eventName, data);

    try {
      await axios.post(getAnalyticsUrl('analytics/event'), {
        event: eventName,
        data,
        page: window.location.pathname,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Custom event tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  async trackConversion(conversionType: string, value?: number): Promise<void> {
    console.log('[Analytics] Tracking conversion:', conversionType, value ? `$${value}` : '');

    try {
      await axios.post(getAnalyticsUrl('analytics/conversion'), {
        type: conversionType,
        value,
        page: window.location.pathname,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[Analytics] Conversion tracked successfully');
    } catch (error) {
      console.error('[Analytics] Failed to track conversion:', error);
    }
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      duration: Date.now() - this.sessionStartTime,
      pages: this.pageViews,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      browserVersion: this.getBrowserVersion(),
      os: this.getOS(),
      osVersion: this.getOSVersion(),
      deviceModel: this.getDeviceModel(),
      connectionType: this.getConnectionType(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Analytics service is now initialized explicitly in App.tsx
// This prevents double initialization and ensures proper timing

export default analytics;