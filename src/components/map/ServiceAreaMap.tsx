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
        center: [20.972, 105.714],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Service area polygon covering all villages
      L.polygon(
        [
          [20.985, 105.695],
          [20.985, 105.735],
          [20.960, 105.735],
          [20.960, 105.695],
        ],
        { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.10, weight: 2.5 }
      ).addTo(map)

      // Village markers
      const villages: [number, number, string, string][] = [
        [20.980, 105.700, 'Đức Tài', '🏠'],
        [20.975, 105.710, 'Trà Tân', '🌿'],
        [20.968, 105.720, 'Xuân Lộc · Ông Đồn', '⛺'],
        [20.963, 105.728, 'Lâm Đồng (Bình Thuận cũ)', '📍'],
      ]

      villages.forEach(([lat, lng, name, icon]) => {
        const divIcon = L.divIcon({
          html: `<div style="background:white;border:2px solid #f97316;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.2)">${icon}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: '',
        })
        L.marker([lat, lng], { icon: divIcon })
          .addTo(map)
          .bindTooltip(`<b>${name}</b>`, { permanent: false, direction: 'top', offset: [0, -16] })
      })

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
