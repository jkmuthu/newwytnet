import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  userSites,
  sitePages,
  hubTemplates,
  users,
  insertUserSiteSchema,
  insertSitePageSchema,
  type UserSite,
  type SitePage,
} from "@shared/schema";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import { isAuthenticated } from "../customAuth";

const router = Router();

async function generateDisplayId(prefix: string): Promise<string> {
  const result = await db.execute(sql`
    SELECT COUNT(*) + 1 as next_id FROM user_sites
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(5, '0')}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

async function generateUniqueSubdomain(baseName: string): Promise<string> {
  let subdomain = slugify(baseName);
  let counter = 0;
  
  while (true) {
    const testSubdomain = counter === 0 ? subdomain : `${subdomain}-${counter}`;
    const [existing] = await db
      .select({ id: userSites.id })
      .from(userSites)
      .where(eq(userSites.subdomain, testSubdomain))
      .limit(1);
    
    if (!existing) {
      return testSubdomain;
    }
    counter++;
  }
}

// ============================================
// WYTSITE TEMPLATES
// ============================================

router.get("/wytsite/templates", async (req, res) => {
  try {
    const templates = await db
      .select()
      .from(hubTemplates)
      .where(and(
        eq(hubTemplates.category, 'wytsite'),
        eq(hubTemplates.isActive, true),
        eq(hubTemplates.isPublic, true)
      ))
      .orderBy(hubTemplates.sortOrder);

    res.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching WytSite templates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch templates" });
  }
});

router.get("/wytsite/templates/:slug", async (req, res) => {
  try {
    const [template] = await db
      .select()
      .from(hubTemplates)
      .where(and(
        eq(hubTemplates.slug, req.params.slug),
        eq(hubTemplates.category, 'wytsite')
      ))
      .limit(1);

    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ success: false, error: "Failed to fetch template" });
  }
});

// ============================================
// USER SITES MANAGEMENT (Authenticated)
// ============================================

router.get("/wytsite/sites", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const sites = await db
      .select({
        id: userSites.id,
        displayId: userSites.displayId,
        name: userSites.name,
        subdomain: userSites.subdomain,
        customDomain: userSites.customDomain,
        status: userSites.status,
        viewCount: userSites.viewCount,
        publishedAt: userSites.publishedAt,
        createdAt: userSites.createdAt,
        updatedAt: userSites.updatedAt,
      })
      .from(userSites)
      .where(and(
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .orderBy(desc(userSites.createdAt));

    res.json({ success: true, sites });
  } catch (error) {
    console.error("Error fetching user sites:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sites" });
  }
});

router.get("/wytsite/sites/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.id),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const pages = await db
      .select()
      .from(sitePages)
      .where(eq(sitePages.siteId, site.id))
      .orderBy(sitePages.navOrder);

    res.json({ success: true, site, pages });
  } catch (error) {
    console.error("Error fetching site:", error);
    res.status(500).json({ success: false, error: "Failed to fetch site" });
  }
});

router.post("/wytsite/sites", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { name, templateId } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: "Site name is required" });
    }

    const displayId = await generateDisplayId('WS');
    const subdomain = await generateUniqueSubdomain(name);

    let theme = {};
    let defaultPages: any[] = [];

    if (templateId) {
      const [template] = await db
        .select()
        .from(hubTemplates)
        .where(eq(hubTemplates.id, templateId))
        .limit(1);
      
      if (template) {
        theme = template.defaultTheme || {};
        defaultPages = (template.defaultPages as string[]) || [];
      }
    }

    const [newSite] = await db
      .insert(userSites)
      .values({
        displayId,
        userId,
        templateId,
        name,
        subdomain,
        theme,
        status: 'draft',
      })
      .returning();

    if (defaultPages.length > 0) {
      const pagesToInsert = defaultPages.map((pageSlug, index) => ({
        siteId: newSite.id,
        title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
        slug: pageSlug,
        path: pageSlug === 'home' ? '/' : `/${pageSlug}`,
        content: getDefaultPageContent(pageSlug),
        isHomePage: pageSlug === 'home',
        showInNav: true,
        navOrder: index,
        status: 'draft' as const,
      }));

      await db.insert(sitePages).values(pagesToInsert);
    } else {
      await db.insert(sitePages).values({
        siteId: newSite.id,
        title: 'Home',
        slug: 'home',
        path: '/',
        content: getDefaultPageContent('home'),
        isHomePage: true,
        showInNav: true,
        navOrder: 0,
        status: 'draft',
      });
    }

    res.json({ success: true, site: newSite });
  } catch (error) {
    console.error("Error creating site:", error);
    res.status(500).json({ success: false, error: "Failed to create site" });
  }
});

router.patch("/wytsite/sites/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [existingSite] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.id),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!existingSite) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const { name, settings, theme, seoSettings, customDomain } = req.body;

    const [updatedSite] = await db
      .update(userSites)
      .set({
        ...(name && { name }),
        ...(settings && { settings }),
        ...(theme && { theme }),
        ...(seoSettings && { seoSettings }),
        ...(customDomain !== undefined && { customDomain }),
        updatedAt: new Date(),
      })
      .where(eq(userSites.id, req.params.id))
      .returning();

    res.json({ success: true, site: updatedSite });
  } catch (error) {
    console.error("Error updating site:", error);
    res.status(500).json({ success: false, error: "Failed to update site" });
  }
});

router.delete("/wytsite/sites/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [existingSite] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.id),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!existingSite) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    await db
      .update(userSites)
      .set({
        deletedAt: new Date(),
        deletedBy: userId,
      })
      .where(eq(userSites.id, req.params.id));

    res.json({ success: true, message: "Site deleted successfully" });
  } catch (error) {
    console.error("Error deleting site:", error);
    res.status(500).json({ success: false, error: "Failed to delete site" });
  }
});

// ============================================
// SITE PUBLISHING
// ============================================

router.post("/wytsite/sites/:id/publish", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [existingSite] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.id),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!existingSite) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const [updatedSite] = await db
      .update(userSites)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSites.id, req.params.id))
      .returning();

    await db
      .update(sitePages)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sitePages.siteId, req.params.id));

    res.json({ 
      success: true, 
      site: updatedSite,
      url: `https://${updatedSite.subdomain}.wytsite.com`
    });
  } catch (error) {
    console.error("Error publishing site:", error);
    res.status(500).json({ success: false, error: "Failed to publish site" });
  }
});

