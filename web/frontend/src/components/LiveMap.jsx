import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ambulanceIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1">🚑</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
})
const patientIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1">📍</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 32],
})

export default function LiveMap({
  ambulanceLat, ambulanceLng,
  patientLat, patientLng,
  dark = true,
}) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const ambMarker = useRef(null)
  const patMarker = useRef(null)
  const polyline = useRef(null)

  // Validate coords — no fallback to Indore
  const pLat = parseFloat(patientLat)
  const pLng = parseFloat(patientLng)
  const aLat = parseFloat(ambulanceLat)
  const aLng = parseFloat(ambulanceLng)

  const hasPatient = !isNaN(pLat) && !isNaN(pLng)
  const hasAmbulance = !isNaN(aLat) && !isNaN(aLng)

  useEffect(() => {
    if (!hasPatient || !mapRef.current) return
    if (mapInstance.current) return // already initialized

    mapInstance.current = L.map(mapRef.current, {
      center: [pLat, pLng],
      zoom: 14,
      zoomControl: true,
    })

    const tileUrl = dark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    L.tileLayer(tileUrl, {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current)

    // Patient marker
    patMarker.current = L.marker([pLat, pLng], { icon: patientIcon })
      .addTo(mapInstance.current)
      .bindPopup('📍 Your Location')
      .openPopup()

    // Ambulance marker (only if coords available)
    if (hasAmbulance) {
      ambMarker.current = L.marker([aLat, aLng], { icon: ambulanceIcon })
        .addTo(mapInstance.current)
        .bindPopup('🚑 Ambulance')

      polyline.current = L.polyline([[aLat, aLng], [pLat, pLng]], {
        color: '#0066cc', weight: 3, dashArray: '8 6',
      }).addTo(mapInstance.current)

      // Fit both markers in view
      mapInstance.current.fitBounds([[pLat, pLng], [aLat, aLng]], { padding: [40, 40] })
    }

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
      ambMarker.current = null
      patMarker.current = null
      polyline.current = null
    }
  }, [hasPatient]) // only init once when patient coords are ready

  // Update ambulance position live (polling)
  useEffect(() => {
    if (!mapInstance.current || !hasAmbulance) return

    if (ambMarker.current) {
      ambMarker.current.setLatLng([aLat, aLng])
    } else {
      ambMarker.current = L.marker([aLat, aLng], { icon: ambulanceIcon })
        .addTo(mapInstance.current)
        .bindPopup('🚑 Ambulance')
    }

    if (polyline.current) {
      polyline.current.setLatLngs([[aLat, aLng], [pLat, pLng]])
    }
  }, [aLat, aLng])

  // Re-center map when patient location changes
  useEffect(() => {
    if (!mapInstance.current || !hasPatient) return
    mapInstance.current.setView([pLat, pLng], 14)
    if (patMarker.current) patMarker.current.setLatLng([pLat, pLng])
  }, [pLat, pLng])

  if (!hasPatient) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>📍 Location not available</p>
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
}
