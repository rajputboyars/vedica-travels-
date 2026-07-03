// Reusable HTML email building blocks — every template in src/emails/
// (and every future one) composes these instead of hand-rolling inline
// styles per file. Email clients need inline CSS + table-safe layouts
// (no flexbox/grid, no external stylesheets), so these helpers exist to
// get that right exactly once. Adding a new email going forward is just:
// write a bodyHtml string using these pieces, pass it to emailShell().
import { siteConfig } from '@/config/site'

const COLORS = {
  brand: '#ea580c',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
} as const

// The outer shell every email renders inside: brand header, a white
// content card, and a consistent footer. `bodyHtml` is trusted content
// built by the calling template (not user input) — same trust model the
// existing templates already used before this refactor.
export function emailShell(bodyHtml: string, opts: { preheader?: string } = {}): string {
  return `
    <div style="background:${COLORS.bg};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>` : ''}
      <div style="max-width:520px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-size:28px;">${siteConfig.emoji}</span>
          <div style="font-size:18px;font-weight:700;color:${COLORS.text};margin-top:4px;">${siteConfig.name}</div>
        </div>
        <div style="background:#ffffff;border:1px solid ${COLORS.border};border-radius:16px;padding:32px;color:${COLORS.text};font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </div>
        <div style="text-align:center;margin-top:20px;color:${COLORS.muted};font-size:12px;line-height:1.6;">
          <div>${siteConfig.tagline}</div>
          <div>${siteConfig.contact.primaryPhone} &middot; ${siteConfig.contact.availability}</div>
        </div>
      </div>
    </div>
  `
}

export function heading(text: string, color: string = COLORS.text): string {
  return `<h2 style="margin:0 0 16px;font-size:20px;color:${color};">${text}</h2>`
}

export function button(label: string, url: string, color: string = COLORS.brand): string {
  return `
    <p style="margin:24px 0;">
      <a href="${url}" style="background:${color};color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        ${label}
      </a>
    </p>
  `
}

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger'

export function badge(label: string, tone: CalloutTone | 'brand' = 'info'): string {
  const c = tone === 'brand' ? { bg: '#fff7ed', border: '#fed7aa', text: COLORS.brand } : COLORS[tone]
  return `<span style="display:inline-block;background:${c.bg};border:1px solid ${c.border};color:${c.text};font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;">${label}</span>`
}

export function calloutBox(innerHtml: string, tone: CalloutTone = 'info'): string {
  const c = COLORS[tone]
  return `<div style="background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:14px 16px;border-radius:10px;margin:16px 0;font-size:14px;">${innerHtml}</div>`
}

// Simple two-column key/value table - used for booking IDs, amounts,
// dates, etc. Tables (not flexbox) because that's what actually renders
// consistently across email clients.
export function infoTable(rows: Array<[string, string]>): string {
  const tr = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;white-space:nowrap;">${label}</td>
          <td style="padding:6px 0 6px 12px;color:${COLORS.text};font-size:14px;font-weight:600;text-align:right;">${value}</td>
        </tr>
      `
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${tr}</table>`
}

export function monoCode(text: string): string {
  return `<span style="font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.5px;">${text}</span>`
}
