import { db } from "./db";
import {
  assessmentCategories,
  assessmentQuestions,
  assessmentOptions,
  assessmentSessions,
  assessmentResponses,
  assessmentResults,
  type AssessmentCategory,
  type AssessmentQuestion,
  type AssessmentOption,
  type AssessmentSession,
  type AssessmentResponse,
  type AssessmentResult,
  type InsertAssessmentSession,
  type InsertAssessmentResponse,
  type InsertAssessmentResult,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class AssessmentService {
  // Initialize default categories and questions
  async initializeDefaultData() {
    // Check if data already exists
    const existingCategories = await db.select().from(assessmentCategories).limit(1);
    if (existingCategories.length > 0) {
      return; // Data already initialized
    }

    // Create default categories
    const categories = [
      { name: 'student', displayName: 'Student', description: 'Currently pursuing education' },
      { name: 'job_seeker', displayName: 'Job Seeker', description: 'Looking for employment opportunities' },
      { name: 'freelancer', displayName: 'Freelancer', description: 'Independent contractor or consultant' },
      { name: 'volunteer', displayName: 'Volunteer', description: 'Community service and volunteer work' },
      { name: 'self_employed', displayName: 'Self-Employed', description: 'Running own business' },
      { name: 'parent', displayName: 'Parent', description: 'Parenting and family management' },
      { name: 'startup_entrepreneur', displayName: 'Startup Entrepreneur', description: 'Building startup ventures' },
      { name: 'corporate_leader', displayName: 'Corporate Leader', description: 'Management and leadership roles' },
      { name: 'educator', displayName: 'Educator/Trainer', description: 'Teaching and training roles' },
      { name: 'expert_consultant', displayName: 'Expert/Consultant', description: 'Subject matter expertise and consulting' },
    ];

    const insertedCategories = await db.insert(assessmentCategories).values(categories).returning();

    // Create sample DISC questions
    const questions = [
      // General DISC questions
      { categoryId: null, questionNumber: 1, questionText: "When facing a challenge, I tend to:", language: 'en', discType: 'D', weight: '1.00' },
      { categoryId: null, questionNumber: 2, questionText: "In social situations, I usually:", language: 'en', discType: 'I', weight: '1.00' },
      { categoryId: null, questionNumber: 3, questionText: "When working in a team, I prefer to:", language: 'en', discType: 'S', weight: '1.00' },
      { categoryId: null, questionNumber: 4, questionText: "When making decisions, I:", language: 'en', discType: 'C', weight: '1.00' },
      { categoryId: null, questionNumber: 5, questionText: "Under pressure, I tend to:", language: 'en', discType: 'D', weight: '1.00' },
      { categoryId: null, questionNumber: 6, questionText: "When communicating with others, I:", language: 'en', discType: 'I', weight: '1.00' },
      { categoryId: null, questionNumber: 7, questionText: "In my work environment, I prefer:", language: 'en', discType: 'S', weight: '1.00' },
      { categoryId: null, questionNumber: 8, questionText: "When analyzing information, I:", language: 'en', discType: 'C', weight: '1.00' },
      { categoryId: null, questionNumber: 9, questionText: "My approach to change is:", language: 'en', discType: 'D', weight: '1.00' },
      { categoryId: null, questionNumber: 10, questionText: "When motivating others, I:", language: 'en', discType: 'I', weight: '1.00' },
      { categoryId: null, questionNumber: 11, questionText: "In conflict situations, I:", language: 'en', discType: 'S', weight: '1.00' },
      { categoryId: null, questionNumber: 12, questionText: "When setting standards, I:", language: 'en', discType: 'C', weight: '1.00' },
      { categoryId: null, questionNumber: 13, questionText: "My leadership style is:", language: 'en', discType: 'D', weight: '1.00' },
      { categoryId: null, questionNumber: 14, questionText: "When building relationships, I:", language: 'en', discType: 'I', weight: '1.00' },
      { categoryId: null, questionNumber: 15, questionText: "My preferred pace of work is:", language: 'en', discType: 'S', weight: '1.00' },
    ];

    const insertedQuestions = await db.insert(assessmentQuestions).values(questions).returning();

    // Create options for each question
    const options = [];
    for (const question of insertedQuestions) {
      const questionOptions = this.getOptionsForQuestion(question.questionNumber, question.id);
      options.push(...questionOptions);
    }

    await db.insert(assessmentOptions).values(options);
  }

  private getOptionsForQuestion(questionNumber: number, questionId: string) {
    const optionSets: Record<number, Array<{optionText: string, optionValue: number, discType: string}>> = {
      1: [
        { optionText: "Take charge and act decisively", optionValue: 4, discType: 'D' },
        { optionText: "Gather people to brainstorm solutions", optionValue: 3, discType: 'I' },
        { optionText: "Consider all stakeholders carefully", optionValue: 2, discType: 'S' },
        { optionText: "Analyze all possible outcomes first", optionValue: 1, discType: 'C' },
      ],
      2: [
        { optionText: "Lead conversations and energize others", optionValue: 4, discType: 'I' },
        { optionText: "Take control of the situation", optionValue: 3, discType: 'D' },
        { optionText: "Listen and support others", optionValue: 2, discType: 'S' },
        { optionText: "Observe and contribute thoughtfully", optionValue: 1, discType: 'C' },
      ],
      3: [
        { optionText: "Support team harmony and collaboration", optionValue: 4, discType: 'S' },
        { optionText: "Ensure quality and accuracy", optionValue: 3, discType: 'C' },
        { optionText: "Drive results and efficiency", optionValue: 2, discType: 'D' },
        { optionText: "Motivate and inspire the team", optionValue: 1, discType: 'I' },
      ],
      4: [
        { optionText: "Gather and analyze detailed information", optionValue: 4, discType: 'C' },
        { optionText: "Consider impact on relationships", optionValue: 3, discType: 'S' },
        { optionText: "Make quick, bold decisions", optionValue: 2, discType: 'D' },
        { optionText: "Seek input from others", optionValue: 1, discType: 'I' },
      ],
      5: [
        { optionText: "Become more focused and driven", optionValue: 4, discType: 'D' },
        { optionText: "Rally others for support", optionValue: 3, discType: 'I' },
        { optionText: "Remain calm and steady", optionValue: 2, discType: 'S' },
        { optionText: "Systematically work through issues", optionValue: 1, discType: 'C' },
      ],
      6: [
        { optionText: "Speak with enthusiasm and passion", optionValue: 4, discType: 'I' },
        { optionText: "Be direct and to the point", optionValue: 3, discType: 'D' },
        { optionText: "Listen carefully and respond thoughtfully", optionValue: 2, discType: 'S' },
        { optionText: "Provide detailed and accurate information", optionValue: 1, discType: 'C' },
      ],
      7: [
        { optionText: "Stable, predictable routines", optionValue: 4, discType: 'S' },
        { optionText: "High standards and quality focus", optionValue: 3, discType: 'C' },
        { optionText: "Fast-paced, results-oriented", optionValue: 2, discType: 'D' },
        { optionText: "Dynamic, people-centered atmosphere", optionValue: 1, discType: 'I' },
      ],
      8: [
        { optionText: "Research thoroughly and verify facts", optionValue: 4, discType: 'C' },
        { optionText: "Consider how it affects team dynamics", optionValue: 3, discType: 'S' },
        { optionText: "Focus on key points and act quickly", optionValue: 2, discType: 'D' },
        { optionText: "Discuss with others to gain insights", optionValue: 1, discType: 'I' },
      ],
      9: [
        { optionText: "Embrace it as an opportunity to lead", optionValue: 4, discType: 'D' },
        { optionText: "Get excited about new possibilities", optionValue: 3, discType: 'I' },
        { optionText: "Need time to adjust and adapt", optionValue: 2, discType: 'S' },
        { optionText: "Carefully evaluate risks and benefits", optionValue: 1, discType: 'C' },
      ],
      10: [
        { optionText: "Inspire with vision and enthusiasm", optionValue: 4, discType: 'I' },
        { optionText: "Set clear goals and drive results", optionValue: 3, discType: 'D' },
        { optionText: "Support and encourage their growth", optionValue: 2, discType: 'S' },
        { optionText: "Provide clear guidelines and feedback", optionValue: 1, discType: 'C' },
      ],
      11: [
        { optionText: "Work to maintain relationships and find common ground", optionValue: 4, discType: 'S' },
        { optionText: "Focus on facts and find logical solutions", optionValue: 3, discType: 'C' },
        { optionText: "Address issues head-on and resolve quickly", optionValue: 2, discType: 'D' },
        { optionText: "Try to lighten the mood and bring people together", optionValue: 1, discType: 'I' },
      ],
      12: [
        { optionText: "Establish precise, detailed criteria", optionValue: 4, discType: 'C' },
        { optionText: "Consider what works best for the team", optionValue: 3, discType: 'S' },
        { optionText: "Set high expectations for results", optionValue: 2, discType: 'D' },
        { optionText: "Focus on inspiring excellence in others", optionValue: 1, discType: 'I' },
      ],
      13: [
        { optionText: "Decisive and results-focused", optionValue: 4, discType: 'D' },
        { optionText: "Motivational and people-focused", optionValue: 3, discType: 'I' },
        { optionText: "Supportive and collaborative", optionValue: 2, discType: 'S' },
        { optionText: "Systematic and quality-focused", optionValue: 1, discType: 'C' },
      ],
      14: [
        { optionText: "Connect through shared experiences and fun", optionValue: 4, discType: 'I' },
        { optionText: "Focus on achieving mutual goals", optionValue: 3, discType: 'D' },
        { optionText: "Build trust through consistency and support", optionValue: 2, discType: 'S' },
        { optionText: "Develop respect through competence and reliability", optionValue: 1, discType: 'C' },
      ],
      15: [
        { optionText: "Steady and consistent", optionValue: 4, discType: 'S' },
        { optionText: "Methodical and thorough", optionValue: 3, discType: 'C' },
        { optionText: "Fast and efficient", optionValue: 2, discType: 'D' },
        { optionText: "Varied and dynamic", optionValue: 1, discType: 'I' },
      ],
    };

    const questionOptions = optionSets[questionNumber];
    
    return questionOptions.map(option => ({
      questionId,
      optionText: option.optionText,
      optionValue: option.optionValue,
      discType: option.discType,
      language: 'en',
    }));
  }

  // Get all categories
  async getCategories(): Promise<AssessmentCategory[]> {
    return await db.select().from(assessmentCategories).where(eq(assessmentCategories.isActive, true));
  }

  // Get questions for assessment with randomization
  async getQuestions(categoryId?: string, language = 'en'): Promise<(AssessmentQuestion & { options: AssessmentOption[] })[]> {
    const questionsQuery = db.select().from(assessmentQuestions)
      .where(and(
        eq(assessmentQuestions.isActive, true),
        eq(assessmentQuestions.language, language),
        categoryId ? eq(assessmentQuestions.categoryId, categoryId) : sql`${assessmentQuestions.categoryId} IS NULL`
      ))
      .orderBy(assessmentQuestions.questionNumber);

    const questions = await questionsQuery;

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db.select().from(assessmentOptions)
          .where(and(
            eq(assessmentOptions.questionId, question.id),
            eq(assessmentOptions.language, language)
          ));
        
        // Randomize option order for each question
        const shuffledOptions = this.shuffleArray([...options]);
        
        return { ...question, options: shuffledOptions };
      })
    );

    // Randomize question order while maintaining question numbers for tracking
    const shuffledQuestions = this.shuffleArray([...questionsWithOptions]);
    
    // Re-assign display order while keeping original questionNumber for tracking
    const questionsWithRandomOrder = shuffledQuestions.map((question, index) => ({
      ...question,
      displayOrder: index + 1
    }));

    return questionsWithRandomOrder;
  }

  // Helper function to shuffle arrays
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Create assessment session
  async createSession(sessionData: InsertAssessmentSession): Promise<AssessmentSession> {
    const [session] = await db.insert(assessmentSessions).values(sessionData).returning();
    return session;
  }

  // Save assessment response
  async saveResponse(responseData: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [response] = await db.insert(assessmentResponses).values(responseData).returning();
    return response;
  }

  // Calculate and save results
  async calculateAndSaveResults(sessionId: string): Promise<AssessmentResult> {
    // Get all responses for this session
    const responses = await db.select({
      responseValue: assessmentResponses.responseValue,
      discType: assessmentOptions.discType,
    })
    .from(assessmentResponses)
    .innerJoin(assessmentOptions, eq(assessmentResponses.optionId, assessmentOptions.id))
    .where(eq(assessmentResponses.sessionId, sessionId));

    // Calculate scores for each DISC type
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    responses.forEach(response => {
      scores[response.discType as keyof typeof scores] += response.responseValue;
    });

    // Calculate percentages
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100),
    };

    // Determine primary and secondary types
    const sortedTypes = Object.entries(percentages)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type);

    const primaryType = sortedTypes[0];
    const secondaryType = sortedTypes[1];

    // Generate personality insights
    const personalityProfile = this.generatePersonalityProfile(percentages);
    const recommendations = this.generateRecommendations(primaryType, secondaryType);
    const strengths = this.generateStrengths(primaryType, secondaryType);
    const developmentAreas = this.generateDevelopmentAreas(primaryType, secondaryType);
    const workStyle = this.generateWorkStyle(primaryType, secondaryType);

    const resultData: InsertAssessmentResult = {
      sessionId,
      dominanceScore: percentages.D.toString(),
      influenceScore: percentages.I.toString(),
      steadinessScore: percentages.S.toString(),
      conscientiousnessScore: percentages.C.toString(),
      primaryType,
      secondaryType,
      personalityProfile,
      recommendations,
      strengths,
      developmentAreas,
      workStyle,
    };

    const [result] = await db.insert(assessmentResults).values(resultData).returning();

    // Mark session as completed
    await db.update(assessmentSessions)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(assessmentSessions.id, sessionId));

    return result;
  }

  // Get assessment result
  async getResult(sessionId: string): Promise<AssessmentResult | undefined> {
    const [result] = await db.select().from(assessmentResults)
      .where(eq(assessmentResults.sessionId, sessionId));
    return result;
  }

  // Get session with result
  async getSessionWithResult(sessionId: string): Promise<(AssessmentSession & { result?: AssessmentResult }) | undefined> {
    const [session] = await db.select().from(assessmentSessions)
      .where(eq(assessmentSessions.id, sessionId));
    
    if (!session) return undefined;

    const result = await this.getResult(sessionId);
    return { ...session, result };
  }

  private generatePersonalityProfile(percentages: Record<string, number>) {
    return {
      dominance: {
        score: percentages.D,
        description: percentages.D > 25 ? 
          "You tend to be direct, decisive, and results-oriented. You like to take charge and drive towards goals." :
          "You may prefer collaborative approaches and tend to be more consultative in your decision-making."
      },
      influence: {
        score: percentages.I,
        description: percentages.I > 25 ?
          "You are likely outgoing, optimistic, and people-focused. You enjoy social interaction and inspiring others." :
          "You may prefer smaller groups and more structured communication styles."
      },
      steadiness: {
        score: percentages.S,
        description: percentages.S > 25 ?
          "You value stability, cooperation, and supportive relationships. You prefer consistent environments." :
          "You may be more comfortable with change and faster-paced environments."
      },
      conscientiousness: {
        score: percentages.C,
        description: percentages.C > 25 ?
          "You focus on quality, accuracy, and systematic approaches. You prefer detailed analysis and high standards." :
          "You may be more comfortable with flexible approaches and quick decision-making."
      }
    };
  }

  private generateRecommendations(primaryType: string, secondaryType: string) {
    const recommendations: Record<string, any> = {
      D: {
        career: ["Leadership roles", "Entrepreneurship", "Sales management", "Project management"],
        environment: "Fast-paced, results-oriented environments with autonomy",
        communication: "Direct, concise communication with focus on outcomes"
      },
      I: {
        career: ["Sales", "Marketing", "Training", "Public relations", "Team leadership"],
        environment: "Collaborative, social environments with variety and interaction",
        communication: "Enthusiastic, people-focused communication with recognition"
      },
      S: {
        career: ["Human resources", "Customer service", "Healthcare", "Education", "Support roles"],
        environment: "Stable, cooperative environments with clear expectations",
        communication: "Supportive, patient communication with personal connection"
      },
      C: {
        career: ["Analysis", "Quality assurance", "Research", "Engineering", "Accounting"],
        environment: "Structured, detail-oriented environments with high standards",
        communication: "Data-driven, precise communication with thorough documentation"
      }
    };

    return {
      primary: recommendations[primaryType],
      secondary: recommendations[secondaryType],
      combinedAdvice: `As a ${primaryType}${secondaryType} type, you blend ${primaryType} traits with ${secondaryType} characteristics, giving you a unique advantage in roles that require both skill sets.`
    };
  }

  private generateStrengths(primaryType: string, secondaryType: string) {
    const strengths: Record<string, string[]> = {
      D: ["Results-oriented", "Decisive", "Confident", "Direct", "Goal-focused"],
      I: ["Enthusiastic", "Persuasive", "Optimistic", "People-oriented", "Inspiring"],
      S: ["Patient", "Reliable", "Supportive", "Team-oriented", "Calm"],
      C: ["Analytical", "Accurate", "Systematic", "Quality-focused", "Thorough"]
    };

    return [
      ...strengths[primaryType],
      ...strengths[secondaryType]?.slice(0, 2) || []
    ];
  }

  private generateDevelopmentAreas(primaryType: string, secondaryType: string) {
    const developmentAreas: Record<string, string[]> = {
      D: ["Patience with others", "Collaborative decision-making", "Attention to detail"],
      I: ["Focus on tasks", "Following through", "Analytical thinking"],
      S: ["Adapting to change", "Assertiveness", "Time management"],
      C: ["Flexibility", "Risk-taking", "Social interaction"]
    };

    return developmentAreas[primaryType] || [];
  }

  private generateWorkStyle(primaryType: string, secondaryType: string) {
    const workStyles: Record<string, any> = {
      D: {
        pace: "Fast",
        focus: "Results and efficiency",
        communication: "Direct and brief",
        decisionMaking: "Quick and autonomous"
      },
      I: {
        pace: "Varied",
        focus: "People and relationships", 
        communication: "Enthusiastic and expressive",
        decisionMaking: "Collaborative and intuitive"
      },
      S: {
        pace: "Steady",
        focus: "Harmony and support",
        communication: "Patient and personal",
        decisionMaking: "Consensus-building"
      },
      C: {
        pace: "Methodical",
        focus: "Quality and accuracy",
        communication: "Detailed and precise",
        decisionMaking: "Data-driven and thorough"
      }
    };

    return workStyles[primaryType];
  }
}