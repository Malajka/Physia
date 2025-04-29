/**
 * Medical disclaimer text for the Physia application.
 * This content is displayed to users before they can create sessions.
 */

export const DISCLAIMER_TEXT = `
# Medical Disclaimer

## Important Notice

The information provided by Physia is not intended to replace professional medical advice, diagnosis or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## Exercise Recommendations

The exercises recommended by this application are based on general physiotherapy practices for muscle pain relief. They are not personalized medical advice. If you experience pain during any exercise, stop immediately and consult a healthcare professional.

## Limitations

- Physia is not a substitute for professional medical care.
- The application does not diagnose medical conditions.
- Results may vary between individuals.
- In case of severe or persistent pain, consult a healthcare professional immediately.

By using Physia, you acknowledge that you understand and agree to these terms.
`;

/**
 * Returns the current disclaimer text.
 * This function allows for potential future expansion to support
 * versioning or localization.
 */
export function getDisclaimerText(): string {
  return DISCLAIMER_TEXT;
}
