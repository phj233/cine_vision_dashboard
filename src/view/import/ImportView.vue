<template>
  <n-card :bordered="false" size="large">
    <n-space vertical align="center" style="width: 100%; max-width: 600px; margin: 2rem auto;">

      <n-alert title="CSV 文件格式要求" type="info" :show-icon="true" style="margin-bottom: 1.5rem; width: 100%;">
        <n-text>
          请确保您的 CSV 文件第一行为列标题。为获得最佳数据导入效果，建议您尽可能完整地提供以下列出的所有字段。
        </n-text>
        <n-divider style="margin-top: 0.75rem; margin-bottom: 0.75rem;"/>
        <n-space :size="[8, 8]" wrap>
          <n-tag v-for="fieldName in expectedFieldNames" :key="fieldName" type="primary" round size="small">
            {{ fieldName }}
          </n-tag>
        </n-space>
      </n-alert>

      <n-upload
        :action="uploadUrl"
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
            <n-icon>
              <icon-upload/>
            </n-icon>
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


      <n-collapse-transition :show="!!uploadResponseDetails && !uploading">
        <n-card title="导入详情" size="small" embedded style="margin-top: 1rem; width: 100%;">
          <n-descriptions label-placement="left" bordered :column="1">
            <n-descriptions-item v-for="(value, key) in uploadResponseDetails" :key="key" :label="String(key)">
              {{ value }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-collapse-transition>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NCollapseTransition,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NIcon,
  NProgress,
  NSpace,
  NTag,
  NText,
  NUpload,
  type UploadCustomRequestOptions,
  type UploadFileInfo,
  useMessage
} from 'naive-ui';
import {CloudUploadOutline as IconUpload} from '@vicons/ionicons5';
import axios from 'axios';
import {Movie} from "@/types.ts";

// 预期 CSV 字段列表 (用于前端提示)
const expectedFieldNames: (keyof Movie)[] = [
  'id', 'title', 'original_title', 'release_date', 'vote_average',
  'vote_count', 'revenue', 'runtime', 'overview', 'tagline', 'genres',
  'cast', 'directors', 'production_companies', 'production_countries',
  'poster_path', 'budget', 'imdb_id', 'tmdb_id',
];

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
console. log('UPLOAD: API_BASE_URL:', API_BASE_URL);
const uploadUrl = `${API_BASE_URL}/api/v1/import`;

// UI 状态
const message = useMessage();
const uploading = ref(false);
const uploadPercent = ref(0);
const uploadMessage = ref('');
const longProcessMessage = ref('');
const uploadStatus = ref<'success' | 'error' | 'info'>('info');
const fileList = ref<UploadFileInfo[]>([]);
const uploadResponseDetails = ref<Record<string, any> | null>(null);

// 文件列表变化时清空旧消息和状态
const handleFileChange = (data: { fileList: UploadFileInfo[] }) => {
  if (data.fileList.length === 0 ||
    (data.fileList.length > 0 && data.fileList[0].status !== 'uploading')) {
    uploadMessage.value = '';
    longProcessMessage.value = '';
    uploadResponseDetails.value = null;
    uploadPercent.value = 0;
  }
  fileList.value = data.fileList.slice(-1);
};

// 自定义上传逻辑
const handleCustomUpload = async ({file, onFinish, onError, onProgress,}: UploadCustomRequestOptions) => {
  uploading.value = true;
  uploadPercent.value = 0;
  uploadMessage.value = `开始上传 ${file.name}...`;
  longProcessMessage.value = ''; // 初始化时清空
  uploadStatus.value = 'info';
  uploadResponseDetails.value = null;

  const formData = new FormData();
  formData.append('file', file.file as File, file.name);

  let serverProcessingMessageSet = false; // 标记是否已显示服务器处理消息

  try {
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        // Axios 会自动为 FormData 设置正确的 'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadPercent.value = percent;
          onProgress({percent}); // 更新 NUpload 内部进度
          if (percent < 100) {
            uploadMessage.value = `文件上传中: ${percent}%`;
          } else if (percent === 100 && !serverProcessingMessageSet) {
            // 文件字节传输完成
            uploadMessage.value = '上传完成！服务器正在验证和处理数据...';
            longProcessMessage.value = '此过程可能需要非常长的时间（例如几分钟到几十分钟），请勿关闭或刷新页面。';
            serverProcessingMessageSet = true;
          }
        }
      },
      timeout: 1800000,
    });

    // 当 axios.post 的 promise resolve 时，表示后端已处理完毕并返回了 HTTP 响应
    console.log('Upload response:', response.data);

    if (response.data && response.data.success === true) {
      message.success(response.data.message || '文件导入成功！');
      uploadMessage.value = response.data.message || '文件导入成功！';
      uploadStatus.value = 'success';
      uploadResponseDetails.value = response.data.details || null;
      onFinish();
    } else {
      const errorMsg = response.data?.message || '导入失败，服务器返回的响应表明操作未成功。';
      message.error(errorMsg);
      uploadMessage.value = errorMsg;
      uploadStatus.value = 'error';
      uploadResponseDetails.value = response.data?.details || null;
      onError();
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    let errorMsg = '文件上传或处理失败，请稍后重试或联系管理员。';
    if (axios.isCancel(err)) {
      errorMsg = '上传已取消。';
    } else if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
      errorMsg = '处理超时！服务器处理时间过长，未能及时响应。';
      message.error(errorMsg);
    } else if (err.response && err.response.data && err.response.data.message) {
      errorMsg = err.response.data.message;
      message.error(errorMsg);
    } else if (err.message) {
      errorMsg = err.message;
      message.error(errorMsg);
    } else {
      message.error(errorMsg);
    }
    uploadMessage.value = errorMsg;
    uploadStatus.value = 'error';
    onError();
  } finally {
    uploading.value = false;
    longProcessMessage.value = '';
    uploadPercent.value = 0;
    if (uploadStatus.value === 'success' || uploadStatus.value === 'error') {
      setTimeout(() => {
        if (fileList.value.length > 0 && fileList.value[0].status !== 'uploading') {
          fileList.value = [];
        }
      }, 5000); // 5秒后清空文件列表，让用户看到文件名和状态
    }
  }
};
// 防止在上传/处理过程中意外关闭页面
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (uploading.value) {
    event.preventDefault();
    event.returnValue = '上传或处理数据中，请勿关闭或刷新页面。';
  }
}
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

</script>

<style scoped>
</style>
