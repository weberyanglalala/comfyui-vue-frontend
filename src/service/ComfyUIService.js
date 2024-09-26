import { API_ROUTES } from '@/config/comfyUIRoutes';
import { fetchWrapper } from '@/helpers/fetchWrapper';

export const ComfyUIService = {
    uploadStyleChangeImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        return fetchWrapper.upload(API_ROUTES.UPLOAD_STYLE_CHANGE_IMAGE, formData);
    },
    getPublicImageUrl(imageName) {
        return fetchWrapper.get(`${API_ROUTES.GET_PUBLIC_IMAGE_URL}?imageName=${imageName}`);
    },
    createStyleSwapImage(body) {
        return fetchWrapper.post(`${API_ROUTES.CREATE_STYLE_SWAP_IMAGE}`, body);
    },
    getSwapStyleImage(promptId) {
        return fetchWrapper.get(`${API_ROUTES.GET_STYLE_SWAP_IMAGE}?promptId=${promptId}`);
    },
    createFurnitureDesignImage(body) {
        return fetchWrapper.post(`${API_ROUTES.CREATE_FURNITURE_DESIGN_IMAGE}`, body);
    },
    getFurnitureDesignImage(promptId) {
        return fetchWrapper.get(`${API_ROUTES.GET_FURNITURE_DESIGN_IMAGE}?promptId=${promptId}`);
    }
};
