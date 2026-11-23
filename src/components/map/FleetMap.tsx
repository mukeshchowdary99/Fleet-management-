import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import { mapStyleUrl } from '../../lib/env'
import type { LatestLocation, Trip, Vehicle } from '../../types/domain'
import { vehicleStatusMeta } from '../../utils/status'
import { boundsFromPoints, pointsGeoJSON, routeGeoJSON } from '../../utils/geo'
import type { GeoPoint } from '../../utils/geo'
import { formatCoordinate, formatPercent, formatRelativeTime, humanize } from '../../utils/format'

const ROUTE_SOURCE = 'fleet-route'
const ROUTE_LINE = 'fleet-route-line'
const POINT_SOURCE = 'fleet-route-points'
const POINT_LAYER = 'fleet-route-point-layer'

export type MapRoute = {
  points: GeoPoint[]
  start?: GeoPoint
  end?: GeoPoint
  history?: GeoPoint[]
}

type FleetMapProps = {
  vehicles?: Vehicle[]
  locations?: LatestLocation[]
  selectedVehicleId?: string | null
  onSelectVehicle?: (vehicleId: string) => void
  route?: MapRoute | null
  trips?: Trip[]
  showVehicles?: boolean
  fitSignal?: string
  className?: string
}

function addLabelValue(container: HTMLElement, label: string, value: string) {
  const row = document.createElement('div')
  row.className = 'flex items-center justify-between gap-3 py-0.5'
  const labelEl = document.createElement('span')
  labelEl.className = 'text-[11px] text-ink-500'
  labelEl.textContent = label
  const valueEl = document.createElement('span')
  valueEl.className = 'text-[11px] font-semibold text-ink-800'
  valueEl.textContent = value
  row.append(labelEl, valueEl)
  container.append(row)
}

function buildPopup(vehicle: Vehicle, location: LatestLocation, trip?: Trip): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'w-64 bg-white p-3.5 font-sans'

  const header = document.createElement('div')
  header.className = 'mb-2 flex items-start justify-between gap-2 border-b border-ink-100 pb-2'
  const title = document.createElement('div')
  const registration = document.createElement('p')
  registration.className = 'text-[13px] font-bold text-ink-900'
  registration.textContent = vehicle.registration_number
  const name = document.createElement('p')
  name.className = 'text-[11px] text-ink-500'
  name.textContent = vehicle.vehicle_name
  title.append(registration, name)
  const status = document.createElement('span')
  status.className = 'rounded-full px-2 py-0.5 text-[10px] font-semibold text-white'
  status.style.backgroundColor = vehicleStatusMeta[vehicle.status].hex
  status.textContent = vehicleStatusMeta[vehicle.status].label
  header.append(title, status)
  wrapper.append(header)

  const details = document.createElement('div')
  addLabelValue(details, 'Driver', vehicle.driver_name ?? 'Unassigned')
  addLabelValue(details, 'Coordinates', formatCoordinate(location.latitude, location.longitude))
  addLabelValue(details, 'Last seen', formatRelativeTime(location.recorded_at))
  addLabelValue(details, 'Speed', `${Math.round(location.speed)} km/h`)
  addLabelValue(details, 'Fuel', formatPercent(vehicle.fuel_level))
  addLabelValue(details, 'Battery', formatPercent(vehicle.battery_level))
  addLabelValue(details, 'Ignition', vehicle.ignition_state ? 'On' : 'Off')
  if (trip) addLabelValue(details, 'Current trip', `${trip.start_location} → ${trip.end_location}`)
  wrapper.append(details)

  const footer = document.createElement('p')
  footer.className = 'mt-2 border-t border-ink-100 pt-2 text-[10px] text-ink-400'
  footer.textContent = 'Historical sample data · not live telemetry'
  wrapper.append(footer)

  return wrapper
}

