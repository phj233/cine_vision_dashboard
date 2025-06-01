import type {GlobalThemeOverrides} from 'naive-ui'

/**
 * 亮色主题覆盖配置
 */
export const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#2080f0',
        primaryColorHover: '#4098fc',
        primaryColorPressed: '#1060d9',
        primaryColorSuppl: '#4098fc',
        infoColor: '#2080f0',
        infoColorHover: '#4098fc',
        infoColorPressed: '#1060d9',
        infoColorSuppl: '#4098fc',
        successColor: '#18a058',
        successColorHover: '#36ad6a',
        successColorPressed: '#0c7a43',
        successColorSuppl: '#36ad6a',
        warningColor: '#f0a020',
        warningColorHover: '#fcb040',
        warningColorPressed: '#d99010',
        warningColorSuppl: '#fcb040',
        errorColor: '#d03050',
        errorColorHover: '#de576d',
        errorColorPressed: '#ab1f3f',
        errorColorSuppl: '#de576d'
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
        primaryColor: '#2080f0',
        primaryColorHover: '#4098fc',
        primaryColorPressed: '#1060d9',
        primaryColorSuppl: '#4098fc',
        infoColor: '#2080f0',
        infoColorHover: '#4098fc',
        infoColorPressed: '#1060d9',
        infoColorSuppl: '#4098fc',
        successColor: '#18a058',
        successColorHover: '#36ad6a',
        successColorPressed: '#0c7a43',
        successColorSuppl: '#36ad6a',
        warningColor: '#f0a020',
        warningColorHover: '#fcb040',
        warningColorPressed: '#d99010',
        warningColorSuppl: '#fcb040',
        errorColor: '#d03050',
        errorColorHover: '#de576d',
        errorColorPressed: '#ab1f3f',
        errorColorSuppl: '#de576d'
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
