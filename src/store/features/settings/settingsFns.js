import { http } from '../../http';
import { ENDPOINTS } from '../../constant';

export const getSettingsRequest = () => http(ENDPOINTS.settings);
export const updateSettingsRequest = (body) => http(ENDPOINTS.settings, { method: 'PATCH', body });
