'use client'

export default function Toast({ toast, onClose }) {
  if (!toast?.message) return null

  const styles = toast.type === 'error'
    ? 'border-[#f2b8b5] bg-[#fff4f2] text-[#b42318]'
    : 'border-[#a7f3d0] bg-[#ecfdf3] text-[#067647]'

  return (
    <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-md border px-4 py-3 text-sm shadow-sm ${styles}`}>
      <div className="flex items-start gap-3">
        <span>{toast.message}</span>
        <button className="font-bold" onClick={onClose} type="button">x</button>
      </div>
    </div>
  )
}
