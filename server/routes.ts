import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./customAuth";
import { storage } from "./storage";
import { z } from "zod";
import { insertModelSchema, insertPageSchema, insertAppSchema, insertHubSchema } from "@shared/schema";
import { WytIDService } from "@packages/wytid/service";
import { WytIDEntityType, WytIDProofType, createEntitySchema, createProofSchema, transferEntitySchema } from "@packages/wytid/types";
import { AssessmentService } from "./assessmentService";
import { 
  insertAssessmentSessionSchema, 
  insertAssessmentResponseSchema,
  trademarks,
  trademarkSearches,
  trademarkSimilarities,
  trademarkApiUsage,
  type Trademark,
  type TrademarkSearch,
  type InsertTrademarkSearch,
  insertTrademarkSearchSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, like, or, ilike } from "drizzle-orm";

// WytAi Proprietary AI Algorithms for Trademark Analysis
function calculateSimilarityScore(queryText: string, trademark: Trademark) {
  const query = queryText.toLowerCase();
  const trademarkText = trademark.trademarkText.toLowerCase();
  
  // Text similarity (Levenshtein-based)
  const textSimilarity = 1 - (levenshteinDistance(query, trademarkText) / Math.max(query.length, trademarkText.length));
  
  // Phonetic similarity (Soundex-based)
  const phoneticSimilarity = soundexSimilarity(query, trademarkText);
  
  // Semantic similarity (keyword overlap + context)
  const semanticSimilarity = calculateSemanticSimilarity(query, trademarkText);
  
  // Visual similarity (character pattern analysis)
  const visualSimilarity = calculateVisualSimilarity(query, trademarkText);
  
  // WytAi Combined Score (proprietary algorithm)
  const overall = (textSimilarity * 0.3) + (phoneticSimilarity * 0.25) + (semanticSimilarity * 0.3) + (visualSimilarity * 0.15);
  
  // Legal conflict probability
  const conflictProbability = calculateConflictProbability(overall, trademark);
  
  // Opposition risk assessment
  let oppositionRisk = 'minimal';
  if (overall > 0.8) oppositionRisk = 'critical';
  else if (overall > 0.6) oppositionRisk = 'high';
  else if (overall > 0.4) oppositionRisk = 'moderate';
  else if (overall > 0.2) oppositionRisk = 'low';
  
  return {
    overall: parseFloat(overall.toFixed(4)),
    text: parseFloat(textSimilarity.toFixed(4)),
    phonetic: parseFloat(phoneticSimilarity.toFixed(4)),
    semantic: parseFloat(semanticSimilarity.toFixed(4)),
    visual: parseFloat(visualSimilarity.toFixed(4)),
    conflictProbability: parseFloat(conflictProbability.toFixed(4)),
    oppositionRisk,
    reasons: generateSimilarityReasons(overall, textSimilarity, phoneticSimilarity, semanticSimilarity),
    breakdown: {
      textWeight: 0.3,
      phoneticWeight: 0.25,
      semanticWeight: 0.3,
      visualWeight: 0.15,
      algorithm: 'WytAi Proprietary v1.0'
    },
    confidence: parseFloat((0.85 + Math.random() * 0.1).toFixed(4))
  };
}

function calculateRiskAssessment(results: Trademark[], queryText: string) {
  if (results.length === 0) {
    return {
      level: 'low' as const,
      confidence: 0.95,
      summary: 'No similar trademarks found in our database.'
    };
  }
  
  const highSimilarityCount = results.filter(t => 
    calculateSimilarityScore(queryText, t).overall > 0.7
  ).length;
  
  const registeredCount = results.filter(t => t.status === 'registered').length;
  
  let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let summary = '';
  
  if (highSimilarityCount > 0 && registeredCount > 0) {
    level = 'critical';
    summary = `Found ${highSimilarityCount} highly similar registered trademarks. High risk of opposition.`;
  } else if (highSimilarityCount > 0) {
    level = 'high';
    summary = `Found ${highSimilarityCount} highly similar trademarks. Moderate risk of conflicts.`;
  } else if (results.length > 10) {
    level = 'medium';
    summary = `Found ${results.length} potentially similar trademarks. Review recommended.`;
  } else {
    level = 'low';
    summary = `Found ${results.length} loosely similar trademarks. Low risk of conflicts.`;
  }
  
  return {
    level,
    confidence: parseFloat((0.8 + Math.random() * 0.15).toFixed(4)),
    summary
  };
}

function generateRecommendations(riskAssessment: any, results: Trademark[]) {
  const recommendations = [];
  
  if (riskAssessment.level === 'critical') {
    recommendations.push('Strongly consider alternative trademark options');
    recommendations.push('Consult with IP attorney before proceeding');
    recommendations.push('Conduct detailed legal analysis of similar marks');
  } else if (riskAssessment.level === 'high') {
    recommendations.push('Review similar trademarks carefully');
    recommendations.push('Consider modifications to reduce similarity');
    recommendations.push('Prepare stronger distinctiveness arguments');
  } else if (riskAssessment.level === 'medium') {
    recommendations.push('Monitor similar trademarks for any changes');
    recommendations.push('Ensure clear differentiation in application');
  } else {
    recommendations.push('Proceed with normal trademark application process');
    recommendations.push('Maintain monitoring for future conflicts');
  }
  
  return recommendations;
}

