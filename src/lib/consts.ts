export const MODERATION_IMAGE_URL =
  "https://api.unicornlanding.com/storage/v1/object/public/brand-assets/Content-Moderation-Img.jpg";

export const DEFAULT_LINK_IMAGE_URL =
  "https://api.unicornlanding.com/storage/v1/object/public/brand-assets//link-icon.svg";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.unicornlanding.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// Helper function to add CORS headers to any response
export function addCorsHeaders(response: Response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper function to handle OPTIONS requests
export function handleCorsOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
