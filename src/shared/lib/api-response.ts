import { NextResponse } from "next/server";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data } satisfies ApiSuccessResponse<T>,
    { status }
  );
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } } satisfies ApiErrorResponse,
    { status }
  );
}
