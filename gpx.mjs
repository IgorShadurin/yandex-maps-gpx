export function validPoints(p) {
  if (
    !Array.isArray(p) ||
    p.length < 2 ||
    p.some(
      (c) =>
        !Array.isArray(c) ||
        c.length < 2 ||
        !Number.isFinite(c[0]) ||
        !Number.isFinite(c[1]) ||
        Math.abs(c[0]) > 180 ||
        Math.abs(c[1]) > 90
    )
  )
    throw Error(
      "The full route geometry is missing or invalid. Refresh Yandex Maps and try again."
    );
  return p;
}
export function gpx(route, name, source) {
  const esc = (s) =>
    String(s)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Speedometer Yandex GPX" xmlns="http://www.topografix.com/GPX/1/1">\n' +
    `<metadata><name>${esc(name)}</name><link href="${esc(
      source
    )}"><text>Yandex Maps</text></link></metadata>\n<trk><name>${esc(
      name
    )}</name><trkseg>\n` +
    validPoints(route.coordinates)
      .map(([lon, lat]) => `<trkpt lat="${lat}" lon="${lon}"/>`)
      .join("\n") +
    "\n</trkseg></trk></gpx>\n"
  );
}
