import axios from 'axios';

interface PageViewData {
  page: string;
  referrer?: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  sessionId: string;
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
  os: string;
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
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Track initial page view
      await this.trackPageView();

      // Set up event listeners
      this.setupEventListeners();

      // Start session tracking
      this.startSessionTracking();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    // Add to page views
    if (!this.pageViews.includes(pageViewData.page)) {
      this.pageViews.push(pageViewData.page);
    }

    try {
      await axios.post('/api/analytics/pageview', pageViewData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
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

    try {
      await axios.post('/api/analytics/click', clickData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }

  private async trackScrollDepth(depth: number): Promise<void> {
    try {
      await axios.post('/api/analytics/scroll', {
        depth,
        page: window.location.pathname,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to track scroll depth:', error);
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
      os: this.getOS()
    };

    try {
      await axios.post('/api/analytics/session', sessionData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to track session end:', error);
    }
  }

  private async trackSessionResume(): Promise<void> {
    try {
      await axios.post('/api/analytics/session-resume', {
        sessionId: this.sessionId,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to track session resume:', error);
    }
  }

  // Public methods for manual tracking
  async trackEvent(eventName: string, data: Record<string, unknown> = {}): Promise<void> {
    try {
      await axios.post('/api/analytics/event', {
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
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackConversion(conversionType: string, value?: number): Promise<void> {
    try {
      await axios.post('/api/analytics/conversion', {
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
    } catch (error) {
      console.error('Failed to track conversion:', error);
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
      os: this.getOS()
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      analytics.initialize();
    });
  } else {
    analytics.initialize();
  }
}

export default analytics;