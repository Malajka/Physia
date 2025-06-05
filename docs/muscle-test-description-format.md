# Muscle Test Description Format Documentation

## Overview

This document describes the formatting system for muscle test descriptions in the Physia application. The system uses markdown-like section markers to automatically format text into different visual sections with appropriate styling and icons.

## Format Specification

### Section Markers

Use `###` followed by a section type to define different content areas:

```
###[SECTION_TYPE]
Content line 1
Content line 2
Content line 3
```

### Available Section Types

| Marker       | Aliases           | Description                    | Visual Style                          |
| ------------ | ----------------- | ------------------------------ | ------------------------------------- |
| `###steps`   | `###instructions` | Step-by-step instructions      | 🔵 Numbered list with teal circles    |
| `###info`    | `###expect`       | Expected outcomes/explanations | 💙 Blue info box with info icon       |
| `###warning` | `###important`    | Safety warnings/cautions       | 🚨 Red warning box with triangle icon |
| `###note`    | `###remember`     | Tips and reminders             | 🟡 Amber note box with list icon      |

## Database Usage Instructions

### Basic Example

```sql
UPDATE muscle_tests
SET description = '
###steps
Sit upright on a chair
Place your right hand against the right side of your head
Try to tilt your head toward the right shoulder while gently resisting
Hold for 5–10 seconds, then repeat on the other side

###info
Pain or tension in the upper neck suggests upper trapezius muscle overload
This condition is common in prolonged desk posture

###warning
Stop immediately if you feel sharp pain
Avoid forcing the movement beyond comfortable range

###note
Remember to breathe normally during the test
Keep your movements gentle and controlled
'
WHERE id = 1;
```

### Section-Specific Examples

#### Instructions Only

```sql
UPDATE muscle_tests
SET description = '
###steps
Stand with feet shoulder-width apart
Raise your arms above your head
Lower them slowly to shoulder height
Hold this position for 10 seconds
'
WHERE id = 2;
```

#### Warnings Only

```sql
UPDATE muscle_tests
SET description = '
###warning
Do not perform if you have recent neck injury
Stop immediately if you experience numbness
Consult doctor if you have chronic neck pain
'
WHERE id = 3;
```

#### Mixed Sections

```sql
UPDATE muscle_tests
SET description = '
###steps
Lie flat on your back
Bend your knees to 90 degrees
Press your lower back into the floor

###info
This exercise targets deep core stabilizers
You should feel mild activation in abdominal muscles

###note
Focus on breathing throughout the movement
Quality is more important than duration
'
WHERE id = 4;
```

## Rules and Guidelines

### Formatting Rules

1. **Section markers must start with `###`** followed immediately by the section type
2. **Each section type must be on its own line**
3. **Content follows on subsequent lines** until the next section marker
4. **Empty lines between sections are optional** but recommended for readability
5. **Bullet points and numbers are automatically removed** from content lines

### Content Guidelines

#### For Steps (`###steps` / `###instructions`)

- Write clear, actionable instructions
- Use imperative verbs (Sit, Place, Hold, Try)
- Include timing when relevant (Hold for 5 seconds)
- Keep each step concise and specific

#### For Information (`###info` / `###expect`)

- Explain what the test measures
- Describe expected sensations or outcomes
- Provide context about the condition being tested
- Use medical terminology appropriately

#### For Warnings (`###warning` / `###important`)

- Include safety precautions
- Specify when to stop the test
- Mention contraindications
- Use clear, direct language

#### For Notes (`###note` / `###remember`)

- Provide helpful tips
- Remind about proper technique
- Include breathing instructions
- Add quality-of-movement reminders

### Fallback Behavior

If no section markers are used, the entire text will be displayed in a simple gray box under "What to expect" section.

```sql
-- This will appear as plain text in info section
UPDATE muscle_tests
SET description = 'This is a simple test without formatting. Perform the movement slowly and stop if you feel pain.'
WHERE id = 5;
```

## Visual Output Examples

### Complete Formatted Output

When properly formatted, the content will display as:

**📋 INSTRUCTIONS**

1. Sit upright on a chair
2. Place your right hand against the right side of your head
3. Try to tilt your head toward the right shoulder while gently resisting
4. Hold for 5–10 seconds, then repeat on the other side

**⚠️ IMPORTANT**

- Stop immediately if you feel sharp pain
- Avoid forcing the movement beyond comfortable range

**💡 WHAT TO EXPECT**

- Pain or tension in the upper neck suggests upper trapezius muscle overload
- This condition is common in prolonged desk posture

**📝 REMEMBER**

- Remember to breathe normally during the test
- Keep your movements gentle and controlled

## Technical Implementation

### Parser Logic

The formatting function (`formatDescriptionText`) processes the input as follows:

1. Split content by `###` markers
2. Identify section type from first line of each section
3. Process content lines (remove bullets, numbers)
4. Sort content into appropriate arrays
5. Render sections with specific styling

### Supported Text Processing

- **Automatic bullet removal**: `- text` → `text`
- **Automatic numbering removal**: `1. text` → `text`
- **Whitespace normalization**: Extra spaces and line breaks are cleaned
- **Empty line filtering**: Blank lines are automatically removed

## Best Practices

### Database Management

1. **Test your formatting** by viewing the muscle test in the UI before saving
2. **Use consistent section order**: steps → warnings → info → notes
3. **Keep content concise** - each point should be one clear statement
4. **Review medical accuracy** of all content before publishing

### Content Writing

1. **Use active voice** for instructions
2. **Be specific about timing** and positioning
3. **Include relevant safety information** for each test
4. **Write for non-medical users** while maintaining accuracy

### Quality Assurance

1. **Preview the formatted output** in the application
2. **Check that all sections render correctly**
3. **Verify medical accuracy** of instructions and expectations
4. **Test with different content lengths** to ensure proper layout

## Troubleshooting

### Common Issues

1. **Content appears in wrong section**

   - Check section marker spelling
   - Ensure `###` starts the line exactly

2. **Sections don't appear**

   - Verify section markers are recognized
   - Check for typos in section names

3. **Formatting looks broken**
   - Check for special characters in content
   - Ensure proper line breaks after markers

### Debug Steps

1. Check the raw database content for proper markers
2. Verify section type spelling matches available types
3. Test with minimal content first, then expand
4. Use browser developer tools to inspect rendered HTML

## Version History

- **v1.0** - Initial implementation with marker-based formatting
- **v1.1** - Added alias support (instructions, expect, important, remember)
- **v1.2** - Improved content processing and icon cleanup
