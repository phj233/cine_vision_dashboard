<template>
  <n-card>
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">数据导入工具</h1>
      <!-- 上传区域 -->
      <n-card>
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
          <n-upload-dragger>
            <div class="py-12 text-center">
              <n-icon size="48" class="mb-4" color="#2080f0">
                <cloud-upload-outline />
              </n-icon>
              <p class="text-lg font-medium">
                {{ uploading ? '正在上传中...' : '点击或拖拽 CSV 文件到此区域' }}
              </p>
              <p class="mt-2 text-sm" style="color: #666;">
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
      <n-card class="mt-4">
        <template #header>
          <div class="text-xl font-bold">CSV 文件格式示例</div>
        </template>
        <div class="bg-white rounded-lg overflow-hidden">
          <img
              src="https://readdy.ai/api/search-image?query=A%20clean%2C%20professional%20screenshot%20of%20a%20CSV%20file%20open%20in%20Excel%20or%20Google%20Sheets%2C%20showing%20sample%20movie%20data%20with%20columns%20for%20movie%20title%2C%20director%2C%20release%20year%2C%20and%20genre.%20The%20spreadsheet%20has%20a%20light%20grid%20pattern%20with%20clear%20column%20headers%20and%20sample%20data%20rows.%20The%20image%20is%20well-lit%20with%20a%20clean%20white%20background%20and%20professional%20appearance.&width=800&height=400&seq=1&orientation=landscape"
              alt="CSV文件格式示例"
              class="w-full h-auto object-cover object-top"
          />
        </div>
        <div class="mt-3 text-sm" style="color: #666;">
          CSV 文件应包含标题行，并确保数据格式与系统要求一致。
        </div>
      </n-card>

      <!-- 导入指南 -->
      <n-card class="mt-4">
        <template #header>
          <div class="text-xl font-bold">CSV 文件格式要求</div>
        </template>
        <n-grid :cols="3" :x-gap="12" responsive="screen">
          <n-gi v-for="(item, index) in guideSteps" :key="index">
            <n-thing>
              <template #avatar>
                <n-avatar round :size="48" :color="avatarColor">
                  <n-icon :component="item.icon" />
                </n-avatar>
              </template>
              <template #header>
                <div class="font-medium">{{ item.title }}</div>
              </template>
              <template #description>
                <div style="color: #666; font-size: 14px;">{{ item.description }}</div>
              </template>
            </n-thing>
          </n-gi>
        </n-grid>
      </n-card>
    </main>
  </n-card>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {CheckmarkCircleOutline, CloudUploadOutline, DocumentTextOutline, ReloadOutline} from '@vicons/ionicons5';
import {useTheme} from '@/composables/useTheme';
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NGi,
  NGrid,
  NIcon,
  NProgress,
  NThing,
  NUpload,
  NUploadDragger,
  useMessage
} from 'naive-ui';

const message = useMessage();
const uploading = ref(false);
const progress = ref(0);
const uploadError = ref('');

// 获取主题状态
const { isDark } = useTheme();

// 头像背景色
const avatarColor = computed(() => isDark.value ? '#18a058' : '#d0f0dd');

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

// 上传完成处理
const handleUploadFinish = ({ file}: { file: File; event?: ProgressEvent }) => {
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

</style>
