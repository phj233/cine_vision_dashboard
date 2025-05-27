<template>
  <div class="min-h-screen dark-bg flex flex-col items-center py-10 px-4">
    <!-- 上传区域 -->
    <n-card class="w-full max-w-4xl" :bordered="false">
      <h1 class="text-2xl font-bold mb-6">导入电影数据</h1>

      <n-upload
          action="http://127.0.0.1:3000/api/v1/import"
          :max="1"
          :show-file-list="true"
          @before-upload="handleBeforeUpload"
          @finish="handleUploadFinish"
          @error="handleUploadError"
          :disabled="uploading"
      >
        <n-upload-dragger :class="['upload-dragger', isDark ? 'dark-upload-dragger' : '']">
          <div class="py-12 text-center">
            <n-icon size="48" class="text-blue-600 mb-4">
              <cloud-upload-outline />
            </n-icon>
            <p class="text-lg font-medium dark-text">
              {{ uploading ? '正在上传中...' : '点击或拖拽 CSV 文件到此区域' }}
            </p>
            <p class="dark-text-secondary mt-2 text-sm">
              支持单个文件上传，文件大小不超过 2GB
            </p>
            <n-progress
                v-if="uploading"
                class="mt-4 w-64 mx-auto"
                type="line"
                :percentage="progress"
                :indicator-placement="'inside'"
            />
          </div>
        </n-upload-dragger>
      </n-upload>

      <n-alert v-if="uploadError" type="error" class="mt-4">
        {{ uploadError }}
        <div class="mt-2">
          <n-button type="primary" size="small" @click="handleRetry">
            <template #icon>
              <n-icon><reload-outline /></n-icon>
            </template>
            重新上传
          </n-button>
        </div>
      </n-alert>
    </n-card>

    <!-- 示例数据预览图 -->
    <n-card class="mt-12 w-full max-w-4xl" :bordered="false">
      <h2 class="text-xl font-bold mb-4">CSV 文件格式示例</h2>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <img
            src="https://readdy.ai/api/search-image?query=A%20clean%2C%20professional%20screenshot%20of%20a%20CSV%20file%20open%20in%20Excel%20or%20Google%20Sheets%2C%20showing%20sample%20movie%20data%20with%20columns%20for%20movie%20title%2C%20director%2C%20release%20year%2C%20and%20genre.%20The%20spreadsheet%20has%20a%20light%20grid%20pattern%20with%20clear%20column%20headers%20and%20sample%20data%20rows.%20The%20image%20is%20well-lit%20with%20a%20clean%20white%20background%20and%20professional%20appearance.&width=800&height=400&seq=1&orientation=landscape"
            alt="CSV文件格式示例"
            class="w-full h-auto object-cover object-top"
        />
      </div>
      <p class="mt-3 text-gray-600 text-sm">
        CSV 文件应包含标题行，并确保数据格式与系统要求一致。
      </p>
    </n-card>

    <!-- 导入指南 -->
    <n-card class="mt-12 w-full max-w-4xl" :bordered="false">
      <h2 class="text-xl font-bold mb-4">CSV 文件格式要求</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <n-thing
            v-for="(item, index) in guideSteps"
            :key="index"
            class="flex flex-col items-center text-center"
        >
          <template #avatar>
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-3">
              <n-icon size="32" color="#2563eb">
                <component :is="item.icon" />
              </n-icon>
            </div>
          </template>
          <template #header>
            <h3 class="font-medium mb-2">{{ item.title }}</h3>
          </template>
          <template #description>
            <p class="text-gray-600 text-sm">{{ item.description }}</p>
          </template>
        </n-thing>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {CheckmarkCircleOutline, CloudUploadOutline, DocumentTextOutline, ReloadOutline} from '@vicons/ionicons5';
import {useTheme} from '@/composables/useTheme';

const message = useMessage();
const uploading = ref(false);
const progress = ref(0);
const uploadError = ref('');

// 获取主题状态
const { isDark } = useTheme();

// 上传指南步骤
const guideSteps = [
  {
    icon: DocumentTextOutline,
    title: '文件格式',
    description: '确保文件为CSV格式，包含正确的列标题'
  },
  {
    icon: CloudUploadOutline,
    title: '上传文件',
    description: '拖拽文件到上传区域或点击选择文件按钮'
  },
  {
    icon: CheckmarkCircleOutline,
    title: '确认导入',
    description: '点击开始导入按钮，等待处理完成'
  }
];

// 上传前验证
const handleBeforeUpload = ({ file }: { file: File }) => {
  if (!file.name.endsWith('.csv')) {
    message.error('仅支持 CSV 格式文件');
    return false;
  }

  if (file.size > 2 * 1024 * 1024 * 1024) {
    message.error('文件大小不能超过 2GB');
    return false;
  }

  uploading.value = true;
  progress.value = 0;
  uploadError.value = '';
  return true;
};

// 处理上传进度
const handleUploadProgress = (e: ProgressEvent) => {
  if (e.lengthComputable) {
    progress.value = Math.round((e.loaded / e.total) * 100);
  }
};

// 上传完成处理
const handleUploadFinish = ({ file, event }: { file: File; event?: ProgressEvent }) => {
  uploading.value = false;
  message.success(`${file.name} 上传成功`);
  // 这里可以添加数据导入后的处理逻辑
};

// 错误处理
const handleUploadError = (error: Error) => {
  uploading.value = false;
  uploadError.value = `上传失败: ${error.message}`;
  message.error('文件上传失败，请检查文件格式后重试');
};

// 重新上传处理
const handleRetry = () => {
  uploadError.value = '';
  // 这里可以添加一些重置逻辑
  message.info('请重新选择文件上传');

  // 模拟点击上传区域
  const uploadInput = document.querySelector('.n-upload input[type=file]');
  if (uploadInput) {
    (uploadInput as HTMLElement).click();
  }
};
</script>

<style scoped>
.n-upload-dragger {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: white;
}

.dark-upload-dragger {
  background-color: #1f2937 !important;
  border-color: #4b5563 !important;
}

.n-upload-dragger:hover {
  border-color: #2080f0;
}

:deep(.n-upload-trigger) {
  width: 100%;
}
</style>