router.post("/wytsite/sites/:id/unpublish", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [updatedSite] = await db
      .update(userSites)
      .set({
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(and(
        eq(userSites.id, req.params.id),
        eq(userSites.userId, userId)
      ))
      .returning();

    if (!updatedSite) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    res.json({ success: true, site: updatedSite });
  } catch (error) {
    console.error("Error unpublishing site:", error);
    res.status(500).json({ success: false, error: "Failed to unpublish site" });
  }
});

// ============================================
// SITE PAGES MANAGEMENT
// ============================================

router.get("/wytsite/sites/:siteId/pages", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.siteId),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const pages = await db
      .select()
      .from(sitePages)
      .where(eq(sitePages.siteId, req.params.siteId))
      .orderBy(sitePages.navOrder);

    res.json({ success: true, pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pages" });
  }
});

router.get("/wytsite/sites/:siteId/pages/:pageId", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.siteId),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const [page] = await db
      .select()
      .from(sitePages)
      .where(and(
        eq(sitePages.id, req.params.pageId),
        eq(sitePages.siteId, req.params.siteId)
      ))
      .limit(1);

    if (!page) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    res.json({ success: true, page });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({ success: false, error: "Failed to fetch page" });
  }
});

router.post("/wytsite/sites/:siteId/pages", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.siteId),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const { title, slug, content, showInNav = true } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: "Page title is required" });
    }

    const pageSlug = slug || slugify(title);
    const path = `/${pageSlug}`;

    const existingPages = await db
      .select()
      .from(sitePages)
      .where(eq(sitePages.siteId, req.params.siteId));
    
    const navOrder = existingPages.length;

    const [newPage] = await db
      .insert(sitePages)
      .values({
        siteId: req.params.siteId,
        title,
        slug: pageSlug,
        path,
        content: content || getDefaultPageContent('blank'),
        showInNav,
        navOrder,
        status: 'draft',
      })
      .returning();

    res.json({ success: true, page: newPage });
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ success: false, error: "Failed to create page" });
  }
});

router.patch("/wytsite/sites/:siteId/pages/:pageId", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.siteId),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const { title, content, showInNav, navOrder, metaTitle, metaDescription } = req.body;

    const [updatedPage] = await db
      .update(sitePages)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        ...(showInNav !== undefined && { showInNav }),
        ...(navOrder !== undefined && { navOrder }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        updatedAt: new Date(),
      })
      .where(and(
        eq(sitePages.id, req.params.pageId),
        eq(sitePages.siteId, req.params.siteId)
      ))
      .returning();

    if (!updatedPage) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    res.json({ success: true, page: updatedPage });
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ success: false, error: "Failed to update page" });
  }
});

