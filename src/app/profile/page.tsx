import { auth } from "@/auth";
import { DebugPanel } from "@/components/DebugPanel";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p className="mb-4">This is a protected page. You can only see this if you&apos;re authenticated.</p>
      <DebugPanel />
    </div>
  );
}
