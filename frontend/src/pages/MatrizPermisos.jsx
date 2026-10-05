import { useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"

const perfiles = [
  { id: "administrador", nombre: "Administrador" },
  { id: "coordinador", nombre: "Coordinador" },
  { id: "docente", nombre: "Docente" },
  { id: "estudiante", nombre: "Estudiante" },
]

const permisosIniciales = [
  {
    id: "usuarios",
    funcionalidad: "Gestión de usuarios (alta y baja)",
    permisos: { administrador: true, coordinador: false, docente: false, estudiante: false },
  },
  {
    id: "estructura",
    funcionalidad: "Estructura académica (sedes y carreras)",
    permisos: { administrador: true, coordinador: true, docente: false, estudiante: false },
  },
  {
    id: "oferta",
    funcionalidad: "Oferta académica y secciones",
    permisos: { administrador: true, coordinador: true, docente: false, estudiante: false },
  },
  {
    id: "nomina",
    funcionalidad: "Consulta de nómina de estudiantes",
    permisos: { administrador: true, coordinador: true, docente: true, estudiante: false },
  },
  {
    id: "inscripcion",
    funcionalidad: "Inscripción de asignaturas",
    permisos: { administrador: false, coordinador: false, docente: false, estudiante: true },
  },
]

function cargarPermisos() {
  try {
    const permisosGuardados = localStorage.getItem("gestion-academica-permisos")
    return permisosGuardados ? JSON.parse(permisosGuardados) : permisosIniciales
  } catch {
    return permisosIniciales
  }
}

function MatrizPermisos() {
  const [permisos, setPermisos] = useState(cargarPermisos)
  const [guardado, setGuardado] = useState(false)

  function actualizarPermiso(idFila, idPerfil, permitido) {
    setPermisos((actuales) =>
      actuales.map((fila) =>
        fila.id === idFila
          ? { ...fila, permisos: { ...fila.permisos, [idPerfil]: permitido } }
          : fila,
      ),
    )
    setGuardado(false)
  }

  function guardarMatriz(evento) {
    evento.preventDefault()
    localStorage.setItem("gestion-academica-permisos", JSON.stringify(permisos))
    setGuardado(true)
  }

  return (
    <div className="sga-page flex min-h-dvh flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Control de acceso · RF1</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Matriz de permisos por perfil</h1>
        </div>

        <form onSubmit={guardarMatriz}>
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Módulo / funcionalidad</th>
                  {perfiles.map((perfil) => (
                    <th key={perfil.id} scope="col" className="px-4 py-4 text-center font-semibold">
                      {perfil.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {permisos.map((fila) => (
                  <tr key={fila.id}>
                    <th scope="row" className="px-5 py-4 text-sm font-medium text-gray-800">
                      {fila.funcionalidad}
                    </th>
                    {perfiles.map((perfil) => (
                      <td key={perfil.id} className="px-4 py-4 text-center">
                        <input
                          aria-label={`${perfil.nombre}: ${fila.funcionalidad}`}
                          type="checkbox"
                          checked={fila.permisos[perfil.id]}
                          disabled={perfil.id === "administrador"}
                          onChange={(evento) => actualizarPermiso(fila.id, perfil.id, evento.target.checked)}
                          className="h-5 w-5 accent-blue-700 disabled:cursor-not-allowed"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="text-sm text-green-700">
              {guardado ? "Matriz de permisos guardada en este navegador." : ""}
            </p>
            <button type="submit" className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Guardar cambios
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default MatrizPermisos