export default function UsersTable({ users }) {
    const theadItems = [
        { id: 1, label: "ID" },
        { id: 2, label: "Name" },
        { id: 3, label: "Surname" },
        { id: 4, label: "Email" },
        { id: 5, label: "Role" },
        { id: 6, label: "Created At" },
    ];
    return (
        <div className="rounded-xl border border-jet overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-eerie text-silver">
                    <tr>
                        {theadItems.map((th) => (
                            <th key={th.id} className="px-4 py-2 text-left">
                                {th.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-t border-jet hover:bg-jet/60 transition">
                            <td className="px-4 py-2">{u.id}</td>
                            <td className="px-4 py-2">{u.name}</td>
                            <td className="px-4 py-2">{u.surname}</td>
                            <td className="px-4 py-2">{u.email}</td>
                            <td className="px-4 py-2 text-xs">
                                <span
                                    className={
                                        u.role === "ADMIN"
                                            ? "px-2 py-1 rounded-full bg-success/20 text-success"
                                            : "px-2 py-1 rounded-full bg-info/20 text-info"
                                    }
                                >
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
