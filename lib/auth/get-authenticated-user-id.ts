import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export default async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return (
    (session.user as { id?: string }).id ??
    (session as typeof session & { userId?: string }).userId ??
    null
  );
}
