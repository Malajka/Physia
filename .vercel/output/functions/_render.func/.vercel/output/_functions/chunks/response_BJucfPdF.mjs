import { J as JSON_HEADERS } from './api_CZk8L_u-.mjs';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

export { jsonResponse as j };
