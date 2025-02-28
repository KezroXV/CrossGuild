import { auth } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <div className="p-4">
      {session ? (
        <div className="space-y-2">
          <p className="text-lg">Logged in as {session.user?.email}</p>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
        </div>
      ) : (
        <p className="text-lg">Not logged in</p>
      )}
    </div>
  );
}
