'use client'
import { useEffect, useRef, useState } from 'react'

// Center of service area: Đức Tài, Hoài Đức, Hà Nội
const DEFAULT_CENTER: [number, number] = [20.975, 105.715]
const DEFAULT_ZOOM = 15

interface MapPickerProps {
  onSelect: (address: string, lat: number, lng: number) => void
  initialAddress?: string
}

export function MapPicker({ onSelect, initialAddress }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)
  const [picked, setPicked] = useState(false)

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      // Service area highlight (rough rectangle around Đức Tài → ngã ba Ông Đồn)
      const servicePolygon = L.polygon(
        [
          [20.982, 105.700],
          [20.982, 105.730],
          [20.965, 105.730],
          [20.965, 105.700],
        ],
        { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.07, weight: 2, dashArray: '6 4' }
      ).addTo(map)
      servicePolygon.bindTooltip('Khu vực phục vụ: Đức Tài → ngã ba Ông Đồn', {
        permanent: false,
        direction: 'top',
      })

      const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map)
      markerRef.current = marker

      const reverseGeocode = async (lat: number, lng: number) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
            { headers: { 'User-Agent': 'GoodFood-delivery-app' } }
          )
          const data = await res.json()
          return data.display_name as string
        } catch {
          return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
      }

      const handleLocationSelect = async (lat: number, lng: number) => {
        marker.setLatLng([lat, lng])
        setPicked(true)
        const addr = await reverseGeocode(lat, lng)
        onSelect(addr, lat, lng)
      }

      marker.on('dragend', () => {
        const latlng = (marker as { getLatLng: () => { lat: number; lng: number } }).getLatLng()
        handleLocationSelect(latlng.lat, latlng.lng)
      })

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        handleLocationSelect(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {!picked && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-3 py-1.5 rounded-full shadow pointer-events-none">
            Chạm để chọn vị trí giao hàng
          </div>
        )}
      </div>
      {initialAddress && (
        <p className="text-xs text-gray-500 truncate px-1">📍 {initialAddress}</p>
      )}
    </div>
  )
}
