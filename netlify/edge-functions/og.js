export default async (request, context) => {
  const response = await context.next();
  let page = await response.text();

  const url = new URL(request.url);
  const match = url.pathname.match(/\/level\/(\d+)/);

  if (match) {
    const level = match[1]; 
    
    // NOTE: Change "level${level}.png" if your images are named differently in public/images!
    const imageUrl = `https://wenbrain.com/banners/banner_level${level}.png`;

    const ogTags = `
      <meta property="og:image" content="${imageUrl}" />
      <meta name="twitter:image" content="${imageUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
    `;
    
    page = page.replace('</head>', `${ogTags}</head>`);
  }

  return new Response(page, response);
};