package com.wordcraft.service;

import com.wordcraft.model.ExerciseType;
import com.wordcraft.model.UserProgress;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProgressService {

    private final UserProgress progress = new UserProgress();

    public synchronized UserProgress getProgress() {
        return progress;
    }

    public synchronized UserProgress addXp(int xp, ExerciseType type, int score) {
        progress.setTotalXp(progress.getTotalXp() + Math.max(0, xp));
        progress.setExercisesCompleted(progress.getExercisesCompleted() + 1);
        progress.setStreak(progress.getStreak() + 1);

        // Update completed count and best score by type
        if (type != null) {
            String typeName = type.name();
            progress.getCompletedByType().merge(typeName, 1, Integer::sum);

            Integer currentBest = progress.getBestScoreByType().get(typeName);
            if (currentBest == null || score > currentBest) {
                progress.getBestScoreByType().put(typeName, score);
            }
        }

        // Level up check
        while (progress.getCurrentLevelXp() >= progress.getXpForNextLevel()) {
            progress.setLevel(progress.getLevel() + 1);
        }

        // Achievement checks
        checkAchievements();

        return progress;
    }

    public synchronized UserProgress resetProgress() {
        progress.setTotalXp(0);
        progress.setLevel(1);
        progress.setStreak(0);
        progress.setExercisesCompleted(0);
        progress.getCompletedByType().clear();
        progress.getBestScoreByType().clear();
        progress.getAchievements().clear();
        return progress;
    }

    private void checkAchievements() {
        List<String> achievements = progress.getAchievements();

        // First exercise
        if (progress.getExercisesCompleted() >= 1 && !achievements.contains("FIRST_STEP")) {
            achievements.add("FIRST_STEP");
        }
        // 10 exercises
        if (progress.getExercisesCompleted() >= 10 && !achievements.contains("GETTING_STARTED")) {
            achievements.add("GETTING_STARTED");
        }
        // 25 exercises
        if (progress.getExercisesCompleted() >= 25 && !achievements.contains("DEDICATED_LEARNER")) {
            achievements.add("DEDICATED_LEARNER");
        }
        // 50 exercises
        if (progress.getExercisesCompleted() >= 50 && !achievements.contains("WORD_WARRIOR")) {
            achievements.add("WORD_WARRIOR");
        }
        // 100 exercises
        if (progress.getExercisesCompleted() >= 100 && !achievements.contains("MASTER_CRAFTER")) {
            achievements.add("MASTER_CRAFTER");
        }
        // Level 5
        if (progress.getLevel() >= 5 && !achievements.contains("LEVEL_5")) {
            achievements.add("LEVEL_5");
        }
        // Level 10
        if (progress.getLevel() >= 10 && !achievements.contains("LEVEL_10")) {
            achievements.add("LEVEL_10");
        }
        // Streak of 5
        if (progress.getStreak() >= 5 && !achievements.contains("ON_FIRE")) {
            achievements.add("ON_FIRE");
        }
        // Streak of 10
        if (progress.getStreak() >= 10 && !achievements.contains("UNSTOPPABLE")) {
            achievements.add("UNSTOPPABLE");
        }
        // Tried all types
        if (progress.getCompletedByType().size() >= ExerciseType.values().length
                && !achievements.contains("EXPLORER")) {
            achievements.add("EXPLORER");
        }
    }
}
