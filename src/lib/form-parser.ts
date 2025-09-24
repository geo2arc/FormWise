import { Profile, ProfileField } from "@/types";
import { getAiMapping } from "./ai-mapper";
// List of common keywords associated with form field types.
const FIELD_KEYWORDS: { [key: string]: string[] } = {
  firstName: ['first name', 'firstname', 'given name'],
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  email: ['email', 'e-mail', 'mail'],
  phone: ['phone', 'mobile', 'contact number', 'tel'],
  address: ['address', 'street'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zipCode: ['zip', 'postal code', 'postcode'],
  country: ['country'],
  company: ['company', 'organization', 'business'],
  jobTitle: ['job title', 'position', 'role'],
};
/**
 * Normalizes a string by converting to lowercase and removing non-alphanumeric characters.
 * @param str The string to normalize.
 * @returns The normalized string.
 */
const normalize = (str: string | null | undefined): string => {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};
/**
 * Finds the best matching profile field for a given form input element using heuristics.
 * @param input The HTMLInputElement to match.
 * @param profileFields The array of user's profile fields.
 * @returns The best matching ProfileField or null if no good match is found.
 */
const findBestMatch = (input: HTMLInputElement, profileFields: ProfileField[]): ProfileField | null => {
  const label = input.labels?.[0]?.textContent || '';
  const placeholder = input.placeholder;
  const name = input.name;
  const id = input.id;
  const inputText = normalize(`${label} ${placeholder} ${name} ${id}`);
  let bestMatch: ProfileField | null = null;
  let highestScore = 0;
  for (const field of profileFields) {
    const fieldKey = normalize(field.key);
    let score = 0;
    // Direct match on normalized key
    if (inputText.includes(fieldKey)) {
      score = 0.9;
    }
    // Keyword-based matching
    for (const keywordType in FIELD_KEYWORDS) {
      if (normalize(field.key) === keywordType) {
        for (const keyword of FIELD_KEYWORDS[keywordType]) {
          if (inputText.includes(normalize(keyword))) {
            score = Math.max(score, 0.8);
            break;
          }
        }
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = field;
    }
  }
  return highestScore > 0.5 ? bestMatch : null;
};
const fillAndHighlight = (input: HTMLInputElement, value: string) => {
  input.value = value;
  // Dispatch events to let frameworks like React know the value has changed
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  // Add highlight class
  input.classList.add('formwise-highlighted');
  setTimeout(() => input.classList.remove('formwise-highlighted'), 1500);
};
/**
 * Scans the document for forms and fills them using the provided profile data.
 * It first uses heuristics and then falls back to an AI mapper for unmatched fields.
 * @param profile The user profile to use for filling the form.
 */
export const matchAndFill = async (profile: Profile): Promise<void> => {
  const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select')) as HTMLInputElement[];
  const unmatchedInputs: HTMLInputElement[] = [];
  // 1. Heuristic Pass
  inputs.forEach(input => {
    const bestMatch = findBestMatch(input, profile.fields);
    if (bestMatch) {
      fillAndHighlight(input, bestMatch.value);
    } else {
      unmatchedInputs.push(input);
    }
  });
  // 2. AI Fallback Pass for remaining inputs
  if (unmatchedInputs.length > 0) {
    console.log(`FormWise AI: ${unmatchedInputs.length} fields not matched by heuristics. Trying AI...`);
    unmatchedInputs.forEach(input => input.classList.add('formwise-ai-pending'));
    const formFieldsData = unmatchedInputs.map((input, index) => ({
      identifier: `input_${index}`, // Simple identifier for this session
      label: input.labels?.[0]?.textContent || '',
      placeholder: input.placeholder,
      name: input.name,
      id: input.id,
    }));
    const profileKeys = profile.fields.map(f => f.key);
    try {
      const aiMapping = await getAiMapping(formFieldsData, profileKeys);
      Object.entries(aiMapping).forEach(([identifier, profileKey]) => {
        if (profileKey) {
          const inputIndex = parseInt(identifier.split('_')[1]);
          const input = unmatchedInputs[inputIndex];
          const profileField = profile.fields.find(f => f.key === profileKey);
          if (input && profileField) {
            fillAndHighlight(input, profileField.value);
          }
        }
      });
    } catch (error) {
      console.error("FormWise AI: AI mapping failed.", error);
    } finally {
      unmatchedInputs.forEach(input => input.classList.remove('formwise-ai-pending'));
    }
  }
};
/**
 * Extracts data from the first visible form on the page.
 * @returns An array of key-value pairs representing the form data.
 */
export const extractFormData = (): { key: string; value: string }[] => {
  const form = document.querySelector('form:not([style*="display: none"])');
  if (!form) return [];
  const formData: { key: string; value: string }[] = [];
  const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select')) as HTMLInputElement[];
  inputs.forEach(input => {
    if (input.value) {
      const label = input.labels?.[0]?.textContent || input.name || input.placeholder || input.id;
      if (label) {
        formData.push({ key: label.trim(), value: input.value });
      }
    }
  });
  return formData;
};