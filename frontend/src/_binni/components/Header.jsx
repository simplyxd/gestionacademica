import { ActionIcon, Burger, Collapse, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { NavLink } from "react-router-dom"

const navigationItems = [
  { to: "/", label: "Cursos" },
  { to: "/permisos", label: "Permisos" },
  { to: "/sedes", label: "Sedes" },
  { to: "/secciones", label: "Secciones" },
  { to: "/horario", label: "Horario" },
  { to: "/periodos", label: "Períodos" },
  { to: "/oferta", label: "Oferta" },
  { to: "/Cliente", label: "Clientes" },
  { to: "/Producto", label: "Productos" },
]

function Header() {
  const [menuAbierto, { toggle: alternarMenu, close: cerrarMenu }] = useDisclosure(false)
  const esquema = useComputedColorScheme("light")
  const { setColorScheme } = useMantineColorScheme()
  const temaSiguiente = esquema === "dark" ? "claro" : "oscuro"

  return (
    <header className="sga-header border-t-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:py-4">
        <NavLink to="/" aria-label="Universidad Andrés Bello, inicio" className="sga-logo shrink-0">
          <img src="/logo-unab.png" alt="Universidad Andrés Bello" className="h-16 w-auto max-w-[58vw] sm:h-20 sm:max-w-[72vw]" />
        </NavLink>
        <div className="hidden border-l-2 border-[var(--sga-primary)] pl-4 text-right md:block">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--sga-primary)]">Portal universitario</p>
          <p className="mt-1 text-sm font-semibold text-[var(--sga-text)]">Gestión académica</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionIcon
            variant="subtle"
            color="navy"
            size="lg"
            aria-label={`Cambiar a tema ${temaSiguiente}`}
            title={`Cambiar a tema ${temaSiguiente}`}
            onClick={() => setColorScheme(esquema === "dark" ? "light" : "dark")}
          >
            {esquema === "dark" ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
          </ActionIcon>
          <Burger
            opened={menuAbierto}
            onClick={alternarMenu}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            className="md:hidden"
          />
        </div>
      </div>
      <div className="sga-navigation">
        <nav aria-label="Navegación principal" className="mx-auto hidden max-w-7xl gap-1 px-4 text-sm font-semibold md:flex sm:gap-3">
          {navigationItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `sga-nav-link shrink-0 border-b-[3px] px-3 py-4 transition-colors ${isActive ? "is-active" : "border-transparent"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="md:hidden">
          <Collapse expanded={menuAbierto}>
            <nav aria-label="Navegación móvil" className="mx-auto max-w-7xl px-4 pb-3 text-sm font-semibold">
              {navigationItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    `sga-nav-link block border-l-4 px-4 py-3 transition-colors ${
                      isActive
                        ? "is-active"
                        : "border-transparent"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </Collapse>
        </div>
      </div>
    </header>
  )
}

export default Header