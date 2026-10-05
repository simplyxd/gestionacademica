import Header from "../components/Header"
import Footer from "../components/Footer"
import CursosCard from "../components/CursosCard"
import { Link } from "react-router-dom"
import {cursos} from "../data/cursos"

const accesos = [
  { to: "/permisos", categoria: "Administración", titulo: "Perfiles y permisos", detalle: "Control de acceso por perfil" },
  { to: "/sedes", categoria: "Institución", titulo: "Sedes", detalle: "Gestiona la estructura institucional" },
  { to: "/secciones", categoria: "Oferta académica", titulo: "Secciones", detalle: "Consulta la oferta del periodo" },
  { to: "/horario", categoria: "Vida académica", titulo: "Horario", detalle: "Revisa clases y jornadas" },
]

function Cursos(){
  return(
    <div className="sga-page flex min-h-dvh flex-col">
      <Header/>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <section className="flex flex-col justify-between gap-6 border-b border-gray-300 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#2e4a95]">Portal académico · Periodo 2026-2</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Bienvenido a Gestión Académica
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
              Accede a la información de cursos, sedes y actividades académicas desde un solo lugar.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 border-l-4 border-[#2e4a95] bg-white px-5 py-4 shadow-sm">
            <span className="text-3xl font-bold text-slate-900">{cursos.length}</span>
            <span className="max-w-24 text-sm font-medium leading-5 text-gray-600">cursos disponibles</span>
          </div>
        </section>

        <section aria-labelledby="accesosRapidos" className="py-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="accesosRapidos" className="text-xl font-bold text-slate-900">Accesos rápidos</h3>
            <p className="text-sm text-gray-500">Módulos del portal</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {accesos.map((acceso) => (
              <Link key={acceso.to} to={acceso.to} className="group border border-gray-200 border-t-[3px] border-t-[#2e4a95] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e4a95]">
                <p className="text-xs font-bold uppercase tracking-wide text-[#2e4a95]">{acceso.categoria}</p>
                <h4 className="mt-3 text-lg font-bold text-slate-900">{acceso.titulo}</h4>
                <p className="mt-1 text-sm leading-5 text-gray-600">{acceso.detalle}</p>
                <span className="mt-4 inline-block text-sm font-bold text-slate-900 group-hover:text-[#2e4a95]">Abrir módulo &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="cursosDisponibles" className="border-t border-gray-300 pt-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="cursosDisponibles" className="text-xl font-bold text-slate-900">Cursos disponibles</h3>
            <span className="text-sm text-gray-500">Catálogo académico</span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
           {cursos.map((curso) => (
            <CursosCard
              key={curso.id}
              nombre={curso.nombre}
              desc={curso.desc}
              horas={curso.horas}
              icon={curso.icon}
              />
           ))} 
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  )
}

export default Cursos