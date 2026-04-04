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

      // Đức Linh, Bình Thuận (nay là Lâm Đồng) — 11.28°N, 107.70°E
      const map = L.map(mapRef.current!, {
        center: [11.275, 107.700],
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Service area polygon — Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn
      L.polygon(
        [
          [11.310, 107.660],
          [11.310, 107.745],
          [11.240, 107.745],
          [11.240, 107.660],
        ],
        { color: '#d4a843', fillColor: '#d4a843', fillOpacity: 0.12, weight: 2.5 }
      ).addTo(map)

      // Village markers — tọa độ thực tế Đức Linh, Bình Thuận
      const villages: [number, number, string, string][] = [
        [11.295, 107.672, 'Đức Tài',   '🏠'],
        [11.278, 107.695, 'Trà Tân',   '🌿'],
        [11.258, 107.715, 'Xuân Lộc',  '⛺'],
        [11.244, 107.730, 'Ông Đồn',   '📍'],
      ]

      villages.forEach(([lat, lng, name, icon]) => {
        const divIcon = L.divIcon({
          html: `<div style="background:#1a1a24;border:2px solid #d4a843;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${icon}</div>`,
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
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ height: 180, border: '1px solid var(--color-border)' }}
    >
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <div
        className="absolute top-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(15,15,19,0.85)', color: 'var(--color-gold)', border: '1px solid var(--color-border)' }}
      >
        📍 Đức Linh · Lâm Đồng
      </div>
    </div>
  )
}
