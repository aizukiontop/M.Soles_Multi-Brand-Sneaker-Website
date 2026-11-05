// Colourway helpers. Each product image may carry the colour it shows (imageColors, parallel to imgs).
// '' or a missing tag means the colour is unknown.

// Indexes of the gallery images that show the selected colour. An empty list means no verified photo
// exists for that colour; callers show a placeholder instead of another colourway's photo.
export function galleryFor(imgs: string[], imageColors: string[], color: string): number[] {
  const all = imgs.map((_, i) => i)
  if (!color) return all
  // Tags only apply while they line up with the photos. If they do not, the photos' colours are
  // unknown, so none is shown for a selected colour.
  const tags = imageColors.length === imgs.length ? imageColors : imgs.map(() => '')
  return all.filter((i) => tags[i] === color)
}

// The colour selected when a product opens: the first listed colour that has a verified photo,
// otherwise the first listed colour.
export function defaultColor(colors: string[], imageColors: string[]): string {
  return colors.find((c) => imageColors.includes(c)) ?? colors[0] ?? ''
}
