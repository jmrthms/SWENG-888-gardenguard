import type { Coordinates } from '../models/types';

export interface BedMarker {
  id: string;
  name: string;
  label: string;
  pests: string[];
  lat: number;
  lng: number;
}

export interface NurseryMarker {
  id: string;
  name: string;
  note: string;
  lat: number;
  lng: number;
}

export interface LeafletMapData {
  beds: BedMarker[];
  nurseries: NurseryMarker[];
  center: Coordinates;
  bedColor: string;
  nurseryColor: string;
}

/**
 * Builds a self-contained Leaflet + OpenStreetMap HTML document for the Map
 * screen's WebView. No API key required (US-6) — tiles come from OSM. Markers,
 * center, and colors are embedded; the page exposes a `window.GG` API that React
 * Native drives via injectJavaScript (focus, recenter, near-filter) and posts
 * messages back ({type:'ready'} on load, {type:'open', id} on a bed tap).
 */
export function buildLeafletHtml(data: LeafletMapData): string {
  // Escape `<` as < so embedded data (e.g. a plant name containing
  // "</script>") can never break out of the inline <script> block. JSON.parse
  // still yields the original characters; popup text is additionally escaped at
  // render time by esc() below.
  const payload = JSON.stringify({
    beds: data.beds,
    nurseries: data.nurseries,
    center: { lat: data.center.latitude, lng: data.center.longitude },
    bedColor: data.bedColor,
    nurseryColor: data.nurseryColor,
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}.leaflet-popup-content{font-family:-apple-system,Roboto,sans-serif;font-size:13px;line-height:1.4}.leaflet-popup-content a{color:#2E7D32;font-weight:600}</style>
</head>
<body>
<div id="map"></div>
<script>
(function(){
  var DATA = ${payload};
  function post(o){ if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function haversine(a,b,c,d){ var R=3958.8,t=Math.PI/180,x=(c-a)*t,y=(d-b)*t; var h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*t)*Math.cos(c*t)*Math.sin(y/2)*Math.sin(y/2); return 2*R*Math.asin(Math.min(1,Math.sqrt(h))); }
  function pin(lat,lng,color){ return L.circleMarker([lat,lng],{radius:9,color:'#fff',weight:2,fillColor:color,fillOpacity:1}); }

  var map = L.map('map',{zoomControl:true}).setView([DATA.center.lat,DATA.center.lng],11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

  var beds=[];
  DATA.beds.forEach(function(b){
    var m=pin(b.lat,b.lng,DATA.bedColor).addTo(map);
    var pests=(b.pests&&b.pests.length)?'<br/>Pests: '+esc(b.pests.join(', ')):'';
    m.bindPopup('<b>'+esc(b.name)+'</b><br/>'+esc(b.label)+pests+'<br/><a href="#" data-open="'+esc(b.id)+'">Tap for details &rsaquo;</a>');
    beds.push({id:b.id,lat:b.lat,lng:b.lng,marker:m});
  });
  DATA.nurseries.forEach(function(n){
    var m=pin(n.lat,n.lng,DATA.nurseryColor).addTo(map);
    m.bindPopup('<b>'+esc(n.name)+'</b><br/>'+esc(n.note));
  });

  if (beds.length){ map.fitBounds(L.featureGroup(beds.map(function(x){return x.marker;})).getBounds().pad(0.3)); }

  document.addEventListener('click',function(e){
    var t=e.target; if(t&&t.getAttribute&&t.getAttribute('data-open')){ e.preventDefault(); post({type:'open',id:t.getAttribute('data-open')}); }
  });

  var userMarker=null;
  window.GG={
    flyTo:function(lat,lng,z){ map.flyTo([lat,lng],z||13); },
    setUser:function(lat,lng){ if(userMarker)map.removeLayer(userMarker); userMarker=L.circleMarker([lat,lng],{radius:7,color:'#fff',weight:2,fillColor:'#1a73e8',fillOpacity:1}).addTo(map); },
    focus:function(id){ for(var i=0;i<beds.length;i++){ if(beds[i].id===id){ map.setView([beds[i].lat,beds[i].lng],15); beds[i].marker.openPopup(); return; } } },
    filterNear:function(on,ulat,ulng,radius){ beds.forEach(function(b){ var near=haversine(ulat,ulng,b.lat,b.lng)<=radius; if(on&&!near){ map.removeLayer(b.marker); } else { b.marker.addTo(map); } }); }
  };
  post({type:'ready'});
})();
</script>
</body>
</html>`;
}
