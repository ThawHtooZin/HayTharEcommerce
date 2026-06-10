import { useState } from 'react'
import { Accessibility, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function AccessibilityWidget() {
  const {
    reduceMotion, setReduceMotion,
    largeText, setLargeText,
    invertColors, setInvertColors,
    readingMask, setReadingMask,
  } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <>
      {readingMask && (
        <div
          className="pointer-events-none fixed inset-0 z-[80]"
          style={{
            background: 'linear-gradient(to bottom, transparent 35%, rgba(45,27,45,0.15) 50%, transparent 65%)',
          }}
        />
      )}

      <div className="fixed bottom-6 right-6 z-[85]">
        {open && (
          <div className="mb-3 w-64 rounded-2xl border border-blush bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-plum">Accessibility</h3>
              <button onClick={() => setOpen(false)} className="text-plum/50 hover:text-plum">
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 space-y-3 text-sm text-plum/80">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="rounded text-pink" />
                Stop animations
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} className="rounded text-pink" />
                Larger text
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={invertColors} onChange={(e) => setInvertColors(e.target.checked)} className="rounded text-pink" />
                Invert colors
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={readingMask} onChange={(e) => setReadingMask(e.target.checked)} className="rounded text-pink" />
                Reading mask
              </label>
            </div>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-plum text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Accessibility options"
        >
          <Accessibility size={22} />
        </button>
      </div>
    </>
  )
}
