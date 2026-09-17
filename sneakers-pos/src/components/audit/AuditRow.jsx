// src/components/audit/AuditRow.jsx

const LEVEL_STYLES = {
  info: 'bg-gray-100 text-gray-700 border-gray-200',
  important: 'bg-amber-100 text-amber-800 border-amber-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const LEVEL_LABELS = {
  info: 'Info',
  important: 'Importante',
  critical: 'Crítico',
}

const ACTION_ICONS = {
  create: '➕',
  update: '✏️',
  delete: '🗑️',
  cancel: '❌',
  close: '🔒',
  register: '📝',
  status: '🔄',
}

export default function AuditRow({ event, onClick }) {
  const levelClass = LEVEL_STYLES[event.level] || LEVEL_STYLES.info
  const levelLabel = LEVEL_LABELS[event.level] || 'Info'
  const icon = ACTION_ICONS[event.action] || '📋'

  const date = new Date(event.createdAt)
  const dateStr = date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
  })
  const timeStr = date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr
      onClick={onClick}
      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-gray-900 font-medium text-xs">{dateStr}</div>
        <div className="text-gray-500 text-xs">{timeStr}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${levelClass}`}
        >
          {levelLabel}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-900 text-xs font-medium">
          {event.userName || '—'}
        </div>
        <div className="text-gray-500 text-xs">{event.userRole || ''}</div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
          {event.module || 'system'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-700">
          {icon} {event.action}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700 text-xs max-w-md truncate">
        {event.description || '—'}
      </td>
    </tr>
  )
}