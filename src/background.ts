import { getProfiles } from './lib/storage';
import { Message } from './types';
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  const handleMessage = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      console.error('FormWise AI: No active tab found.');
      return;
    }
    switch (message.type) {
      case 'FILL_FORM': {
        chrome.tabs.sendMessage(tab.id, message);
        sendResponse({ status: 'ok', description: 'Fill command sent to content script.' });
        break;
      }
      case 'SCAN_AND_FILL': {
        const profiles = await getProfiles();
        if (profiles.length > 0) {
          chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM', payload: profiles[0] });
          sendResponse({ status: 'ok', description: 'Scan and fill command sent.' });
        } else {
          sendResponse({ status: 'error', description: 'No profiles available to fill.' });
        }
        break;
      }
      case 'SAVE_FORM_DATA': {
        chrome.tabs.sendMessage(tab.id, { type: 'SAVE_FORM_DATA' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            sendResponse({ status: 'error', description: 'Could not communicate with content script.' });
            return;
          }
          if (response && response.payload && response.payload.length > 0) {
            const encodedProfile = encodeURIComponent(JSON.stringify(response.payload));
            const optionsUrl = chrome.runtime.getURL(`options.html?newProfile=${encodedProfile}`);
            chrome.tabs.create({ url: optionsUrl });
            sendResponse({ status: 'ok', description: 'Opening options page to save new profile.' });
          } else {
            sendResponse({ status: 'error', description: 'No form data found to save.' });
          }
        });
        break;
      }
      case 'AI_MAP_FIELD': {
        try {
          // This URL should point to your deployed Cloudflare Worker.
          // For local development, it points to the wrangler dev server.
          const workerUrl = 'http://127.0.0.1:8787/api/map-field';
          const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message.payload),
          });

          if (!response.ok) {
            throw new Error(`AI worker responded with status: ${response.status}`);
          }

          const data = await response.json();
          sendResponse(data);
        } catch (error) {
          console.error('FormWise AI: Error calling AI mapper worker.', error);
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;
      }
    }
  };
  handleMessage();
  return true; // Indicates that the response is sent asynchronously
});
console.log('FormWise AI background service worker loaded.');