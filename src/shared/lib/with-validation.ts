import { NextRequest } from "next/server";
import type { z } from "zod";
import { handleApiError } from "./handle-api-error";

export type ValidatedContext<T> = {
  body: T;
};

export function withValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema
) {
  return function withValidatedHandler<
    C extends Record<string, unknown>,
    TResult extends Response,
  >(
    handler: (
      req: NextRequest,
      context: C & ValidatedContext<z.infer<TSchema>>
    ) => Promise<TResult> | TResult
  ) {
    return async (req: NextRequest, context: C): Promise<Response> => {
      try {
        const body = schema.parse(await req.json());
        return await handler(req, { ...context, body });
      } catch (error) {
        return handleApiError(error);
      }
    };
  };
}
