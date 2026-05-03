'use client'

export default function ActivationTable({ codes, onCopy, onDelete, onRegenerate, loading }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d8dee6] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e4e7ec]">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Used</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[#667085]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e7ec]">
            {codes.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium">{item.user?.email || 'Unknown user'}</div>
                  <div className="text-xs text-[#667085]">{item.user?.full_name || item.user_id}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <code className="rounded bg-[#f2f4f7] px-2 py-1 text-xs">{item.code}</code>
                </td>
                <td className="px-4 py-3 text-sm text-[#475467]">{new Date(item.expires_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{item.is_used ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-[#cfd6df] px-3 py-1.5 text-xs font-medium" disabled={loading} onClick={() => onCopy(item.code)} type="button">
                      Copy
                    </button>
                    <button className="rounded-md border border-[#cfd6df] px-3 py-1.5 text-xs font-medium" disabled={loading} onClick={() => onRegenerate(item)} type="button">
                      Regenerate
                    </button>
                    <button className="rounded-md border border-[#f2b8b5] px-3 py-1.5 text-xs font-medium text-[#b42318]" disabled={loading} onClick={() => onDelete(item.id)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!codes.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#667085]" colSpan="5">
                  No activation codes found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
