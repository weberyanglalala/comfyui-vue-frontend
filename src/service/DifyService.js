import { API_ROUTES } from '@/config/comfyUIRoutes';
import { fetchWrapper } from '@/helpers/fetchWrapper';

export const DifyService = {
    createTravelProduct(body) {
        return fetchWrapper.post(`${API_ROUTES.DIFY_CREATE_TRAVEL_PRODUCT}`, body);
    }
};
