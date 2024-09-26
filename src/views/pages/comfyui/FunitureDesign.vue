<script setup>
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import ProgressSpinner from 'primevue/progressspinner';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { ComfyUIService } from '@/service/ComfyUIService';
import { retryWithDelay } from '@/helpers/retryWithDelay';
import { watch, ref, computed } from 'vue';

const promptOptions = [
    {
        label: 'Custom Style',
        value: 'Custom Style Here....'
    },
    {
        label: 'Minimalist Scandinavian Style',
        value: 'Convert the furniture image into a sleek Minimalist Scandinavian design. Use clean lines, light wood tones, soft neutral colors, and an uncluttered aesthetic to evoke simplicity and functionality.'
    },
    {
        label: 'Industrial Loft Style',
        value: 'Transform the furniture image into an Industrial Loft design. Incorporate raw, unfinished textures like exposed brick, steel, and reclaimed wood. Use darker tones and an edgy, utilitarian look with visible hardware and mechanical elements.'
    },
    {
        label: 'Mid-Century Modern Style',
        value: 'Convert the furniture image into a Mid-Century Modern design. Use organic shapes, tapered legs, and vibrant hues such as mustard yellow, teal, and olive green. Combine sleek lines with natural materials like walnut wood for a retro vibe.'
    },
    {
        label: 'Bohemian Chic Style',
        value: 'Transform the furniture image into a Bohemian Chic design. Incorporate vibrant patterns, eclectic textures, and warm, earthy colors. Use natural materials like rattan, macramé, and woven fabrics to create a laid-back, artistic aesthetic.'
    },
    {
        label: 'Art Deco Glamour Style',
        value: 'Convert the furniture image into an Art Deco Glamour design. Incorporate luxurious materials like velvet, marble, and gold accents. Use bold geometric patterns, rich jewel tones, and sleek, symmetrical lines to evoke opulence and sophistication.'
    }
];

const toast = useToast();
const stylePrompt = ref('');
const sourceImageName = ref('');
const sourceImageUrl = ref('');
const isLoading = ref(false);
const seed = ref(1);
const width = ref(1280);
const height = ref(720);
const promptId = ref('');
const getPromptResultState = ref(false);
const styleChangeImageUrl = ref('');

const createImageButtonState = computed(() => {
    return sourceImageUrl.value !== '' && stylePrompt.value !== '';
});

const formLoading = () => {
    isLoading.value = true;
};

const formLoaded = () => {
    isLoading.value = false;
};

const onFileSelect = async (event) => {
    formLoading();
    const file = event.files[0];
    const reader = new FileReader();
    try {
        const uploadResult = await ComfyUIService.uploadStyleChangeImage(file);
        sourceImageName.value = uploadResult.name;
        const sourceImageUrlResult = await ComfyUIService.getPublicImageUrl(sourceImageName.value);
        sourceImageUrl.value = sourceImageUrlResult.publicUrl;
        reader.readAsDataURL(file);
        toast.add({ severity: 'success', summary: '成功', detail: '圖片上傳成功', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: '錯誤', detail: '圖片上傳失敗', life: 3000 });
    } finally {
        formLoaded();
    }
};

const createFurnitureDesign = async () => {
    const body = {
        image_path: sourceImageName.value,
        style: stylePrompt.value,
        seed: seed.value
    };
    try {
        formLoading();
        const result = await ComfyUIService.createFurnitureDesignImage(body);
        promptId.value = result.body.prompt_id;
        getPromptResultState.value = true;
        toast.add({ severity: 'success', summary: '成功', detail: result.message, life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: '錯誤', detail: '圖片建立失敗', life: 3000 });
    } finally {
        formLoaded();
    }
};

const getPromptResult = async () => {
    try {
        formLoading();
        const result = await retryWithDelay(
            async () => {
                const response = await ComfyUIService.getFurnitureDesignImage(promptId.value);
                if (response.body.is_success !== true) {
                    throw new Error('Result not ready');
                }
                return response;
            },
            {
                maxRetries: 5,
                delay: 5000,
                onRetry: (retryCount) => {
                    toast.add({
                        severity: 'info',
                        summary: '提示',
                        detail: `嘗試第 ${retryCount} 次失敗。將在 ${5000 / 1000} 秒後重新嘗試`,
                        life: 3000
                    });
                }
            }
        );
        styleChangeImageUrl.value = result.body.public_url;
        getPromptResultState.value = false;
        toast.add({ severity: 'success', summary: '成功', detail: '取得結果成功', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: '錯誤', detail: '取得結果失敗', life: 3000 });
    } finally {
        formLoaded();
    }
};

const { getPrimary, getSurface, isDarkTheme } = useLayout();

watch([getPrimary, getSurface, isDarkTheme], () => {});
</script>

<template>
    <Fluid>
        <Toast />
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl">Furniture Design</div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">Width</label>
                <InputNumber v-model="width" id="width" rows="4" />
            </div>
            <div class="flex flex-wrap">
                <label for="height" class="mb-2">Height</label>
                <InputNumber v-model="height" id="height" rows="4" />
            </div>
            <div class="flex flex-wrap">
                <label for="seed" class="mb-2">Seed</label>
                <InputNumber v-model="seed" id="seed" rows="4" />
            </div>
            <div class="flex flex-wrap flex-col">
                <label for="style-prompt-select" class="mb-2">Style Prompt Select</label>
                <Select class="block" v-model="stylePrompt" id="style-prompt-select" :options="promptOptions" placeholder="Select a Style Prompt" option-label="label" option-value="value" />
            </div>
            <div class="flex flex-wrap">
                <label for="style-prompt" class="mb-2">Style Prompt</label>
                <Textarea v-model="stylePrompt" id="style-prompt" rows="4" />
            </div>
            <div class="flex flex-wrap">
                <label for="image-upload" class="w-full mb-2">Image Upload</label>
                <div class="card w-full p-0">
                    <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary" class="p-button-outlined" v-if="!sourceImageUrl" id="image-upload" />
                    <Image :src="sourceImageUrl" alt="Image" width="250" preview v-if="sourceImageUrl" />
                    <InputText v-if="sourceImageUrl" v-model="sourceImageUrl" class="w-full" readonly />
                </div>
            </div>
            <div class="flex flex-wrap">
                <label for="promptId" class="mb-2">Prompt Id</label>
                <InputText v-model="promptId" id="promptId" rows="4" disabled />
            </div>
            <div class="flex flex-wrap" v-if="styleChangeImageUrl">
                <label for="style-change-image" class="w-full mb-2">Style Change Image</label>
                <Image :src="styleChangeImageUrl" alt="Image" width="250" preview />
                <InputText v-model="styleChangeImageUrl" class="w-full" readonly />
            </div>
            <div class="flex flex-wrap gap-2">
                <Button label="Get Prompt Id" icon="pi pi-check" :disabled="!createImageButtonState" @click="createFurnitureDesign" />
                <Button label="Try Get Prompt Result" icon="pi pi-check" :disabled="!getPromptResultState" @click="getPromptResult" />
            </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
            </div>
        </div>
    </Fluid>
</template>
