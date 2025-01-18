import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
// TODO insted of check role, check profileAccess (Groups)

  // Check if user has admin role
  const isAdmin = session?.user.roles.some(role => role === "ROLE_ADMIN");
  
  if (!isAdmin) {
    redirect("/auth/error?error=Not%20authorized");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-4">This is a protected admin page. You can only see this if you&apos;re authenticated and have the ROLE_ADMIN role.</p>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <p className="text-gray-600">This is a placeholder for admin actions.</p>
      </div>
    </div>
  );
}
