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

function AdminLayout({ children }: { children: React.ReactNode }) {
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

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: "Total Orders", value: "1,284" },
        { label: "Revenue", value: "₹4,35,000" },
        { label: "Active Users", value: "342" }
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <ul className="mt-4 space-y-3">
        {["Order #482 placed by Priya M.", "New private space booking for Saturday", "Payment confirmed — Order #479"].map((item, i) => (
          <li key={i} className="text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}