router.delete("/wytsite/sites/:siteId/pages/:pageId", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.id, req.params.siteId),
        eq(userSites.userId, userId),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const [page] = await db
      .select()
      .from(sitePages)
      .where(and(
        eq(sitePages.id, req.params.pageId),
        eq(sitePages.siteId, req.params.siteId)
      ))
      .limit(1);

    if (!page) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    if (page.isHomePage) {
      return res.status(400).json({ success: false, error: "Cannot delete the home page" });
    }

    await db
      .delete(sitePages)
      .where(eq(sitePages.id, req.params.pageId));

    res.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ success: false, error: "Failed to delete page" });
  }
});

// ============================================
// PUBLIC SITE RENDERING
// ============================================

router.get("/wytsite/public/:subdomain", async (req, res) => {
  try {
    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.subdomain, req.params.subdomain),
        eq(userSites.status, 'published'),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    await db
      .update(userSites)
      .set({ viewCount: sql`${userSites.viewCount} + 1` })
      .where(eq(userSites.id, site.id));

    const pages = await db
      .select()
      .from(sitePages)
      .where(and(
        eq(sitePages.siteId, site.id),
        eq(sitePages.status, 'published')
      ))
      .orderBy(sitePages.navOrder);

    res.json({ 
      success: true, 
      site: {
        ...site,
        viewCount: (site.viewCount || 0) + 1,
      },
      pages,
    });
  } catch (error) {
    console.error("Error fetching public site:", error);
    res.status(500).json({ success: false, error: "Failed to fetch site" });
  }
});

router.get("/wytsite/public/:subdomain/:slug", async (req, res) => {
  try {
    const [site] = await db
      .select()
      .from(userSites)
      .where(and(
        eq(userSites.subdomain, req.params.subdomain),
        eq(userSites.status, 'published'),
        isNull(userSites.deletedAt)
      ))
      .limit(1);

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    const [page] = await db
      .select()
      .from(sitePages)
      .where(and(
        eq(sitePages.siteId, site.id),
        eq(sitePages.slug, req.params.slug),
        eq(sitePages.status, 'published')
      ))
      .limit(1);

    if (!page) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    const navPages = await db
      .select({
        id: sitePages.id,
        title: sitePages.title,
        slug: sitePages.slug,
        path: sitePages.path,
        showInNav: sitePages.showInNav,
        navOrder: sitePages.navOrder,
      })
      .from(sitePages)
      .where(and(
        eq(sitePages.siteId, site.id),
        eq(sitePages.status, 'published'),
        eq(sitePages.showInNav, true)
      ))
      .orderBy(sitePages.navOrder);

    res.json({ 
      success: true, 
      site,
      page,
      navigation: navPages,
    });
  } catch (error) {
    console.error("Error fetching public page:", error);
    res.status(500).json({ success: false, error: "Failed to fetch page" });
  }
});

// Helper function to generate default page content
function getDefaultPageContent(pageType: string): any[] {
  const defaultBlocks: Record<string, any[]> = {
    home: [
      {
        type: 'hero',
        id: 'hero-1',
        data: {
          title: 'Welcome to Your New Website',
          subtitle: 'Create something amazing',
          buttonText: 'Get Started',
          buttonLink: '#',
          backgroundType: 'gradient',
          backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        }
      },
      {
        type: 'features',
        id: 'features-1',
        data: {
          title: 'Why Choose Us',
          features: [
            { icon: 'Zap', title: 'Fast', description: 'Lightning fast performance' },
            { icon: 'Shield', title: 'Secure', description: 'Enterprise-grade security' },
            { icon: 'Heart', title: 'Reliable', description: '99.9% uptime guarantee' },
          ]
        }
      },
    ],
    about: [
      {
        type: 'text',
        id: 'about-1',
        data: {
          title: 'About Us',
          content: 'Tell your story here. Share your mission, values, and what makes you unique.',
        }
      },
    ],
    services: [
      {
        type: 'services',
        id: 'services-1',
        data: {
          title: 'Our Services',
          services: [
            { title: 'Service 1', description: 'Description of your first service', price: '' },
            { title: 'Service 2', description: 'Description of your second service', price: '' },
            { title: 'Service 3', description: 'Description of your third service', price: '' },
          ]
        }
      },
    ],
    contact: [
      {
        type: 'contact',
        id: 'contact-1',
        data: {
          title: 'Get in Touch',
          subtitle: 'We\'d love to hear from you',
          email: 'hello@example.com',
          phone: '',
          address: '',
          showForm: true,
        }
      },
    ],
    blank: [],
  };

  return defaultBlocks[pageType] || defaultBlocks.blank;
}

export default router;
