"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

import type { DateLabel } from "@/components/find/TestCenterList";
import { cn } from "@/lib/cx";
import type { TestCenter, TestCenterWithDistance, UserLocation } from "@/lib/types";

const PIN_SIZE = [34, 42] as const;

function buildPinIcon(color: string, selected: boolean): L.DivIcon {
  const [width, height] = PIN_SIZE;
  return L.divIcon({
    className: cn("tc-pin", selected && "tc-pin--selected"),
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 8],
    html: `<svg width="${width}" height="${height}" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 1C8.27 1 2 7.27 2 15c0 10.35 14 24 14 24s14-13.65 14-24C30 7.27 23.73 1 16 1z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="15" r="5.5" fill="#ffffff"/>
    </svg>`,
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: "tc-pin",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:26px;height:26px;border-radius:9999px;background:#4f46e5;border:4px solid #fff;box-shadow:0 2px 8px rgb(15 23 42 / 0.35);"></div>`,
  });
}

function MapController({
  centers,
  userLocation,
  focusCenter,
  activeCode,
  markerRefs,
}: {
  centers: TestCenterWithDistance[];
  userLocation: UserLocation | null;
  focusCenter: TestCenter | null;
  activeCode: string | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      const points: L.LatLngTuple[] = [
        [userLocation.lat, userLocation.lng],
        ...centers
          .slice(0, 14)
          .map((center) => [center.lat, center.lng] as [number, number]),
      ];
      map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 12 });
    } else if (focusCenter) {
      map.setView([focusCenter.lat, focusCenter.lng], 13);
    } else {
      const allPoints = centers
        .slice(0, 20)
        .map((center) => [center.lat, center.lng] as [number, number]);
      if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [42, 42], maxZoom: 12 });
      }
    }
  }, [centers, userLocation, focusCenter, map]);

  useEffect(() => {
    if (!activeCode) return;
    const selected = centers.find((center) => center.code === activeCode);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom() || 10, 12), {
        duration: 0.55,
      });
    }
    markerRefs.current[activeCode]?.openPopup();
  }, [activeCode, centers, map, markerRefs]);

  return null;
}

export default function TestCenterMap({
  centers,
  dateLabels,
  userLocation = null,
  focusCenter = null,
  activeCode,
  onSelect,
}: {
  centers: TestCenterWithDistance[];
  dateLabels: DateLabel[];
  userLocation?: UserLocation | null;
  focusCenter?: TestCenter | null;
  activeCode: string | null;
  onSelect: (code: string) => void;
}) {
  const t = useTranslations("results");
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const defaultCenter = useMemo(() => {
    if (focusCenter) return [focusCenter.lat, focusCenter.lng] as [number, number];
    if (userLocation) return [userLocation.lat, userLocation.lng] as [number, number];
    if (centers.length > 0) return [centers[0].lat, centers[0].lng] as [number, number];
    return [25, 39] as [number, number];
  }, [userLocation, focusCenter, centers]);

  const icons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    for (const center of centers) {
      const hasSeats = Object.values(center.availability).some((seats) => seats > 0);
      map[center.code] = buildPinIcon(
        hasSeats ? "#4f46e5" : "#f43f5e",
        activeCode === center.code
      );
    }
    return map;
  }, [centers, activeCode]);

  return (
    <MapContainer center={defaultCenter} zoom={13} zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        centers={centers}
        userLocation={userLocation}
        focusCenter={focusCenter}
        activeCode={activeCode}
        markerRefs={markerRefs}
      />

      {userLocation ? (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={350}
            pathOptions={{ color: "#4f46e5", weight: 1.5, opacity: 0.5, fillColor: "#4f46e5", fillOpacity: 0.08 }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon()} />
        </>
      ) : null}

      {centers.map((center) => (
        <Marker
          key={center.code}
          position={[center.lat, center.lng]}
          icon={icons[center.code]}
          eventHandlers={{ click: () => onSelect(center.code) }}
          ref={(instance) => {
            if (instance) markerRefs.current[center.code] = instance;
          }}
        >
          <Popup>
            <div className="p-3">
              <p className="font-bold text-slate-900">{center.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {center.city ? `${center.city} · ${center.address}` : center.address}
              </p>
              {center.distanceKm != null ? (
                <p className="mt-1.5 text-xs font-semibold text-indigo-600">
                  {t("distanceAway", { km: center.distanceKm })}
                </p>
              ) : null}

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {dateLabels.map(({ date, label }) => {
                  const seats = center.availability[date] ?? 0;
                  const available = seats > 0;
                  return (
                    <span
                      key={date}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-600"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", available ? "bg-emerald-500" : "bg-rose-500")} />
                      {label} · {t(available ? "available" : "unavailable")}
                    </span>
                  );
                })}
              </div>

              <a
                href={center.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("openInMaps")}
              </a>

              <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-400">
                {t("bookNotice")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}