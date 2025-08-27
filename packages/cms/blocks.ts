// CMS block definitions and rendering
import { z } from "zod";

export enum BlockType {
  HERO = 'hero',
  RICH_TEXT = 'richtext',
  IMAGE = 'image',
  GALLERY = 'gallery',
  CTA = 'cta',
  COLLECTION_GRID = 'collection',
  FORM = 'form',
  MAP = 'map',
  TABS = 'tabs',
  ACCORDION = 'accordion',
  FOOTER = 'footer',
}

// Base block schema
const baseBlockSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(BlockType),
  name: z.string(),
  settings: z.object({
    padding: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
    margin: z.enum(['none', 'small', 'medium', 'large']).default('none'),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    animation: z.enum(['none', 'fadeIn', 'slideUp', 'scale']).default('none'),
    visible: z.boolean().default(true),
    customCSS: z.string().optional(),
  }).optional(),
});

// Hero block schema
const heroBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.HERO),
  content: z.object({
    title: z.string().default('Hero Title'),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().optional(),
    backgroundVideo: z.string().optional(),
    overlay: z.object({
      enabled: z.boolean().default(false),
      color: z.string().default('rgba(0,0,0,0.5)'),
    }).optional(),
    cta: z.object({
      text: z.string().default('Get Started'),
      url: z.string().default('#'),
      style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    }).optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
  }),
});

// Rich text block schema
const richTextBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.RICH_TEXT),
  content: z.object({
    html: z.string().default('<p>Rich text content goes here...</p>'),
    alignment: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  }),
});

// Image block schema
const imageBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.IMAGE),
  content: z.object({
    src: z.string(),
    alt: z.string().default(''),
    caption: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    objectFit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
    lazy: z.boolean().default(true),
  }),
});

// Gallery block schema
const galleryBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.GALLERY),
  content: z.object({
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().default(''),
      caption: z.string().optional(),
    })),
    layout: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    spacing: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
    lightbox: z.boolean().default(true),
  }),
});

// CTA block schema
const ctaBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.CTA),
  content: z.object({
    title: z.string().default('Call to Action'),
    description: z.string().optional(),
    button: z.object({
      text: z.string().default('Click Here'),
      url: z.string().default('#'),
      style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
      size: z.enum(['small', 'medium', 'large']).default('medium'),
      icon: z.string().optional(),
    }),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    backgroundImage: z.string().optional(),
  }),
});

// Collection grid block schema
const collectionGridBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.COLLECTION_GRID),
  content: z.object({
    title: z.string().optional(),
    modelName: z.string(),
    filters: z.record(z.any()).default({}),
    sorting: z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']).default('desc'),
    }).optional(),
    pagination: z.object({
      enabled: z.boolean().default(true),
      itemsPerPage: z.number().default(12),
    }),
    layout: z.enum(['grid', 'list', 'cards']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    fields: z.array(z.string()).default([]),
  }),
});

// Form block schema
const formBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.FORM),
  content: z.object({
    title: z.string().default('Contact Form'),
    description: z.string().optional(),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(), // For select, radio
    })),
    submitButton: z.object({
      text: z.string().default('Submit'),
      style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    }),
    action: z.object({
      type: z.enum(['email', 'webhook', 'database']).default('email'),
      target: z.string(),
    }),
    successMessage: z.string().default('Thank you for your submission!'),
  }),
});

// Map block schema
const mapBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.MAP),
  content: z.object({
    latitude: z.number(),
    longitude: z.number(),
    zoom: z.number().default(12),
    height: z.number().default(400),
    markers: z.array(z.object({
      latitude: z.number(),
      longitude: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
    })).default([]),
    style: z.enum(['roadmap', 'satellite', 'hybrid', 'terrain']).default('roadmap'),
  }),
});

// Tabs block schema
const tabsBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.TABS),
  content: z.object({
    tabs: z.array(z.object({
      id: z.string(),
      label: z.string(),
      content: z.string(),
      icon: z.string().optional(),
    })),
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    defaultTab: z.string().optional(),
  }),
});

// Accordion block schema
const accordionBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.ACCORDION),
  content: z.object({
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      defaultOpen: z.boolean().default(false),
    })),
    allowMultiple: z.boolean().default(false),
  }),
});

// Footer block schema
const footerBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.FOOTER),
  content: z.object({
    sections: z.array(z.object({
      title: z.string(),
      links: z.array(z.object({
        label: z.string(),
        url: z.string(),
        external: z.boolean().default(false),
      })),
    })),
    socialLinks: z.array(z.object({
      platform: z.string(),
      url: z.string(),
      icon: z.string(),
    })).optional(),
    copyright: z.string().optional(),
    logo: z.object({
      src: z.string().optional(),
      alt: z.string().default('Logo'),
    }).optional(),
  }),
});

// Union of all block types
export const blockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  richTextBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  ctaBlockSchema,
  collectionGridBlockSchema,
  formBlockSchema,
  mapBlockSchema,
  tabsBlockSchema,
  accordionBlockSchema,
  footerBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;
