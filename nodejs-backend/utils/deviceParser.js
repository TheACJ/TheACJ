/**
 * Device and User Agent Parser Utility
 * Extracts device information from user agent strings
 */

/**
 * Parse user agent to extract device information
 * @param {string} userAgent - User agent string
 * @returns {Object} Device information
 */
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      browser: 'Unknown',
      browserVersion: 'Unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      deviceModel: 'Unknown'
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Device Type Detection
  let deviceType = 'desktop';
  let deviceModel = 'Unknown';
  
  if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) {
    deviceType = 'tablet';
    if (ua.includes('ipad')) deviceModel = 'iPad';
    else if (ua.includes('playbook')) deviceModel = 'BlackBerry PlayBook';
    else if (ua.includes('silk')) deviceModel = 'Kindle Fire';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
    if (ua.includes('iphone')) {
      deviceModel = 'iPhone';
      const match = userAgent.match(/iphone os (\d+[_\d]*)/i);
      if (match) deviceModel += ` (iOS ${match[1].replace(/_/g, '.')})`;
    } else if (ua.includes('ipod')) {
      deviceModel = 'iPod';
    } else if (ua.includes('android')) {
      deviceModel = 'Android Device';
      const match = userAgent.match(/android ([\d.]+)/i);
      if (match) deviceModel += ` (${match[1]})`;
    } else if (ua.includes('blackberry')) {
      deviceModel = 'BlackBerry';
    }
  }

  // Browser Detection
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('edg/')) {
    browser = 'Edge';
    const match = userAgent.match(/edg\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('edgios/')) {
    browser = 'Edge iOS';
    const match = userAgent.match(/edgios\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/chrome\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/version\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/firefox\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
    const match = userAgent.match(/(?:opera|opr)\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
    const match = userAgent.match(/(?:msie |rv:)([\d.]+)/i);
    if (match) browserVersion = match[1];
  }

  // OS Detection
  let os = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10/11';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
    else if (ua.includes('windows nt 6.0')) osVersion = 'Vista';
    else if (ua.includes('windows nt 5.1')) osVersion = 'XP';
    else {
      const match = userAgent.match(/windows nt ([\d.]+)/i);
      if (match) osVersion = match[1];
    }
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS';
    const match = userAgent.match(/mac os x ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('linux')) {
    os = 'Linux';
    if (ua.includes('ubuntu')) osVersion = 'Ubuntu';
    else if (ua.includes('debian')) osVersion = 'Debian';
    else if (ua.includes('fedora')) osVersion = 'Fedora';
    else osVersion = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = userAgent.match(/android ([\d.]+)/i);
    if (match) osVersion = match[1];
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
    const match = userAgent.match(/os ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('xbox')) {
    os = 'Xbox';
  } else if (ua.includes('playstation')) {
    os = 'PlayStation';
  }

  return {
    deviceType,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceModel
  };
}

/**
 * Extract domain from referrer URL
 * @param {string} referrer - Referrer URL
 * @returns {string|null} Domain or null
 */
function extractReferrerDomain(referrer) {
  if (!referrer || referrer === '' || referrer === 'null') {
    return null;
  }

  try {
    const url = new URL(referrer);
    let domain = url.hostname;
    
    // Remove www. prefix
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (e) {
    // If URL parsing fails, try to extract domain manually
    const match = referrer.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    if (match) {
      return match[1];
    }
    return referrer;
  }
}

/**
 * Get connection type from navigator (if available in frontend)
 * @param {string} connectionType - Connection type string from frontend
 * @returns {string} Connection type
 */
function parseConnectionType(connectionType) {
  if (!connectionType) return 'unknown';
  
  const conn = connectionType.toLowerCase();
  if (conn.includes('4g')) return '4G';
  if (conn.includes('3g')) return '3G';
  if (conn.includes('2g')) return '2G';
  if (conn.includes('wifi') || conn.includes('wlan')) return 'WiFi';
  if (conn.includes('ethernet')) return 'Ethernet';
  if (conn.includes('cellular')) return 'Cellular';
  
  return connectionType;
}

module.exports = {
  parseUserAgent,
  extractReferrerDomain,
  parseConnectionType
};

