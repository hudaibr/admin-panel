'use client'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-[#667085]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-medium" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="rounded-md bg-[#b42318] px-4 py-2 text-sm font-semibold text-white"
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
