"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    L: any;
  }
}

type Operator = {
  id: number;
  name: string;
  phone: string;
  status: "Activo" | "Inactivo";
};

type VehicleType = "Sedán" | "SUV" | "Pickup" | "Camión liviano" | "Moto";

type RequestItem = {
  id: number;
  name: string;
  phone: string;
  vehicle: VehicleType;
  origin: string;
  destination: string;
  problem: string;
  status: string;
  createdAt: string;
  assignedOperatorId?: number;
  distanceKm: number;
  baseCost: number;
  vehicleCost: number;
  nightSurcharge: number;
  holidaySurcharge: number;
  totalCost: number;
};

export default function Home() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);

  const [view, setView] = useState<"solicitud" | "admin">("solicitud");
  const [logged, setLogged] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [whatsapp, setWhatsapp] = useState("50700000000");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const [costPerKm, setCostPerKm] = useState(2);
  const [nightPercent, setNightPercent] = useState(20);
  const [holidayPercent, setHolidayPercent] = useState(30);

  const [vehicleRates, setVehicleRates] = useState<Record<VehicleType, number>>({
    Sedán: 15,
    SUV: 20,
    Pickup: 25,
    "Camión liviano": 35,
    Moto: 10,
  });

  const [opName, setOpName] = useState("");
  const [opPhone, setOpPhone] = useState("");
  const [opStatus, setOpStatus] = useState<"Activo" | "Inactivo">("Activo");

  const [mapOpen, setMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<"origin" | "destination">("origin");
  const [selectedCoords, setSelectedCoords] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "" as VehicleType | "",
    origin: "",
    destination: "",
    problem: "",
    isNight: false,
    isHoliday: false,
  });

  useEffect(() => {
    setWhatsapp(localStorage.getItem("gruapp_whatsapp") || "50700000000");
    setOperators(JSON.parse(localStorage.getItem("gruapp_operators") || "[]"));
    setRequests(JSON.parse(localStorage.getItem("gruapp_requests") || "[]"));
    setCostPerKm(Number(localStorage.getItem("gruapp_cost_per_km") || 2));
    setNightPercent(Number(localStorage.getItem("gruapp_night_percent") || 20));
    setHolidayPercent(Number(localStorage.getItem("gruapp_holiday_percent") || 30));

    const savedRates = localStorage.getItem("gruapp_vehicle_rates");
    if (savedRates) setVehicleRates(JSON.parse(savedRates));
  }, []);

  useEffect(() => {
    if (!mapOpen) return;

    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!window.L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      setTimeout(() => {
        if (!mapRef.current || leafletMap.current) return;

        leafletMap.current = window.L.map(mapRef.current).setView([8.9824, -79.5199], 12);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(leafletMap.current);

        leafletMap.current.on("click", (e: any) => {
          const coords = `${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
          setSelectedCoords(coords);

          if (marker.current) marker.current.remove();

          marker.current = window.L.marker([e.latlng.lat, e.latlng.lng])
            .addTo(leafletMap.current)
            .bindPopup("Ubicación seleccionada")
            .openPopup();
        });
      }, 200);
    };

    loadLeaflet();
  }, [mapOpen]);

  const parseCoords = (coords: string) => {
    const [lat, lng] = coords.split(",").map(Number);
    return { lat, lng };
  };

  const calculateDistanceKm = (origin: string, destination: string) => {
    if (!origin || !destination) return 0;

    const a = parseCoords(origin);
    const b = parseCoords(destination);

    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;

    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return Number((2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))).toFixed(2));
  };

  const calculateCost = () => {
    if (!form.vehicle) {
      return {
        distanceKm: 0,
        baseCost: 0,
        vehicleCost: 0,
        nightSurcharge: 0,
        holidaySurcharge: 0,
        totalCost: 0,
      };
    }

    const distanceKm = calculateDistanceKm(form.origin, form.destination);
    const baseCost = Number((distanceKm * costPerKm).toFixed(2));
    const vehicleCost = vehicleRates[form.vehicle] || 0;
    const subtotal = baseCost + vehicleCost;
    const nightSurcharge = form.isNight ? Number((subtotal * (nightPercent / 100)).toFixed(2)) : 0;
    const holidaySurcharge = form.isHoliday ? Number((subtotal * (holidayPercent / 100)).toFixed(2)) : 0;
    const totalCost = Number((subtotal + nightSurcharge + holidaySurcharge).toFixed(2));

    return { distanceKm, baseCost, vehicleCost, nightSurcharge, holidaySurcharge, totalCost };
  };

  const currentCost = calculateCost();

  const savePricing = () => {
    localStorage.setItem("gruapp_cost_per_km", String(costPerKm));
    localStorage.setItem("gruapp_night_percent", String(nightPercent));
    localStorage.setItem("gruapp_holiday_percent", String(holidayPercent));
    localStorage.setItem("gruapp_vehicle_rates", JSON.stringify(vehicleRates));
    alert("Tarifas guardadas");
  };

  const openMap = (target: "origin" | "destination") => {
    setMapTarget(target);
    setSelectedCoords("");
    setMapOpen(true);
    leafletMap.current = null;
    marker.current = null;
  };

  const confirmMap = () => {
    if (!selectedCoords) {
      alert("Selecciona un punto en el mapa");
      return;
    }

    setForm({ ...form, [mapTarget]: selectedCoords });
    setMapOpen(false);
  };

  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setSelectedCoords(coords);

        if (leafletMap.current) {
          const [lat, lng] = coords.split(",").map(Number);
          leafletMap.current.setView([lat, lng], 16);

          if (marker.current) marker.current.remove();

          marker.current = window.L.marker([lat, lng])
            .addTo(leafletMap.current)
            .bindPopup("Mi ubicación")
            .openPopup();
        }
      },
      () => alert("No se pudo obtener tu GPS")
    );
  };

  const login = () => {
    if (adminUser === "GRUAPP" && adminPass === "987654321") setLogged(true);
    else alert("Usuario o contraseña incorrectos");
  };

  const saveWhatsapp = () => {
    localStorage.setItem("gruapp_whatsapp", whatsapp);
    alert("WhatsApp guardado");
  };

  const saveOperator = () => {
    if (!opName || !opPhone) {
      alert("Completa nombre y teléfono");
      return;
    }

    const updated = [
      ...operators,
      { id: Date.now(), name: opName, phone: opPhone, status: opStatus },
    ];

    setOperators(updated);
    localStorage.setItem("gruapp_operators", JSON.stringify(updated));
    setOpName("");
    setOpPhone("");
  };

  const deleteOperator = (id: number) => {
    const updated = operators.filter((op) => op.id !== id);
    setOperators(updated);
    localStorage.setItem("gruapp_operators", JSON.stringify(updated));
  };

  const sendRequest = () => {
    if (!form.name || !form.phone || !form.vehicle || !form.origin || !form.destination || !form.problem) {
      alert("Completa los campos obligatorios");
      return;
    }

    const cost = calculateCost();

    const newRequest: RequestItem = {
      id: Date.now(),
      name: form.name,
      phone: form.phone,
      vehicle: form.vehicle,
      origin: form.origin,
      destination: form.destination,
      problem: form.problem,
      status: "Pendiente",
      createdAt: new Date().toLocaleString(),
      assignedOperatorId: undefined,
      ...cost,
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem("gruapp_requests", JSON.stringify(updated));

    const message = encodeURIComponent(
      `Nueva solicitud de grúa\n\nCliente: ${form.name}\nTeléfono: ${form.phone}\nVehículo: ${form.vehicle}\nOrigen: https://www.google.com/maps?q=${form.origin}\nDestino: https://www.google.com/maps?q=${form.destination}\nDistancia estimada: ${cost.distanceKm} km\nTotal estimado: USD ${cost.totalCost}\nProblema: ${form.problem}`
    );

    window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
  };

  const updateRequestStatus = (id: number, status: string) => {
    const updated = requests.map((req) => req.id === id ? { ...req, status } : req);
    setRequests(updated);
    localStorage.setItem("gruapp_requests", JSON.stringify(updated));
  };

  const assignOperator = (requestId: number, operatorId: string) => {
    const updated = requests.map((req) =>
      req.id === requestId
        ? { ...req, assignedOperatorId: operatorId ? Number(operatorId) : undefined, status: operatorId ? "Asignado" : req.status }
        : req
    );

    setRequests(updated);
    localStorage.setItem("gruapp_requests", JSON.stringify(updated));
  };

  const getOperatorName = (id?: number) => {
    if (!id) return "Sin asignar";
    return operators.find((op) => op.id === id)?.name || "Operador no encontrado";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-zinc-900 p-2 shadow-lg">
            <Image src="/Logo.jpeg" alt="Grúas Ebenezer" width={80} height={80} className="mix-blend-lighten" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Grúas Ebenezer</h1>
            <p className="text-sm text-zinc-400">GruApp Panamá · v0.6</p>
          </div>
        </div>

        <nav className="flex gap-3">
          <button onClick={() => setView("solicitud")} className="rounded-xl bg-red-700 px-5 py-3 font-bold">
            Solicitar grúa
          </button>
          <button onClick={() => setView("admin")} className="rounded-xl bg-blue-700 px-5 py-3 font-bold">
            Panel privado
          </button>
        </nav>
      </header>

      {view === "solicitud" && (
        <section className="mx-auto max-w-6xl p-6">
          <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <div className="mx-auto w-fit rounded-3xl bg-zinc-950 p-4 shadow-2xl">
              <Image src="/Logo.jpeg" alt="Logo" width={180} height={180} className="mix-blend-lighten" />
            </div>
            <h2 className="mt-5 text-4xl font-black">Solicitud de asistencia vial</h2>
            <p className="mt-2 text-zinc-400">Selecciona origen, destino y detalles del servicio.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-5 text-2xl font-bold">Datos del servicio</h3>

              <div className="space-y-4">
                <input className="w-full rounded-xl bg-black p-4" placeholder="Nombre completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="w-full rounded-xl bg-black p-4" placeholder="Teléfono / WhatsApp *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

                <select className="w-full rounded-xl bg-black p-4" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value as VehicleType })}>
                  <option value="">Tipo de vehículo *</option>
                  <option>Sedán</option>
                  <option>SUV</option>
                  <option>Pickup</option>
                  <option>Camión liviano</option>
                  <option>Moto</option>
                </select>

                <div className="flex gap-3">
                  <input className="w-full rounded-xl bg-black p-4" readOnly placeholder="Ubicación actual *" value={form.origin} />
                  <button onClick={() => openMap("origin")} className="rounded-xl bg-blue-700 px-5 font-bold">Mapa</button>
                </div>

                <div className="flex gap-3">
                  <input className="w-full rounded-xl bg-black p-4" readOnly placeholder="Destino *" value={form.destination} />
                  <button onClick={() => openMap("destination")} className="rounded-xl bg-blue-700 px-5 font-bold">Mapa</button>
                </div>

                <textarea className="w-full rounded-xl bg-black p-4" placeholder="Descripción del problema *" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />

                <label className="flex gap-3 rounded-xl bg-black p-4">
                  <input type="checkbox" checked={form.isNight} onChange={(e) => setForm({ ...form, isNight: e.target.checked })} />
                  Servicio nocturno
                </label>

                <label className="flex gap-3 rounded-xl bg-black p-4">
                  <input type="checkbox" checked={form.isHoliday} onChange={(e) => setForm({ ...form, isHoliday: e.target.checked })} />
                  Servicio en día feriado
                </label>

                <button onClick={sendRequest} className="w-full rounded-xl bg-red-700 p-5 text-xl font-black">
                  Enviar solicitud por WhatsApp
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-5 text-2xl font-bold">Cotización estimada</h3>
              <p><b>WhatsApp destino:</b> {whatsapp}</p>
              <p><b>Distancia:</b> {currentCost.distanceKm} km</p>
              <p><b>Costo por km:</b> USD {currentCost.baseCost}</p>
              <p><b>Costo por vehículo:</b> USD {currentCost.vehicleCost}</p>
              <p><b>Recargo nocturno:</b> USD {currentCost.nightSurcharge}</p>
              <p><b>Recargo feriado:</b> USD {currentCost.holidaySurcharge}</p>
              <div className="mt-5 rounded-2xl bg-red-700 p-5 text-center">
                <p className="text-sm">Total estimado</p>
                <p className="text-4xl font-black">USD {currentCost.totalCost}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === "admin" && !logged && (
        <section className="mx-auto mt-10 max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="mx-auto w-fit rounded-3xl bg-zinc-950 p-4">
            <Image src="/Logo.jpeg" alt="Logo" width={180} height={180} className="mix-blend-lighten" />
          </div>

          <h2 className="mt-5 text-center text-3xl font-black">Panel privado</h2>

          <div className="mt-6 space-y-4">
            <input className="w-full rounded-xl bg-black p-4" placeholder="Usuario" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
            <input className="w-full rounded-xl bg-black p-4" placeholder="Contraseña" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
            <button onClick={login} className="w-full rounded-xl bg-blue-700 p-4 font-bold">Ingresar</button>
          </div>
        </section>
      )}

      {view === "admin" && logged && (
        <section className="mx-auto max-w-6xl p-6">
          <div className="mb-6 flex justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div>
              <h2 className="text-3xl font-black">Panel Administrativo</h2>
              <p className="text-zinc-400">Operación, tarifas y seguimiento</p>
            </div>
            <button onClick={() => setLogged(false)} className="rounded-xl bg-red-700 px-5 font-bold">Cerrar sesión</button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-bold">WhatsApp principal</h3>
              <input className="mt-4 w-full rounded-xl bg-black p-4" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <button onClick={saveWhatsapp} className="mt-4 w-full rounded-xl bg-blue-700 p-4 font-bold">Guardar</button>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-bold">Tarifas</h3>

              <label className="mt-4 block text-sm text-zinc-400">Costo por km</label>
              <input type="number" className="w-full rounded-xl bg-black p-4" value={costPerKm} onChange={(e) => setCostPerKm(Number(e.target.value))} />

              <label className="mt-4 block text-sm text-zinc-400">Recargo nocturno %</label>
              <input type="number" className="w-full rounded-xl bg-black p-4" value={nightPercent} onChange={(e) => setNightPercent(Number(e.target.value))} />

              <label className="mt-4 block text-sm text-zinc-400">Recargo feriado %</label>
              <input type="number" className="w-full rounded-xl bg-black p-4" value={holidayPercent} onChange={(e) => setHolidayPercent(Number(e.target.value))} />

              {Object.keys(vehicleRates).map((vehicle) => (
                <div key={vehicle}>
                  <label className="mt-4 block text-sm text-zinc-400">{vehicle}</label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-black p-4"
                    value={vehicleRates[vehicle as VehicleType]}
                    onChange={(e) =>
                      setVehicleRates({
                        ...vehicleRates,
                        [vehicle]: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}

              <button onClick={savePricing} className="mt-4 w-full rounded-xl bg-blue-700 p-4 font-bold">Guardar tarifas</button>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-bold">Operadores</h3>
              <input className="mt-4 w-full rounded-xl bg-black p-4" placeholder="Nombre" value={opName} onChange={(e) => setOpName(e.target.value)} />
              <input className="mt-3 w-full rounded-xl bg-black p-4" placeholder="WhatsApp" value={opPhone} onChange={(e) => setOpPhone(e.target.value)} />
              <select className="mt-3 w-full rounded-xl bg-black p-4" value={opStatus} onChange={(e) => setOpStatus(e.target.value as "Activo" | "Inactivo")}>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <button onClick={saveOperator} className="mt-4 w-full rounded-xl bg-red-700 p-4 font-bold">Guardar operador</button>

              <div className="mt-5 space-y-3">
                {operators.map((op) => (
                  <div key={op.id} className="rounded-xl bg-black p-4">
                    <b>{op.name}</b>
                    <p>{op.phone}</p>
                    <p>{op.status}</p>
                    <button onClick={() => deleteOperator(op.id)} className="mt-2 text-red-500">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-4 text-2xl font-bold">Seguimiento de solicitudes</h3>

            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="rounded-xl bg-black p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <b>{req.name}</b>
                      <p>{req.phone} · {req.vehicle}</p>
                      <p>{req.problem}</p>
                      <p className="text-zinc-400">{req.createdAt}</p>
                    </div>

                    <div>
                      <p><b>Estado:</b> {req.status}</p>
                      <p><b>Operador:</b> {getOperatorName(req.assignedOperatorId)}</p>
                      <p><b>Distancia:</b> {req.distanceKm} km</p>
                      <p><b>Total:</b> USD {req.totalCost}</p>
                    </div>

                    <div className="space-y-3">
                      <select
                        value={req.assignedOperatorId || ""}
                        onChange={(e) => assignOperator(req.id, e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 p-3"
                      >
                        <option value="">Asignar operador</option>
                        {operators.filter(op => op.status === "Activo").map((op) => (
                          <option key={op.id} value={op.id}>{op.name}</option>
                        ))}
                      </select>

                      <select
                        value={req.status}
                        onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 p-3"
                      >
                        <option>Pendiente</option>
                        <option>Asignado</option>
                        <option>En camino</option>
                        <option>En sitio</option>
                        <option>En traslado</option>
                        <option>Finalizado</option>
                        <option>Cancelado</option>
                      </select>

                      <a target="_blank" href={`https://www.google.com/maps?q=${req.origin}`} className="block rounded-xl bg-blue-700 px-4 py-2 text-center font-bold">
                        Ver origen
                      </a>

                      <a target="_blank" href={`https://www.google.com/maps?q=${req.destination}`} className="block rounded-xl bg-zinc-700 px-4 py-2 text-center font-bold">
                        Ver destino
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-4 flex justify-between">
              <h2 className="text-2xl font-black">
                Seleccionar {mapTarget === "origin" ? "ubicación actual" : "destino"}
              </h2>
              <button onClick={() => setMapOpen(false)} className="rounded-xl bg-red-700 px-4 py-2 font-bold">
                Cerrar
              </button>
            </div>

            <button onClick={getGPS} className="mb-4 rounded-xl bg-blue-700 px-5 py-3 font-bold">
              Usar mi GPS
            </button>

            <div ref={mapRef} className="h-[500px] w-full rounded-2xl bg-zinc-900" />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-zinc-300">
                Coordenadas: <b>{selectedCoords || "Selecciona un punto en el mapa"}</b>
              </p>

              <button onClick={confirmMap} className="rounded-xl bg-red-700 px-6 py-3 font-black">
                Confirmar ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}