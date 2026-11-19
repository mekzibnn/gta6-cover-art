// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos;
// ?shot=cover shows the cover alone. `photo` picks the first panel's sample,
// `caption` the title, `grade` the colour grade, `size` the export size.
// window.__shotReady is set once painted.
export async function runShot(shot, query, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const first = await api.loadSample(photo);
  const photos = [first, null, null];
  const rest = ['pier', 'boulevard', 'sunset'].filter((n) => n !== photo);
  photos[1] = await api.loadSample(rest[0]);
  photos[2] = await api.loadSample(rest[1]);
  await api.apply({
    photos,
    title: query.get('caption') ?? 'Sunset Heist',
    subtitle: query.get('subtitle') ?? 'Vice City · 2026',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
