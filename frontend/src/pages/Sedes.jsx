import { useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"

const sedesIniciales = [
  { id: 1, nombre: "Sede Central", direccion: "Av. Libertador 4500", comuna: "Santiago", estado: "Activa" },
  { id: 2, nombre: "Sede Norte", direccion: "Camino Costero 800", comuna: "Antofagasta", estado: "Activa" },
]

function Sedes() {
  const [sedes, setSedes] = useState(sedesIniciales)
  const [siguienteId, setSiguienteId] = useState(3)

  function agregarSede(evento) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)
    const sede = {
      id: siguienteId,
      nombre: formulario.get("nombre").trim(),
      direccion: formulario.get("direccion").trim(),
      comuna: formulario.get("comuna").trim(),
      estado: formulario.get("estado"),
    }

    setSedes((actuales) => [...actuales, sede])
    setSiguienteId((id) => id + 1)
    evento.currentTarget.reset()
  }

  function eliminarSede(id) {
    setSedes((actuales) => actuales.filter((sede) => sede.id !== id))
  }

  return (
    <div className="sga-page flex min-h-dvh flex-col">
      <Header />
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Estructura institucional · RF2</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Gestión de sedes</h1>
        </div>

        <form onSubmit={agregarSede} className="mb-10 rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-900">Registrar sede</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nombreSede" className="mb-1 block text-sm font-medium text-gray-700">Nombre de la sede</label>
              <input id="nombreSede" name="nombre" required maxLength={100} placeholder="Ej. Sede Central Providencia" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="direccionSede" className="mb-1 block text-sm font-medium text-gray-700">Dirección física</label>
              <input id="direccionSede" name="direccion" required maxLength={160} placeholder="Ej. Av. Principal 1234" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="comunaSede" className="mb-1 block text-sm font-medium text-gray-700">Comuna / ciudad</label>
              <input id="comunaSede" name="comuna" required maxLength={80} placeholder="Ej. Santiago" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="estadoSede" className="mb-1 block text-sm font-medium text-gray-700">Estado operativo</label>
              <select id="estadoSede" name="estado" defaultValue="Activa" className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option>Activa</option>
                <option>En mantenimiento</option>
                <option>Inactiva</option>
              </select>
            </div>
            <div className="sm:col-span-2 sm:flex sm:justify-end">
              <button type="submit" className="w-full rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto">
                Agregar sede
              </button>
            </div>
          </div>
        </form>

        <section aria-labelledby="sedesRegistradas">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h3 id="sedesRegistradas" className="text-lg font-semibold text-gray-900">Sedes registradas</h3>
            <span className="text-sm text-gray-600">{sedes.length} {sedes.length === 1 ? "sede" : "sedes"}</span>
          </div>
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Dirección</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Comuna</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{sede.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{sede.direccion}</td>
                    <td className="px-4 py-3 text-gray-700">{sede.comuna}</td>
                    <td className="px-4 py-3 text-gray-700">{sede.estado}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => eliminarSede(sede.id)} aria-label={`Eliminar ${sede.nombre}`} className="rounded px-3 py-2 font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {sedes.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">No hay sedes registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Sedes