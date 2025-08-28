import { useState, useEffect } from 'react';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    os: 'unknown',
    browser: 'unknown',
    screenSize: { width: 1920, height: 1080 },
    orientation: 'landscape',
    touchEnabled: false,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      // Detect device type
      let type: DeviceInfo['type'] = 'desktop';
      if (width < 768) {
        type = 'mobile';
      } else if (width < 1024) {
        type = 'tablet';
      }

      // Override with user agent detection for better accuracy
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const tabletRegex = /iPad|Android(?=.*Mobile)/i;
      
      if (mobileRegex.test(userAgent)) {
        if (tabletRegex.test(userAgent)) {
          type = 'tablet';
        } else {
          type = 'mobile';
        }
      }

      // Detect OS
      let os = 'unknown';
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

      // Detect browser
      let browser = 'unknown';
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      else if (userAgent.includes('Opera')) browser = 'Opera';

      const newDeviceInfo: DeviceInfo = {
        type,
        os,
        browser,
        screenSize: { width, height },
        orientation: width > height ? 'landscape' : 'portrait',
        touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      };

      setDeviceInfo(newDeviceInfo);
      setIsMobile(type === 'mobile');
      setIsTablet(type === 'tablet');
      setIsDesktop(type === 'desktop');
    };

    // Initial detection
    detectDevice();

    // Listen for resize events
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return {
    deviceInfo,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: deviceInfo.screenSize.width < 768,
    isMediumScreen: deviceInfo.screenSize.width >= 768 && deviceInfo.screenSize.width < 1024,
    isLargeScreen: deviceInfo.screenSize.width >= 1024,
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape',
    touchEnabled: deviceInfo.touchEnabled,
  };
}