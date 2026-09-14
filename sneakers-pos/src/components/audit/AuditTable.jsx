// src/components/audit/AuditTable.jsx
import { ChevronRight, User as UserIcon, Cpu } from 'lucide-react'
import { getActionLabel } from '../../data/audit'
import { LevelBadge, ResultBadge, ModuleBadge } from './AuditBadges'

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function UserCell({ user }) {
  if (!user || user.system) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-dark-muted">
        <Cpu size={14} /> Sistema
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/40 text-brand-blue text-[10px] font-bold flex items-center justify-center">
        {user.name?.charAt(0)?.toUpperCase() || <UserIcon size={12} />}
      </span>
      <span className="text-brand-black dark:text-dark-text font-medium truncate">
        {user.name}
      </span>
    </span>
  )
}

export default function AuditTable({ events = [], onRowClick }) {
  if (events.length === 0) return null

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-dark-muted border-b border-gray-100 dark:border-dark-border">
              <th className="px-4 py-3 font-medium">Fecha/hora</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Acción</th>
              <th className="px-4 py-3 font-medium">Módulo</th>
              <th className="px-4 py-3 font-medium">Entidad</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {events.map((e) => (
              <tr
                key={e.id}
                onClick={() => onRowClick?.(e)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 dark:text-dark-muted whitespace-nowrap">
                  {formatDateTime(e.createdAt)}
                </td>
                <td className="px-4 py-3"><UserCell user={e.user} /></td>
                <td className="px-4 py-3 text-brand-black dark:text-dark-text font-medium">
                  {getActionLabel(e.action)}
                </td>
                <td className="px-4 py-3"><ModuleBadge module={e.module} /></td>
                <td className="px-4 py-3 text-gray-600 dark:text-dark-muted truncate max-w-[160px]">
                  {e.entityName || e.entityId || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-dark-muted truncate max-w-[220px]">
                  {e.description || '—'}
                </td>
                <td className="px-4 py-3"><ResultBadge result={e.result} /></td>
                <td className="px-4 py-3"><LevelBadge level={e.level} /></td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight size={16} className="text-gray-400 inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
        {events.map((e) => (
          <li
            key={e.id}
            onClick={() => onRowClick?.(e)}
            className="px-4 py-4 cursor-pointer active:bg-gray-50 dark:active:bg-dark-surface"
          >
            <div className="flex items-center justify-between mb-2">
              <UserCell user={e.user} />
              <span className="text-xs text-gray-400 dark:text-dark-muted">
                {formatDateTime(e.createdAt)}
              </span>
            </div>
            <p className="text-sm font-medium text-brand-black dark:text-dark-text">
              {getActionLabel(e.action)}{' '}
              <span className="font-normal text-gray-500 dark:text-dark-muted">
                · {e.entityName || e.entityId || '—'}
              </span>
            </p>
            {e.description && (
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 line-clamp-2">
                {e.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ModuleBadge module={e.module} />
              <ResultBadge result={e.result} />
              <LevelBadge level={e.level} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}