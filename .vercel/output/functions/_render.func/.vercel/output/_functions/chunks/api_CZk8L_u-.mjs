const JSON_HEADERS = { "Content-Type": "application/json" };
function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}
function errorResponse(code, message, status) {
  return jsonResponse({ error: { code, message } }, status);
}
function successResponse(data, status = 200) {
  return jsonResponse(data, status);
}

export { JSON_HEADERS as J, errorResponse as e, successResponse as s };
