import { NextRequest } from "next/server";
import {
  type AuthContext,
  type RouteHandlerContext,
  withAuth,
} from "./with-auth";
import { apiError } from "./api-response";

export function withAdmin<C extends RouteHandlerContext = RouteHandlerContext>(
  handler: (
    req: NextRequest,
    context: C & AuthContext
  ) => Promise<Response> | Response
) {
  return withAuth<C>(async (req, context) => {
    if (!context.session.user.isAdmin) {
      return apiError("FORBIDDEN", "Forbidden", 403);
    }

    return handler(req, context);
  });
}
