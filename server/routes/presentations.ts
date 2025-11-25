
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

/**
 * Get presentation markdown for download
 */
router.get('/api/presentations/:slug/download', async (req, res) => {
  try {
    const { slug } = req.params;
    const presentationPath = path.join(process.cwd(), 'docs', 'presentations', `${slug}.md`);
    
    const content = await fs.readFile(presentationPath, 'utf-8');
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.md"`);
    res.send(content);
  } catch (error) {
    console.error('Presentation download error:', error);
    res.status(404).json({ error: 'Presentation not found' });
  }
});

/**
 * List available presentations
 */
router.get('/api/presentations', async (req, res) => {
  try {
    const presentationsDir = path.join(process.cwd(), 'docs', 'presentations');
    const files = await fs.readdir(presentationsDir);
    
    const presentations = files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        slug: f.replace('.md', ''),
        filename: f
      }));
    
    res.json({ presentations });
  } catch (error) {
    console.error('Presentations list error:', error);
    res.status(500).json({ error: 'Failed to list presentations' });
  }
});

export default router;
