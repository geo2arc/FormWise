import { Message } from './types';
import { matchAndFill, extractFormData } from './lib/form-parser';
// Inject CSS for highlighting filled fields
const style = document.createElement('style');
style.textContent = `
  @keyframes formwise-highlight {
    from {
      box-shadow: 0 0 5px 2px rgba(100, 116, 139, 0.5);
    }
    to {
      box-shadow: 0 0 5px 2px rgba(100, 116, 139, 0);
    }
  }
  .formwise-highlighted {
    animation: formwise-highlight 1.5s ease-out;
  }
`;
document.head.appendChild(style);
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  const handler = async () => {
    switch (message.type) {
      case 'FILL_FORM': {
        console.log('FormWise AI: Received profile to fill:', message.payload);
        await matchAndFill(message.payload);
        sendResponse({ status: 'ok', description: 'Form filled.' });
        break;
      }
      case 'SAVE_FORM_DATA': {
        console.log('FormWise AI: Received request to save form data.');
        const formData = extractFormData();
        sendResponse({ type: 'FORM_DATA_RESPONSE', payload: formData });
        break;
      }
    }
  };
  handler();
  return true; // Keep the message channel open for async response
});
console.log('FormWise AI content script injected.');