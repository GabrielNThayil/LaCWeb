export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminLayout>
        <h1 className="text-2xl font-bold py-4">Dashboard</h1>
        <StatsGrid />
        <RecentActivity />
      </AdminLayout>
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-white shadow-lg p-4 fixed top-0 left-0 h-screen">
        <h2 className="text-xl font-semibold py-3">Admin Panel</h2>
        <nav>
          <ul>
            <li className="py-2"><a href="/admin">Dashboard</a></li>
            <li className="py-2"><a href="/admin/users">Users</a></li>
            <li className="py-2"><a href="/admin/settings">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <main className="ml-64 p-6 flex-1">
        {children}
      </main>
    </div>
  )
}

definition: {
  "name": "Dashboard",
  "description": "Main admin dashboard component",
  "props": {
    "title": "string"
  }
}