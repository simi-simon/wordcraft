package com.wordcraft.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserProgress {
    private int totalXp;
    private int level;
    private int streak;
    private int exercisesCompleted;
    private Map<String, Integer> completedByType;
    private Map<String, Integer> bestScoreByType;
    private List<String> achievements;

    public UserProgress() {
        this.totalXp = 0;
        this.level = 1;
        this.streak = 0;
        this.exercisesCompleted = 0;
        this.completedByType = new HashMap<>();
        this.bestScoreByType = new HashMap<>();
        this.achievements = new ArrayList<>();
    }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    public int getExercisesCompleted() { return exercisesCompleted; }
    public void setExercisesCompleted(int exercisesCompleted) { this.exercisesCompleted = exercisesCompleted; }
    public Map<String, Integer> getCompletedByType() { return completedByType; }
    public void setCompletedByType(Map<String, Integer> completedByType) { this.completedByType = completedByType; }
    public Map<String, Integer> getBestScoreByType() { return bestScoreByType; }
    public void setBestScoreByType(Map<String, Integer> bestScoreByType) { this.bestScoreByType = bestScoreByType; }
    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }

    public int getXpForNextLevel() {
        return level * 100;
    }

    public int getCurrentLevelXp() {
        int xpNeeded = 0;
        for (int i = 1; i < level; i++) {
            xpNeeded += i * 100;
        }
        return totalXp - xpNeeded;
    }
}
