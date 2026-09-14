# Yandex Maps → GPX

<img src="icons/readme-icon.svg" width="80" height="80" alt="A route turning into a download arrow">

**Take a route you planned in Yandex Maps into your GPS app.**

You have picked your stops and found a route you want to ride. This Chrome extension turns its calculated road-following line into a GPX file you can open in Speedometer GPS or another app that imports GPX tracks. You do not have to redraw the route or copy its coordinates by hand.

Click **Read route**, check the stops and outline, then **Download GPX**. The export keeps the complete available route geometry rather than drawing straight lines between your stops.

## Install manually in Chrome

This repository contains a locally installed extension. No build, account with this project, or API key is needed.

1. At the top of this GitHub page, choose **Code → Download ZIP**. Extract the ZIP into a permanent folder on your computer. Alternatively, clone it:

   ```sh
   git clone https://github.com/IgorShadurin/yandex-maps-gpx.git
   ```

2. Open `chrome://extensions` in Chrome's address bar.
3. Turn on **Developer mode** in the upper-right corner.
4. Click **Load unpacked**.
5. Select the extracted folder that directly contains `manifest.json`. Select the folder, not the ZIP file or an individual file inside it.
6. Click Chrome's puzzle-piece **Extensions** button and pin **Yandex → GPX · Speedometer**. Look for the green route-and-arrow icon.

Keep the installation folder in place. Moving or deleting it can break the extension. Unpacked extensions need to be installed separately in each Chrome profile or computer.

### Update or recover an installation

Replace the files in the same installation folder with a newer download, or run `git pull` in a cloned folder. Open `chrome://extensions` and click **Reload** on the extension's card. Close and reopen its popup.

If the icon disappears, check the puzzle-piece menu and make sure the extension is enabled in the Chrome profile you are using. If the original folder is missing, download it again and use **Load unpacked** with the new folder.

## Export your route

1. Open Yandex Maps in a normal Chrome tab and calculate a route with your chosen travel mode and stops.
2. Wait until the route and distance appear.
3. Open the extension and click **Read route**.
4. Check the distance, numbered stops and route preview. If Yandex returns several alternatives, select the one you want.
5. Optionally edit the route name, then click **Download GPX** at the top.
6. Save the file and import it into your GPS app. For an iPhone, transfer it using AirDrop or Files, then open it in a compatible app.

**Read another route** returns to the first screen. The interface is English; stop names remain as Yandex supplies them.

## What to expect

- GPX 1.1 with a track containing the complete coordinate sequence Yandex returns.
- Coordinates are checked before export and written in GPX latitude/longitude order.
- No invented timestamps, elevation, speed or recorded-trip history.
- A compact preview and all stops, with Download GPX at the top.
- No build step, third-party JavaScript libraries or background service worker.

The extension reads the current route URL again. Yandex may recalculate the route, so compare the result with the route you intended to export. It does not automatically identify the active card among multiple alternatives.

It relies on route data embedded in Yandex Maps pages, not a guaranteed export API. A change to Yandex's page format can break extraction. Some travel modes may not provide the expected geometry. Unsupported data produces an error rather than an export of only the stops. If Yandex shows a CAPTCHA, complete it in the map tab and retry.

## Privacy and permissions

The extension has no analytics, advertising, project account, API keys or upload server. It does not persist route data in extension storage: the loaded route stays in popup memory, and the GPX is saved only when you download it.

It requests two Chrome permissions:

| Permission  | Purpose                                                              |
| ----------- | -------------------------------------------------------------------- |
| `activeTab` | Temporarily access the tab you invoke the extension on.              |
| `scripting` | Read route data from that Yandex Maps tab when you click Read route. |

Reading a route makes an HTTPS request to the current Yandex Maps URL using your existing same-origin browser session. Yandex receives that request. The extension does not read cookie values or send route data to another service.

**Downloaded GPX files include the route coordinates, your chosen name and the original Yandex route URL.** Treat them as location data when sharing. Chrome and your operating system may retain downloaded files and download history.

This repository includes only the extension, icons, documentation and synthetic tests. It contains no Speedometer mobile app code, personal route files, browser profiles, credentials or private configuration. Icon PNGs have been stripped of ancillary text/provenance metadata before publication.

## Development and checks

Edit `popup.html` for the interface, `popup.js` for reading and displaying routes, and `gpx.mjs` for validation and serialization. Reload the extension in Chrome after changes.

Run the dependency-free checks with Node.js:

```sh
node --test test.mjs
node --check popup.js
```

Tests use synthetic coordinates and verify coordinate order, complete track export, XML escaping and rejection of malformed geometry. A real Yandex tab is still needed to check extraction after changes to the site.

This is an independent tool, not an official Yandex product.
