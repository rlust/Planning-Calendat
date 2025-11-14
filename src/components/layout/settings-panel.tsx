'use client';

import { useEffect } from 'react';
import { useAppData } from '@/components/providers/app-data-provider';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
};

const themes = ['light', 'dark', 'system'] as const;
const densities = ['comfortable', 'compact'] as const;

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { state, setSettings, resetWorkspace } = useAppData();

  useEffect(() => {
    if (!open) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const applyTheme = (theme: (typeof themes)[number]) => {
    setSettings({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Workspace settings"
      description="Adjust the basics to make the workspace feel more like yours."
    >
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-stone-700">Theme</h3>
        <div className="flex gap-2">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize ${
                state.settings.theme === theme
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-500'
              }`}
              onClick={() => applyTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-stone-700">Density</h3>
        <div className="flex gap-2">
          {densities.map((density) => (
            <button
              key={density}
              type="button"
              className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize ${
                state.settings.density === density
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-500'
              }`}
              onClick={() => setSettings({ density })}
            >
              {density}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-stone-700">Data</h3>
        <p className="text-sm text-stone-500">
          Everything lives in your browser for now. Reset brings back the starter data if you want a clean slate.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            resetWorkspace();
            onClose();
          }}
        >
          Reset workspace
        </Button>
      </section>
      <div className="flex justify-end pt-4">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
