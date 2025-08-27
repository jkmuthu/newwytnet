// CMS package - Content Management System with blocks and page rendering
export * from './blocks';
export * from './renderer';

// Re-export commonly used types and utilities
export type { Block, BlockType } from './blocks';
export type { RenderContext, PageData } from './renderer';

// CMS version and metadata
export const CMS_VERSION = '1.0.0';
export const CMS_COMPATIBILITY = {
  kernel: '^1.0.0',
  react: '^18.0.0',
  nextjs: '^14.0.0',
};

// Default CMS configuration
export const DEFAULT_CMS_CONFIG = {
  blocks: {
    enabledBlocks: [
      'hero', 'richtext', 'image', 'gallery', 'cta', 
      'collection', 'form', 'map', 'tabs', 'accordion', 'footer'
    ],
    customBlocks: [],
    maxBlocksPerPage: 100,
  },
  rendering: {
    enableSSR: true,
    enableCache: true,
    cacheTTL: 300, // 5 minutes
    enablePreview: true,
  },
  media: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    enableOptimization: true,
  },
  themes: {
    defaultTheme: 'default',
    customThemes: [],
    enableThemeCustomization: true,
  },
};

// Initialize CMS with configuration
export function initializeCMS(config: Partial<typeof DEFAULT_CMS_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_CMS_CONFIG, ...config };
  
  console.log(`📝 WytNet CMS v${CMS_VERSION} initialized`);
  console.log(`   - Blocks: ${mergedConfig.blocks.enabledBlocks.length} types enabled`);
  console.log(`   - Rendering: SSR ${mergedConfig.rendering.enableSSR ? 'enabled' : 'disabled'}`);
  console.log(`   - Media: Max size ${mergedConfig.media.maxFileSize / 1024 / 1024}MB`);
  
  return mergedConfig;
}

// CMS health check
export function getCMSHealth() {
  return {
    version: CMS_VERSION,
    status: 'healthy',
    availableBlocks: DEFAULT_CMS_CONFIG.blocks.enabledBlocks,
    renderingEngine: 'server-side',
    timestamp: new Date().toISOString(),
  };
}

// Utility functions for CMS operations
export function getBlockLibrary() {
  const { BlockRegistry } = require('./blocks');
  return BlockRegistry.getBlockTypes();
}

export function validatePageStructure(pageData: any): boolean {
  // Validate page structure and blocks
  if (!pageData.blocks || !Array.isArray(pageData.blocks)) {
    return false;
  }
  
  const { BlockValidator } = require('./blocks');
  return pageData.blocks.every((block: any) => {
    const validation = BlockValidator.validate(block);
    return validation.valid;
  });
}

export function optimizePageForSEO(pageData: any) {
  // Add SEO optimizations to page data
  return {
    ...pageData,
    meta: {
      ...pageData.meta,
      canonical: pageData.path,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      ...(pageData.meta || {}),
    },
  };
}
