import { e as errorResponse } from './api_CZk8L_u-.mjs';

var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["VALIDATION_FAILED"] = "validation_failed";
  ErrorCode2["DISCLAIMER_REQUIRED"] = "disclaimer_required";
  ErrorCode2["RESOURCE_NOT_FOUND"] = "resource_not_found";
  ErrorCode2["SERVER_ERROR"] = "server_error";
  ErrorCode2["AUTHENTICATION_REQUIRED"] = "authentication_required";
  return ErrorCode2;
})(ErrorCode || {});

function withAuth(handler) {
  return function(context) {
    const { locals } = context;
    const user = locals.user;
    if (!user) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }
    return handler(context, user.id);
  };
}

export { ErrorCode as E, withAuth as w };
