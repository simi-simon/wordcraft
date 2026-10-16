package com.wordcraft.controller;

import com.wordcraft.model.*;
import com.wordcraft.service.ExerciseService;
import com.wordcraft.service.ProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final ProgressService progressService;

    public ExerciseController(ExerciseService exerciseService, ProgressService progressService) {
        this.exerciseService = exerciseService;
        this.progressService = progressService;
    }

    @GetMapping("/types")
    public List<Map<String, Object>> getExerciseTypes() {
        return exerciseService.getExerciseTypes();
    }

    @GetMapping("/{type}")
    public List<Exercise> getExercisesByType(@PathVariable String type) {
        try {
            ExerciseType exerciseType = ExerciseType.valueOf(type.replace('-', '_').toUpperCase());
            return exerciseService.getExercisesByType(exerciseType);
        } catch (IllegalArgumentException e) {
            return java.util.Collections.emptyList();
        }
    }

    @GetMapping("/single/{id}")
    public Exercise getExerciseById(@PathVariable Long id) {
        return exerciseService.getExerciseById(id);
    }

    @PostMapping("/submit")
    public Map<String, Object> submitExercise(@RequestBody ExerciseSubmission submission) {
        ExerciseResult result = exerciseService.evaluateSubmission(submission);

        // Update progress
        Exercise exercise = exerciseService.getExerciseById(submission.getExerciseId());
        if (exercise != null) {
            progressService.addXp(result.getXpEarned(), exercise.getType(), result.getScore());
        }

        UserProgress progress = progressService.getProgress();

        return Map.of(
                "result", result,
                "progress", progress
        );
    }
}
