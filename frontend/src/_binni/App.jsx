import { lazy, Suspense, useState } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import Clientes from "./pages/Clientes"
import Productos from "./pages/Productos"
import Cursos from "./pages/Cursos"
import MatrizPermisos from "./pages/MatrizPermisos"
import Sedes from "./pages/Sedes"
import SeccionesPeriodo from "./pages/SeccionesPeriodo"
import Horario from "./pages/Horario"
import { INITIAL_PERIODS, INITIAL_SECTIONS } from "./data/academicMockData"

const Periodos = lazy(() => import("./pages/Periodos"))
const Oferta = lazy(() => import("./pages/Oferta"))

function App() {
  const [periodos, setPeriodos] = useState(INITIAL_PERIODS)
  const [secciones, setSecciones] = useState(INITIAL_SECTIONS)

  function guardarPeriodo(periodo) {
    setPeriodos((actuales) => {
      const existe = actuales.some((actual) => actual.id === periodo.id)
      return existe
        ? actuales.map((actual) => actual.id === periodo.id ? periodo : actual)
        : [...actuales, periodo]
    })
  }

  function guardarSeccion(seccion) {
    setSecciones((actuales) => {
      const existe = actuales.some((actual) => actual.id === seccion.id)
      return existe
        ? actuales.map((actual) => actual.id === seccion.id ? seccion : actual)
        : [...actuales, seccion]
    })
  }

  return (
    <HashRouter>
      <Suspense fallback={<main className="p-8" role="status">Cargando vista académica…</main>}>
        <Routes>
          <Route path="/" element={<Cursos />} />
          <Route path="/Cliente" element={<Clientes />} />
          <Route path="/Producto" element={<Productos />} />
          <Route path="/permisos" element={<MatrizPermisos />} />
          <Route path="/sedes" element={<Sedes />} />
          <Route path="/secciones" element={<SeccionesPeriodo />} />
          <Route path="/horario" element={<Horario />} />
          <Route
            path="/periodos"
            element={<Periodos periodos={periodos} onGuardar={guardarPeriodo} />}
          />
          <Route
            path="/oferta"
            element={
              <Oferta
                periodos={periodos}
                secciones={secciones}
                onGuardar={guardarSeccion}
              />
            }
          />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
