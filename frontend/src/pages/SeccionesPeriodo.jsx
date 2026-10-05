import { useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"

const seccionesPorPeriodo = {
  "2026-2": [
    { codigo: "INF-301 · Sec 01", nombre: "Ingeniería de Software I", detalle: "Presencial / Diurna", creditos: 6 },
    { codigo: "INF-302 · Sec 02", nombre: "Base de Datos Avanzadas", detalle: "Online / Vespertina", creditos: 6 },
    { codigo: "LID-101 · Sec 01", nombre: "Liderazgo de Equipos", detalle: "Presencial / Diurna", creditos: 4 },
  ],
  "2026-1": [
    { codigo: "INF-201 · Sec 01", nombre: "Algoritmos y Estructuras de Datos", detalle: "Presencial / Diurna", creditos: 8 },
    { codigo: "MAT-202 · Sec 02", nombre: "Matemáticas Discretas", detalle: "Presencial / Diurna", creditos: 6 },
  ],
}

function SeccionesPeriodo() {
  const [periodo, setPeriodo] = useState("2026-2")
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null)
  const secciones = seccionesPorPeriodo[periodo]

  return (
    <div className="sga-page flex min-h-dvh flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Oferta académica · RF9</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Mis secciones del periodo</h1>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="periodoSeccion" className="text-sm font-semibold text-gray-800">Periodo académico</label>
            <select id="periodoSeccion" value={periodo} onChange={(evento) => setPeriodo(evento.target.value)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option value="2026-2">2026 · Segundo semestre (vigente)</option>
              <option value="2026-1">2026 · Primer semestre</option>
            </select>
          </div>
          <p aria-live="polite" className="text-sm font-semibold text-gray-700">{secciones.length} {secciones.length === 1 ? "sección" : "secciones"}</p>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Código / sección</th>
                <th scope="col" className="px-4 py-3 font-semibold">Asignatura</th>
                <th scope="col" className="px-4 py-3 font-semibold">Modalidad / jornada</th>
                <th scope="col" className="px-4 py-3 font-semibold">Créditos</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {secciones.map((seccion) => (
                <tr key={seccion.codigo}>
                  <td className="px-4 py-4 font-semibold text-blue-800">{seccion.codigo}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{seccion.nombre}</td>
                  <td className="px-4 py-4 text-gray-700">{seccion.detalle}</td>
                  <td className="px-4 py-4 text-gray-700">{seccion.creditos} SCT</td>
                  <td className="px-4 py-4 text-right">
                    <button type="button" onClick={() => setSeccionSeleccionada(seccion)} className="rounded bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                      Ver nómina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />

      {seccionSeleccionada && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-950/50 p-4" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setSeccionSeleccionada(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="tituloNomina" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{seccionSeleccionada.codigo}</p>
            <h3 id="tituloNomina" className="mt-2 text-xl font-bold text-gray-900">{seccionSeleccionada.nombre}</h3>
            <p className="mt-3 text-gray-700">{seccionSeleccionada.detalle} · {seccionSeleccionada.creditos} SCT</p>
            <p className="mt-4 text-sm text-gray-600">La nómina de estudiantes estará disponible cuando se conecte la fuente de datos académica.</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setSeccionSeleccionada(null)} className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default SeccionesPeriodo