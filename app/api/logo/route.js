import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return new NextResponse('Domain required', { status: 400 });
  }

  let buffer;
  let contentType = 'image/png';

  try {
    // AdBlock DNS engeline takılmayan ve yüksek çözünürlüklü logolar veren icon.horse API
    const response = await fetch(`https://icon.horse/icon/${domain}`, { signal: AbortSignal.timeout(4000) });
    
    if (!response.ok) throw new Error('Icon.horse failed');
    
    buffer = await response.arrayBuffer();
    contentType = response.headers.get('content-type') || 'image/png';

  } catch (error) {
    console.log(`Primary logo fetch failed for ${domain}, falling back to Google Favicon.`);
    try {
      // Birinci servis hata verirse veya DNS engelliyse Google Favicon API'ye fallback yap
      const fallbackResponse = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
      if (fallbackResponse.ok) {
         buffer = await fallbackResponse.arrayBuffer();
         contentType = fallbackResponse.headers.get('content-type') || 'image/png';
      } else {
         return new NextResponse('Logo not found', { status: 404 });
      }
    } catch (fallbackErr) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
