// Server-side rendering for CMS blocks and pages
import { Block, BlockType } from "./blocks";

export interface RenderContext {
  tenantId: string;
  locale: string;
  theme: any;
  baseUrl: string;
  isPreview?: boolean;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  path: string;
  locale: string;
  blocks: Block[];
  theme?: any;
  meta?: {
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

export class PageRenderer {
  static async renderPage(page: PageData, context: RenderContext): Promise<string> {
    const html = `
      <!DOCTYPE html>
      <html lang="${page.locale}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title}</title>
          ${page.meta?.description ? `<meta name="description" content="${page.meta.description}">` : ''}
          ${page.meta?.keywords ? `<meta name="keywords" content="${page.meta.keywords}">` : ''}
          ${page.meta?.ogImage ? `<meta property="og:image" content="${page.meta.ogImage}">` : ''}
          <meta property="og:title" content="${page.title}">
          <meta property="og:url" content="${context.baseUrl}${page.path}">
          
          ${this.renderThemeStyles(page.theme || context.theme)}
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            .block { position: relative; }
            .block-padding-none { padding: 0; }
            .block-padding-small { padding: 1rem; }
            .block-padding-medium { padding: 2rem; }
            .block-padding-large { padding: 4rem; }
            .block-margin-none { margin: 0; }
            .block-margin-small { margin: 1rem 0; }
            .block-margin-medium { margin: 2rem 0; }
            .block-margin-large { margin: 4rem 0; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            .fade-in { animation: fadeIn 0.6s ease-in; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .slide-up { animation: slideUp 0.6s ease-out; }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          </style>
        </head>
        <body>
          ${await this.renderBlocks(page.blocks, context)}
          
          ${context.isPreview ? this.renderPreviewScripts() : ''}
        </body>
      </html>
    `;

    return html;
  }

  private static async renderBlocks(blocks: Block[], context: RenderContext): Promise<string> {
    const renderedBlocks = await Promise.all(
      blocks.map(block => this.renderBlock(block, context))
    );
    
    return renderedBlocks.join('\n');
  }

  private static async renderBlock(block: Block, context: RenderContext): Promise<string> {
    if (!block.settings?.visible !== false) {
      return '';
    }

    const blockClasses = [
      'block',
      `block-${block.type}`,
      `block-padding-${block.settings?.padding || 'medium'}`,
      `block-margin-${block.settings?.margin || 'none'}`,
      block.settings?.animation && block.settings.animation !== 'none' ? block.settings.animation : '',
    ].filter(Boolean).join(' ');

    const blockStyles = [
      block.settings?.backgroundColor ? `background-color: ${block.settings.backgroundColor}` : '',
      block.settings?.textColor ? `color: ${block.settings.textColor}` : '',
      block.settings?.customCSS || '',
    ].filter(Boolean).join('; ');

    const blockContent = await this.renderBlockContent(block, context);

    return `
      <div class="${blockClasses}" ${blockStyles ? `style="${blockStyles}"` : ''} data-block-id="${block.id}">
        ${blockContent}
      </div>
    `;
  }

  private static async renderBlockContent(block: Block, context: RenderContext): Promise<string> {
    switch (block.type) {
      case BlockType.HERO:
        return this.renderHeroBlock(block as any, context);
      case BlockType.RICH_TEXT:
        return this.renderRichTextBlock(block as any, context);
      case BlockType.IMAGE:
        return this.renderImageBlock(block as any, context);
      case BlockType.GALLERY:
        return this.renderGalleryBlock(block as any, context);
      case BlockType.CTA:
        return this.renderCTABlock(block as any, context);
      case BlockType.COLLECTION_GRID:
        return await this.renderCollectionGridBlock(block as any, context);
      case BlockType.FORM:
        return this.renderFormBlock(block as any, context);
      case BlockType.MAP:
        return this.renderMapBlock(block as any, context);
      case BlockType.TABS:
        return this.renderTabsBlock(block as any, context);
      case BlockType.ACCORDION:
        return this.renderAccordionBlock(block as any, context);
      case BlockType.FOOTER:
        return this.renderFooterBlock(block as any, context);
      default:
        return `<div>Unknown block type: ${block.type}</div>`;
    }
  }

  private static renderHeroBlock(block: any, context: RenderContext): string {
    const { content } = block;
    const alignmentClass = `text-${content.alignment || 'center'}`;
    
    const backgroundStyle = content.backgroundImage 
      ? `background-image: url(${content.backgroundImage}); background-size: cover; background-position: center;`
      : '';

    const overlayHtml = content.overlay?.enabled 
      ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: ${content.overlay.color};"></div>`
      : '';

    const ctaHtml = content.cta 
      ? `<a href="${content.cta.url}" class="btn btn-${content.cta.style}" style="position: relative; z-index: 1;">
           ${content.cta.text}
         </a>`
      : '';

    return `
      <section class="hero ${alignmentClass}" style="position: relative; min-height: 60vh; display: flex; align-items: center; ${backgroundStyle}">
        ${overlayHtml}
        <div class="container" style="position: relative; z-index: 1;">
          <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">${content.title}</h1>
          ${content.subtitle ? `<h2 style="font-size: 1.5rem; margin-bottom: 1rem; opacity: 0.9;">${content.subtitle}</h2>` : ''}
          ${content.description ? `<p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.8;">${content.description}</p>` : ''}
          ${ctaHtml}
        </div>
      </section>
    `;
  }

  private static renderRichTextBlock(block: any, context: RenderContext): string {
    const { content } = block;
    const alignmentClass = `text-${content.alignment || 'left'}`;

    return `
      <div class="container">
        <div class="rich-text ${alignmentClass}">
          ${content.html}
        </div>
      </div>
    `;
  }

  private static renderImageBlock(block: any, context: RenderContext): string {
    const { content } = block;
    const alignmentClass = `text-${content.alignment || 'center'}`;

    const imageStyle = [
      content.width ? `width: ${content.width}px` : '',
      content.height ? `height: ${content.height}px` : '',
      `object-fit: ${content.objectFit || 'cover'}`,
    ].filter(Boolean).join('; ');

    return `
      <div class="container">
        <div class="image-block ${alignmentClass}">
          <img 
            src="${content.src}" 
            alt="${content.alt}"
            style="${imageStyle}"
            ${content.lazy ? 'loading="lazy"' : ''}
          />
          ${content.caption ? `<p class="image-caption" style="margin-top: 0.5rem; color: #666;">${content.caption}</p>` : ''}
        </div>
      </div>
    `;
  }

  private static renderGalleryBlock(block: any, context: RenderContext): string {
    const { content } = block;
    const gridCols = content.columns || 3;
    
    const imagesHtml = content.images.map((image: any, index: number) => `
      <div class="gallery-item">
        <img 
          src="${image.src}" 
          alt="${image.alt}"
          style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;"
          onclick="${content.lightbox ? `openLightbox(${index})` : ''}"
        />
        ${image.caption ? `<p style="margin-top: 0.5rem; text-align: center; color: #666;">${image.caption}</p>` : ''}
      </div>
    `).join('');

    return `
      <div class="container">
        <div class="gallery" style="display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 1rem;">
          ${imagesHtml}
        </div>
      </div>
    `;
  }

  private static renderCTABlock(block: any, context: RenderContext): string {
    const { content } = block;
    const alignmentClass = `text-${content.alignment || 'center'}`;

    const backgroundStyle = content.backgroundImage 
      ? `background-image: url(${content.backgroundImage}); background-size: cover; background-position: center;`
      : '';

    return `
      <section class="cta ${alignmentClass}" style="padding: 4rem 0; ${backgroundStyle}">
        <div class="container">
          <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${content.title}</h2>
          ${content.description ? `<p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.8;">${content.description}</p>` : ''}
          <a href="${content.button.url}" class="btn btn-${content.button.style} btn-${content.button.size}">
            ${content.button.icon ? `<i class="fas fa-${content.button.icon}"></i> ` : ''}
            ${content.button.text}
          </a>
        </div>
      </section>
    `;
  }

  private static async renderCollectionGridBlock(block: any, context: RenderContext): Promise<string> {
    const { content } = block;
    
    // In a real implementation, this would fetch data from the specified model
    // For now, return a placeholder
    return `
      <div class="container">
        ${content.title ? `<h2 style="margin-bottom: 2rem;">${content.title}</h2>` : ''}
        <div class="collection-grid" style="display: grid; grid-template-columns: repeat(${content.columns || 3}, 1fr); gap: 1rem;">
          <div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
            <p>Collection items from "${content.modelName}" would be rendered here</p>
          </div>
        </div>
      </div>
    `;
  }

  private static renderFormBlock(block: any, context: RenderContext): string {
    const { content } = block;
    
    const fieldsHtml = content.fields.map((field: any) => {
      switch (field.type) {
        case 'textarea':
          return `
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${field.required ? ' *' : ''}</label>
              <textarea 
                name="${field.id}" 
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                style="width: 100%; min-height: 100px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              ></textarea>
            </div>
          `;
        case 'select':
          const optionsHtml = (field.options || []).map((option: string) => 
            `<option value="${option}">${option}</option>`
          ).join('');
          return `
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${field.required ? ' *' : ''}</label>
              <select 
                name="${field.id}" 
                ${field.required ? 'required' : ''}
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              >
                <option value="">Select...</option>
                ${optionsHtml}
              </select>
            </div>
          `;
        default:
          return `
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${field.required ? ' *' : ''}</label>
              <input 
                type="${field.type}" 
                name="${field.id}" 
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
          `;
      }
    }).join('');

    return `
      <div class="container">
        <form action="/api/forms/submit" method="POST" style="max-width: 600px; margin: 0 auto;">
          ${content.title ? `<h2 style="margin-bottom: 1rem;">${content.title}</h2>` : ''}
          ${content.description ? `<p style="margin-bottom: 2rem;">${content.description}</p>` : ''}
          
          ${fieldsHtml}
          
          <button 
            type="submit" 
            class="btn btn-${content.submitButton.style}"
            style="width: 100%; padding: 0.75rem 1.5rem; margin-top: 1rem;"
          >
            ${content.submitButton.text}
          </button>
          
          <input type="hidden" name="form_id" value="${block.id}" />
        </form>
      </div>
    `;
  }

  private static renderMapBlock(block: any, context: RenderContext): string {
    const { content } = block;
    
    return `
      <div class="container">
        <div 
          id="map-${block.id}" 
          style="width: 100%; height: ${content.height || 400}px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center;"
        >
          <p>Interactive map would be rendered here (${content.latitude}, ${content.longitude})</p>
        </div>
      </div>
    `;
  }

  private static renderTabsBlock(block: any, context: RenderContext): string {
    const { content } = block;
    
    const tabsHtml = content.tabs.map((tab: any, index: number) => `
      <button 
        class="tab-button" 
        onclick="showTab('${block.id}', '${tab.id}')"
        style="padding: 0.75rem 1.5rem; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer; ${index === 0 ? 'background: white; border-bottom: 1px solid white;' : ''}"
      >
        ${tab.icon ? `<i class="fas fa-${tab.icon}"></i> ` : ''}${tab.label}
      </button>
    `).join('');

    const contentHtml = content.tabs.map((tab: any, index: number) => `
      <div id="tab-content-${block.id}-${tab.id}" style="display: ${index === 0 ? 'block' : 'none'}; padding: 2rem;">
        ${tab.content}
      </div>
    `).join('');

    return `
      <div class="container">
        <div class="tabs">
          <div class="tab-buttons" style="border-bottom: 1px solid #ddd;">
            ${tabsHtml}
          </div>
          <div class="tab-content">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;
  }

  private static renderAccordionBlock(block: any, context: RenderContext): string {
    const { content } = block;
    
    const itemsHtml = content.items.map((item: any) => `
      <div class="accordion-item" style="border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;">
        <button 
          class="accordion-header" 
          onclick="toggleAccordion('${block.id}', '${item.id}')"
          style="width: 100%; padding: 1rem; text-align: left; background: #f8f9fa; border: none; cursor: pointer; font-weight: 500;"
        >
          ${item.title}
          <span style="float: right;">▼</span>
        </button>
        <div 
          id="accordion-content-${block.id}-${item.id}" 
          style="display: ${item.defaultOpen ? 'block' : 'none'}; padding: 1rem; border-top: 1px solid #ddd;"
        >
          ${item.content}
        </div>
      </div>
    `).join('');

    return `
      <div class="container">
        <div class="accordion">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  private static renderFooterBlock(block: any, context: RenderContext): string {
    const { content } = block;
    
    const sectionsHtml = content.sections.map((section: any) => `
      <div class="footer-section">
        <h4 style="margin-bottom: 1rem; font-weight: 600;">${section.title}</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${section.links.map((link: any) => `
            <li style="margin-bottom: 0.5rem;">
              <a href="${link.url}" ${link.external ? 'target="_blank" rel="noopener"' : ''} style="color: #666; text-decoration: none;">
                ${link.label}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    const socialLinksHtml = content.socialLinks ? `
      <div class="social-links" style="margin-top: 2rem;">
        ${content.socialLinks.map((social: any) => `
          <a href="${social.url}" target="_blank" rel="noopener" style="margin-right: 1rem; color: #666;">
            <i class="fab fa-${social.icon}"></i>
          </a>
        `).join('')}
      </div>
    ` : '';

    return `
      <footer style="background: #f8f9fa; padding: 3rem 0 1rem; border-top: 1px solid #ddd;">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            ${content.logo?.src ? `
              <div class="footer-logo">
                <img src="${content.logo.src}" alt="${content.logo.alt}" style="height: 40px; margin-bottom: 1rem;" />
              </div>
            ` : ''}
            ${sectionsHtml}
          </div>
          
          ${socialLinksHtml}
          
          ${content.copyright ? `
            <div style="text-align: center; padding-top: 2rem; border-top: 1px solid #ddd; color: #666;">
              ${content.copyright}
            </div>
          ` : ''}
        </div>
      </footer>
    `;
  }

  private static renderThemeStyles(theme: any): string {
    if (!theme) return '';
    
    return `
      <style>
        :root {
          --primary-color: ${theme.colors?.primary || '#007bff'};
          --secondary-color: ${theme.colors?.secondary || '#6c757d'};
          --success-color: ${theme.colors?.success || '#28a745'};
          --danger-color: ${theme.colors?.danger || '#dc3545'};
          --warning-color: ${theme.colors?.warning || '#ffc107'};
          --info-color: ${theme.colors?.info || '#17a2b8'};
          --light-color: ${theme.colors?.light || '#f8f9fa'};
          --dark-color: ${theme.colors?.dark || '#343a40'};
          --font-family: ${theme.fonts?.primary || 'system-ui, -apple-system, sans-serif'};
          --border-radius: ${theme.spacing?.borderRadius || '4px'};
        }
        
        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--border-radius);
          text-decoration: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-secondary { background: var(--secondary-color); color: white; }
        .btn-outline { background: transparent; border: 2px solid var(--primary-color); color: var(--primary-color); }
        
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        
        .btn-small { padding: 0.5rem 1rem; font-size: 0.875rem; }
        .btn-medium { padding: 0.75rem 1.5rem; }
        .btn-large { padding: 1rem 2rem; font-size: 1.125rem; }
      </style>
    `;
  }

  private static renderPreviewScripts(): string {
    return `
      <script>
        // Preview mode scripts for editor integration
        function showTab(blockId, tabId) {
          const tabs = document.querySelectorAll('[id^="tab-content-' + blockId + '-"]');
          tabs.forEach(tab => tab.style.display = 'none');
          document.getElementById('tab-content-' + blockId + '-' + tabId).style.display = 'block';
        }
        
        function toggleAccordion(blockId, itemId) {
          const content = document.getElementById('accordion-content-' + blockId + '-' + itemId);
          content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
        
        function openLightbox(index) {
          // Lightbox implementation
          console.log('Open lightbox for image:', index);
        }
      </script>
    `;
  }
}
