import { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { auth } from "./auth";
import { apiError } from "./api-response";
import { handleApiError } from "./handle-api-error";

export type RouteHandlerContext = {
  params?: Promise<Record<string, string | string[]>>;
};

export type AuthContext = {
  session: Session;
};

export function withAuth<C extends RouteHandlerContext = RouteHandlerContext>(
  handler: (
    req: NextRequest,
    context: C & AuthContext
  ) => Promise<Response> | Response
) {
  return async (req: NextRequest, context: C): Promise<Response> => {
    try {
      const session = await auth();

      if (!session?.user) {
        return apiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      return await handler(req, { ...context, session });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
