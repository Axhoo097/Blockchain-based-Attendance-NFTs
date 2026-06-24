import { IAIAnalysis } from '../models/Post';

/** Calculate additional reputation points from AI analysis */
export function calculateAIReputation(analysis: IAIAnalysis): number {
  let points = 0;

  // +20 for each distinct technical skill detected (max 3 skills = 60 pts)
  const techSkills = analysis.skillsDetected.slice(0, 3);
  points += techSkills.length * 20;

  // Bonus for high score
  if (analysis.score >= 80) points += 10;
  else if (analysis.score >= 60) points += 5;

  // Bonus for advanced/expert level
  if (analysis.experienceLevel === 'expert')      points += 15;
  else if (analysis.experienceLevel === 'advanced') points += 10;

  return points;
}

/** Point awards table */
export const REPUTATION_POINTS = {
  PROFILE_CREATED:    10,
  POST_CREATED:       5,
  AI_SKILL_DETECTED:  20,
  VERIFIED_ACHIEVEMENT: 30,
} as const;
