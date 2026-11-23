import type { FeatureCollection, LineString, Point } from 'geojson'

export type GeoPoint = { latitude: number; longitude: number }

export type LngLatBounds = [[number, number], [number, number]]

export function routeGeoJSON(points: GeoPoint[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features:
      points.length > 1
        ? [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: points.map((point) => [point.longitude, point.latitude]),
              },
            },
          ]
        : [],
  }
}

export function pointsGeoJSON(
  points: Array<GeoPoint & { kind: 'start' | 'end' | 'history'; label: string }>,
): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      properties: { kind: point.kind, label: point.label },
      geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
    })),
  }
}

export function boundsFromPoints(points: GeoPoint[], padding = 0.025): LngLatBounds | null {
  if (points.length === 0) return null
  const longitudes = points.map((point) => point.longitude)
  const latitudes = points.map((point) => point.latitude)
  return [
    [Math.min(...longitudes) - padding, Math.min(...latitudes) - padding],
    [Math.max(...longitudes) + padding, Math.max(...latitudes) + padding],
  ]
}
