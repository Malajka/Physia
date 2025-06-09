export async function GET() {
  return new Response("Hello from Cloudflare Pages!", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
