const leaflet = window.L;

class MapViewTiff {
  constructor(elementId) {
    this.map = leaflet.map(elementId, { renderer: leaflet.canvas(), minZoom: 3 });
    this.map.setView([59, 17], 4);
    leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
    this.current = null;
  }

  async show(url) {
    if (this.current) this.map.removeLayer(this.current);

    const ab = await (await fetch(url)).arrayBuffer();
    const georaster = await window.parseGeoraster(ab);

    const colorFn = vals => {
      const v = vals[0];
      if (v == null || isNaN(v) || v <= 0) return null;
      if (v < 10)  return "rgba(255,200,200,0.6)";
      if (v < 50)  return "rgba(255,150,150,0.65)";
      if (v < 100) return "rgba(255, 80, 80,0.7)";
      return "rgba(255,0,0,0.8)";
    };

    this.current = new window.GeoRasterLayer({
      georaster,
      pixelValuesToColorFn: colorFn,
      resolution: 256,
      opacity: 0.75,
      updateWhenIdle: true
    }).addTo(this.map);

    try { this.map.fitBounds(this.current.getBounds(), { padding: [10,10] }); } catch {}
    setTimeout(()=>this.map.invalidateSize(),0);
  }
}

export { MapViewTiff };