export function FleetMap({
  vehicles = [],
  locations = [],
  selectedVehicleId,
  onSelectVehicle,
  route,
  trips = [],
  showVehicles = true,
  fitSignal,
  className = '',
}: FleetMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleUrl,
      center: [77.62, 12.97],
      zoom: 9.6,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => setReady(true))
    const markers = markersRef.current
    return () => {
      popupRef.current?.remove()
      markers.forEach((marker) => marker.remove())
      markers.clear()
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !showVehicles) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    locations.forEach((location) => {
      const vehicle = vehicles.find((item) => item.id === location.vehicle_id)
      if (!vehicle) return
      const element = document.createElement('button')
      element.type = 'button'
      element.className = `fleet-marker${selectedVehicleId === vehicle.id ? ' is-selected' : ''}`
      element.style.backgroundColor = vehicleStatusMeta[vehicle.status].hex
      element.setAttribute('aria-label', `${vehicle.registration_number}, ${humanize(vehicle.status)}`)
      element.title = vehicle.registration_number
      element.addEventListener('click', (event) => {
        event.stopPropagation()
        onSelectVehicle?.(vehicle.id)
      })
      const marker = new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map)
      markersRef.current.set(vehicle.id, marker)
    })

    const markers = markersRef.current
    return () => {
      markers.forEach((marker) => marker.remove())
      markers.clear()
    }
  }, [ready, vehicles, locations, selectedVehicleId, onSelectVehicle, showVehicles])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    if (!map.getSource(ROUTE_SOURCE)) {
      map.addSource(ROUTE_SOURCE, { type: 'geojson', data: routeGeoJSON([]) })
      map.addLayer({
        id: ROUTE_LINE,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#3267f6', 'line-width': 3.5, 'line-opacity': 0.9 },
      })
    }
    if (!map.getSource(POINT_SOURCE)) {
      map.addSource(POINT_SOURCE, { type: 'geojson', data: pointsGeoJSON([]) })
      map.addLayer({
        id: POINT_LAYER,
        type: 'circle',
        source: POINT_SOURCE,
        paint: {
          'circle-radius': ['match', ['get', 'kind'], 'start', 7, 'end', 7, 3],
          'circle-color': ['match', ['get', 'kind'], 'start', '#10b981', 'end', '#ef4444', '#3267f6'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      })
    }

    const lineSource = map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined
    const pointSource = map.getSource(POINT_SOURCE) as GeoJSONSource | undefined
    lineSource?.setData(routeGeoJSON(route?.points ?? []))
    const markers: Array<GeoPoint & { kind: 'start' | 'end' | 'history'; label: string }> = []
    if (route?.start) markers.push({ ...route.start, kind: 'start', label: 'Trip start' })
    if (route?.end) markers.push({ ...route.end, kind: 'end', label: 'Trip end' })
    route?.history?.forEach((point, index) =>
      markers.push({ ...point, kind: 'history', label: `Location ${index + 1}` }),
    )
    pointSource?.setData(pointsGeoJSON(markers))
  }, [ready, route])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !selectedVehicleId) {
      popupRef.current?.remove()
      popupRef.current = null
      return
    }
    const location = locations.find((item) => item.vehicle_id === selectedVehicleId)
    const vehicle = vehicles.find((item) => item.id === selectedVehicleId)
    if (!location || !vehicle) return

    const trip = trips.find((item) => item.id === location.trip_id)
    popupRef.current?.remove()
    popupRef.current = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '280px' })
      .setLngLat([location.longitude, location.latitude])
      .setDOMContent(buildPopup(vehicle, location, trip))
      .addTo(map)
  }, [ready, selectedVehicleId, vehicles, locations, trips])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !fitSignal) return
    const points: GeoPoint[] = route?.points.length
      ? [...route.points, ...(route.history ?? [])]
      : locations
          .filter((location) => vehicles.some((vehicle) => vehicle.id === location.vehicle_id))
          .map((location) => ({ latitude: location.latitude, longitude: location.longitude }))
    const bounds = boundsFromPoints(points)
    if (bounds) map.fitBounds(bounds, { padding: 56, maxZoom: 12.5, duration: 700 })
  }, [ready, fitSignal, route, locations, vehicles])

  return (
    <div className={`fleet-map relative overflow-hidden rounded-xl border border-ink-200 bg-ink-100 ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-medium text-ink-600 shadow-sm backdrop-blur">
        Historical sample data · OpenFreeMap tiles
      </div>
    </div>
  )
}