export type HeroBlock = z.infer<typeof heroBlockSchema>;
export type RichTextBlock = z.infer<typeof richTextBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type GalleryBlock = z.infer<typeof galleryBlockSchema>;
export type CTABlock = z.infer<typeof ctaBlockSchema>;
export type CollectionGridBlock = z.infer<typeof collectionGridBlockSchema>;
export type FormBlock = z.infer<typeof formBlockSchema>;
export type MapBlock = z.infer<typeof mapBlockSchema>;
export type TabsBlock = z.infer<typeof tabsBlockSchema>;
export type AccordionBlock = z.infer<typeof accordionBlockSchema>;
export type FooterBlock = z.infer<typeof footerBlockSchema>;

// Block registry for creating new blocks
export class BlockRegistry {
  static createBlock(type: BlockType, customContent?: any): Block {
    const baseId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (type) {
      case BlockType.HERO:
        return {
          id: baseId,
          type: BlockType.HERO,
          name: 'Hero Section',
          content: {
            title: 'Hero Title',
            subtitle: 'Hero subtitle',
            alignment: 'center',
            ...customContent,
          },
        } as HeroBlock;

      case BlockType.RICH_TEXT:
        return {
          id: baseId,
          type: BlockType.RICH_TEXT,
          name: 'Rich Text',
          content: {
            html: '<p>Rich text content goes here...</p>',
            alignment: 'left',
            ...customContent,
          },
        } as RichTextBlock;

      case BlockType.IMAGE:
        return {
          id: baseId,
          type: BlockType.IMAGE,
          name: 'Image',
          content: {
            src: '',
            alt: '',
            alignment: 'center',
            objectFit: 'cover',
            lazy: true,
            ...customContent,
          },
        } as ImageBlock;

      case BlockType.GALLERY:
        return {
          id: baseId,
          type: BlockType.GALLERY,
          name: 'Image Gallery',
          content: {
            images: [],
            layout: 'grid',
            columns: 3,
            spacing: 'medium',
            lightbox: true,
            ...customContent,
          },
        } as GalleryBlock;

      case BlockType.CTA:
        return {
          id: baseId,
          type: BlockType.CTA,
          name: 'Call to Action',
          content: {
            title: 'Call to Action',
            button: {
              text: 'Click Here',
              url: '#',
              style: 'primary',
              size: 'medium',
            },
            alignment: 'center',
            ...customContent,
          },
        } as CTABlock;

      case BlockType.COLLECTION_GRID:
        return {
          id: baseId,
          type: BlockType.COLLECTION_GRID,
          name: 'Collection Grid',
          content: {
            modelName: '',
            filters: {},
            pagination: {
              enabled: true,
              itemsPerPage: 12,
            },
            layout: 'grid',
            columns: 3,
            fields: [],
            ...customContent,
          },
        } as CollectionGridBlock;

      case BlockType.FORM:
        return {
          id: baseId,
          type: BlockType.FORM,
          name: 'Contact Form',
          content: {
            title: 'Contact Form',
            fields: [
              {
                id: 'name',
                type: 'text',
                label: 'Name',
                required: true,
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email',
                required: true,
              },
              {
                id: 'message',
                type: 'textarea',
                label: 'Message',
                required: true,
              },
            ],
            submitButton: {
              text: 'Submit',
              style: 'primary',
            },
            action: {
              type: 'email',
              target: 'contact@example.com',
            },
            successMessage: 'Thank you for your submission!',
            ...customContent,
          },
        } as FormBlock;

      default:
        throw new Error(`Unknown block type: ${type}`);
    }
  }

  static getBlockTypes(): Array<{ type: BlockType; name: string; icon: string; description: string }> {
    return [
      { type: BlockType.HERO, name: 'Hero Section', icon: 'image', description: 'Large banner with title and call-to-action' },
      { type: BlockType.RICH_TEXT, name: 'Rich Text', icon: 'align-left', description: 'Formatted text content with styling' },
      { type: BlockType.IMAGE, name: 'Image', icon: 'image', description: 'Single image with optional caption' },
      { type: BlockType.GALLERY, name: 'Gallery', icon: 'images', description: 'Collection of images in grid or carousel' },
      { type: BlockType.CTA, name: 'Call to Action', icon: 'mouse-pointer', description: 'Button or link to drive user action' },
      { type: BlockType.COLLECTION_GRID, name: 'Collection Grid', icon: 'th', description: 'Dynamic content from data models' },
      { type: BlockType.FORM, name: 'Form', icon: 'wpforms', description: 'Contact or data collection form' },
      { type: BlockType.MAP, name: 'Map', icon: 'map-marker-alt', description: 'Interactive map with markers' },
      { type: BlockType.TABS, name: 'Tabs', icon: 'folder', description: 'Tabbed content sections' },
      { type: BlockType.ACCORDION, name: 'Accordion', icon: 'chevron-down', description: 'Collapsible content sections' },
      { type: BlockType.FOOTER, name: 'Footer', icon: 'window-minimize', description: 'Site footer with links and information' },
    ];
  }
}

// Block validation utilities
export class BlockValidator {
  static validate(block: any): { valid: boolean; errors: string[] } {
    try {
      blockSchema.parse(block);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { valid: false, errors };
      }
      return { valid: false, errors: [error.message] };
    }
  }

  static sanitizeContent(block: Block): Block {
    // Sanitize HTML content in rich text blocks
    if (block.type === BlockType.RICH_TEXT) {
      // Basic HTML sanitization (in production, use a proper sanitizer like DOMPurify)
      const sanitized = block.content.html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
      
      return {
        ...block,
        content: {
          ...block.content,
          html: sanitized,
        },
      };
    }

    return block;
  }
}
