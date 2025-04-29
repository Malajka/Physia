import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('Received session creation request:', body);

    // Stub implementation: generate a dummy session ID
    const id = Math.floor(Date.now() / 1000);

    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in /api/sessions POST:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}; 