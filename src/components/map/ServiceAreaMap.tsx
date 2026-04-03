'use client'
import { useEffect, useRef } from 'react'

export function ServiceAreaMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    // Inject Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [20.974, 105.715],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Service area polygon
      L.polygon(
        [
          [20.982, 105.700],
          [20.982, 105.730],
          [20.965, 105.730],
          [20.965, 105.700],
        ],
        { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 2.5 }
      ).addTo(map)

      // Start marker: Đức Tài
      L.marker([20.978, 105.703])
        .addTo(map)
        .bindPopup('<b>Đức Tài</b><br>Điểm xuất phát', { closeButton: false })

      // End marker: Ngã ba Ông Đồn
      L.marker([20.967, 105.725])
        .addTo(map)
        .bindPopup('<b>Ngã ba Ông Đồn</b><br>Điểm cuối', { closeButton: false })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 relative" style={{ height: 180 }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full shadow">
        📍 Khu vực phục vụ
      </div>
    </div>
  )
}
