package com.wordcraft.model;

import java.util.Map;

public class Exercise {
    private Long id;
    private ExerciseType type;
    private int difficulty;
    private String title;
    private String instruction;
    private int xpReward;
    private Map<String, Object> data;

    public Exercise() {}

    public Exercise(Long id, ExerciseType type, int difficulty, String title,
                    String instruction, int xpReward, Map<String, Object> data) {
        this.id = id;
        this.type = type;
        this.difficulty = difficulty;
        this.title = title;
        this.instruction = instruction;
        this.xpReward = xpReward;
        this.data = data;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ExerciseType getType() { return type; }
    public void setType(ExerciseType type) { this.type = type; }
    public int getDifficulty() { return difficulty; }
    public void setDifficulty(int difficulty) { this.difficulty = difficulty; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }
    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
