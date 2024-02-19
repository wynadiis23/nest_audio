import { updateStreamStatusMessageType } from '../../event-gateway/type';

export type streamStatusType = {
  lastActivity: string;
  clientKeyStatus?: string;
  message?: string;
} & updateStreamStatusMessageType;
