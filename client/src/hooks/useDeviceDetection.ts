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
    let timeoutId: NodeJS.Timeout;
    
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      // Detect device type based on width breakpoints
      let type: DeviceInfo['type'] = 'desktop';
      if (width < 768) {
        type = 'mobile';
      } else if (width < 1024) {
        type = 'tablet';
      }

      // Override with user agent detection for better accuracy
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const tabletRegex = /iPad|Android(?!.*Mobile)/i;
      
      const widthType = type;
      
      if (mobileRegex.test(userAgent)) {
        type = 'mobile';
      }
      
      if (tabletRegex.test(userAgent) && widthType !== 'mobile') {
        type = 'tablet';
      }

      // Only update if device type actually changed (prevent unnecessary re-renders)
      const currentType = deviceInfo.type;
      if (currentType !== type) {
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
      }
    };

    // Debounced resize handler - only trigger after 150ms of no resize events
    const debouncedDetectDevice = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(detectDevice, 150);
    };

    // Initial detection
    detectDevice();

    // Use matchMedia for more efficient breakpoint detection
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
    const tabletMediaQuery = window.matchMedia('(max-width: 1023px)');
    
    const handleMediaChange = () => {
      // Only update on significant breakpoint changes
      debouncedDetectDevice();
    };

    // Listen to media queries instead of resize for better performance
    mobileMediaQuery.addEventListener('change', handleMediaChange);
    tabletMediaQuery.addEventListener('change', handleMediaChange);
    
    // Fallback for orientation changes
    window.addEventListener('orientationchange', debouncedDetectDevice);

    return () => {
      clearTimeout(timeoutId);
      mobileMediaQuery.removeEventListener('change', handleMediaChange);
      tabletMediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('orientationchange', debouncedDetectDevice);
    };
  }, [deviceInfo.type]);

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