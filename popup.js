import { gpx, validPoints } from "./gpx.mjs";
const $ = (id) => document.getElementById(id);
let data;
const mode = (t) =>
  ({
    scooter: "Scooter",
    bicycle: "Bicycle",
    pedestrian: "Walking",
    auto: "Driving",
    masstransit: "Public transport",
  }[t] ||
  t ||
  "Route");
const selected = () => data.routes[+$("routes").value];
function show() {
  const r = selected(),
    p = validPoints(r.coordinates);
  $("summary").textContent = `${mode(r.type)} · ${(
    r.distanceMeters / 1000
  ).toFixed(2)} km · ${p.length.toLocaleString("en-US")} track points`;
  $("stops").replaceChildren(
    ...data.waypoints.map((w, i) => {
      const li = document.createElement("li");
      li.textContent = w.name || `Stop ${i + 1}`;
      return li;
    })
  );
  const xs = p.map((c) => c[0] * Math.cos((p[0][1] * Math.PI) / 180)),
    ys = p.map((c) => -c[1]);
  const minX = xs.reduce((a, b) => Math.min(a, b)),
    maxX = xs.reduce((a, b) => Math.max(a, b)),
    minY = ys.reduce((a, b) => Math.min(a, b)),
    maxY = ys.reduce((a, b) => Math.max(a, b));
  const dx = maxX - minX,
    dy = maxY - minY,
    scale = Math.min(296 / (dx || 1e-9), 121 / (dy || 1e-9));
  $("line").setAttribute(
    "points",
    p
      .map(
        (_, i) =>
          `${160 + (xs[i] - minX - dx / 2) * scale},${
            72.5 + (ys[i] - minY - dy / 2) * scale
          }`
      )
      .join(" ")
  );
}
$("routes").onchange = show;
$("back").onclick = () => {
  data = null;
  $("result").hidden = true;
  $("intro").hidden = false;
  $("status").textContent = "";
  window.scrollTo(0, 0);
  $("read").focus();
};
$("read").onclick = async () => {
  $("read").disabled = true;
  $("status").textContent = "Reading route…";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const u = new URL(tab.url);
    if (
      u.protocol !== "https:" ||
      !/^(www\.)?yandex\.(by|ru|com|kz|uz|com\.tr)$/.test(u.hostname) ||
      !u.pathname.startsWith("/maps") ||
      !u.searchParams.get("rtext")
    )
      throw Error("Open a Yandex Maps tab with a calculated route.");
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          const sourceUrl = location.href;
          const r = await fetch(sourceUrl, {
            credentials: "same-origin",
            signal: AbortSignal.timeout(20000),
          });
          if (!r.ok)
            throw Error(
              "Yandex did not return a route. Refresh and try again."
            );
          const doc = new DOMParser().parseFromString(
            await r.text(),
            "text/html"
          );
          const router = [
            ...doc.querySelectorAll('script[type="application/json"]'),
          ]
            .map((s) => {
              try {
                return JSON.parse(s.textContent).config?.routerResponse;
              } catch {
                return null;
              }
            })
            .find((r) => r?.routes?.length);
          if (!router)
            throw Error(
              "Route data is unavailable. Refresh Yandex Maps and wait for calculation. Complete any CAPTCHA in the tab yourself."
            );
          if (location.href !== sourceUrl)
            throw Error("The route changed while reading. Try again.");
          return {
            sourceUrl,
            waypoints: (router.waypoints || []).map((w) => ({ name: w.name })),
            routes: router.routes.map((r) => ({
              type: r.type || router.type,
              distanceMeters: r.distance?.value,
              coordinates: r.coordinates,
            })),
          };
        } catch (e) {
          return { error: e.message };
        }
      },
    });
    if (!result || result.error)
      throw Error(result?.error || "Could not read this tab.");
    result.routes.forEach((r) => validPoints(r.coordinates));
    data = result;
    $("routes").replaceChildren(
      ...data.routes.map(
        (r, i) =>
          new Option(
            `${i + 1}. ${mode(r.type)} · ${(r.distanceMeters / 1000).toFixed(
              2
            )} km`,
            i
          )
      )
    );
    $("variant").hidden = data.routes.length < 2;
    $("name").value =
      [data.waypoints[0]?.name, data.waypoints.at(-1)?.name]
        .filter(Boolean)
        .join(" — ") || "Yandex route";
    show();
    $("intro").hidden = true;
    $("result").hidden = false;
    $("status").textContent = "";
    window.scrollTo(0, 0);
    $("download").focus();
  } catch (e) {
    $("status").textContent = e.message;
  } finally {
    $("read").disabled = false;
  }
};
$("download").onclick = () => {
  try {
    const name = $("name").value.trim() || "Yandex route";
    const u = URL.createObjectURL(
        new Blob([gpx(selected(), name, data.sourceUrl)], {
          type: "application/gpx+xml",
        })
      ),
      a = document.createElement("a");
    a.href = u;
    a.download =
      name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").slice(0, 120) + ".gpx";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 30000);
    $("status").textContent =
      "GPX sent to Chrome downloads. Open it in Speedometer GPS on your iPhone.";
  } catch (e) {
    $("status").textContent = e.message;
  }
};
