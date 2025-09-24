export interface ProfileField {
  id: string;
  key: string;
  value: string;
}
export interface Profile {
  id: string;
  name: string;
  fields: ProfileField[];
}
// Message Types for communication between extension parts
export type MessageType = 'FILL_FORM' | 'SAVE_FORM_DATA' | 'SCAN_AND_FILL' | 'FORM_DATA_RESPONSE' | 'AI_MAP_FIELD';
export interface FillFormMessage {
  type: 'FILL_FORM';
  payload: Profile;
}
export interface ScanAndFillMessage {
  type: 'SCAN_AND_FILL';
}
export interface SaveFormDataMessage {
  type: 'SAVE_FORM_DATA';
}
export interface FormDataResponse {
  type: 'FORM_DATA_RESPONSE';
  payload: { key: string; value: string }[];
}
export interface AiMapFieldMessage {
  type: 'AI_MAP_FIELD';
  payload: {
    formFields: { identifier: string; context: string }[];
    profileKeys: string[];
  };
}
export type Message = FillFormMessage | SaveFormDataMessage | ScanAndFillMessage | FormDataResponse | AiMapFieldMessage;