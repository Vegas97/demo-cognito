import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      Profile page for {session.user.name}
    </div>
  );
}
