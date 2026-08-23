export const NS = 'socialWorkbench'

const en = {
  settingsLabel: 'Social Workbench', title: 'Social Capability Workbench',
  subtitle: 'What the system can do, whether it is usable now, and what unblocks it.',
  loading: 'Loading capability health…', retry: 'Retry', refresh: 'Refresh health', refreshing: 'Checking…',
  pipeline: 'Pipeline facts', capabilities: 'Capability map', safety: 'Authority boundary',
  safetyText: 'This surface is read-only. Login, one-time approval, and live publishing remain user-held operations.',
  lastChecked: 'Observed', noConditions: 'No runtime conditions — this capability is planned.',
}

export const dictionaries = {
  en,
  zh: {
    settingsLabel: '社交能力工作台', title: '社交能力工作台',
    subtitle: '只看三件事：系统能做什么、此刻是否可用、下一步如何解除阻塞。',
    loading: '正在读取能力健康状态…', retry: '重试', refresh: '刷新健康状态', refreshing: '检查中…',
    pipeline: '流水线事实', capabilities: '能力地图', safety: '权限边界',
    safetyText: '当前界面只读。登录、一次性确认和真实发布仍由用户持有，不因工作台可见而自动扩权。',
    lastChecked: '探测时间', noConditions: '没有运行条件：该能力仍处于规划阶段。',
  },
}
