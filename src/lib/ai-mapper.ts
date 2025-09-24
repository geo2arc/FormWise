import { ProfileField } from "@/types";
interface FormFieldData {
  identifier: string; // A unique way to find the input again (e.g., combination of name and type)
  label: string;
  placeholder: string;
  name: string;
  id: string;
}
/**
 * Sends form and profile data to the background script to get an AI-powered mapping.
 * @param formFields An array of data extracted from form inputs.
 * @param profileKeys An array of keys from the user's profile.
 * @returns A promise that resolves to a mapping object from form identifier to profile key.
 */
export const getAiMapping = async (
  formFields: FormFieldData[],
  profileKeys: string[]
): Promise<Record<string, string | null>> => {
  return new Promise((resolve, reject) => {
    const payload = {
      formFields: formFields.map(f => ({
        identifier: f.identifier,
        context: `Label: "${f.label}", Placeholder: "${f.placeholder}", Name: "${f.name}", ID: "${f.id}"`
      })),
      profileKeys,
    };
    chrome.runtime.sendMessage({ type: 'AI_MAP_FIELD', payload }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'AI mapping failed in background script.'));
      }
    });
  });
};