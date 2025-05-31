import {createDiscreteApi, darkTheme} from 'naive-ui';
import {computed} from 'vue';
import {darkThemeOverrides, lightThemeOverrides} from '@/lib/theme';

// 获取主题状态
const getThemeConfig = () => {
    // 从localStorage获取当前主题偏好
    const isDarkMode = localStorage.getItem('theme-preference') === 'dark';

    return {
        theme: isDarkMode ? darkTheme : null,
        themeOverrides: isDarkMode ? darkThemeOverrides : lightThemeOverrides,
    };
};

// 获取动态配置
const getDiscreteApiOptions = () => {
    const { theme, themeOverrides } = getThemeConfig();

    return {
        configProviderProps: {
            theme,
            themeOverrides
        }
    };
};

// 创建离散API，可以在组件外使用
const { message, notification, dialog, loadingBar } = createDiscreteApi(
    ['message', 'notification', 'dialog', 'loadingBar'],
    computed(getDiscreteApiOptions)
);

/**
 * 显示消息提示
 * @param content 消息内容
 * @param type 消息类型：success, info, warning, error
 * @param duration 显示时长（毫秒），默认3000
 */
export const showMessage = (
    content: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration = 3000
) => {
    message[type](content, { duration });
};

/**
 * 显示通知
 * @param title 通知标题
 * @param content 通知内容
 * @param type 通知类型：success, info, warning, error
 * @param duration 显示时长（毫秒），默认4500
 */
export const showNotification = (
    title: string,
    content: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration = 4500
) => {
    notification[type]({
        title,
        content,
        duration,
        keepAliveOnHover: true
    });
};

/**
 * 显示确认对话框
 * @param title 对话框标题
 * @param content 对话框内容
 * @param positiveText 确认按钮文字
 * @param negativeText 取消按钮文字
 * @returns Promise<boolean> 用户确认返回true，取消返回false
 */
export const showConfirm = (
    title: string,
    content: string,
    positiveText = '确认',
    negativeText = '取消'
): Promise<boolean> => {
    return new Promise((resolve) => {
        dialog.warning({
            title,
            content,
            positiveText,
            negativeText,
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false),
            onClose: () => resolve(false)
        });
    });
};

/**
 * 显示加载条
 */
export const startLoading = () => loadingBar.start();
export const finishLoading = () => loadingBar.finish();
export const errorLoading = () => loadingBar.error();

export { message, notification, dialog, loadingBar };
