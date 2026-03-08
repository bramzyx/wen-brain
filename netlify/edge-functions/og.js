export default async (request, context) => {
  const url = new URL(request.url)
  const level = url.searchParams.get('level') || '1'
  const bannerUrl = `https://wenbrain.com/banners/banner_level${level}.png`
  const html = await context.next()
  const text = await html.text()
  const modified = text
    .replace(/<meta property="og:image"[^>]*>/g, `<meta property="og:image" content="${bannerUrl}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/g, `<meta name="twitter:image" content="${bannerUrl}" />`)
  return new Response(modified, html)
}
export const config = { path: "/" }
