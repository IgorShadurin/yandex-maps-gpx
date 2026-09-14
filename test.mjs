import test from "node:test";
import assert from "node:assert/strict";
import { gpx, validPoints } from "./gpx.mjs";

test("exports every point in GPX latitude/longitude order without fabricated metrics", () => {
  const xml = gpx(
    {
      coordinates: [
        [10, 20],
        [10.1, 20.2],
        [10.2, 20.3],
      ],
    },
    "Example route",
    "https://yandex.com/maps/"
  );
  assert.equal((xml.match(/<trkpt /g) || []).length, 3);
  assert.match(xml, /<trkpt lat="20" lon="10"\/>/);
  assert.match(xml, /<trkpt lat="20.3" lon="10.2"\/>/);
  assert.equal((xml.match(/<trkseg>/g) || []).length, 1);
  assert.doesNotMatch(xml, /<time>|<ele>|<speed>/);
});

test("escapes untrusted names and source URLs and removes invalid XML controls", () => {
  const xml = gpx(
    {
      coordinates: [
        [10, 20],
        [11, 21],
      ],
    },
    "A < B & C\u0001",
    'https://yandex.com/maps/?a="1"&b=2'
  );
  assert.ok(xml.includes("A &lt; B &amp; C"));
  assert.ok(xml.includes("a=&quot;1&quot;&amp;b=2"));
  assert.ok(!xml.includes("\u0001"));
});

test("rejects incomplete, nonnumeric and out-of-range geometry", () => {
  for (const p of [
    null,
    [],
    [[10, 20]],
    [[10, 20], null],
    [
      [10, 20],
      [NaN, 20],
    ],
    [
      [10, 20],
      [Infinity, 20],
    ],
    [
      [10, 20],
      [181, 20],
    ],
    [
      [10, 20],
      [10, -91],
    ],
    [
      [10, 20],
      ["10", 20],
    ],
  ]) {
    assert.throws(() => validPoints(p));
  }
});
