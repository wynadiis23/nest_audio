import { updateStreamStatusMessageType } from '../../event-gateway/type';

export type streamStatusType = {
  lastActivityTime: string;
  savedClientKey?: string;
  clientKeyStatus?: string;
  message?: string;
} & updateStreamStatusMessageType;
