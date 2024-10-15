<script setup>
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import ProgressSpinner from 'primevue/progressspinner';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { ComfyUIService } from '@/service/ComfyUIService';
import { watch, ref, computed } from 'vue';
import { retryWithDelay } from '@/helpers/retryWithDelay';
import { getImageDimensions } from '@/helpers/imageHelper';

const toast = useToast();
const stylePrompt = ref('A professional portrait of an Asian male teacher around 30 years old, with a warm smile and approachable demeanor, set against a clean and tidy background.');
const sourceImageName = ref('');
const sourceImageUrl = ref('');
const isLoading = ref(false);
const seed = ref(1);
const width = ref(1280);
const height = ref(720);
const count = ref(1);
const promptId = ref('');
const getPromptResultState = ref(false);
const styleChangeImageUrls = ref([]);

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
    try {
        const imageDimension = await getImageDimensions(file);
        width.value = imageDimension.width;
        height.value = imageDimension.height;
        const uploadResult = await ComfyUIService.uploadStyleChangeImage(file);
        sourceImageName.value = uploadResult.name;
        const sourceImageUrlResult = await ComfyUIService.getPublicImageUrl(sourceImageName.value);
        sourceImageUrl.value = sourceImageUrlResult.publicUrl;
        toast.add({ severity: 'success', summary: '成功', detail: '圖片上傳成功', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: '錯誤', detail: '圖片上傳失敗', life: 3000 });
    } finally {
        formLoaded();
    }
};

const createCharacterPhotos = async () => {
    const body = {
        image_path: sourceImageName.value,
        style: stylePrompt.value,
        seed: seed.value,
        count: count.value,
        width: width.value,
        height: height.value
    };
    try {
        formLoading();
        const result = await ComfyUIService.createCharacterDesignImages(body);
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
                const response = await ComfyUIService.getCharacterDesignImages(promptId.value);
                if (response.isSuccess !== true) {
                    throw new Error('Result not ready');
                }
                return response;
            },
            {
                maxRetries: 6,
                delay: 10000,
                onRetry: (retryCount) => {
                    toast.add({
                        severity: 'info',
                        summary: '提示',
                        detail: `嘗試第 ${retryCount} 次失敗。將在 ${10000 / 1000} 秒後重新嘗試`,
                        life: 3000
                    });
                }
            }
        );
        console.log(result);
        styleChangeImageUrls.value = result.body.public_urls;
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
            <div class="font-semibold text-xl">Character Change</div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">Width</label>
                <InputNumber v-model="width" id="width" rows="4" :max="1280" />
            </div>
            <div class="flex flex-wrap">
                <label for="height" class="mb-2">Height</label>
                <InputNumber v-model="height" id="height" rows="4" :max="1280" />
            </div>
            <div class="flex flex-wrap">
                <label for="seed" class="mb-2">Seed</label>
                <InputNumber v-model="seed" id="seed" rows="4" :max="12000000" />
            </div>
            <div class="flex flex-wrap">
                <label for="count" class="mb-2">Count</label>
                <InputNumber v-model="count" id="count" rows="4" :max="4" />
            </div>
            <div class="flex flex-wrap">
                <label for="style-prompt" class="mb-2">Style Prompt</label>
                <Textarea v-model="stylePrompt" id="style-prompt" rows="4" maxlength="5000" />
            </div>
            <div class="flex flex-wrap">
                <label for="image-upload" class="w-full mb-2">Image Upload</label>
                <div class="card w-full p-0">
                    <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary" class="p-button-outlined" v-if="!sourceImageUrl" id="image-upload" file-limit="1" />
                    <Image :src="sourceImageUrl" alt="Image" width="250" preview v-if="sourceImageUrl" />
                    <InputText v-if="sourceImageUrl" v-model="sourceImageUrl" class="w-full" readonly />
                </div>
            </div>
            <div class="flex flex-wrap">
                <label for="promptId" class="mb-2">Prompt Id</label>
                <InputText v-model="promptId" id="promptId" rows="4" disabled />
            </div>
            <div class="flex flex-wrap" v-if="styleChangeImageUrls">
                <label for="style-change-image" class="w-full mb-2">Style Change Image</label>
                <div class="flex flex-wrap gap-2" v-for="(styleChangeImageUrl, index) in styleChangeImageUrls" :key="index">
                    <Image :src="styleChangeImageUrl" alt="Image" width="250" preview />
                    <InputText :model-value="styleChangeImageUrl" class="w-full block" readonly />
                </div>
            </div>
            <div class="flex flex-wrap gap-2">
                <Button label="Get Prompt Id" icon="pi pi-check" :disabled="!createImageButtonState" @click="createCharacterPhotos" />
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
