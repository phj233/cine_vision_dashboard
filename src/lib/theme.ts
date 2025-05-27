import {GlobalThemeOverrides} from 'naive-ui'

/**
 * 亮色主题覆盖配置
 */
export const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#3B82F6',
        primaryColorHover: '#2563EB',
        primaryColorPressed: '#1D4ED8',
        infoColor: '#60A5FA',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
    },
    Card: {
        borderRadius: '8px',
    },
    Button: {
        borderRadiusMedium: '6px',
        borderRadiusSmall: '4px',
    },
    DataTable: {
        thColor: 'rgba(243, 244, 246, 0.8)',
        tdColorHover: 'rgba(243, 244, 246, 0.5)',
        borderRadius: '8px',
    },
    Input: {
        borderRadius: '6px',
    },
    Select: {
        menuBorderRadius: '6px',
    },
}

/**
 * 暗色主题覆盖配置
 */
export const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#60A5FA',
        primaryColorHover: '#93C5FD',
        primaryColorPressed: '#3B82F6',
        infoColor: '#60A5FA',
        successColor: '#34D399',
        warningColor: '#FBBF24',
        errorColor: '#F87171',
    },
    Card: {
        colorEmbedded: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '8px',
    },
    Button: {
        borderRadiusMedium: '6px',
        borderRadiusSmall: '4px',
        textColorPrimary: '#f1f5f9',
    },
    DataTable: {
        thColor: 'rgba(15, 23, 42, 0.8)',
        tdColorHover: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px',
    },
    Input: {
        borderRadius: '6px',
    },
    Select: {
        menuBorderRadius: '6px',
    },
}

/**
 * 自定义图表主题
 */
export const chartTheme = {
    light: {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#1f2937'
        },
        title: {
            textStyle: {
                color: '#111827'
            }
        },
        line: {
            itemStyle: {
                borderWidth: 2
            },
            lineStyle: {
                width: 2
            },
            symbolSize: 6
        },
        radar: {
            itemStyle: {
                borderWidth: 2
            },
            lineStyle: {
                width: 2
            },
            symbolSize: 6
        },
        gauge: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: [
                        [0.3, '#67e0e3'],
                        [0.7, '#37a2da'],
                        [1, '#fd666d']
                    ],
                    width: 15
                }
            }
        }
    },
    dark: {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#c9d1d9'
        },
        title: {
            textStyle: {
                color: '#f1f5f9'
            }
        },
        line: {
            itemStyle: {
                borderWidth: 2
            },
            lineStyle: {
                width: 2
            },
            symbolSize: 6
        },
        radar: {
            itemStyle: {
                borderWidth: 2
            },
            lineStyle: {
                width: 2
            },
            symbolSize: 6
        },
        gauge: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: [
                        [0.3, '#5CCFE6'],
                        [0.7, '#3B82F6'],
                        [1, '#F43F5E']
                    ],
                    width: 15
                }
            }
        }
    }
}

/**
 * 根据当前主题模式获取适当的图表主题
 * @param isDark 是否是暗色模式
 */
export const getChartTheme = (isDark: boolean) => {
    return isDark ? chartTheme.dark : chartTheme.light
}
