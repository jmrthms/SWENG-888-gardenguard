import { describe, it, expect } from '@jest/globals';
import { buildLeafletHtml, type BedMarker, type NurseryMarker } from '../mapHtml';

const beds: BedMarker[] = [
  { id: 'bed-1', name: 'Tomato', label: 'Raised bed', pests: ['Aphids', 'Hornworms'], lat: 34.0, lng: -81.0 },
];
const nurseries: NurseryMarker[] = [
  { id: 'n1', name: 'GreenThumb', note: 'Organic starts', lat: 34.02, lng: -81.03 },
];
const data = {
  beds,
  nurseries,
  center: { latitude: 34.0, longitude: -81.0 },
  bedColor: '#2E7D32',
  nurseryColor: '#795548',
};

describe('buildLeafletHtml', () => {
  it('builds a Leaflet + OpenStreetMap page (no API key)', () => {
    const html = buildLeafletHtml(data);
    expect(html).toContain('leaflet@1.9.4');
    expect(html).toContain('tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(html).not.toMatch(/googleapis|maps\.google|apiKey/i);
  });

  it('embeds bed and nursery markers and the colors', () => {
    const html = buildLeafletHtml(data);
    expect(html).toContain('Tomato');
    expect(html).toContain('bed-1');
    expect(html).toContain('GreenThumb');
    expect(html).toContain('#2E7D32');
    expect(html).toContain('#795548');
    expect(html).toContain('34'); // center / marker latitude
  });

  it('wires the bed-tap bridge and the ready signal', () => {
    const html = buildLeafletHtml(data);
    expect(html).toContain('data-open');
    expect(html).toContain("type:'open'");
    expect(html).toContain("type:'ready'");
    expect(html).toContain('window.GG');
  });

  it('exposes the JS control API React Native drives', () => {
    const html = buildLeafletHtml(data);
    for (const fn of ['flyTo', 'setUser', 'focus', 'filterNear']) {
      expect(html).toContain(`${fn}:function`);
    }
  });

  it('neutralizes embedded data so it cannot break out of the <script> block', () => {
    const countScriptClose = (s: string) => (s.match(/<\/script>/g) ?? []).length;
    const safe = buildLeafletHtml({ ...data, beds: [{ ...beds[0], name: 'Tomato' }] });
    const evil = buildLeafletHtml({ ...data, beds: [{ ...beds[0], name: 'Evil </script><b>x' }] });
    // the malicious name must not add a closing </script> tag to the document
    expect(countScriptClose(evil)).toBe(countScriptClose(safe));
    expect(evil).not.toContain('Evil </script>');
    expect(evil).toContain('Evil \\u003c/script'); // `<` -> < neutralizes the breakout
  });
});
