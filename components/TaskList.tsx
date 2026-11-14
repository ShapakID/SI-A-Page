'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { getCategoryBadge } from '@/lib/ui-helpers';
import { CheckCircle2, Circle, ExternalLink, Calendar, BookOpen } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('si_a_completed_tasks');
      if (stored) {
        setCompletedIds(JSON.parse(stored));
      }
    } catch {
      // LocalStorage access failsafe
    }
  }, []);

  const toggleTask = (id: number) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('si_a_completed_tasks', JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const filteredTasks = tasks.filter((t) => {
    const isDone = completedIds.includes(t.id);
    if (filter === 'pending') return !isDone;
    if (filter === 'done') return isDone;
    return true;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Daftar Tugas</h2>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-2 py-1 rounded transition-colors ${
              filter === 'pending' ? 'bg-neutral-200 text-ink font-medium' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-2 py-1 rounded transition-colors ${
              filter === 'done' ? 'bg-neutral-200 text-ink font-medium' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-neutral-200 text-ink font-medium' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center border border-hairline rounded-lg bg-canvas-subtle">
          <p className="text-xs text-ink-muted">
            {filter === 'pending'
              ? 'Tidak ada tugas yang tertunda. Kerja bagus!'
              : 'Tidak ada tugas pada filter ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isDone = completedIds.includes(task.id);
            const badge = getCategoryBadge(task.category);

            return (
              <div
                key={task.id}
                className={`p-3.5 border rounded-lg transition-all ${
                  isDone
                    ? 'border-hairline bg-canvas-subtle opacity-70'
                    : 'border-hairline bg-canvas hover:border-hairline-emphasis shadow-subtle'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-ink transition-colors shrink-0"
                    title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {task.subject}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-semibold truncate ${
                        isDone ? 'line-through text-ink-muted' : 'text-ink'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Deadline: {task.deadline}</span>
                      </div>

                      {task.submission_url && (
                        <a
                          href={task.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-ink font-medium hover:underline text-xs"
                        >
                          <span>Kumpul Tugas</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
