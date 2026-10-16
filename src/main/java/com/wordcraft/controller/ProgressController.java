package com.wordcraft.controller;

import com.wordcraft.model.UserProgress;
import com.wordcraft.service.ProgressService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public UserProgress getProgress() {
        return progressService.getProgress();
    }

    @PostMapping("/reset")
    public UserProgress resetProgress() {
        return progressService.resetProgress();
    }
}
