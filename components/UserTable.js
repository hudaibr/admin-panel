'use client'

export default function UserTable({
  users,
  selected,
  onSelect,
  onSelectAll,
  onDelete,
  onStatus,
  loading,
}) {
  const allSelected = users.length > 0 && users.every((user) => selected.includes(user.id))

  return (
    <div className="overflow-hidden rounded-lg border border-[#d8dee6] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e4e7ec]">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <input checked={allSelected} onChange={(event) => onSelectAll(event.target.checked)} type="checkbox" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#667085]">Activated</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[#667085]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e7ec]">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <input
                    checked={selected.includes(user.id)}
                    onChange={(event) => onSelect(user.id, event.target.checked)}
                    type="checkbox"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium">{user.email}</td>
                <td className="px-4 py-3 text-sm text-[#475467]">{user.full_name || '-'}</td>
                <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#fff4f2] text-[#b42318]'}`}>
                    {user.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{user.is_activated ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-md border border-[#cfd6df] px-3 py-1.5 text-xs font-medium hover:bg-[#f2f4f7]"
                      disabled={loading}
                      onClick={() => onStatus(user.id, !user.is_active)}
                      type="button"
                    >
                      {user.is_active ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      className="rounded-md border border-[#f2b8b5] px-3 py-1.5 text-xs font-medium text-[#b42318] hover:bg-[#fff4f2]"
                      disabled={loading}
                      onClick={() => onDelete([user.id])}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#667085]" colSpan="7">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
