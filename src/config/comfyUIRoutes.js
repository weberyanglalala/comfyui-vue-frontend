const API_BASE_URL = import.meta.env.VITE_COMFY_API_ENDPOINT;

export const API_ROUTES = {
    UPLOAD_STYLE_CHANGE_IMAGE: `${API_BASE_URL}/api/comfyui/uploadImageByFile`,
    GET_PUBLIC_IMAGE_URL: `${API_BASE_URL}/api/comfyui/GetInputUploadImageUrl`,
    CREATE_STYLE_SWAP_IMAGE: `${API_BASE_URL}/api/StyleSwap/CreateStyleChangeImageByPrompt`,
    GET_STYLE_SWAP_IMAGE: `${API_BASE_URL}/api/StyleSwap/GetStyleChangeImageByPromptId`,
    CREATE_FURNITURE_DESIGN_IMAGE: `${API_BASE_URL}/api/FurnitureDesign/CreateFurnitureDesign`,
    GET_FURNITURE_DESIGN_IMAGE: `${API_BASE_URL}/api/FurnitureDesign/GetFurnitureDesignByPromptId`
};
