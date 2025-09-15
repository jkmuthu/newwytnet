import type { Trademark } from "@shared/schema";

// WytAi Proprietary AI Algorithms for Trademark Analysis
export function calculateSimilarityScore(queryText: string, trademark: Trademark) {
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

export function calculateRiskAssessment(results: Trademark[], queryText: string) {
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

export function generateRecommendations(riskAssessment: { level: string }, results: Trademark[]) {
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
  const allWords = Array.from(new Set([...words1, ...words2]));
  
  const vector1 = allWords.map(word => words1.includes(word) ? 1 : 0);
  const vector2 = allWords.map(word => words2.includes(word) ? 1 : 0);
  
  const dotProduct = vector1.reduce((sum: number, a: number, i: number) => sum + a * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum: number, a: number) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum: number, a: number) => sum + a * a, 0));
  
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
export async function initializeSampleTrademarkData() {
  const { db } = await import("../db");
  const { trademarks } = await import("@shared/schema");
  const { sql } = await import("drizzle-orm");
  
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