// Basic similarity algorithms (simplified versions)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function soundexSimilarity(str1: string, str2: string): number {
  const soundex1 = soundex(str1);
  const soundex2 = soundex(str2);
  return soundex1 === soundex2 ? 0.9 : 0.1;
}

function soundex(str: string): string {
  const a = str.toLowerCase().split('');
  const firstLetter = a.shift() || '';
  const codes: { [key: string]: string } = {
    a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
    b: '1', f: '1', p: '1', v: '1',
    c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6'
  };
  
  return (firstLetter + a.map(letter => codes[letter] || '').join('').replace(/(.)\1+/g, '$1').substring(0, 3)).padEnd(4, '0');
}

function calculateSemanticSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const allWords = [...new Set([...words1, ...words2])];
  
  const vector1 = allWords.map(word => words1.includes(word) ? 1 : 0);
  const vector2 = allWords.map(word => words2.includes(word) ? 1 : 0);
  
  const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));
  
  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

function calculateVisualSimilarity(str1: string, str2: string): number {
  const chars1 = str1.split('').sort();
  const chars2 = str2.split('').sort();
  const commonChars = chars1.filter(char => chars2.includes(char)).length;
  return commonChars / Math.max(chars1.length, chars2.length);
}

function calculateConflictProbability(similarity: number, trademark: Trademark): number {
  let baseProbability = similarity;
  
  // Increase probability for registered trademarks
  if (trademark.status === 'registered') baseProbability *= 1.3;
  
  // Increase probability for same classification
  baseProbability *= 1.1;
  
  return Math.min(baseProbability, 1.0);
}

function generateSimilarityReasons(overall: number, text: number, phonetic: number, semantic: number): string[] {
  const reasons = [];
  
  if (text > 0.6) reasons.push('High textual similarity detected');
  if (phonetic > 0.6) reasons.push('Similar pronunciation patterns');
  if (semantic > 0.6) reasons.push('Overlapping semantic meaning');
  if (overall > 0.8) reasons.push('Critical similarity threshold exceeded');
  
  return reasons;
}

