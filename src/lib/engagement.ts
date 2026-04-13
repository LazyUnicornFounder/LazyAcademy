import { supabase } from "@/integrations/supabase/client";

export const BADGE_CONFIG: Record<string, { label: string; emoji: string; description: string }> = {
  first_lesson: { label: "First Steps", emoji: "🌱", description: "Complete your first lesson" },
  week_complete: { label: "Week Warrior", emoji: "⚔️", description: "Complete a full module" },
  streak_3: { label: "On Fire", emoji: "🔥", description: "3-day streak" },
  streak_7: { label: "Unstoppable", emoji: "💪", description: "7-day streak" },
  streak_30: { label: "Legend", emoji: "👑", description: "30-day streak" },
  quiz_master: { label: "Quiz Master", emoji: "🧠", description: "5 perfect quizzes" },
  explorer: { label: "Explorer", emoji: "🧭", description: "Try 5+ different interests" },
  speed_learner: { label: "Speed Learner", emoji: "⚡", description: "Complete 3 lessons in one day" },
};

export const ACCESSORY_UNLOCKS: { level: number; id: string; label: string; emoji: string }[] = [
  { level: 5, id: "hat", label: "Top Hat", emoji: "🎩" },
  { level: 10, id: "cape", label: "Cape", emoji: "🦸" },
  { level: 15, id: "glasses", label: "Cool Glasses", emoji: "😎" },
  { level: 20, id: "crown", label: "Royal Crown", emoji: "👑" },
  { level: 25, id: "wings", label: "Wings", emoji: "🪽" },
];

export const XP_VALUES = {
  lesson: 10,
  dailyChallenge: 30,
  perfectQuiz: 25,
  moduleComplete: 50,
  streakMultiplier: 5,
};

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForNextLevel(xp: number): { current: number; needed: number } {
  const currentLevelXp = xp % 100;
  return { current: currentLevelXp, needed: 100 };
}

export function getUnlockedAccessories(level: number) {
  return ACCESSORY_UNLOCKS.filter((a) => level >= a.level);
}

export interface EngagementResult {
  xpGained: number;
  newXpTotal: number;
  oldLevel: number;
  newLevel: number;
  newBadges: string[];
  isModuleComplete: boolean;
}

export async function awardLessonCompletion(
  childId: string,
  lessonId: string,
  moduleId: string,
  isDailyChallenge: boolean,
  quizScore?: { correct: number; total: number }
): Promise<EngagementResult> {
  // Get or create rewards
  let { data: rewards } = await supabase
    .from("child_rewards")
    .select("*")
    .eq("child_id", childId)
    .single();

  if (!rewards) {
    const { data: created } = await supabase
      .from("child_rewards")
      .insert({ child_id: childId, xp_total: 0, level: 1 })
      .select()
      .single();
    rewards = created!;
  }

  const oldLevel = rewards.level;
  let xpGained = isDailyChallenge ? XP_VALUES.dailyChallenge : XP_VALUES.lesson;

  // Perfect quiz bonus
  if (quizScore && quizScore.correct === quizScore.total && quizScore.total > 0) {
    xpGained += XP_VALUES.perfectQuiz;
  }

  // Streak bonus
  const { data: prog } = await supabase
    .from("child_progress")
    .select("current_streak")
    .eq("child_id", childId)
    .single();
  if (prog) {
    xpGained += prog.current_streak * XP_VALUES.streakMultiplier;
  }

  const newXpTotal = rewards.xp_total + xpGained;
  const newLevel = calculateLevel(newXpTotal);

  await supabase
    .from("child_rewards")
    .update({ xp_total: newXpTotal, level: newLevel })
    .eq("child_id", childId);

  // Check badges
  const newBadges: string[] = [];
  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("child_id", childId);
  const earned = new Set((existingBadges || []).map((b) => b.badge_type));

  // First Steps
  if (!earned.has("first_lesson")) {
    newBadges.push("first_lesson");
  }

  // Streak badges
  const streak = prog?.current_streak || 1;
  if (streak >= 3 && !earned.has("streak_3")) newBadges.push("streak_3");
  if (streak >= 7 && !earned.has("streak_7")) newBadges.push("streak_7");
  if (streak >= 30 && !earned.has("streak_30")) newBadges.push("streak_30");

  // Speed Learner — 3 lessons completed today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (!earned.has("speed_learner")) {
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("child_id", childId)
      .eq("completed", true)
      .gte("completed_at", todayStart.toISOString());
    if ((count || 0) >= 3) newBadges.push("speed_learner");
  }

  // Quiz Master — 5 perfect quizzes (approximation: count quizzes completed)
  if (quizScore && quizScore.correct === quizScore.total && !earned.has("quiz_master")) {
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("child_id", childId)
      .eq("type", "quiz")
      .eq("completed", true);
    if ((count || 0) >= 5) newBadges.push("quiz_master");
  }

  // Check module completion
  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, completed")
    .eq("module_id", moduleId);
  const allComplete = moduleLessons?.every((l) => l.id === lessonId || l.completed) || false;

  if (allComplete) {
    xpGained += XP_VALUES.moduleComplete;
    const finalXp = rewards.xp_total + xpGained;
    const finalLevel = calculateLevel(finalXp);
    await supabase
      .from("child_rewards")
      .update({ xp_total: finalXp, level: finalLevel })
      .eq("child_id", childId);

    if (!earned.has("week_complete")) newBadges.push("week_complete");

    // Explorer badge — check unique module themes
    if (!earned.has("explorer")) {
      const { data: mods } = await supabase
        .from("curriculum_modules")
        .select("title")
        .eq("child_id", childId)
        .eq("status", "completed");
      if ((mods?.length || 0) >= 5) newBadges.push("explorer");
    }
  }

  // Insert new badges
  if (newBadges.length > 0) {
    await supabase.from("badges").insert(
      newBadges.map((bt) => ({ child_id: childId, badge_type: bt }))
    );
  }

  return {
    xpGained,
    newXpTotal: allComplete ? rewards.xp_total + xpGained : newXpTotal,
    oldLevel,
    newLevel: allComplete ? calculateLevel(rewards.xp_total + xpGained) : newLevel,
    newBadges,
    isModuleComplete: allComplete,
  };
}
