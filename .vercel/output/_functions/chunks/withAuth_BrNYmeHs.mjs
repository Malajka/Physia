import { e as errorResponse } from "./api_CZk8L_u-.mjs";

var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["VALIDATION_FAILED"] = "validation_failed";
  ErrorCode2["DISCLAIMER_REQUIRED"] = "disclaimer_required";
  ErrorCode2["RESOURCE_NOT_FOUND"] = "resource_not_found";
  ErrorCode2["SERVER_ERROR"] = "server_error";
  ErrorCode2["AUTHENTICATION_REQUIRED"] = "authentication_required";
  return ErrorCode2;
})(ErrorCode || {});

function withAuth(handler) {
  return async function (context) {
    const { locals } = context;
    const supabase = locals.supabase;
    if (!supabase) {
      return errorResponse(ErrorCode.SERVER_ERROR, "Server configuration error: Supabase client unavailable", 500);
    }
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return errorResponse(ErrorCode.SERVER_ERROR, "Failed to retrieve session", 500);
    }
    const { session } = data;
    if (!session) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }
    return handler(context, session.user.id);
  };
}

export { ErrorCode as E, withAuth as w };
