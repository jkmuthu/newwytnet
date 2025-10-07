import { db } from '../db';
import { 
  profileCompletion,
  type ProfileCompletion,
  type InsertProfileCompletion 
} from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { pointsService } from './pointsService';

// Points awarded per profile section
const SECTION_POINTS = {
  basic_info: 5,
  demographics: 5,
  photo_upload: 10,
  first_need: 10,
  first_offer: 10,
};

// Section weights for completion percentage
const SECTION_WEIGHTS = {
  basic_info: 20,
  demographics: 20,
  photo_upload: 20,
  first_need: 20,
  first_offer: 20,
};

export class ProfileCompletionService {
  /**
   * Get or create user's profile completion record
   */
  async getOrCreateCompletion(userId: string, tenantId?: string): Promise<ProfileCompletion> {
    const existing = await db.select()
      .from(profileCompletion)
      .where(eq(profileCompletion.userId, userId))
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

    const [completion] = await db.insert(profileCompletion).values({
      userId,
      tenantId: tenantId || null,
      completionPercentage: 0,
      sectionsCompleted: [],
      totalPointsEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return completion;
  }

  /**
   * Mark a section as completed and award points
   */
  async completeSection(
    userId: string, 
    section: keyof typeof SECTION_POINTS,
    tenantId?: string
  ): Promise<ProfileCompletion> {
    const completion = await this.getOrCreateCompletion(userId, tenantId);

    // Check if section already completed
    const sectionsCompleted = (completion.sectionsCompleted as string[]) || [];
    if (sectionsCompleted.includes(section)) {
      return completion; // Already completed, no points awarded
    }

    // Add section to completed list
    const newSectionsCompleted = [...sectionsCompleted, section];
    
    // Calculate new completion percentage
    const completionPercentage = this.calculateCompletionPercentage(newSectionsCompleted);
    
    // Get points for this section
    const pointsAwarded = SECTION_POINTS[section] || 0;
    const newTotalPoints = completion.totalPointsEarned + pointsAwarded;

    // Update completion record
    const [updated] = await db.update(profileCompletion)
      .set({
        sectionsCompleted: newSectionsCompleted,
        completionPercentage,
        totalPointsEarned: newTotalPoints,
        completedAt: completionPercentage === 100 ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(profileCompletion.userId, userId))
      .returning();

    // Award points to user's WytPoints wallet
    if (pointsAwarded > 0) {
      await pointsService.creditPoints({
        userId,
        amount: pointsAwarded,
        type: 'profile_completion',
        description: `Profile completion: ${section.replace('_', ' ')}`,
        metadata: { section, completionPercentage },
      });
    }

    // Bonus points for 100% completion
    if (completionPercentage === 100 && completion.completionPercentage < 100) {
      const bonusPoints = 50; // Big bonus for full completion
      await pointsService.creditPoints({
        userId,
        amount: bonusPoints,
        type: 'profile_completion_bonus',
        description: 'Bonus for 100% profile completion!',
        metadata: { completionPercentage: 100 },
      });
    }

    console.log(`[ProfileCompletionService] Completed section '${section}' for user ${userId}, awarded ${pointsAwarded} points`);
    return updated;
  }

  /**
   * Calculate completion percentage based on completed sections
   */
  private calculateCompletionPercentage(sectionsCompleted: string[]): number {
    if (sectionsCompleted.length === 0) return 0;

    let totalWeight = 0;
    sectionsCompleted.forEach(section => {
      totalWeight += SECTION_WEIGHTS[section as keyof typeof SECTION_WEIGHTS] || 0;
    });

    return Math.min(100, totalWeight);
  }

  /**
   * Get user's completion status
   */
  async getCompletionStatus(userId: string): Promise<{
    completion: ProfileCompletion;
    nextSections: string[];
    canAccessMatches: boolean;
  }> {
    const completion = await this.getOrCreateCompletion(userId);
    const sectionsCompleted = (completion.sectionsCompleted as string[]) || [];

    // Determine next sections to complete
    const allSections = Object.keys(SECTION_POINTS);
    const nextSections = allSections.filter(s => !sectionsCompleted.includes(s));

    // Can access matches if profile is at least 70% complete
    const canAccessMatches = completion.completionPercentage >= 70;

    return {
      completion,
      nextSections,
      canAccessMatches,
    };
  }

  /**
   * Check if a specific section is completed
   */
  async isSectionCompleted(userId: string, section: string): Promise<boolean> {
    const completion = await this.getOrCreateCompletion(userId);
    const sectionsCompleted = (completion.sectionsCompleted as string[]) || [];
    return sectionsCompleted.includes(section);
  }

  /**
   * Get all incomplete sections for a user
   */
  async getIncompleteSections(userId: string): Promise<{
    section: string;
    points: number;
    weight: number;
  }[]> {
    const completion = await this.getOrCreateCompletion(userId);
    const sectionsCompleted = (completion.sectionsCompleted as string[]) || [];

    const allSections = Object.keys(SECTION_POINTS);
    const incompleteSections = allSections
      .filter(s => !sectionsCompleted.includes(s))
      .map(section => ({
        section,
        points: SECTION_POINTS[section as keyof typeof SECTION_POINTS] || 0,
        weight: SECTION_WEIGHTS[section as keyof typeof SECTION_WEIGHTS] || 0,
      }));

    return incompleteSections;
  }

  /**
   * Get completion statistics
   */
  async getCompletionStats(): Promise<{
    totalUsers: number;
    fullyCompleted: number;
    averageCompletion: number;
  }> {
    const allCompletions = await db.select()
      .from(profileCompletion);

    const totalUsers = allCompletions.length;
    const fullyCompleted = allCompletions.filter(c => c.completionPercentage === 100).length;
    const averageCompletion = totalUsers > 0 
      ? allCompletions.reduce((sum, c) => sum + c.completionPercentage, 0) / totalUsers 
      : 0;

    return {
      totalUsers,
      fullyCompleted,
      averageCompletion: Math.round(averageCompletion),
    };
  }

  /**
   * Auto-complete sections based on user actions
   * This can be called from various parts of the app
   */
  async autoCompleteSection(userId: string, section: keyof typeof SECTION_POINTS): Promise<void> {
    const isCompleted = await this.isSectionCompleted(userId, section);
    if (!isCompleted) {
      await this.completeSection(userId, section);
    }
  }
}

export const profileCompletionService = new ProfileCompletionService();
