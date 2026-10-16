package com.wordcraft.service;

import com.wordcraft.model.*;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final Map<Long, Exercise> exercises = new LinkedHashMap<>();
    private long nextId = 1;

    @PostConstruct
    public void init() {
        initLetterTracing();
        initTypingPractice();
        initSpellingPractice();
        initSentenceConstruction();
        initReadingCopying();
        initCapitalizationPunctuation();
        initWordSpacing();
        initVisualRecognition();
    }

    public List<Exercise> getExercisesByType(ExerciseType type) {
        return exercises.values().stream()
                .filter(e -> e.getType() == type)
                .collect(Collectors.toList());
    }

    public Exercise getExerciseById(Long id) {
        return exercises.get(id);
    }

    public List<Map<String, Object>> getExerciseTypes() {
        List<Map<String, Object>> types = new ArrayList<>();
        for (ExerciseType type : ExerciseType.values()) {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("type", type.name());
            info.put("name", getTypeName(type));
            info.put("description", getTypeDescription(type));
            info.put("icon", getTypeIcon(type));
            info.put("color", getTypeColor(type));
            info.put("exerciseCount", getExercisesByType(type).size());
            types.add(info);
        }
        return types;
    }

    public ExerciseResult evaluateSubmission(ExerciseSubmission submission) {
        Exercise exercise = exercises.get(submission.getExerciseId());
        if (exercise == null) {
            return new ExerciseResult(submission.getExerciseId(), false, 0, 0,
                    "Exercise not found!", null);
        }

        String answer = submission.getAnswer() != null ? submission.getAnswer().trim() : "";
        Map<String, Object> data = exercise.getData();
        boolean correct = false;
        int score = 0;
        String feedback = "";
        Map<String, Object> details = new HashMap<>();

        switch (exercise.getType()) {
            case LETTER_TRACING:
                score = submission.getDetails() != null && submission.getDetails().containsKey("score")
                        ? ((Number) submission.getDetails().get("score")).intValue() : 60;
                correct = score >= 50;
                feedback = score >= 85 ? "Splendid tracing! Your strokes followed the guide beautifully!"
                        : score >= 60 ? "Great effort! Try keeping your strokes smoother along the lines."
                        : "Good try! Take your time and trace slowly along the guide.";
                break;

            case TYPING_PRACTICE:
                String targetText = (String) data.get("text");
                int accuracy = calculateTextAccuracy(answer, targetText);
                score = accuracy;
                correct = accuracy >= 70;
                int wpm = submission.getDetails() != null && submission.getDetails().containsKey("wpm")
                        ? ((Number) submission.getDetails().get("wpm")).intValue() : 0;
                details.put("accuracy", accuracy);
                details.put("wpm", wpm);
                details.put("correctText", targetText);
                feedback = accuracy == 100 ? "Flawless! 100% accuracy achieved!"
                        : accuracy >= 80 ? "Super typing! You maintained great rhythm and accuracy."
                        : accuracy >= 60 ? "Good practice! Follow the finger guides to boost accuracy."
                        : "Keep practicing! Use the finger placement chart for support.";
                break;

            case SPELLING_PRACTICE:
                String correctWord = ((String) data.get("word")).toLowerCase().trim();
                correct = answer.equalsIgnoreCase(correctWord);
                score = correct ? 100 : calculateTextAccuracy(answer.toLowerCase(), correctWord);
                details.put("correctAnswer", correctWord);
                if (correct) {
                    feedback = "Correct! You mastered this spelling!";
                } else {
                    feedback = "Not quite. The correct spelling is: \"" + correctWord + "\"";
                }
                break;

            case SENTENCE_CONSTRUCTION:
                String subType = (String) data.get("subType");
                if ("grammar".equals(subType)) {
                    String correctGrammar = (String) data.get("correctAnswer");
                    correct = answer.equalsIgnoreCase(correctGrammar.trim());
                    score = correct ? 100 : 0;
                    details.put("correctSentence", correctGrammar);
                    feedback = correct ? "Excellent! You picked the correct grammatical form!"
                            : "Incorrect grammar choice. Correct answer: " + correctGrammar;
                } else {
                    String correctSentence = (String) data.get("correctSentence");
                    // Ignore casing and trailing period differences in evaluation tolerance
                    String cleanAns = answer.replaceAll("\\s+", " ").trim();
                    String cleanTarget = correctSentence.replaceAll("\\s+", " ").trim();
                    correct = cleanAns.equalsIgnoreCase(cleanTarget);
                    score = correct ? 100 : calculateTextAccuracy(cleanAns, cleanTarget);
                    details.put("correctSentence", correctSentence);
                    feedback = correct ? "Perfect sentence construction! Words are in exact order."
                            : "Not quite right. The correct sentence order is: \"" + correctSentence + "\"";
                }
                break;

            case READING_COPYING:
                String originalSentence = (String) data.get("sentence");
                int copyAccuracy = calculateTextAccuracy(answer, originalSentence);
                score = copyAccuracy;
                correct = copyAccuracy >= 80;
                details.put("correctText", originalSentence);
                details.put("accuracy", copyAccuracy);
                feedback = copyAccuracy == 100 ? "Outstanding! Copied with 100% precision!"
                        : copyAccuracy >= 80 ? "Very close! Notice small capitalization or punctuation nuances."
                        : copyAccuracy >= 50 ? "Good try! Break sentences into 2-3 word chunks in your mind."
                        : "Keep practicing! Take your time to read each word before typing.";
                break;

            case CAPITALIZATION_PUNCTUATION:
                String correctFormatted = (String) data.get("correct");
                correct = answer.equals(correctFormatted.trim());
                score = correct ? 100 : calculateTextAccuracy(answer, correctFormatted);
                details.put("correctText", correctFormatted);
                feedback = correct ? "Brilliant! Capitals and punctuation marks placed correctly!"
                        : "Check carefully! The proper version is: \"" + correctFormatted + "\"";
                break;

            case WORD_SPACING:
                String spacingType = (String) data.get("subType");
                if ("identify".equals(spacingType)) {
                    String correctChoice = (String) data.get("correctAnswer");
                    correct = answer.equalsIgnoreCase(correctChoice.trim());
                    score = correct ? 100 : 0;
                    details.put("correctText", correctChoice);
                    feedback = correct ? "Spot on! You accurately identified the correct spacing!"
                            : "Not quite. The sentence with correct spacing is: \"" + correctChoice + "\"";
                } else {
                    String correctSpacing = (String) data.get("correct");
                    String cleanAns = answer.replaceAll("\\s+", " ").trim();
                    String cleanCorrect = correctSpacing.replaceAll("\\s+", " ").trim();
                    correct = cleanAns.equalsIgnoreCase(cleanCorrect);
                    score = correct ? 100 : calculateTextAccuracy(cleanAns, cleanCorrect);
                    details.put("correctText", correctSpacing);
                    feedback = correct ? "Superb spacing! Every word stands clean and separated."
                            : "Spacing needs attention. Correct form: \"" + correctSpacing + "\"";
                }
                break;

            case VISUAL_RECOGNITION:
                String targetLetter = (String) data.get("targetLetter");
                correct = answer.equalsIgnoreCase(targetLetter);
                score = correct ? 100 : 0;
                details.put("correctLetter", targetLetter);
                feedback = correct ? "Correct! Sharp visual recognition!"
                        : "Not quite. The correct match was: " + targetLetter;
                break;
        }

        int xpEarned = calculateXp(exercise.getXpReward(), score);
        details.put("maxScore", 100);

        return new ExerciseResult(exercise.getId(), correct, score, xpEarned, feedback, details);
    }

    private int calculateTextAccuracy(String typed, String target) {
        if (target == null || target.isEmpty()) return 0;
        if (typed == null || typed.isEmpty()) return 0;

        int maxLen = Math.max(typed.length(), target.length());
        int matches = 0;
        int minLen = Math.min(typed.length(), target.length());

        for (int i = 0; i < minLen; i++) {
            if (typed.charAt(i) == target.charAt(i)) {
                matches++;
            }
        }
        return (int) Math.round(((double) matches / maxLen) * 100.0);
    }

    private int calculateXp(int baseXp, int score) {
        return Math.max(5, (int) Math.round(baseXp * (score / 100.0)));
    }

    // ===== Exercise Data Initialization =====

    private void initLetterTracing() {
        // Uppercase letters
        String[] upperLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "M", "S"};
        for (String l : upperLetters) {
            addExercise(ExerciseType.LETTER_TRACING, 1,
                    "Trace Uppercase " + l,
                    "Trace the uppercase letter " + l + " along the dotted stroke guides.",
                    15, Map.of("letter", l, "case", "upper", "mode", "letter",
                            "hint", "Start at top skyline and stroke downward"));
        }

        // Lowercase letters
        String[] lowerLetters = {"a", "b", "c", "d", "e", "p", "q", "m", "n", "s"};
        for (String l : lowerLetters) {
            addExercise(ExerciseType.LETTER_TRACING, 1,
                    "Trace Lowercase " + l,
                    "Trace the lowercase letter " + l + " within the midline and baseline guides.",
                    15, Map.of("letter", l, "case", "lower", "mode", "letter",
                            "hint", "Notice if the tail goes up or down"));
        }

        // Trace Words
        String[] words = {"cat", "sun", "dog", "star", "tree", "bird", "fish", "book"};
        for (String word : words) {
            addExercise(ExerciseType.LETTER_TRACING, 2,
                    "Trace Word: " + word,
                    "Trace the word '" + word + "' smoothly without lifting until each letter finishes.",
                    25, Map.of("letter", word, "case", "lower", "mode", "word",
                            "hint", "Keep spacing even between letters"));
        }

        // Trace Shapes
        String[] shapes = {"circle", "square", "triangle", "star", "heart"};
        for (String shape : shapes) {
            addExercise(ExerciseType.LETTER_TRACING, 1,
                    "Trace Shape: " + shape,
                    "Follow the dotted perimeter to complete the " + shape + ".",
                    20, Map.of("letter", shape, "case", "none", "mode", "shape",
                            "hint", "Control pencil speed on curves and corners"));
        }
    }

    private void initTypingPractice() {
        Object[][] typingData = {
                {"the cat sat on the mat", 1, 15, "Focus on home row keys"},
                {"a big red fox ran fast", 1, 15, "Keep your fingers curved on home row"},
                {"she sells sea shells", 2, 20, "Use pinky fingers for A and S"},
                {"jump high and touch the sky", 2, 20, "Practice reaching up to U and I"},
                {"the quick brown fox jumps over the lazy dog", 3, 30, "Classic pangram using all 26 alphabet keys"},
                {"bright stars shine in the dark night", 2, 25, "Rhythmic typing with spacebar using thumbs"},
                {"listen carefully and type every word", 2, 25, "Pacing beats speed for dysgraphia training"},
                {"five boxing wizards jump quickly", 3, 30, "Advanced keyboard navigation test"},
        };

        for (Object[] d : typingData) {
            addExercise(ExerciseType.TYPING_PRACTICE, (int) d[1],
                    "Type: " + ((String) d[0]).substring(0, Math.min(22, ((String) d[0]).length())) + "...",
                    "Type the sentence accurately. Use the finger guide map below the keys.",
                    (int) d[2], Map.of("text", d[0], "timeLimit", 60, "tip", d[3]));
        }
    }

    private void initSpellingPractice() {
        // 1. Word Completion
        Object[][] completionData = {
                {"elephant", "el_ph_nt", "A huge animal with a trunk and big ears"},
                {"butterfly", "b_tt_rfly", "A colorful insect with wings"},
                {"rainbow", "r_inb_w", "An arc of 7 colors after rain"},
                {"dolphin", "d_lph_n", "A playful and smart sea mammal"},
                {"mountain", "m_unt__n", "A very tall natural elevation of Earth"},
                {"blanket", "bl_nk_t", "Keeps you warm in bed"},
                {"pencil", "p_nc_l", "Used for writing and drawing"},
                {"castle", "c_stl_", "A fortress where kings and queens lived"},
        };
        for (Object[] d : completionData) {
            addExercise(ExerciseType.SPELLING_PRACTICE, 1,
                    "Complete: " + d[1],
                    "Fill in the missing vowels to complete the word. Hint: " + d[2],
                    20, Map.of("word", d[0], "display", d[1], "hint", d[2], "subType", "completion"));
        }

        // 2. Unscramble Words
        Object[][] unscrambleData = {
                {"apple", "pleap", "A sweet red or green crunchy fruit"},
                {"house", "ouhse", "A building where a family lives"},
                {"water", "atwer", "Essential liquid we drink every day"},
                {"happy", "pahyp", "The opposite of sad"},
                {"tiger", "greit", "A fierce wild feline with orange and black stripes"},
                {"bread", "draeb", "Bakery staple made from wheat dough"},
                {"cloud", "ldouc", "Fluffy white vapor floating in the sky"},
                {"dragon", "gnorda", "Mythical creature that breathes fire"},
        };
        for (Object[] d : unscrambleData) {
            addExercise(ExerciseType.SPELLING_PRACTICE, 2,
                    "Unscramble: " + d[1],
                    "Rearrange the jumbled letters in correct order. Hint: " + d[2],
                    25, Map.of("word", d[0], "scrambled", d[1], "hint", d[2], "subType", "unscramble"));
        }

        // 3. Common Dysgraphia Spelling Correction Exercises
        Object[][] correctionData = {
                {"because", "becuz", "Reason word often confused phonetically"},
                {"friend", "frend", "Remember: 'fri' ends with 'end'"},
                {"school", "skool", "Place of learning (silent 'h')"},
                {"beautiful", "beutiful", "Starts with B-E-A-U"},
                {"different", "diffrent", "Has a double 'f' and middle 'e'"},
                {"tomorrow", "tommorow", "One 'm' and two 'r's"},
                {"receive", "recieve", "Rule: 'i' before 'e' except after 'c'"},
                {"people", "poeple", "Starts with p-e-o"},
        };
        for (Object[] d : correctionData) {
            addExercise(ExerciseType.SPELLING_PRACTICE, 2,
                    "Correct: " + d[1],
                    "Identify the spelling mistake and write the corrected word. Hint: " + d[2],
                    25, Map.of("word", d[0], "misspelled", d[1], "hint", d[2], "subType", "correction"));
        }
    }

    private void initSentenceConstruction() {
        // 1. Arrange Words into Sentences
        Object[][] sentenceData = {
                {"The cat is sleeping on the rug.", new String[]{"rug.", "sleeping", "is", "cat", "on", "The", "the"}},
                {"I like to read exciting adventure books.", new String[]{"adventure", "read", "books.", "to", "I", "like", "exciting"}},
                {"The golden sun rose above the mountains.", new String[]{"mountains.", "sun", "rose", "above", "golden", "The", "the"}},
                {"A little bird built a cozy nest.", new String[]{"nest.", "built", "A", "bird", "cozy", "little", "a"}},
                {"We planted colorful flowers in the garden.", new String[]{"garden.", "flowers", "planted", "colorful", "in", "We", "the"}},
                {"The friendly dog wagged his fluffy tail.", new String[]{"tail.", "dog", "wagged", "friendly", "his", "The", "fluffy"}},
        };

        for (Object[] d : sentenceData) {
            addExercise(ExerciseType.SENTENCE_CONSTRUCTION, 1,
                    "Build: Meaningful Sentence",
                    "Click the word cards in the correct sequence to build a grammatically correct sentence.",
                    25, Map.of("correctSentence", d[0], "words", Arrays.asList((String[]) d[1]), "subType", "arrange"));
        }

        // 2. Grammar Practice (Subject-verb agreement, pronoun, tense)
        Object[][] grammarData = {
                {"The dogs ___ in the park happily.", new String[]{"bark", "barks", "barking"}, "bark", "Subject 'dogs' is plural, so use 'bark'."},
                {"She ___ to the library every Tuesday.", new String[]{"goes", "go", "going"}, "goes", "Third-person singular 'She' takes 'goes'."},
                {"Yesterday, they ___ a delicious cake.", new String[]{"baked", "bakes", "bake"}, "baked", "'Yesterday' indicates past tense."},
                {"Neither the cat nor the dogs ___ outside.", new String[]{"are", "is", "am"}, "are", "Agreement matches nearest subject 'dogs'."},
                {"Each student ___ bringing their workbook.", new String[]{"is", "are", "were"}, "is", "'Each' is grammatically singular."},
        };

        for (Object[] d : grammarData) {
            addExercise(ExerciseType.SENTENCE_CONSTRUCTION, 2,
                    "Grammar: Choose Correct Word",
                    (String) d[3],
                    25, Map.of("sentence", d[0], "options", Arrays.asList((String[]) d[1]),
                            "correctAnswer", d[2], "explanation", d[3], "subType", "grammar"));
        }
    }

    private void initReadingCopying() {
        Object[][] readingSentences = {
                {"The tiny hummingbird fluttered near the red flower.", 1, 7},
                {"Fresh morning dew glistened softly on the green grass.", 1, 7},
                {"A swift river rushed gently between tall pine trees.", 2, 8},
                {"Careful writers take pauses to breathe and relax their grip.", 2, 8},
                {"The curious cat peered through the cozy window curtains.", 2, 8},
                {"Bright constellations illuminated the quiet midnight sky.", 3, 9},
                {"Practicing every day turns small efforts into great mastery.", 3, 9},
        };

        for (int i = 0; i < readingSentences.length; i++) {
            Object[] item = readingSentences[i];
            int diff = (int) item[1];
            addExercise(ExerciseType.READING_COPYING, diff,
                    "Memory & Attention #" + (i + 1),
                    "Read the sentence during the countdown, retain it, then type it accurately.",
                    20 + (diff * 5),
                    Map.of("sentence", item[0], "displayTime", item[2]));
        }
    }

    private void initCapitalizationPunctuation() {
        Object[][] capPuncData = {
                {"the children played soccer until it was dark", "The children played soccer until it was dark.", "Capitalize first word and add a period"},
                {"where did you put my reading book asked sarah", "Where did you put my reading book? asked Sarah.", "Add capital W and S, and a question mark"},
                {"wow that shooting star was incredible", "Wow, that shooting star was incredible!", "Add exclamation mark and capital W"},
                {"on monday we visited paris london and rome", "On Monday, we visited Paris, London, and Rome.", "Capitalize days, cities, and add commas"},
                {"can you help me carry these heavy boxes please", "Can you help me carry these heavy boxes, please?", "Add question mark and proper punctuation"},
                {"dr baker lives at 12 elm street in boston", "Dr. Baker lives at 12 Elm Street in Boston.", "Capitalize titles, names, streets, and city"},
        };

        for (int i = 0; i < capPuncData.length; i++) {
            int difficulty = i < 3 ? 1 : 2;
            addExercise(ExerciseType.CAPITALIZATION_PUNCTUATION, difficulty,
                    "Format & Punctuate #" + (i + 1),
                    (String) capPuncData[i][2],
                    25 + (difficulty * 5),
                    Map.of("broken", capPuncData[i][0], "correct", capPuncData[i][1], "tip", capPuncData[i][2]));
        }
    }

    private void initWordSpacing() {
        // 1. Insert spaces between words
        Object[][] insertSpacingData = {
                {"thecatisblack", "the cat is black", "4 words stuck together"},
                {"ilikepizzaverymuch", "i like pizza very much", "5 words stuck together"},
                {"thestarsglowatnight", "the stars glow at night", "5 words stuck together"},
                {"wearelearningnewskills", "we are learning new skills", "5 words stuck together"},
                {"abigredballbouncedhigh", "a big red ball bounced high", "6 words stuck together"},
                {"practicemakeseverydaybetter", "practice makes every day better", "5 words stuck together"}
        };

        for (int i = 0; i < insertSpacingData.length; i++) {
            addExercise(ExerciseType.WORD_SPACING, 1,
                    "Insert Spaces: " + insertSpacingData[i][0],
                    "Separate the fused words by inserting a space between each word.",
                    20,
                    Map.of("noSpaces", insertSpacingData[i][0], "correct", insertSpacingData[i][1],
                            "subType", "insert", "hint", insertSpacingData[i][2]));
        }

        // 2. Identify incorrectly spaced text
        Object[][] identifySpacingData = {
                {"Which sentence has correct word spacing?",
                        new String[]{
                                "The cat is sleep ing on the soft rug.",
                                "The cat is sleeping on the soft rug.",
                                "Thecat is sleeping onthe softrug."
                        },
                        "The cat is sleeping on the soft rug.",
                        "Notice that 'sleep ing' and 'thecat' split words incorrectly."},
                {"Spot the correctly spaced sentence:",
                        new String[]{
                                "We wentto the zo oto see lions.",
                                "We went to the zoo to see lions.",
                                "Wewent to thezoo to see lions."
                        },
                        "We went to the zoo to see lions.",
                        "Each individual English word must have exactly one space between it."},
                {"Select the sentence with proper spacing:",
                        new String[]{
                                "Apples are sweet and crunchy to eat.",
                                "Applesare sweet and cr unchy to eat.",
                                "Apples are swe et and crunchy toeat."
                        },
                        "Apples are sweet and crunchy to eat.",
                        "Watch out for spaces placed in the middle of words."}
        };

        for (int i = 0; i < identifySpacingData.length; i++) {
            addExercise(ExerciseType.WORD_SPACING, 2,
                    "Identify Spacing #" + (i + 1),
                    "Look carefully at word boundaries and select the sentence with accurate spacing.",
                    25,
                    Map.of("prompt", identifySpacingData[i][0],
                            "options", Arrays.asList((String[]) identifySpacingData[i][1]),
                            "correctAnswer", identifySpacingData[i][2],
                            "explanation", identifySpacingData[i][3],
                            "subType", "identify"));
        }
    }

    private void initVisualRecognition() {
        // 1. Differentiate commonly confused letters (b/d, p/q, m/n, w/v)
        Object[][] confusedLetters = {
                {"b", new String[]{"b", "d", "p", "q"}, "Find lowercase letter 'b' (bat with a belly to the right)", "confused"},
                {"d", new String[]{"b", "d", "p", "q"}, "Find lowercase letter 'd' (donut with a stick behind)", "confused"},
                {"p", new String[]{"b", "d", "p", "q"}, "Find lowercase letter 'p' (tail hangs down to the left)", "confused"},
                {"q", new String[]{"b", "d", "p", "q"}, "Find lowercase letter 'q' (round head with tail on right)", "confused"},
                {"m", new String[]{"m", "n", "w", "u"}, "Find lowercase letter 'm' (two arches)", "confused"},
                {"n", new String[]{"m", "n", "h", "r"}, "Find lowercase letter 'n' (one single arch)", "confused"},
                {"w", new String[]{"w", "m", "v", "u"}, "Find lowercase letter 'w' (points down, opens up)", "confused"},
                {"u", new String[]{"u", "n", "v", "c"}, "Find lowercase letter 'u' (cup holding water)", "confused"},
        };

        for (Object[] d : confusedLetters) {
            addExercise(ExerciseType.VISUAL_RECOGNITION, 1,
                    (String) d[2],
                    "Observe orientation and line directions carefully.",
                    20,
                    Map.of("targetLetter", d[0],
                            "options", Arrays.asList((String[]) d[1]),
                            "prompt", d[2],
                            "subType", d[3]));
        }

        // 2. Match letters with images
        Object[][] imageLetters = {
                {"A", new String[]{"A", "B", "C", "D"}, "🍎 Apple starts with letter:", "🍎", "match_image"},
                {"B", new String[]{"D", "B", "P", "Q"}, "🦋 Butterfly starts with letter:", "🦋", "match_image"},
                {"C", new String[]{"O", "G", "C", "Q"}, "🐱 Cat starts with letter:", "🐱", "match_image"},
                {"D", new String[]{"B", "P", "D", "T"}, "🐶 Dog starts with letter:", "🐶", "match_image"},
                {"E", new String[]{"F", "E", "L", "I"}, "🐘 Elephant starts with letter:", "🐘", "match_image"},
                {"F", new String[]{"E", "T", "F", "P"}, "🐸 Frog starts with letter:", "🐸", "match_image"},
                {"S", new String[]{"Z", "5", "S", "C"}, "🌞 Sun starts with letter:", "🌞", "match_image"},
                {"R", new String[]{"P", "B", "R", "K"}, "🚀 Rocket starts with letter:", "🚀", "match_image"},
        };

        for (Object[] d : imageLetters) {
            addExercise(ExerciseType.VISUAL_RECOGNITION, 1,
                    "Match Image: " + d[3],
                    (String) d[2],
                    20,
                    Map.of("targetLetter", d[0],
                            "options", Arrays.asList((String[]) d[1]),
                            "prompt", d[2],
                            "imageEmoji", d[3],
                            "subType", d[4]));
        }
    }

    private void addExercise(ExerciseType type, int difficulty, String title,
                             String instruction, int xpReward, Map<String, Object> data) {
        long id = nextId++;
        exercises.put(id, new Exercise(id, type, difficulty, title, instruction, xpReward, data));
    }

    // ===== Display Helpers =====

    private String getTypeName(ExerciseType type) {
        return switch (type) {
            case LETTER_TRACING -> "Letter & Shape Tracing";
            case TYPING_PRACTICE -> "Typing Practice";
            case SPELLING_PRACTICE -> "Spelling Practice";
            case SENTENCE_CONSTRUCTION -> "Sentence Construction";
            case READING_COPYING -> "Reading & Copying";
            case CAPITALIZATION_PUNCTUATION -> "Capitalisation & Punctuation";
            case WORD_SPACING -> "Word Spacing";
            case VISUAL_RECOGNITION -> "Visual Letter Recognition";
        };
    }

    private String getTypeDescription(ExerciseType type) {
        return switch (type) {
            case LETTER_TRACING -> "Trace letters, words, and shapes with stroke guidance";
            case TYPING_PRACTICE -> "Improve typing speed and accuracy with interactive finger placement guidance";
            case SPELLING_PRACTICE -> "Complete, unscramble, and correct common spelling errors";
            case SENTENCE_CONSTRUCTION -> "Arrange words and master grammar fundamentals";
            case READING_COPYING -> "Boost reading attention and sentence recall accuracy";
            case CAPITALIZATION_PUNCTUATION -> "Master capital letters, commas, and ending punctuation";
            case WORD_SPACING -> "Insert spaces and identify incorrectly spaced words";
            case VISUAL_RECOGNITION -> "Match letters with images and differentiate b/d, p/q";
        };
    }

    private String getTypeIcon(ExerciseType type) {
        return switch (type) {
            case LETTER_TRACING -> "✍️";
            case TYPING_PRACTICE -> "⌨️";
            case SPELLING_PRACTICE -> "🔤";
            case SENTENCE_CONSTRUCTION -> "📝";
            case READING_COPYING -> "📖";
            case CAPITALIZATION_PUNCTUATION -> "🔠";
            case WORD_SPACING -> "📏";
            case VISUAL_RECOGNITION -> "👀";
        };
    }

    private String getTypeColor(ExerciseType type) {
        return switch (type) {
            case LETTER_TRACING -> "#ff6b9d";
            case TYPING_PRACTICE -> "#c084fc";
            case SPELLING_PRACTICE -> "#4ade80";
            case SENTENCE_CONSTRUCTION -> "#fbbf24";
            case READING_COPYING -> "#38bdf8";
            case CAPITALIZATION_PUNCTUATION -> "#fb923c";
            case WORD_SPACING -> "#2dd4bf";
            case VISUAL_RECOGNITION -> "#f472b6";
        };
    }
}
