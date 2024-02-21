import { updateStreamStatusMessageType } from '../../event-gateway/type';

export type streamStatusType = {
  lastActivityTime: string;
  username: string;
  userStatus?: string;
  savedClientKey?: string;
  clientKeyStatus?: string;
  message?: string;
} & updateStreamStatusMessageType;
