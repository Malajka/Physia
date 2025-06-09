# Training Plan Description Formatting System

## Overview

The system enables formatting of exercise descriptions in training plans using section markers. The training plan is displayed as three cards:

- **Warm-Up** - orange background and accents
- **Workout** - blue background and accents
- **Cool-Down** - green background and accents

## How the System Works

### Display Logic

The system **does not duplicate exercises** between cards. Instead, it:

1. **Analyzes all exercises** in the training plan
2. **Extracts sections** from each exercise according to markers
3. **Groups sections** into appropriate cards:
   - **Warm-Up** card shows only `###warmup` sections from all exercises
   - **Workout** card shows only `###workout` sections from all exercises
   - **Cool-Down** card shows only `###cooldown` sections from all exercises

### Example Flow

If you have an exercise:

```
Name: "Neck Stretching"

###warmup
Sit comfortably on a chair
Perform 3 head rotations

###workout
Place hand on head
Gently apply pressure

###cooldown
Return to neutral position
Take deep breaths
```

**Result on the page:**

- **Warm-Up card** will show: "Neck Stretching" with warm-up instructions
- **Workout card** will show: "Neck Stretching" with workout instructions
- **Cool-Down card** will show: "Neck Stretching" with cool-down instructions

## Marker Format

### Basic Markers

- `###warmup` or `###warm-up` - warm-up instructions
- `###workout` - main workout instructions
- `###cooldown` or `###cool-down` - cool-down instructions

### Formatting Rules

- Markers must start with `###`
- Each marker must be on a separate line
- Place instructions in lines after the marker
- Case doesn't matter (`###WARMUP` = `###warmup`)

## Formatting Examples

### Exercise with Full Cycle

```
###warmup
Sit upright on a chair
Perform 5 slow head rotations to the right
Perform 5 slow head rotations to the left
Gently tilt head forward

###workout
Place right hand on right side of head
Gently press head toward right shoulder
Hold position for 15 seconds
Repeat for left side

###cooldown
Return to neutral head position
Take 3 deep breaths
Gently roll shoulders backward
```

### Warm-Up Only Exercise

```
###warmup
Stand straight with feet shoulder-width apart
Perform 10 forward arm circles
Perform 10 backward arm circles
```

### Workout Only Exercise

```
###workout
Place hands on hips
Perform slow side bend to the right
Hold position for 10 seconds
Return to upright position
```

### Cool-Down Only Exercise

```
###cooldown
Slowly stand up from chair
Perform gentle full body stretch
Breathe calmly for one minute
```

## Page Layout

### Structure Layout

The session page displays **three parallel cards**:

1. **Warm-Up Card** (orange gradient background)

   - All `###warmup` sections from the training plan
   - Orange fields with warm-up instructions

2. **Workout Card** (blue gradient background)

   - All `###workout` sections from the training plan
   - Blue fields with workout instructions

3. **Cool-Down Card** (green gradient background)
   - All `###cooldown` sections from the training plan
   - Green fields with cool-down instructions

### Elements of Each Exercise Section

- **Exercise name** (header)
- **Parameters**: number of sets, reps, rest time
- **Instructions** for the given phase (colored bullets and text)
- **Notes** (if available) - yellow field
- **Images** (if available) - thumbnails

### Empty Sections

If there are no exercises for a given phase in the plan, the card displays "No exercises for this section".

## Database Usage

### Complete JSONB Example

```json
{
  "title": "Upper Back Training Plan",
  "description": "Personalized exercise program...",
  "warnings": ["Stop exercise immediately if you feel sharp pain", "Consult with doctor before starting the program"],
  "exercises": [
    {
      "id": 1,
      "name": "Neck Muscle Stretching",
      "description": "###warmup\nSit comfortably on chair\n###workout\nPlace hand on head\n###cooldown\nReturn to neutral position",
      "sets": 3,
      "reps": 15,
      "rest_time_seconds": 30,
      "notes": "Remember to breathe calmly throughout the exercise"
    }
  ]
}
```

### Updating Existing Exercise

```sql
UPDATE exercises SET description = '
###warmup
Sit upright on chair
Perform arm warm-up

###workout
Perform main exercise
Hold position for 15 seconds

###cooldown
Return to starting position
Take deep breaths
' WHERE id = 1;
```

## Benefits of the New System

### ✅ Clarity

- Each card contains only relevant instructions
- No duplication of exercises between cards
- Logical division into training phases

### ✅ Flexibility

- Exercises can have only some phases (e.g., workout only)
- Can combine different types of exercises in one plan
- Easy addition of new exercises

### ✅ Compatibility

- Old descriptions without markers work (go to Workout section)
- Can gradually migrate existing data
- Doesn't require changes to database structure

## Troubleshooting

### Problem: Exercise doesn't appear in any card

**Solution:**

- Check if description contains `###warmup`, `###workout` or `###cooldown` markers
- If no markers, exercise should appear in Workout card as plain text

### Problem: Card is empty despite exercises in plan

**Solution:**

- Check if exercises have appropriate markers for that card
- Warm-Up card requires `###warmup`, Workout requires `###workout`, Cool-Down requires `###cooldown`

### Problem: Incorrect marker formatting

**Solution:**

- Use exactly `###` (three hash symbols)
- Marker must be at beginning of line
- No extra spaces before `###`

### Problem: Instructions don't display

**Solution:**

- Instructions must be in lines **after** the marker
- Each instruction on separate line
- Check for empty lines separating content

## Best Practices

### 🎯 Exercise Planning

1. **Think full cycle**: warm-up → workout → cool-down
2. **One instruction per line** - easier to read
3. **Logical sequence** - from simple to more complex movements
4. **Clear verbs** - "Sit", "Place", "Perform", "Hold"

### 📝 Writing Instructions

1. **Short, specific sentences**
2. **Avoid overly technical terms**
3. **Always provide starting position**
4. **Specify time or number of repetitions where needed**

### 🏗️ Plan Structure

1. **Warm-up**: body preparation, joint mobilization
2. **Main workout**: specific therapeutic exercises
3. **Cool-down**: return to rest state, relaxation

### 🔄 Data Migration

1. **Test on database copy** before production changes
2. **Migrate gradually** - not all exercises at once
3. **Keep copies** of old descriptions before changes
4. **Verify results** on page after each update

## Real-World Examples

### Plan for Neck Pain

```json
{
  "exercises": [
    {
      "name": "Neck Mobilization",
      "description": "###warmup\nGentle head rotations\n###workout\nBends and rotations\n###cooldown\nMuscle relaxation"
    },
    {
      "name": "Deep Muscle Strengthening",
      "description": "###workout\nIsometric contractions\nPosition holding"
    }
  ]
}
```

### Warm-Up Only Plan

```json
{
  "exercises": [
    {
      "name": "Training Preparation",
      "description": "###warmup\nJoint rotations\nGentle stretching"
    }
  ]
}
```

This system provides professional, intuitive display of training plans with clear division into training phases and eliminates problems with content duplication between sections.
