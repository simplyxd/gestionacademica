import { useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

const horariosPorPeriodo = {
  "2026-2": [
    {
      hora: "08:30 - 10:00",
      clases: {
        Lunes: { nombre: "Ingeniería de Software I", sala: "Aula 302", docente: "Mario Docente" },
        Miércoles: { nombre: "Ingeniería de Software I", sala: "Aula 302", docente: "Mario Docente" },
      },
    },
    {
      hora: "10:15 - 11:45",
      clases: {
        Martes: { nombre: "Base de Datos Avanzadas", sala: "Laboratorio Informática 1", docente: "Carlos Admin" },
        Jueves: { nombre: "Base de Datos Avanzadas", sala: "Laboratorio Informática 1", docente: "Carlos Admin" },
      },
    },
    {
      hora: "12:00 - 13:30",
      clases: {
        Viernes: { nombre: "Liderazgo de Equipos", sala: "Auditorio Central", docente: "Sofía Coordinadora" },
      },
    },
  ],
  "2026-1": [
    {
      hora: "08:30 - 10:00",
      clases: {
        Martes: { nombre: "Algoritmos y Estructuras de Datos", sala: "Aula 204", docente: "Mario Docente" },
        Jueves: { nombre: "Algoritmos y Estructuras de Datos", sala: "Aula 204", docente: "Mario Docente" },
      },
    },
    {
      hora: "10:15 - 11:45",
      clases: {
        Lunes: { nombre: "Matemáticas Discretas", sala: "Aula 105", docente: "Sofía Coordinadora" },
        Miércoles: { nombre: "Matemáticas Discretas", sala: "Aula 105", docente: "Sofía Coordinadora" },
      },
    },
  ],
}

function Horario() {
  const [periodo, setPeriodo] = useState("2026-2")
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)
  const horarios = horariosPorPeriodo[periodo]

  return (
    <div className="sga-page flex min-h-dvh flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Consulta de horarios · RF9</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Mi horario semanal</h1>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="periodoHorario" className="text-sm font-semibold text-gray-800">Periodo académico</label>
            <select id="periodoHorario" value={periodo} onChange={(evento) => setPeriodo(evento.target.value)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option value="2026-2">2026 · Segundo semestre</option>
              <option value="2026-1">2026 · Primer semestre</option>
            </select>
          </div>
          <p className="text-sm font-semibold text-gray-700">Vista: estudiante</p>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full min-w-[800px] border-collapse text-center text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th scope="col" className="w-32 px-3 py-4 font-semibold">Hora</th>
                {dias.map((dia) => <th key={dia} scope="col" className="px-3 py-4 font-semibold">{dia}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {horarios.map((bloque) => (
                <tr key={bloque.hora}>
                  <th scope="row" className="bg-gray-50 px-3 py-4 font-semibold text-gray-700">{bloque.hora}</th>
                  {dias.map((dia) => {
                    const clase = bloque.clases[dia]
                    return (
                      <td key={dia} className="min-w-36 px-2 py-3 align-top">
                        {clase && (
                          <button type="button" onClick={() => setClaseSeleccionada(clase)} className="w-full rounded border-l-4 border-blue-700 bg-blue-50 p-3 text-left hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                            <span className="block font-semibold text-blue-900">{clase.nombre}</span>
                            <span className="mt-1 block text-xs text-gray-700">{clase.sala}</span>
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />

      {claseSeleccionada && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-950/50 p-4" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setClaseSeleccionada(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="tituloClase" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Detalle de asignatura</p>
            <h3 id="tituloClase" className="mt-2 text-xl font-bold text-gray-900">{claseSeleccionada.nombre}</h3>
            <p className="mt-4 text-gray-700">Sala / espacio: {claseSeleccionada.sala}</p>
            <p className="mt-2 text-gray-700">Docente: {claseSeleccionada.docente}</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setClaseSeleccionada(null)} className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Horario