<template>
  <n-card title="CSV 文件导入" :bordered="false" size="large">
    <n-space vertical align="center" style="width: 100%; max-width: 600px; margin: 2rem auto;">

      <n-alert title="CSV 文件格式要求" type="info" :show-icon="true" style="margin-bottom: 1.5rem; width: 100%;">
        <n-text>
          请确保您的 CSV 文件第一行为列标题。为获得最佳数据导入效果，建议您尽可能完整地提供以下表格中列出的所有字段。
        </n-text>
        <n-divider style="margin-top: 0.75rem; margin-bottom: 0.75rem;" />
        <n-space :size="[8, 8]" wrap>
          <n-tag v-for="fieldName in expectedFieldNames" :key="fieldName" type="primary" round size="small">
            {{ fieldName }}
          </n-tag>
        </n-space>
      </n-alert>

      <n-upload
        :action="uploadUrlAction"
        accept=".csv, text/csv"
        :max="1"
        :custom-request="handleCustomUpload"
        @change="handleFileChange"
        :disabled="uploading"
        v-model:file-list="fileList"
        :show-file-list="true"
        list-type="text"
        style="width: 100%;"
      >
        <n-button type="primary" :loading="uploading" :disabled="uploading" block>
          <template #icon>
            <n-icon><icon-upload /></n-icon>
          </template>
          选择 CSV 文件并上传
        </n-button>
      </n-upload>

      <div v-if="uploading && uploadPercent > 0" style="width: 100%; margin-top: 1rem;">
        <n-progress
          type="line"
          status="info"
          :percentage="uploadPercent"
          :indicator-placement="'inside'"
          processing
        />
      </div>

      <n-text v-if="uploadMessage" :type="uploadStatus"
              style="margin-top: 1rem; font-weight: bold; text-align: center;">
        {{ uploadMessage }}
      </n-text>
      <n-text v-if="longProcessMessage" type="warning" style="font-size: 0.85rem; text-align: center;">
        {{ longProcessMessage }}
      </n-text>

      <div v-if="uploadResult && !uploading" style="width: 100%; margin-top: 1.5rem;">
        <n-card
          :title="uploadResult.status === 'success' && uploadResult.errorCount === 0 ? '导入成功' : '导入完成总结'"
          :type="uploadResult.status === 'success' && uploadResult.errorCount === 0 ? 'success' : (uploadResult.errorCount > 0 || uploadResult.status === 'error' ? 'warning' : 'info')"
          embedded
        >
          <n-grid :cols="3" :x-gap="12" :y-gap="12" responsive="screen">
            <n-gi>
              <n-statistic label="成功处理记录" :value="uploadResult.count" />
            </n-gi>
            <n-gi>
              <n-statistic label="失败记录" :value="uploadResult.errorCount">
                <template #prefix v-if="uploadResult.errorCount > 0">
                  <n-icon color="red"><icon-error /></n-icon>
                </template>
              </n-statistic>
            </n-gi>
            <n-gi>
              <n-statistic label="后端处理时长" :value="formatProcessingTime(uploadResult.processingTime)" />
            </n-gi>
          </n-grid>

          <div v-if="uploadResult.errorCount > 0 && uploadResult.errors && uploadResult.errors.length > 0">
            <n-divider title-placement="left" style="margin-top: 1rem;">错误详情</n-divider>
            <n-list bordered hoverable size="small" style="max-height: 200px; overflow-y: auto;">
              <template #header>
                <n-text type="error">共 {{ uploadResult.errorCount }} 条记录处理失败（仅展示部分错误）：</n-text>
              </template>
              <n-list-item v-for="(err, index) in uploadResult.errors.slice(0, 10)" :key="index">
                <n-text type="error" style="word-break: break-all;">{{ typeof err === 'object' ? JSON.stringify(err) : String(err) }}</n-text>
              </n-list-item>
              <template #footer v-if="uploadResult.errors.length > 10">
                <n-text depth="3">更多错误详情请查看后端日志。</n-text>
              </template>
              <template #footer v-else-if="uploadResult.errors.length === 0 && uploadResult.errorCount > 0">
                <n-text depth="3">具体错误内容请查看后端日志。</n-text>
              </template>
            </n-list>
          </div>
          <div v-else-if="uploadResult.status === 'error' && (!uploadResult.errors || uploadResult.errors.length === 0)">
            <n-divider title-placement="left" style="margin-top: 1rem;">错误信息</n-divider>
            <n-text type="error">{{ uploadResult.rawMessage || '发生未知错误。' }}</n-text>
          </div>
        </n-card>
      </div>

    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NDivider,
  NGi,
  NGrid,
  NIcon,
  NList,
  NListItem,
  NProgress,
  NSpace,
  NStatistic,
  NTag,
  NText,
  NUpload,
  type UploadCustomRequestOptions,
  type UploadFileInfo,
  useMessage
} from 'naive-ui';
import {AlertCircleOutline as IconError, CloudUploadOutline as IconUpload} from '@vicons/ionicons5';
import {importApi} from '@/lib/api';
import type {Movie} from "@/types";

// Movie 接口和 expectedFieldNames 保持不变
const expectedFieldNames: (keyof Movie)[] = [
  'id', 'title', 'original_title', 'release_date', 'vote_average',
  'vote_count', 'revenue', 'runtime', 'overview', 'tagline', 'genres',
  'cast', 'directors', 'production_companies', 'production_countries',
  'poster_path', 'budget', 'imdb_id', 'tmdb_id',
];

