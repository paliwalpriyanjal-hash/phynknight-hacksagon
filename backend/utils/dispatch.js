import Ambulance from '../models/Ambulance.js'

/**
 * Haversine formula — distance between two lat/lng points in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find the nearest available ambulance to a given location
 * Returns ambulance with estimated ETA in minutes
 */
export async function findNearestAmbulance(patientLocation) {
  const { lat, lng } = patientLocation
  const available = await Ambulance.find({ status: 'available', isActive: true })

  if (!available.length) return null

  let nearest = null
  let minDistance = Infinity

  for (const amb of available) {
    if (!amb.currentLocation?.lat) continue
    const dist = haversineDistance(lat, lng, amb.currentLocation.lat, amb.currentLocation.lng)
    if (dist < minDistance) {
      minDistance = dist
      nearest = amb
    }
  }

  if (!nearest && available.length > 0) {
    // Fallback: return first available if no GPS data
    nearest = available[0]
    minDistance = 3
  }

  if (!nearest) return null

  // Estimate ETA: assume 40 km/h average speed in city
  const etaMinutes = Math.max(3, Math.round((minDistance / 40) * 60))

  return { ...nearest.toObject(), eta: etaMinutes, distanceKm: minDistance.toFixed(2) }
}
