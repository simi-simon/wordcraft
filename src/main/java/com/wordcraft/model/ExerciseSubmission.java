package com.wordcraft.model;

import java.util.Map;

public class ExerciseSubmission {
    private Long exerciseId;
    private ExerciseType type;
    private String answer;
    private Map<String, Object> details;

    public ExerciseSubmission() {}

    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
    public ExerciseType getType() { return type; }
    public void setType(ExerciseType type) { this.type = type; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
