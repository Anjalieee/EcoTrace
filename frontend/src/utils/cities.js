export const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Noida']

export const CITY_COORDINATES = {
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Noida: { lat: 28.5355, lng: 77.3910 },
}

export function getCityCoordinates(city) {
  return CITY_COORDINATES[city] || CITY_COORDINATES.Delhi
}