export const maxDuration = 30; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';
 
export function GET(request) {
  return new Response('Vercel', {
    status: 200,
  });
}