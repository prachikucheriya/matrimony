import DeleteUserButton from "./DeleteUserButton";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN" || session.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      phone: true,
      email: true,
      role: true,
      plan: true,
      createdAt: true,
      profile: {
        select: {
          displayName: true,
          gender: true,
          city: true,
          status: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">
          Matrimony Admin Dashboard
        </h1>

        <p className="mb-8 text-gray-600">
          Manage registered users and profiles
        </p>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">Total Registered Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Mobile / Email</th>
                <th className="p-4">Gender</th>
                <th className="p-4">City</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Profile Status</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">
                    {user.profile?.displayName || "Not completed"}
                  </td>
                  <td className="p-4">
                    {user.phone || user.email || "-"}
                  </td>
                  <td className="p-4">
                    {user.profile?.gender || "-"}
                  </td>
                  <td className="p-4">
                    {user.profile?.city || "-"}
                  </td>
                  <td className="p-4">{user.plan}</td>
                  <td className="p-4">
                    {user.profile?.status || "NO PROFILE"}
                  </td>
                  <td className="p-4">{user.role}</td>
                  
                    
<td className="p-4">
  {user.createdAt.toLocaleDateString("en-IN")}
</td>

<td className="p-4">
  {user.role === "ADMIN" ? (
    <span className="text-gray-400">Protected</span>
  ) : (
    <DeleteUserButton
      userId={user.id}
      userName={user.profile?.displayName || "Unnamed User"}
    />
  )}
</td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
