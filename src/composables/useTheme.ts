import {computed, inject} from 'vue'
import {darkTheme, useOsTheme} from 'naive-ui'

export interface ThemeVars {
    isDark: boolean
    textColor: string
    bgColor: string
    borderColor: string
    primaryColor: string
    secondaryColor: string
    dangerColor: string
    successColor: string
    cardBgColor: string
    hoverColor: string
}

/**
 * 主题工具函数
 * 用于获取当前应用的主题状态和变量
 */
export function useTheme() {
    // 通过注入获取应用当前的主题
    const theme = inject('theme', null)
    const osTheme = useOsTheme()

    // 判断当前是否是暗色主题
    const isDark = computed(() => theme?.value === darkTheme)

    // 定义各种主题相关的颜色变量
    const themeVars = computed<ThemeVars>(() => {
        if (isDark.value) {
            return {
                isDark: true,
                textColor: 'dark-text',
                bgColor: 'dark-bg',
                borderColor: 'dark-border',
                primaryColor: 'text-blue-400',
                secondaryColor: 'dark-text-secondary',
                dangerColor: 'text-red-400',
                successColor: 'text-green-400',
                cardBgColor: 'dark-card',
                hoverColor: 'hover:bg-gray-700'
            }
        } else {
            return {
                isDark: false,
                textColor: 'text-gray-800',
                bgColor: 'bg-white',
                borderColor: 'border-gray-200',
                primaryColor: 'text-blue-600',
                secondaryColor: 'text-gray-600',
                dangerColor: 'text-red-600',
                successColor: 'text-green-600',
                cardBgColor: 'bg-white',
                hoverColor: 'hover:bg-gray-100'
            }
        }
    })

    return {
        theme,
        isDark,
        themeVars,
        osTheme
    }
}
