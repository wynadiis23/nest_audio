import { getCurrentDate } from '../../utils';

export const StreamStatusKey = (key?: string) => {
  const date = getCurrentDate();

  return key ? `${date}_${key}` : `${date}_`;
};
