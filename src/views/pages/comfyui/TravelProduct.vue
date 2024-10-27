<script setup>
import ProgressSpinner from 'primevue/progressspinner';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { DifyService } from '@/service/DifyService';

import { watch, ref, computed } from 'vue';

const toast = useToast();
const isLoading = ref(false);
const productName = ref('');
const productDescription = ref('');
const productCategory = ref('');
const productActivity = ref('');
const productRegistration = ref('');
const productPolicy = ref('');

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const buttonState = computed(() => {
    return productName.value !== '';
});

const formLoading = () => {
    isLoading.value = true;
};

const formLoaded = () => {
    isLoading.value = false;
};

const generateProduct = async () => {
    formLoading();
    try {
        const response = await DifyService.createTravelProduct({
            productName: productName.value
        });
        productName.value = response.body.name;
        productDescription.value = response.body.description;
        productCategory.value = response.body.category;
        productActivity.value = response.body.activity;
        productRegistration.value = response.body.registration;
        productPolicy.value = response.body.policy;
        toast.add({ severity: 'success', summary: '成功', detail: '生成文案成功', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: '錯誤', detail: '生成文案失敗', life: 3000 });
    } finally {
        formLoaded();
    }
};

watch([getPrimary, getSurface, isDarkTheme], () => {});
</script>

<template>
    <Fluid>
        <Toast />
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl">旅遊產品文案生成器</div>
            <div class="flex flex-wrap">
                <Button label="生成文案" @click="generateProduct" :disabled="!buttonState" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">商品名稱</label>
                <InputText v-model="productName" id="productName" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">商品分類推薦</label>
                <InputText v-model="productCategory" id="productCategory" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">活動敘述</label>
                <Textarea v-model="productDescription" id="productDescription" rows="5" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">活動資訊</label>
                <Textarea v-model="productActivity" id="productActivity" rows="5" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">報名須知</label>
                <Textarea v-model="productRegistration" id="productRegistration" rows="5" />
            </div>
            <div class="flex flex-wrap">
                <label for="width" class="mb-2">取消與變更政策</label>
                <Textarea v-model="productPolicy" id="productPolicy" rows="5" />
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