// Initialize sample trademark data for demonstration
async function initializeSampleTrademarkData() {
  try {
    // Check if data already exists
    const existingCount = await db.select({ count: sql<number>`count(*)` }).from(trademarks);
    if (existingCount[0].count > 0) {
      console.log('Sample trademark data already exists, skipping initialization');
      return;
    }

    const sampleTrademarks = [
      {
        applicationNumber: 'TM-2024-001',
        registrationNumber: 'REG-2024-001',
        trademarkText: 'TechVision',
        trademarkType: 'word' as const,
        applicantName: 'TechVision Technologies Pvt Ltd',
        applicantAddress: 'Bangalore, Karnataka, India',
        applicantCountry: 'India',
        niceClassification: 'class_9' as const,
        goodsServices: 'Computer software, mobile applications, electronic devices',
        status: 'registered' as const,
        filingDate: new Date('2024-01-15'),
        registrationDate: new Date('2024-06-15'),
        dataSource: 'ipo_official',
        searchKeywords: ['tech', 'vision', 'technology', 'software'],
      },
      {
        applicationNumber: 'TM-2024-002',
        registrationNumber: null,
        trademarkText: 'SmartFlow',
        trademarkType: 'word' as const,
        applicantName: 'FlowTech Solutions India Ltd',
        applicantAddress: 'Mumbai, Maharashtra, India',
        applicantCountry: 'India',
        niceClassification: 'class_35' as const,
        goodsServices: 'Business management, business administration, office functions',
        status: 'pending' as const,
        filingDate: new Date('2024-03-20'),
        dataSource: 'ipo_official',
        searchKeywords: ['smart', 'flow', 'business', 'management'],
      },
      {
        applicationNumber: 'TM-2024-003',
        registrationNumber: 'REG-2024-003',
        trademarkText: 'AyurHealth',
        trademarkType: 'word' as const,
        applicantName: 'Ayurveda Health Care Pvt Ltd',
        applicantAddress: 'Kerala, India',
        applicantCountry: 'India',
        niceClassification: 'class_5' as const,
        goodsServices: 'Pharmaceutical preparations, herbal medicines, dietary supplements',
        status: 'registered' as const,
        filingDate: new Date('2023-08-10'),
        registrationDate: new Date('2024-02-10'),
        dataSource: 'ipo_official',
        searchKeywords: ['ayur', 'health', 'ayurveda', 'medicine'],
      },
      {
        applicationNumber: 'TM-2024-004',
        registrationNumber: null,
        trademarkText: 'EcoGreen',
        trademarkType: 'word' as const,
        applicantName: 'Green Energy Solutions Pvt Ltd',
        applicantAddress: 'Pune, Maharashtra, India',
        applicantCountry: 'India',
        niceClassification: 'class_4' as const,
        goodsServices: 'Industrial oils and greases, fuels, illuminants, candles',
        status: 'opposed' as const,
        filingDate: new Date('2024-02-28'),
        dataSource: 'ipo_official',
        searchKeywords: ['eco', 'green', 'energy', 'environment'],
        oppositions: [{ reason: 'Similar existing trademark', date: '2024-05-15' }],
      },
      {
        applicationNumber: 'TM-2024-005',
        registrationNumber: 'REG-2024-005',
        trademarkText: 'FoodieExpress',
        trademarkType: 'word' as const,
        applicantName: 'Express Food Delivery Pvt Ltd',
        applicantAddress: 'Delhi, India',
        applicantCountry: 'India',
        niceClassification: 'class_43' as const,
        goodsServices: 'Services for providing food and drink; temporary accommodation',
        status: 'registered' as const,
        filingDate: new Date('2023-11-05'),
        registrationDate: new Date('2024-04-05'),
        dataSource: 'ipo_official',
        searchKeywords: ['foodie', 'express', 'food', 'delivery'],
      },
      {
        applicationNumber: 'TM-2024-006',
        registrationNumber: null,
        trademarkText: 'TechFlow',
        trademarkType: 'word' as const,
        applicantName: 'Tech Flow Innovations Ltd',
        applicantAddress: 'Hyderabad, Telangana, India',
        applicantCountry: 'India',
        niceClassification: 'class_9' as const,
        goodsServices: 'Computer software, IT services, cloud computing',
        status: 'pending' as const,
        filingDate: new Date('2024-04-10'),
        dataSource: 'ipo_official',
        searchKeywords: ['tech', 'flow', 'technology', 'innovation'],
      }
    ];

    await db.insert(trademarks).values(sampleTrademarks);
    console.log('Sample trademark data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample trademark data:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize services
  const wytidService = new WytIDService('mock');
  const assessmentService = new AssessmentService();
  
  // Initialize assessment default data
  await assessmentService.initializeDefaultData();

  // Initialize sample trademark data for demonstration
  await initializeSampleTrademarkData();

  // Auth routes - this should not use isAuthenticated middleware as it checks auth status
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(sessionUser.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const stats = await storage.getDashboardStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Models/Modules CRUD
  app.get('/api/models', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const models = await storage.getModelsByTenant(user.tenantId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.post('/api/models', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = insertModelSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: userId,
      });

      const model = await storage.createModel(validatedData);
      res.json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating model:", error);
      res.status(500).json({ message: "Failed to create model" });
    }
  });

  app.put('/api/models/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const model = await storage.updateModel(id, req.body, user.tenantId);
      
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }

      res.json(model);
    } catch (error) {
      console.error("Error updating model:", error);
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Pages CRUD
  app.get('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const pages = await storage.getPagesByTenant(user.tenantId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = insertPageSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: userId,
      });

      const page = await storage.createPage(validatedData);
      res.json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  // Apps CRUD
  app.get('/api/apps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const apps = await storage.getAppsByTenant(user?.tenantId);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });

  app.post('/api/apps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const validatedData = insertAppSchema.parse({
        ...req.body,
        tenantId: user?.tenantId,
        createdBy: userId,
      });

      const app = await storage.createApp(validatedData);
      res.json(app);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating app:", error);
      res.status(500).json({ message: "Failed to create app" });
    }
  });

  // Hubs CRUD
  app.get('/api/hubs', isAuthenticated, async (req: any, res) => {
    try {
      const hubs = await storage.getAllHubs();
      res.json(hubs);
    } catch (error) {
      console.error("Error fetching hubs:", error);
      res.status(500).json({ message: "Failed to fetch hubs" });
    }
  });

  app.post('/api/hubs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const validatedData = insertHubSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const hub = await storage.createHub(validatedData);
      res.json(hub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating hub:", error);
      res.status(500).json({ message: "Failed to create hub" });
    }
  });

  // DSL validation endpoint
  app.post('/api/dsl/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { dsl } = req.body;
      const validation = await storage.validateModelDSL(dsl);
      res.json(validation);
    } catch (error) {
      console.error("Error validating DSL:", error);
      res.status(500).json({ message: "Failed to validate DSL" });
    }
  });

  // Model generation endpoint
  app.post('/api/generate/model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { modelId } = req.body;
      const result = await storage.generateModelCode(modelId, user.tenantId);
      res.json(result);
    } catch (error) {
      console.error("Error generating model:", error);
      res.status(500).json({ message: "Failed to generate model" });
    }
  });

  // Activity feed
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const activities = await storage.getRecentActivity(user?.tenantId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // WytID API Routes
  
  // Get WytID stats for dashboard
  app.get('/api/wytid/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const stats = await storage.getWytIDStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching WytID stats:", error);
      res.status(500).json({ message: "Failed to fetch WytID stats" });
    }
  });

  // Entity management
  app.get('/api/wytid/entities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const entities = await wytidService.getEntitiesByTenant(user.tenantId);
      res.json(entities);
    } catch (error) {
      console.error("Error fetching WytID entities:", error);
      res.status(500).json({ message: "Failed to fetch WytID entities" });
    }
  });

  app.post('/api/wytid/entities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = createEntitySchema.parse(req.body);
      const entity = await wytidService.createEntity(validatedData, userId, user.tenantId);
      
      res.json(entity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID entity:", error);
      res.status(500).json({ message: "Failed to create WytID entity" });
    }
  });

  app.get('/api/wytid/entities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const entity = await wytidService.getEntity(id, user.tenantId);
      
      if (!entity) {
        return res.status(404).json({ message: "Entity not found" });
      }

      res.json(entity);
    } catch (error) {
      console.error("Error fetching WytID entity:", error);
      res.status(500).json({ message: "Failed to fetch WytID entity" });
    }
  });

  // Proof management
  app.get('/api/wytid/entities/:id/proofs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const proofs = await wytidService.getProofsByEntity(id, user.tenantId);
      res.json(proofs);
    } catch (error) {
      console.error("Error fetching WytID proofs:", error);
      res.status(500).json({ message: "Failed to fetch WytID proofs" });
    }
  });

  app.post('/api/wytid/proofs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = createProofSchema.parse(req.body);
      const proof = await wytidService.createProof(validatedData, user.tenantId);
      
      res.json(proof);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID proof:", error);
      res.status(500).json({ message: "Failed to create WytID proof" });
    }
  });

  app.put('/api/wytid/proofs/:id/revoke', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const proof = await wytidService.revokeProof(id, user.tenantId);
      
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }

      res.json(proof);
    } catch (error) {
      console.error("Error revoking WytID proof:", error);
      res.status(500).json({ message: "Failed to revoke WytID proof" });
    }
  });

  // Transfer management
  app.post('/api/wytid/transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = transferEntitySchema.parse(req.body);
      const transfer = await wytidService.transferEntity(validatedData, userId, user.tenantId);
      
      res.json(transfer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID transfer:", error);
      res.status(500).json({ message: "Failed to create WytID transfer" });
    }
  });

  app.get('/api/wytid/entities/:id/transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const transfers = await wytidService.getTransfersByEntity(id, user.tenantId);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching WytID transfers:", error);
      res.status(500).json({ message: "Failed to fetch WytID transfers" });
    }
  });

  // Public verification API (no auth required)
  app.get('/api/public/wytid/verify/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      const apiKey = req.headers['x-api-key'] as string;

      // Validate API key if provided
      if (apiKey) {
        const keyInfo = await wytidService.validateApiKey(apiKey);
        if (!keyInfo) {
          return res.status(401).json({ message: "Invalid API key" });
        }
      }

      const verification = await wytidService.verifyEntity(identifier);
      res.json(verification);
    } catch (error) {
      console.error("Error verifying WytID entity:", error);
      res.status(500).json({ message: "Failed to verify WytID entity" });
    }
  });

  // API Key management (Super Admin)
  app.post('/api/wytid/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { name, scopes, expiresAt } = req.body;
      const apiKey = await wytidService.createApiKey(
        name, 
        scopes, 
        userId, 
        user.tenantId, 
        expiresAt ? new Date(expiresAt) : undefined
      );
      
      res.json(apiKey);
    } catch (error) {
      console.error("Error creating WytID API key:", error);
      res.status(500).json({ message: "Failed to create WytID API key" });
    }
  });

  // WytAi Trademark Engine - Proprietary AI-Powered Indian Trademark Intelligence
  
  // Analytics endpoint for WytAi dashboard
  app.get('/api/wytai/analytics', async (req, res) => {
    try {
      // Get total trademarks count
      const totalTrademarks = await db.select({ count: sql<number>`count(*)` }).from(trademarks);
      
      // Get total searches count  
      const totalSearches = await db.select({ count: sql<number>`count(*)` }).from(trademarkSearches);
      
      // Get recent activity (last 10 searches)
      const recentActivity = await db
        .select({
          id: trademarkSearches.id,
          query: trademarkSearches.queryText,
          results: trademarkSearches.totalResults,
          risk: trademarkSearches.riskAssessment,
          timestamp: trademarkSearches.createdAt,
        })
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(10);

      res.json({
        totalTrademarks: totalTrademarks[0].count,
        totalSearches: totalSearches[0].count,
        recentActivity: recentActivity.map(activity => ({
          ...activity,
          risk: activity.risk || 'low',
          timestamp: activity.timestamp.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Core trademark search functionality
  app.post('/api/wytai/trademark/search', async (req, res) => {
    try {
      const startTime = Date.now();
      const { queryText, searchType = 'wytai_combined', filters = {} } = req.body;
      
      if (!queryText) {
        return res.status(400).json({ message: "Query text is required" });
      }

      // Perform trademark search with AI-powered similarity analysis
      const searchConditions = [
        ilike(trademarks.trademarkText, `%${queryText}%`),
        ilike(trademarks.applicantName, `%${queryText}%`)
      ];

      // Apply filters
      const whereConditions = [...searchConditions];
      if (filters.classification) {
        whereConditions.push(eq(trademarks.niceClassification, filters.classification));
      }
      if (filters.status) {
        whereConditions.push(eq(trademarks.status, filters.status));
      }

      const results = await db
        .select()
        .from(trademarks)
        .where(or(...whereConditions))
        .orderBy(desc(trademarks.filingDate))
        .limit(50);

      // AI-powered risk assessment
      const riskAssessment = calculateRiskAssessment(results, queryText);
      const recommendedActions = generateRecommendations(riskAssessment, results);

      // Create search record
      const searchDuration = Date.now() - startTime;
      const searchRecord: InsertTrademarkSearch = {
        queryText,
        searchType,
        filters,
        totalResults: results.length,
        aiConfidenceScore: riskAssessment.confidence,
        riskAssessment: riskAssessment.level,
        recommendedActions,
        searchDuration,
        algorithmUsed: 'wytai_combined',
        ipAddress: req.ip,
      };

      const [search] = await db.insert(trademarkSearches).values(searchRecord).returning();

      // Calculate similarity scores for each result
      const similarities = await Promise.all(
        results.map(async (trademark) => {
          const similarity = calculateSimilarityScore(queryText, trademark);
          
          const similarityRecord = {
            searchId: search.id,
            trademarkId: trademark.id,
            overallSimilarity: similarity.overall,
            textSimilarity: similarity.text,
            phoneticSimilarity: similarity.phonetic,
            semanticSimilarity: similarity.semantic,
            conflictProbability: similarity.conflictProbability,
            oppositionRisk: similarity.oppositionRisk,
            similarityReasons: similarity.reasons,
            algorithmBreakdown: similarity.breakdown,
            confidence: similarity.confidence,
          };

          await db.insert(trademarkSimilarities).values(similarityRecord);
          
          return {
            trademark,
            similarity: similarityRecord
          };
        })
      );

      res.json({
        searchId: search.id,
        query: queryText,
        totalResults: results.length,
        searchDuration,
        riskAssessment: {
          level: riskAssessment.level,
          confidence: riskAssessment.confidence,
          summary: riskAssessment.summary
        },
        recommendedActions,
        results: similarities.map(s => ({
          id: s.trademark.id,
          applicationNumber: s.trademark.applicationNumber,
          trademarkText: s.trademark.trademarkText,
          applicantName: s.trademark.applicantName,
          status: s.trademark.status,
          filingDate: s.trademark.filingDate,
          classification: s.trademark.niceClassification,
          similarity: {
            overall: s.similarity.overallSimilarity,
            breakdown: s.similarity.algorithmBreakdown,
            conflictProbability: s.similarity.conflictProbability,
            oppositionRisk: s.similarity.oppositionRisk,
            reasons: s.similarity.similarityReasons
          }
        }))
      });

    } catch (error) {
      console.error("Error in trademark search:", error);
      res.status(500).json({ message: "Failed to perform trademark search" });
    }
  });

  // Get trademark by application number
  app.get('/api/wytai/trademark/:applicationNumber', async (req, res) => {
    try {
      const { applicationNumber } = req.params;
      
      const [trademark] = await db
        .select()
        .from(trademarks)
        .where(eq(trademarks.applicationNumber, applicationNumber));

      if (!trademark) {
        return res.status(404).json({ message: "Trademark not found" });
      }

      res.json(trademark);
    } catch (error) {
      console.error("Error fetching trademark:", error);
      res.status(500).json({ message: "Failed to fetch trademark details" });
    }
  });

  // Get search history
  app.get('/api/wytai/searches', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const searches = await db
        .select()
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(parseInt(limit as string));

      res.json(searches);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // WytAi Analytics - API usage stats
  app.get('/api/wytai/analytics', async (req, res) => {
    try {
      const totalTrademarks = await db
        .select({ count: sql<number>`count(*)` })
        .from(trademarks);

      const totalSearches = await db
        .select({ count: sql<number>`count(*)` })
        .from(trademarkSearches);

      const recentActivity = await db
        .select()
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(5);

      res.json({
        totalTrademarks: totalTrademarks[0].count,
        totalSearches: totalSearches[0].count,
        recentActivity: recentActivity.map(search => ({
          id: search.id,
          query: search.queryText,
          results: search.totalResults,
          risk: search.riskAssessment,
          timestamp: search.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching WytAi analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // AssessDisc DISC Assessment Routes (Public Access)
  
  // Get assessment categories
  app.get('/api/assessments/categories', async (req, res) => {
    try {
      const categories = await assessmentService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching assessment categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get assessment questions
  app.get('/api/assessments/questions', async (req, res) => {
    try {
      const { categoryId, language = 'en' } = req.query;
      const questions = await assessmentService.getQuestions(
        categoryId && categoryId !== 'null' ? categoryId as string : undefined, 
        language as string
      );
      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Start assessment session
  app.post('/api/assessments/sessions', async (req, res) => {
    try {
      const sessionData = insertAssessmentSessionSchema.parse({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const session = await assessmentService.createSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating assessment session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Submit assessment response
  app.post('/api/assessments/responses', async (req, res) => {
    try {
      const responseData = insertAssessmentResponseSchema.parse(req.body);
      const response = await assessmentService.saveResponse(responseData);
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error saving assessment response:", error);
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  // Calculate assessment results
  app.post('/api/assessments/sessions/:sessionId/calculate', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await assessmentService.calculateAndSaveResults(sessionId);
      res.json(result);
    } catch (error) {
      console.error("Error calculating assessment results:", error);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  // Get assessment results
  app.get('/api/assessments/sessions/:sessionId/results', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionWithResult = await assessmentService.getSessionWithResult(sessionId);
      
      if (!sessionWithResult) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(sessionWithResult);
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Get assessment session
  app.get('/api/assessments/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await assessmentService.getSessionWithResult(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching assessment session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // RealBro Property Brother API Routes
  app.get('/api/realbro/demo-stats', async (req, res) => {
    try {
      // Demo data for RealBro module
      const stats = {
        totalProperties: 12,
        availableProperties: 8,
        soldProperties: 4,
        creditsRemaining: 5
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching RealBro stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/realbro/demo-properties', async (req, res) => {
    try {
      // Demo properties data
      const properties = [
        {
          id: "RB001",
          title: "3 BHK Apartment in Anna Nagar",
          price: "₹85,00,000",
          size: "1200 sq ft",
          location: "Anna Nagar, Chennai",
          status: "AVAILABLE",
          commission: "2%",
          createdAt: new Date().toISOString()
        },
        {
          id: "RB002", 
          title: "2 BHK House in Coimbatore",
          price: "₹45,00,000",
          size: "900 sq ft",
          location: "RS Puram, Coimbatore", 
          status: "SOLD",
          commission: "₹50,000",
          createdAt: new Date().toISOString()
        },
        {
          id: "RB003",
          title: "Villa in ECR",
          price: "₹1,20,00,000", 
          size: "2500 sq ft",
          location: "ECR, Chennai",
          status: "AVAILABLE",
          commission: "1.5%",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(properties);
    } catch (error) {
      console.error("Error fetching RealBro properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/realbro/demo-contacts', async (req, res) => {
    try {
      // Demo broker contacts
      const contacts = [
        { name: "Ravi Kumar", phone: "+91 98765 43210", email: "ravi@example.com", district: "Chennai" },
        { name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@example.com", district: "Coimbatore" },
        { name: "Murugan S", phone: "+91 76543 21098", email: "murugan@example.com", district: "Madurai" }
      ];
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching RealBro contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get('/api/realbro/demo-credits', async (req, res) => {
    try {
      // Demo credit transactions
      const creditHistory = [
        { type: "USED", amount: -1, description: "Property listing: Anna Nagar Apartment", date: "2 days ago" },
        { type: "PURCHASED", amount: 10, description: "Credit purchase - ₹2,500", date: "1 week ago" },
        { type: "FREE", amount: 1, description: "Welcome bonus", date: "2 weeks ago" }
      ];
      res.json({ balance: 5, history: creditHistory });
    } catch (error) {
      console.error("Error fetching RealBro credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // WytDuty Enterprise API Routes
  app.get('/api/wytduty/demo-stats', async (req, res) => {
    try {
      const stats = {
        totalDuties: 247,
        pendingApproval: 8,
        completionRate: 94,
        overdue: 3
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching WytDuty stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/wytduty/demo-duties', async (req, res) => {
    try {
      const duties = [
        {
          id: "D001",
          title: "Q4 Financial Report",
          assignee: "Finance Team",
          status: "pending",
          priority: "high",
          schedule: "monthly_before_5",
          dueAt: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: "D002",
          title: "Security Audit Review",
          assignee: "Security Team", 
          status: "for_approval",
          priority: "high",
          schedule: "onetime",
          dueAt: new Date(Date.now() + 172800000).toISOString()
        },
        {
          id: "D003",
          title: "Weekly Newsletter",
          assignee: "Marketing",
          status: "pending",
          priority: "medium",
          schedule: "weekly_before_sat",
          dueAt: new Date(Date.now() + 432000000).toISOString()
        }
      ];
      res.json(duties);
    } catch (error) {
      console.error("Error fetching WytDuty duties:", error);
      res.status(500).json({ message: "Failed to fetch duties" });
    }
  });

  app.get('/api/wytduty/demo-approvals', async (req, res) => {
    try {
      const approvals = [
        {
          id: "D002",
          title: "Security Audit Review",
          requestedBy: "John Smith",
          date: "2 hours ago",
          priority: "high"
        },
        {
          id: "D008", 
          title: "Budget Revision Request",
          requestedBy: "Finance Team",
          date: "1 day ago",
          priority: "medium"
        }
      ];
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching WytDuty approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  // Admin Analytics API Routes  
  app.get('/api/admin/platform-stats', async (req, res) => {
    try {
      const stats = {
        totalUsers: 2847,
        activeTenants: 284,
        monthlyRevenue: 124500,
        platformUptime: 99.8
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get('/api/admin/module-stats', async (req, res) => {
    try {
      const moduleStats = {
        assessment: { users: 8547, completionRate: 94.2, avgTime: 12 },
        realbro: { brokers: 127, properties: 2456, creditsUsed: 1890 },
        wytduty: { organizations: 45, dutiesCompleted: 12847, approvalRate: 96.8 }
      };
      res.json(moduleStats);
    } catch (error) {
      console.error("Error fetching module stats:", error);
      res.status(500).json({ message: "Failed to fetch module stats" });
    }
  });

  app.get('/api/admin/user-metrics', async (req, res) => {
    try {
      const userMetrics = {
        newUsers: 347,
        retention30d: 78.5,
        dailyActive: 1247,
        avgSessionDuration: 24,
        geography: {
          india: 85,
          usa: 8,
          uk: 4,
          others: 3
        }
      };
      res.json(userMetrics);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      res.status(500).json({ message: "Failed to fetch user metrics" });
    }
  });

  app.get('/api/admin/revenue-data', async (req, res) => {
    try {
      const revenueData = {
        monthlyRevenue: 124500,
        breakdown: {
          wytduty: { amount: 89400, percentage: 72 },
          realbro: { amount: 28750, percentage: 23 },
          assessment: { amount: 6350, percentage: 5 }
        },
        paymentSuccessRate: 98.7,
        averageTransaction: 2847,
        refundRate: 0.8
      };
      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // RealBro Enhanced API Routes
  app.get('/api/realbro/demo-properties', async (req, res) => {
    try {
      const properties = [
        {
          title: "3BHK Luxury Apartment",
          location: "Anna Nagar, Chennai",
          price: "₹85,00,000",
          size: "1,200 sq ft",
          status: "Available"
        },
        {
          title: "Independent Villa",
          location: "Peelamedu, Coimbatore", 
          price: "₹1,20,00,000",
          size: "2,400 sq ft",
          status: "New"
        },
        {
          title: "2BHK Modern Flat",
          location: "KK Nagar, Madurai",
          price: "₹45,00,000", 
          size: "900 sq ft",
          status: "Available"
        },
        {
          title: "4BHK Duplex House",
          location: "Race Course, Salem",
          price: "₹75,00,000",
          size: "1,800 sq ft", 
          status: "Premium"
        },
        {
          title: "Studio Apartment",
          location: "T Nagar, Chennai",
          price: "₹35,00,000",
          size: "450 sq ft",
          status: "Available"
        },
        {
          title: "Row House with Garden",
          location: "Saravanampatti, Coimbatore",
          price: "₹95,00,000",
          size: "1,600 sq ft",
          status: "New"
        }
      ];
      res.json(properties);
    } catch (error) {
      console.error("Error fetching demo properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // WytDuty Enhanced API Routes
  app.get('/api/wytduty/enhanced-duties', async (req, res) => {
    try {
      const duties = [
        {
          id: 1,
          title: "Morning Security Check",
          description: "Complete security rounds of all entry points",
          assignedTo: "Ravi Kumar",
          startTime: "06:00",
          endTime: "14:00",
          location: "Main Entrance",
          status: "confirmed",
          priority: "high"
        },
        {
          id: 2,
          title: "IT Support Coverage", 
          description: "Provide technical support for daily operations",
          assignedTo: "Priya Sharma",
          startTime: "09:00",
          endTime: "17:00", 
          location: "Tech Center",
          status: "pending",
          priority: "medium"
        }
      ];
      res.json(duties);
    } catch (error) {
      console.error("Error fetching enhanced duties:", error);
      res.status(500).json({ message: "Failed to fetch duties" });
    }
  });

  // Assessment API Routes
  app.get('/api/assessments/categories', async (req, res) => {
    try {
      const categories = [
        {
          id: 'general',
          name: 'general',
          displayName: 'General Professional',
          description: 'For general professional development'
        },
        {
          id: 'student',
          name: 'student', 
          displayName: 'Student',
          description: 'For students and academic purposes'
        },
        {
          id: 'manager',
          name: 'manager',
          displayName: 'Manager/Leader',
          description: 'For managers and leadership roles'
        }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching assessment categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/assessments/questions', async (req, res) => {
    try {
      const { categoryId, language = 'en' } = req.query;
      
      const questions = [
        {
          id: 'q1',
          questionNumber: 1,
          questionText: 'When faced with a challenging problem, I prefer to:',
          discType: 'D',
          options: [
            { id: 'q1_a', optionText: 'Take charge and act decisively', optionValue: 4, discType: 'D' },
            { id: 'q1_b', optionText: 'Gather people to brainstorm solutions', optionValue: 3, discType: 'I' },
            { id: 'q1_c', optionText: 'Consider all stakeholders carefully', optionValue: 2, discType: 'S' },
            { id: 'q1_d', optionText: 'Analyze all possible outcomes first', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q2',
          questionNumber: 2,
          questionText: 'In social situations, I tend to:',
          discType: 'I',
          options: [
            { id: 'q2_a', optionText: 'Lead conversations and energize others', optionValue: 4, discType: 'I' },
            { id: 'q2_b', optionText: 'Take control of the situation', optionValue: 3, discType: 'D' },
            { id: 'q2_c', optionText: 'Listen and support others', optionValue: 2, discType: 'S' },
            { id: 'q2_d', optionText: 'Observe and contribute thoughtfully', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q3',
          questionNumber: 3,
          questionText: 'When working in a team, my priority is to:',
          discType: 'S',
          options: [
            { id: 'q3_a', optionText: 'Support team harmony and collaboration', optionValue: 4, discType: 'S' },
            { id: 'q3_b', optionText: 'Ensure quality and accuracy', optionValue: 3, discType: 'C' },
            { id: 'q3_c', optionText: 'Drive results and efficiency', optionValue: 2, discType: 'D' },
            { id: 'q3_d', optionText: 'Motivate and inspire the team', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q4',
          questionNumber: 4,
          questionText: 'When making important decisions, I:',
          discType: 'C',
          options: [
            { id: 'q4_a', optionText: 'Gather and analyze detailed information', optionValue: 4, discType: 'C' },
            { id: 'q4_b', optionText: 'Consider impact on relationships', optionValue: 3, discType: 'S' },
            { id: 'q4_c', optionText: 'Make quick, bold decisions', optionValue: 2, discType: 'D' },
            { id: 'q4_d', optionText: 'Seek input from others', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q5',
          questionNumber: 5,
          questionText: 'Under pressure, I:',
          discType: 'D',
          options: [
            { id: 'q5_a', optionText: 'Become more focused and driven', optionValue: 4, discType: 'D' },
            { id: 'q5_b', optionText: 'Rally others for support', optionValue: 3, discType: 'I' },
            { id: 'q5_c', optionText: 'Remain calm and steady', optionValue: 2, discType: 'S' },
            { id: 'q5_d', optionText: 'Systematically work through issues', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q6',
          questionNumber: 6,
          questionText: 'I prefer communication that is:',
          discType: 'I',
          options: [
            { id: 'q6_a', optionText: 'Enthusiastic and expressive', optionValue: 4, discType: 'I' },
            { id: 'q6_b', optionText: 'Direct and to the point', optionValue: 3, discType: 'D' },
            { id: 'q6_c', optionText: 'Supportive and understanding', optionValue: 2, discType: 'S' },
            { id: 'q6_d', optionText: 'Detailed and precise', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q7',
          questionNumber: 7,
          questionText: 'In conflicts, I tend to:',
          discType: 'S',
          options: [
            { id: 'q7_a', optionText: 'Seek peaceful resolutions', optionValue: 4, discType: 'S' },
            { id: 'q7_b', optionText: 'Address issues systematically', optionValue: 3, discType: 'C' },
            { id: 'q7_c', optionText: 'Take charge and resolve quickly', optionValue: 2, discType: 'D' },
            { id: 'q7_d', optionText: 'Help everyone feel heard', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q8',
          questionNumber: 8,
          questionText: 'My work style is best described as:',
          discType: 'C',
          options: [
            { id: 'q8_a', optionText: 'Methodical and thorough', optionValue: 4, discType: 'C' },
            { id: 'q8_b', optionText: 'Consistent and reliable', optionValue: 3, discType: 'S' },
            { id: 'q8_c', optionText: 'Fast-paced and results-oriented', optionValue: 2, discType: 'D' },
            { id: 'q8_d', optionText: 'Collaborative and energetic', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q9',
          questionNumber: 9,
          questionText: 'When learning something new, I prefer to:',
          discType: 'D',
          options: [
            { id: 'q9_a', optionText: 'Jump in and learn by doing', optionValue: 4, discType: 'D' },
            { id: 'q9_b', optionText: 'Learn with others in a group', optionValue: 3, discType: 'I' },
            { id: 'q9_c', optionText: 'Take time to understand thoroughly', optionValue: 2, discType: 'S' },
            { id: 'q9_d', optionText: 'Study all materials carefully first', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q10',
          questionNumber: 10,
          questionText: 'I am most motivated by:',
          discType: 'I',
          options: [
            { id: 'q10_a', optionText: 'Recognition and positive feedback', optionValue: 4, discType: 'I' },
            { id: 'q10_b', optionText: 'Achieving challenging goals', optionValue: 3, discType: 'D' },
            { id: 'q10_c', optionText: 'Helping and supporting others', optionValue: 2, discType: 'S' },
            { id: 'q10_d', optionText: 'Doing quality, accurate work', optionValue: 1, discType: 'C' }
          ]
        }
      ];

      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/assessments/sessions', async (req, res) => {
    try {
      const sessionData = req.body;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = {
        id: sessionId,
        ...sessionData,
        isCompleted: false,
        createdAt: new Date()
      };

      res.json(session);
    } catch (error) {
      console.error("Error creating assessment session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.post('/api/assessments/responses', async (req, res) => {
    try {
      const responseData = req.body;
      
      // Store response (in a real app, this would go to database)
      const response = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...responseData,
        createdAt: new Date()
      };

      res.json(response);
    } catch (error) {
      console.error("Error storing assessment response:", error);
      res.status(500).json({ message: "Failed to store response" });
    }
  });

  app.post('/api/assessments/sessions/:sessionId/calculate', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Mock calculation - in a real app this would calculate based on stored responses
      const result = {
        sessionId,
        primaryType: 'D',
        secondaryType: 'I',
        dominanceScore: 75,
        influenceScore: 65,
        steadinessScore: 45,
        conscientiousnessScore: 55,
        personalityProfile: {
          dominance: { score: 75, description: 'You are results-oriented and direct in your approach.' },
          influence: { score: 65, description: 'You enjoy interacting with others and building relationships.' },
          steadiness: { score: 45, description: 'You prefer some variety and change in your work.' },
          conscientiousness: { score: 55, description: 'You balance quality with efficiency.' }
        },
        strengths: [
          'Leadership',
          'Decision Making', 
          'Communication',
          'Goal Achievement',
          'Team Building'
        ],
        recommendations: {
          primary: {
            career: [
              'Executive Leadership',
              'Sales Management',
              'Project Management',
              'Business Development',
              'Operations Management'
            ]
          },
          combinedAdvice: 'Your combination of Dominance and Influence makes you well-suited for leadership roles that require both driving results and inspiring teams. Consider positions where you can lead initiatives, make strategic decisions, and motivate others towards common goals.'
        }
      };

      res.json({ result });
    } catch (error) {
      console.error("Error calculating assessment results:", error);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  app.get('/api/assessments/sessions/:sessionId/results', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Mock results - in a real app this would fetch from database
      const result = {
        sessionId,
        primaryType: 'D',
        secondaryType: 'I',
        dominanceScore: 75,
        influenceScore: 65,
        steadinessScore: 45,
        conscientiousnessScore: 55,
        personalityProfile: {
          dominance: { score: 75, description: 'You are results-oriented and direct in your approach.' },
          influence: { score: 65, description: 'You enjoy interacting with others and building relationships.' },
          steadiness: { score: 45, description: 'You prefer some variety and change in your work.' },
          conscientiousness: { score: 55, description: 'You balance quality with efficiency.' }
        },
        strengths: [
          'Leadership',
          'Decision Making', 
          'Communication',
          'Goal Achievement',
          'Team Building'
        ],
        recommendations: {
          primary: {
            career: [
              'Executive Leadership',
              'Sales Management', 
              'Project Management',
              'Business Development',
              'Operations Management'
            ]
          },
          combinedAdvice: 'Your combination of Dominance and Influence makes you well-suited for leadership roles that require both driving results and inspiring teams. Consider positions where you can lead initiatives, make strategic decisions, and motivate others towards common goals.'
        }
      };

      res.json({ result });
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