const API_BASE_URL_FOR_ACTION = import.meta.env.VITE_API_BASE_URL || '';
const uploadUrlAction = `${API_BASE_URL_FOR_ACTION}/api/v1/import`;

const message = useMessage();
const uploading = ref(false);
const uploadPercent = ref(0);
const uploadMessage = ref('');
const longProcessMessage = ref('');
const uploadStatus = ref<'success' | 'error' | 'info'>('info');
const fileList = ref<UploadFileInfo[]>([]);

interface UploadResult {
  status: 'success' | 'error' | 'info';
  count: number;
  errorCount: number;
  errors: any[];
  processingTime: number;
  rawMessage?: string;
}
const uploadResult = ref<UploadResult | null>(null);

// 文件列表变化时的处理逻辑 (已修改)
const handleFileChange = (data: { fileList: UploadFileInfo[], file: UploadFileInfo }) => {
  if (data.fileList.length === 0 && fileList.value.length > 0) {
    uploadMessage.value = '';
    longProcessMessage.value = '';
    uploadResult.value = null;
    uploadPercent.value = 0;
    uploadStatus.value = 'info'; // 重置状态
  }
  fileList.value = data.fileList.slice(-1);
};

const formatProcessingTime = (ms?: number | string): string => { /* ... (保持不变) ... */
  if (ms === null || ms === undefined) return '未知';
  const value = Number(ms);
  if (isNaN(value)) return '未知';
  if (value < 1000) {
    return `${value} 毫秒`;
  }
  return `${(value / 1000).toFixed(2)} 秒`;
};

const handleCustomUpload = async ({ file, onFinish, onError, onProgress }: UploadCustomRequestOptions) => {
  uploading.value = true;
  uploadPercent.value = 0;
  uploadMessage.value = `开始上传 ${file.name}...`;
  longProcessMessage.value = '';
  uploadStatus.value = 'info';
  uploadResult.value = null; // <--- 关键：在这里清空上一次的结果

  let serverProcessingMessageSet = false;

  const apiOnUploadProgress = (progressEvent: any) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      uploadPercent.value = percent;
      onProgress({ percent });
      if (percent < 100) {
        uploadMessage.value = `文件上传中: ${percent}%`;
      } else if (percent === 100 && !serverProcessingMessageSet) {
        uploadMessage.value = '上传完成！服务器正在验证和处理数据...';
        longProcessMessage.value = 'CSV文件较大，此过程可能需要非常长的时间，请勿关闭或刷新页面。';
        serverProcessingMessageSet = true;
      }
    }
  };

  try {
    const responseData = await importApi.uploadCsvFile(file.file as File, apiOnUploadProgress);
    console.log('Upload response from API service:', responseData);
    longProcessMessage.value = '';

    if (responseData && responseData.success === true) {
      const successMsg = responseData.message || `文件导入成功！`;
      message.success(successMsg);
      uploadMessage.value = successMsg;
      uploadStatus.value = 'success';
      uploadResult.value = { // 设置本次上传的结果
        status: 'success',
        count: responseData.count ?? 0,
        errorCount: responseData.errorCount ?? 0,
        errors: responseData.errors || [],
        processingTime: responseData.processingTime ?? 0,
        rawMessage: successMsg
      };
      onFinish();
    } else {
      const errorMsg = responseData?.message || '导入操作未成功，详情请查看下方或联系管理员。';
      message.error(errorMsg);
      uploadMessage.value = errorMsg;
      uploadStatus.value = 'error';
      uploadResult.value = { // 设置本次上传的结果
        status: 'error',
        count: responseData?.count ?? 0,
        errorCount: responseData?.errorCount ?? (responseData?.errors?.length || (responseData?.message ? 1 : 0)),
        errors: responseData?.errors || (responseData?.message ? [responseData.message] : ['未知服务端错误']),
        processingTime: responseData?.processingTime ?? 0,
        rawMessage: errorMsg
      };
      onError();
    }
  } catch (err: any) {
    console.error('Error during customUpload in component:', err);
    longProcessMessage.value = '';
    let uiErrorMsg = '文件上传或处理失败，请检查网络或服务器状态。';
    if (err.response && err.response.data && err.response.data.message) {
      uiErrorMsg = err.response.data.message;
    } else if (err.message) {
      if (err.message.toLowerCase().includes('timeout')) {
        uiErrorMsg = '处理超时！服务器处理时间过长，未能及时响应。';
      } else if (err.message.toLowerCase().includes('network error')) {
        uiErrorMsg = '网络错误，请检查您的网络连接。';
      } else {
        uiErrorMsg = err.message;
      }
    }
    message.error(uiErrorMsg);
    uploadMessage.value = uiErrorMsg;
    uploadStatus.value = 'error';
    uploadResult.value = { // 设置本次上传的结果
      status: 'error',
      count: 0,
      errorCount: 1,
      errors: [uiErrorMsg],
      processingTime: 0,
      rawMessage: uiErrorMsg
    };
    onError();
  } finally {
    uploading.value = false;
    // fileList.value = []; // 考虑是否在操作完成后自动清空文件列表
  }
};
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (uploading.value) {
    event.preventDefault();
    event.returnValue = '文件仍在上传或处理中，确定要离开吗？未完成的操作可能会丢失。';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

</script>

<style scoped>
</style>
