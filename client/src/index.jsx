import React from 'react'
import { Workbench } from './Workbench.jsx'
import { dictionaries, NS } from './locales.js'
import { CSS } from './styles.js'

export const name = 'social-workbench'
export const inject = ['slots', 'connection', 'locale']
export const RPC_CHANNEL = '/dsh-social-workbench'

export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dictionaries), 'social-workbench: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'social-workbench'
    style.textContent = CSS
    document.head.append(style)
    return () => style.remove()
  }, 'social-workbench: styles')
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(RPC_CHANNEL, endpoint, payload, signal)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'social-workbench',
    order: 42,
    label: () => t('settingsLabel'),
    locale: NS,
    inject: () => ({ rpcCall, t }),
  }, Workbench))
}
