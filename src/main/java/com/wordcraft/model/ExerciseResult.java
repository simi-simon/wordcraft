package com.wordcraft.model;

import java.util.Map;

public class ExerciseResult {
    private Long exerciseId;
    private boolean correct;
    private int score;
    private int xpEarned;
    private String feedback;
    private Map<String, Object> details;

    public ExerciseResult() {}

    public ExerciseResult(Long exerciseId, boolean correct, int score,
                          int xpEarned, String feedback, Map<String, Object> details) {
        this.exerciseId = exerciseId;
        this.correct = correct;
        this.score = score;
        this.xpEarned = xpEarned;
        this.feedback = feedback;
        this.details = details;
    }

    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
