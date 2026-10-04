import React from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'https://esm.sh/htm@3.1.1';
import {
  Accordion,
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  ColorSchemeScript,
  Drawer,
  Grid,
  Group,
  MantineProvider,
  Menu,
  Modal,
  NavLink,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  defaultVariantColorsResolver,
  parseThemeColor,
  useComputedColorScheme,
  useMantineColorScheme,
} from 'https://esm.sh/@mantine/core@7.14.1?external=react,react-dom';
import { useDisclosure, useMediaQuery } from 'https://esm.sh/@mantine/hooks@7.14.1?external=react,react-dom';
import {
  IconArchive,
  IconBooks,
  IconBuildingBank,
  IconCalendarEvent,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconClipboardList,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconHome,
  IconInbox,
  IconLayoutGrid,
  IconLogout,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
  IconUserSquareRounded,
} from 'https://esm.sh/@tabler/icons-react@3.19.0?external=react';
import {
  PERSONAS_MOCK_INICIAL,
  alternarEstadoMiembro,
  listarDocentesActivos,
  listarEstudiantesActivos,
} from './datos.js';

const html = htm.bind(React.createElement);
const ROL_COORDINADOR = 'coordinador';
const PERIODO = { codigo: '2026-2', estado: 'en curso' };

const ROL_LABEL = {
  admin: 'Administrador',
  coordinador: 'Coordinador académico',
  docente: 'Docente',
  estudiante: 'Estudiante',
};

const NAV_COORDINADOR = [
  { id: 'inicio', label: 'Inicio', icon: IconHome },
  { id: 'sedes', label: 'Sedes y carreras', icon: IconBuildingBank, group: 'Estructura' },
  { id: 'planes', label: 'Planes de estudio', icon: IconBooks, group: 'Estructura' },
  { id: 'periodos', label: 'Períodos', icon: IconCalendarEvent, group: 'Ciclo' },
  { id: 'matricula', label: 'Matrícula', icon: IconClipboardList, group: 'Ciclo' },
  { id: 'oferta', label: 'Oferta de secciones', icon: IconLayoutGrid, group: 'Ciclo' },
  {
    id: 'personas',
    label: 'Docentes y estudiantes',
    icon: IconUserSquareRounded,
    group: 'Personas',
    activo: true,
  },
  { id: 'reportes', label: 'Reportes', icon: IconChartBar, group: 'Consultas' },
];

function obtenerSesionMock() {
  const sesionPorDefecto = {
    id: 'u-coord-1',
    nombre: 'Coordinador académico',
    rol: ROL_COORDINADOR,
  };

  const sesionGlobal = window.sessionMockSGA;
  if (sesionGlobal && typeof sesionGlobal === 'object' && typeof sesionGlobal.rol === 'string') {
    return {
      id: sesionGlobal.id || sesionPorDefecto.id,
      nombre: sesionGlobal.nombre || 'Usuario mock',
      rol: sesionGlobal.rol.toLowerCase(),
    };
  }

  return sesionPorDefecto;
}

function inicialesDe(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function formatearFecha(iso) {
  if (!iso || typeof iso !== 'string') {
    return '—';
  }
  const [anio, mes, dia] = iso.split('-');
  if (!anio || !mes || !dia) {
    return iso;
  }
  return `${dia}/${mes}/${anio}`;
}

function crearFormularioInicial(tabActiva) {
  const base = {
    nombre: '',
    documento: '',
    gmail: '',
    telefono: '',
    incorporacion: '',
    estado: 'activo',
  };

  if (tabActiva === 'docentes') {
    return { ...base, materia: '', cursosEncargados: '', tipoVinculo: '' };
  }

  return { ...base, codigoEstudiante: '', contactoEmergencia: '', nivelCursando: '' };
}

function etiquetaRol(tabActiva) {
  return tabActiva === 'docentes' ? 'docente' : 'estudiante';
}

function badgeEstado(estado) {
  const activo = estado === 'activo';
  return html`
    <${Badge} color=${activo ? 'teal' : 'slate'} variant=${activo ? 'light' : 'outline'}>
      ${activo ? 'Activo' : 'Inactivo'}
    <//>
  `;
}

function EstadoVacio({ titulo, descripcion }) {
  return html`
    <${Stack} align="center" gap="sm" py="xl" ta="center">
      <${ThemeIcon} variant="light" color="slate" size=${56} radius="xl">
        <${IconInbox} size=${28} stroke=${1.5} />
      <//>
      <${Text} fw=${600}>${titulo}<//>
      ${descripcion
        ? html`<${Text} c="dimmed" fz="sm" maw=${360}>${descripcion}<//>`
        : null}
    <//>
  `;
}

function camposFicha(persona, tabActiva) {
  const comunes = [
    ['Nombre y apellido', persona.nombre],
    ['Documento', persona.documento, true],
    ['Gmail', persona.gmail],
    ['Teléfono', persona.telefono],
    ['Fecha de incorporación', formatearFecha(persona.incorporacion)],
    ['Estado', persona.estado === 'activo' ? 'Activo' : 'Inactivo'],
  ];

  if (tabActiva === 'docentes') {
    return [
      ...comunes,
      ['Materia que imparte', persona.materia],
      ['Encargado de qué cursos', persona.cursosEncargados],
      ['Tipo de vínculo con la institución', persona.tipoVinculo],
    ];
  }

  return [
    ...comunes,
    ['Código de estudiante', persona.codigoEstudiante, true],
    ['Contacto de emergencia', persona.contactoEmergencia],
    ['Nivel que está cursando', persona.nivelCursando],
  ];
}

function PersonasListado() {
  const sesionMock = React.useMemo(() => obtenerSesionMock(), []);
  const esCoordinador = sesionMock.rol === ROL_COORDINADOR;
  const [personas, setPersonas] = React.useState(PERSONAS_MOCK_INICIAL);
  const [tabActiva, setTabActiva] = React.useState('docentes');
  const [filtroEstado, setFiltroEstado] = React.useState('activos');
  const [busqueda, setBusqueda] = React.useState('');
  const [pagina, setPagina] = React.useState(1);
  const [tamanoPagina, setTamanoPagina] = React.useState(20);
  const [drawerModo, setDrawerModo] = React.useState(null);
  const [personaId, setPersonaId] = React.useState(null);
  const [confirmacion, setConfirmacion] = React.useState(null);
  const [formulario, setFormulario] = React.useState(crearFormularioInicial('docentes'));
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 47.99em)');
  const isTablet = useMediaQuery('(max-width: 75em)');
  const collapsed = !isMobile && (desktopCollapsed || isTablet);
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');

  React.useEffect(() => {
    window.personasAcademicasMock = personas;
    window.personasAcademicasActivas = {
      docentes: listarDocentesActivos(personas),
      estudiantes: listarEstudiantesActivos(personas),
    };
  }, [personas]);

  React.useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado, tabActiva, tamanoPagina]);

  const listaActiva = personas[tabActiva];
  const textoBusqueda = busqueda.trim().toLowerCase();
  const listaFiltrada = listaActiva.filter((persona) => {
    const coincideTexto =
      textoBusqueda.length === 0 ||
      persona.nombre.toLowerCase().includes(textoBusqueda) ||
      persona.documento.toLowerCase().includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && persona.estado === 'activo') ||
      (filtroEstado === 'inactivos' && persona.estado === 'inactivo');

    return coincideTexto && coincideEstado;
  });

  const total = listaFiltrada.length;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));
  const paginaVisible = Math.min(pagina, totalPaginas);
  const desde = total === 0 ? 0 : (paginaVisible - 1) * tamanoPagina + 1;
  const hasta = Math.min(paginaVisible * tamanoPagina, total);
  const filasPagina = listaFiltrada.slice(
    (paginaVisible - 1) * tamanoPagina,
    paginaVisible * tamanoPagina
  );
  const activosEnLista = listaActiva.filter((persona) => persona.estado === 'activo').length;
  const etiquetaTabla = tabActiva === 'docentes' ? 'docentes' : 'estudiantes';
  const rol = etiquetaRol(tabActiva);
  const conteoVisible = `${total} ${total === 1 ? rol : etiquetaTabla}`;
  const conteoActivos = `${activosEnLista} ${activosEnLista === 1 ? 'activo' : 'activos'}`;
  const personaActual = listaActiva.find((persona) => persona.id === personaId) || null;
  const sinRegistros = listaActiva.length === 0;
  const tituloVacio = sinRegistros
    ? `Todavía no hay ${etiquetaTabla}`
    : `Sin ${etiquetaTabla} para esta búsqueda`;
  const descripcionVacia = sinRegistros
    ? `Usa «Nuevo ${rol}» para dar de alta el primero.`
    : 'Prueba con otro nombre o cambia el filtro de estado.';
  const resumen =
    filtroEstado === 'todos' ? `${conteoVisible} · ${conteoActivos}` : `${conteoVisible} en el listado`;

  const tituloDrawer =
    drawerModo === 'crear'
      ? `Nuevo ${rol}`
      : drawerModo === 'editar'
        ? `Editar ${rol}`
        : personaActual?.nombre || 'Ficha';
  const subtituloDrawer =
    drawerModo === 'crear'
      ? 'El alta queda activa. El estado se cambia desde la fila.'
      : personaActual
        ? personaActual.documento
        : '';

  function manejarCambioTab(valor) {
    const nuevaTab = valor || 'docentes';
    setTabActiva(nuevaTab);
    setDrawerModo(null);
    setPersonaId(null);
    setFormulario(crearFormularioInicial(nuevaTab));
    closeMobile();
  }

  function abrirAlta() {
    setDrawerModo('crear');
    setPersonaId(null);
    setFormulario(crearFormularioInicial(tabActiva));
  }

  function abrirVer(persona) {
    setDrawerModo('ver');
    setPersonaId(persona.id);
  }

  function abrirEdicion(persona) {
    setDrawerModo('editar');
    setPersonaId(persona.id);
    setFormulario({ ...persona });
  }

  function cerrarDrawer() {
    setDrawerModo(null);
    setPersonaId(null);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  }

  function guardarFormulario(evento) {
    evento.preventDefault();

    setPersonas((previo) => {
      const copia = {
        docentes: [...previo.docentes],
        estudiantes: [...previo.estudiantes],
      };
      const { estado: _estadoIgnorado, ...datosFormulario } = formulario;

      if (drawerModo === 'editar' && personaId) {
        copia[tabActiva] = copia[tabActiva].map((persona) =>
          persona.id === personaId
            ? { ...persona, ...datosFormulario, estado: persona.estado }
            : persona
        );
      } else {
        const prefijo = tabActiva === 'docentes' ? 'd' : 'e';
        copia[tabActiva] = [
          { id: `${prefijo}-${Date.now()}`, ...datosFormulario, estado: 'activo' },
          ...copia[tabActiva],
        ];
      }

      return copia;
    });

    cerrarDrawer();
  }

  function confirmarAlternar() {
    if (!confirmacion) {
      return;
    }
    setPersonas((previo) => alternarEstadoMiembro(previo, tabActiva, confirmacion.id));
    setConfirmacion(null);
  }

  function menuAcciones(persona) {
    const desactivar = persona.estado === 'activo';
    return html`
      <${Menu} position="bottom-end" withinPortal>
        <${Menu.Target}>
          <${ActionIcon} aria-label=${`Más acciones para ${persona.nombre}`}>
            <${IconDotsVertical} size=${18} stroke=${1.5} />
          <//>
        <//>
        <${Menu.Dropdown}>
          <${Menu.Item}
            leftSection=${html`<${IconEye} size=${16} stroke=${1.5} />`}
            onClick=${() => abrirVer(persona)}
          >
            Ver ficha
          <//>
          <${Menu.Item}
            leftSection=${html`<${IconEdit} size=${16} stroke=${1.5} />`}
            onClick=${() => abrirEdicion(persona)}
          >
            Editar
          <//>
          <${Menu.Divider} />
          <${Menu.Item}
            color=${desactivar ? 'crimson' : 'teal'}
            leftSection=${html`<${IconArchive} size=${16} stroke=${1.5} />`}
            onClick=${() => setConfirmacion(persona)}
          >
            ${desactivar ? 'Desactivar' : 'Reactivar'}
          <//>
        <//>
      <//>
    `;
  }

  function filaPersona(persona) {
    return html`
      <${Table.Tr} key=${persona.id}>
        <${Table.Td}>
          <${Stack} gap=${2}>
            <${Text} component="span" className="sga-code" c="indigo">${persona.documento}<//>
            <${Text} fz="sm" fw=${500} lineClamp=${1}>${persona.nombre}<//>
          <//>
        <//>
        <${Table.Td} visibleFrom="lg">
          <${Text} fz="sm" lineClamp=${1}>${persona.gmail}<//>
        <//>
        <${Table.Td} visibleFrom="md" className="sga-tnum">${persona.telefono}<//>
        <${Table.Td} className="sga-tnum">${formatearFecha(persona.incorporacion)}<//>
        <${Table.Td}>${badgeEstado(persona.estado)}<//>
        <${Table.Td}>
          <${Group} gap=${4} justify="flex-end" wrap="nowrap">
            <${Tooltip} label="Ver ficha" withinPortal>
              <${ActionIcon}
                aria-label=${`Ver ficha de ${persona.nombre}`}
                onClick=${() => abrirVer(persona)}
              >
                <${IconEye} size=${18} stroke=${1.5} />
              <//>
            <//>
            ${menuAcciones(persona)}
          <//>
        <//>
      <//>
    `;
  }

  if (!esCoordinador) {
    return html`
      <${Box} className="sga-page-background">
        <${Box} className="sga-content" p="lg">
          <${Paper} className="sga-glass" withBorder=${false} radius="md" p="lg" shadow="none" maw=${560}>
            <${Stack} gap="sm">
              <${Title} order=${1}>Acceso restringido<//>
              <${Text} c="dimmed">
                Esta pantalla está habilitada solo para el coordinador académico.
              <//>
              <${Badge} color="slate" variant="outline">
                Sesión actual: ${sesionMock.nombre} (${ROL_LABEL[sesionMock.rol] || sesionMock.rol})
              <//>
            <//>
          <//>
        <//>
      <//>
    `;
  }

  const formularioCampos = html`
    <${Stack} gap="lg">
      <${Text} fz="sm" c="dimmed">* Campo obligatorio<//>
      <${Accordion} multiple defaultValue=${['personales', 'rol']} variant="separated" radius="md">
        <${Accordion.Item} value="personales">
          <${Accordion.Control}>Datos personales<//>
          <${Accordion.Panel}>
            <${Grid} gutter="md">
              <${Grid.Col} span=${12}>
                <${TextInput}
                  label="Nombre y apellido"
                  value=${formulario.nombre}
                  onChange=${(evento) => actualizarCampo('nombre', evento.currentTarget.value)}
                  withAsterisk
                  required
                />
              <//>
              <${Grid.Col} span=${{ base: 12, md: 6 }}>
                <${TextInput}
                  label="Documento de identidad"
                  value=${formulario.documento}
                  onChange=${(evento) => actualizarCampo('documento', evento.currentTarget.value)}
                  withAsterisk
                  required
                />
              <//>
              <${Grid.Col} span=${{ base: 12, md: 6 }}>
                <${TextInput}
                  label="Número de teléfono"
                  value=${formulario.telefono}
                  onChange=${(evento) => actualizarCampo('telefono', evento.currentTarget.value)}
                  withAsterisk
                  required
                />
              <//>
              <${Grid.Col} span=${{ base: 12, md: 8 }}>
                <${TextInput}
                  label="Gmail"
                  type="email"
                  value=${formulario.gmail}
                  onChange=${(evento) => actualizarCampo('gmail', evento.currentTarget.value)}
                  withAsterisk
                  required
                />
              <//>
              <${Grid.Col} span=${{ base: 12, md: 4 }}>
                <${TextInput}
                  label="Fecha de incorporación"
                  type="date"
                  value=${formulario.incorporacion}
                  onChange=${(evento) => actualizarCampo('incorporacion', evento.currentTarget.value)}
                  withAsterisk
                  required
                />
              <//>
            <//>
          <//>
        <//>
        <${Accordion.Item} value="rol">
          <${Accordion.Control}>
            ${tabActiva === 'docentes' ? 'Datos del docente' : 'Datos del estudiante'}
          <//>
          <${Accordion.Panel}>
            ${tabActiva === 'docentes'
              ? html`
                  <${Grid} gutter="md">
                    <${Grid.Col} span=${12}>
                      <${TextInput}
                        label="Materia que imparte"
                        value=${formulario.materia || ''}
                        onChange=${(evento) => actualizarCampo('materia', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                    <${Grid.Col} span=${{ base: 12, md: 6 }}>
                      <${TextInput}
                        label="Encargado de qué cursos"
                        value=${formulario.cursosEncargados || ''}
                        onChange=${(evento) =>
                          actualizarCampo('cursosEncargados', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                    <${Grid.Col} span=${{ base: 12, md: 6 }}>
                      <${TextInput}
                        label="Tipo de vínculo con la institución"
                        value=${formulario.tipoVinculo || ''}
                        onChange=${(evento) => actualizarCampo('tipoVinculo', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                  <//>
                `
              : html`
                  <${Grid} gutter="md">
                    <${Grid.Col} span=${{ base: 12, md: 6 }}>
                      <${TextInput}
                        label="Código de estudiante"
                        value=${formulario.codigoEstudiante || ''}
                        onChange=${(evento) =>
                          actualizarCampo('codigoEstudiante', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                    <${Grid.Col} span=${{ base: 12, md: 6 }}>
                      <${TextInput}
                        label="Nivel que está cursando"
                        value=${formulario.nivelCursando || ''}
                        onChange=${(evento) =>
                          actualizarCampo('nivelCursando', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                    <${Grid.Col} span=${12}>
                      <${TextInput}
                        label="Contacto de emergencia"
                        value=${formulario.contactoEmergencia || ''}
                        onChange=${(evento) =>
                          actualizarCampo('contactoEmergencia', evento.currentTarget.value)}
                        withAsterisk
                        required
                      />
                    <//>
                  <//>
                `}
          <//>
        <//>
      <//>
      <${Group} className="sga-drawer-footer" justify="flex-end" gap="sm">
        <${Button} variant="subtle" color="slate" type="button" onClick=${cerrarDrawer}>
          Cancelar
        <//>
        <${Button} type="submit" leftSection=${html`<${IconCheck} size=${18} stroke=${1.5} />`}>
          ${drawerModo === 'crear' ? `Crear ${rol}` : `Actualizar ${rol}`}
        <//>
      <//>
    <//>
  `;

  return html`
    <${AppShell}
      header=${{ height: 64 }}
      navbar=${{
        width: collapsed ? 76 : 264,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding=${{ base: 'md', sm: 'lg', lg: 'xl' }}
      className="sga-page-background"
    >
      <${AppShell.Header} className="sga-glass-header">
        <${Group} h="100%" px="md" justify="space-between" wrap="nowrap">
          <${Group} gap="sm" wrap="nowrap">
            <${Burger}
              opened=${mobileOpened}
              onClick=${toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label="Abrir menú"
            />
            <${Burger}
              opened=${!desktopCollapsed}
              onClick=${toggleDesktop}
              visibleFrom="lg"
              size="sm"
              aria-label="Contraer menú"
            />
            <${Text} fw=${700} fz="lg" c="navy" component="span">SGA<//>
            <${Text} c="dimmed" fz="sm" visibleFrom="md" component="span">
              Instituto Universitario Nueva Formación
            <//>
          <//>
          <${Group} gap="sm" wrap="nowrap">
            <${Badge} color="orange" size="lg" visibleFrom="xs">
              ${PERIODO.codigo} · ${PERIODO.estado}
            <//>
            <${Tooltip} label=${scheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <${ActionIcon}
                onClick=${() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar esquema de color"
              >
                ${scheme === 'dark'
                  ? html`<${IconSun} size=${18} stroke=${1.5} />`
                  : html`<${IconMoon} size=${18} stroke=${1.5} />`}
              <//>
            <//>
            <${Menu} width=${240}>
              <${Menu.Target}>
                <${Group}
                  gap="xs"
                  component="button"
                  className="sga-user-button"
                  aria-label="Menú de usuario"
                  wrap="nowrap"
                >
                  <${Avatar} color="navy" radius="xl" size="sm">${inicialesDe(sesionMock.nombre)}<//>
                  <${Box} visibleFrom="sm" ta="left">
                    <${Text} fz="sm" fw=${600} lh=${1.2}>${sesionMock.nombre}<//>
                    <${Text} fz="xs" c="dimmed" lh=${1.2}>${ROL_LABEL[sesionMock.rol] || sesionMock.rol}<//>
                  <//>
                  <${IconChevronDown} size=${16} stroke=${1.5} />
                <//>
              <//>
              <${Menu.Dropdown}>
                <${Menu.Label}>${ROL_LABEL[sesionMock.rol] || sesionMock.rol}<//>
                <${Menu.Item}
                  leftSection=${html`<${IconLogout} size=${16} stroke=${1.5} />`}
                  color="crimson"
                >
                  Cerrar sesión
                <//>
              <//>
            <//>
          <//>
        <//>
      <//>

      <${AppShell.Navbar} className="sga-glass-navbar" p="sm">
        <${ScrollArea} type="never" style=${{ flex: 1 }}>
          <${Stack} gap=${4}>
            ${NAV_COORDINADOR.map((item, index) => {
              const grupoAnterior = NAV_COORDINADOR[index - 1]?.group;
              const mostrarGrupo = !collapsed && item.group && grupoAnterior !== item.group;
              const Icono = item.icon;
              const enlace = html`
                <${NavLink}
                  key=${item.id}
                  label=${collapsed ? undefined : item.label}
                  leftSection=${html`<${Icono} size=${20} stroke=${1.5} />`}
                  active=${Boolean(item.activo)}
                  variant="light"
                  color="navy"
                  className="sga-nav-link"
                  aria-label=${item.label}
                  onClick=${() => closeMobile()}
                />
              `;
              return html`
                <${Box} key=${item.id}>
                  ${mostrarGrupo
                    ? html`
                        <${Text} fz="xs" fw=${600} c="dimmed" tt="uppercase" px="sm" pt="md" pb=${4}>
                          ${item.group}
                        <//>
                      `
                    : null}
                  ${collapsed
                    ? html`<${Tooltip} label=${item.label} position="right">${enlace}<//>`
                    : enlace}
                <//>
              `;
            })}
          <//>
        <//>
      <//>

      <${AppShell.Main}>
        <${Box} className="sga-content">
          <${Stack} gap="xs" mb="lg">
            <${Group} justify="space-between" align="flex-start" wrap="wrap" gap="md">
              <${Stack} gap=${4} style=${{ flex: '1 1 20rem' }}>
                <${Title} order=${1}>Personas académicas<//>
                <${Text} c="dimmed" fz="md" maw=${720}>
                  Alta, edición y baja lógica de docentes y estudiantes. Al desactivar, la persona
                  deja de estar activa y el registro se conserva.
                <//>
              <//>
              <${Button}
                style=${{ flexShrink: 0 }}
                onClick=${abrirAlta}
                leftSection=${html`<${IconPlus} size=${18} stroke=${1.5} />`}
              >
                ${tabActiva === 'docentes' ? 'Nuevo docente' : 'Nuevo estudiante'}
              <//>
            <//>
          <//>

          <${Paper} className="sga-solid-card" withBorder radius="md" p="lg" shadow="sm">
            <${Stack} gap="md">
              <${Tabs} value=${tabActiva} onChange=${manejarCambioTab} color="indigo">
                <${Tabs.List}>
                  <${Tabs.Tab} value="docentes">Docentes<//>
                  <${Tabs.Tab} value="estudiantes">Estudiantes<//>
                <//>
              <//>

              <${Group} justify="space-between" align="end" wrap="wrap" gap="sm">
                <${TextInput}
                  placeholder="Buscar por nombre o documento"
                  value=${busqueda}
                  onChange=${(evento) => setBusqueda(evento.currentTarget.value)}
                  leftSection=${html`<${IconSearch} size=${16} stroke=${1.5} />`}
                  w=${{ base: '100%', sm: 320 }}
                  size="sm"
                  aria-label="Buscar personas"
                />
                <${SegmentedControl}
                  value=${filtroEstado}
                  onChange=${setFiltroEstado}
                  color="navy"
                  radius="md"
                  size="sm"
                  aria-label="Filtrar por estado"
                  data=${[
                    { value: 'activos', label: 'Activos' },
                    { value: 'inactivos', label: 'Inactivos' },
                    { value: 'todos', label: 'Todos' },
                  ]}
                />
              <//>

              <${Text} fz="sm" c="dimmed" className="sga-tnum" role="status">
                ${resumen}
              <//>

              <${Box} visibleFrom="sm">
                <${Table.ScrollContainer} minWidth=${720}>
                  <${Table} className="sga-table">
                    <${Table.Thead}>
                      <${Table.Tr}>
                        <${Table.Th}>Persona<//>
                        <${Table.Th} visibleFrom="lg">Correo<//>
                        <${Table.Th} visibleFrom="md">Teléfono<//>
                        <${Table.Th}>Incorporación<//>
                        <${Table.Th}>Estado<//>
                        <${Table.Th} w=${96} aria-label="Acciones" />
                      <//>
                    <//>
                    <${Table.Tbody}>
                      ${filasPagina.length === 0
                        ? html`
                            <${Table.Tr}>
                              <${Table.Td} colSpan=${6}>
                                <${EstadoVacio} titulo=${tituloVacio} descripcion=${descripcionVacia} />
                              <//>
                            <//>
                          `
                        : filasPagina.map((persona) => filaPersona(persona))}
                    <//>
                  <//>
                <//>
              <//>

              <${Box} hiddenFrom="sm">
                ${filasPagina.length === 0
                  ? html`<${EstadoVacio} titulo=${tituloVacio} descripcion=${descripcionVacia} />`
                  : html`
                      <${Stack} gap="sm">
                        ${filasPagina.map(
                          (persona) => html`
                            <${Paper}
                              key=${persona.id}
                              className="sga-persona-card"
                              withBorder=${false}
                              shadow="none"
                              radius="md"
                              p="md"
                            >
                              <${Group} justify="space-between" align="flex-start" wrap="nowrap">
                                <${Stack} gap=${2}>
                                  <${Text} component="span" className="sga-code" c="indigo">
                                    ${persona.documento}
                                  <//>
                                  <${Text} fw=${500}>${persona.nombre}<//>
                                  <${Text} fz="sm" c="dimmed">${persona.gmail}<//>
                                <//>
                                ${menuAcciones(persona)}
                              <//>
                              <${Group} gap="xs" mt="sm">
                                ${badgeEstado(persona.estado)}
                                <${Text} fz="xs" c="dimmed" className="sga-tnum">
                                  ${formatearFecha(persona.incorporacion)}
                                <//>
                              <//>
                            <//>
                          `
                        )}
                      <//>
                    `}
              <//>

              <${Group} className="sga-list-footer" justify="space-between" align="center" wrap="wrap" gap="sm">
                <${Group} gap="sm">
                  <${Text} fz="sm" c="dimmed" className="sga-tnum">
                    Mostrando ${desde}–${hasta} de ${total}
                  <//>
                  <${Select}
                    size="xs"
                    w=${90}
                    value=${String(tamanoPagina)}
                    onChange=${(valor) => setTamanoPagina(Number(valor || 20))}
                    data=${['20', '50', '100']}
                    searchable=${false}
                    aria-label="Filas por página"
                  />
                <//>
                <${Pagination}
                  total=${totalPaginas}
                  value=${paginaVisible}
                  onChange=${setPagina}
                />
              <//>
            <//>
          <//>
        <//>
      <//>

      <${Drawer}
        opened=${drawerModo !== null}
        onClose=${cerrarDrawer}
        position=${isMobile ? 'bottom' : 'right'}
        size=${isMobile ? '100%' : drawerModo === 'ver' ? 480 : 640}
        offset=${isMobile ? 0 : 8}
        radius="md"
        padding="lg"
        classNames=${{ content: 'sga-glass-strong' }}
        overlayProps=${{ backgroundOpacity: 0.35, blur: 3 }}
        closeOnClickOutside=${drawerModo === 'ver'}
        closeButtonProps=${{ 'aria-label': 'Cerrar panel' }}
        title=${html`
          <${Stack} gap=${2}>
            <${Title} order=${3}>${tituloDrawer}<//>
            ${subtituloDrawer
              ? html`<${Text} fz="sm" c="dimmed" className=${drawerModo !== 'crear' ? 'sga-code' : ''}>${subtituloDrawer}<//>`
              : null}
          <//>
        `}
      >
        ${drawerModo === 'ver' && personaActual
          ? html`
              <${Stack} gap="md">
                ${camposFicha(personaActual, tabActiva).map(
                  ([etiqueta, valor, mono]) => html`
                    <${Stack} key=${etiqueta} gap=${2}>
                      <${Text} fz="xs" fw=${600} c="dimmed">${etiqueta}<//>
                      <${Text} fz="sm" className=${mono ? 'sga-code' : ''} c=${mono ? 'indigo' : undefined}>
                        ${valor || '—'}
                      <//>
                    <//>
                  `
                )}
                <${Group} className="sga-drawer-footer" justify="flex-end" gap="sm">
                  <${Button} variant="subtle" color="slate" onClick=${cerrarDrawer}>Cerrar<//>
                  <${Button} onClick=${() => abrirEdicion(personaActual)}>Editar ${rol}<//>
                <//>
              <//>
            `
          : drawerModo === 'crear' || drawerModo === 'editar'
            ? html`<form onSubmit=${guardarFormulario}>${formularioCampos}</form>`
            : null}
      <//>

      <${Modal}
        opened=${Boolean(confirmacion)}
        onClose=${() => setConfirmacion(null)}
        title=${confirmacion?.estado === 'activo' ? `Desactivar ${rol}` : `Reactivar ${rol}`}
        size="sm"
        centered
        classNames=${{ content: 'sga-glass-strong' }}
        closeButtonProps=${{ 'aria-label': 'Cerrar' }}
      >
        ${confirmacion
          ? html`
              <${Stack} gap="lg">
                <${Text}>
                  <${Text} span fw=${600}>${confirmacion.nombre}<//>
                  ${confirmacion.estado === 'activo'
                    ? ' dejará de figurar como miembro activo. El registro se conserva.'
                    : ' volverá a figurar como miembro activo.'}
                <//>
                <${Group} justify="flex-end" gap="sm">
                  <${Button} variant="subtle" color="slate" onClick=${() => setConfirmacion(null)}>
                    Cancelar
                  <//>
                  <${Button}
                    color=${confirmacion.estado === 'activo' ? 'crimson' : 'navy'}
                    onClick=${confirmarAlternar}
                  >
                    ${confirmacion.estado === 'activo' ? 'Desactivar' : 'Reactivar'}
                  <//>
                <//>
              <//>
            `
          : null}
      <//>
    <//>
  `;
}

const variantColorResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input);
  const parsed = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  if (
    input.variant === 'light' &&
    parsed.isThemeColor &&
    (parsed.color === 'amber' || parsed.color === 'orange')
  ) {
    return { ...resolved, color: `var(--sga-${parsed.color}-text)` };
  }

  return resolved;
};

const tema = {
  primaryColor: 'navy',
  primaryShade: { light: 6, dark: 5 },
  white: '#FFFFFF',
  black: '#0F172A',
  autoContrast: true,
  luminanceThreshold: 0.35,
  variantColorResolver,
  fontSmoothing: true,
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
  defaultGradient: { from: 'navy.6', to: 'indigo.5', deg: 135 },
  colors: {
    navy: ['#EEF2FB', '#D7E0F4', '#B3C2E6', '#8AA0D6', '#6480C4', '#4462AF', '#2E4A95', '#1F3777', '#14285A', '#0B1B3F'],
    indigo: ['#EEF0FC', '#DCE0F8', '#BCC3F0', '#98A3E6', '#7583DA', '#5766CC', '#4351B8', '#35409A', '#293178', '#1E2456'],
    amber: ['#FFF8E6', '#FFEDC2', '#FFDE94', '#FFCC61', '#F7B93A', '#E6A420', '#C98A12', '#A36E0C', '#7C5308', '#563A05'],
    slate: ['#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A'],
    teal: ['#ECFDF7', '#CDF7EA', '#9EEFD7', '#66E0BF', '#34C9A4', '#12AC89', '#0B7F66', '#0A6753', '#0B5243', '#083A30'],
    crimson: ['#FEF1F2', '#FDDDE0', '#FBBFC5', '#F7919C', '#EF5F6F', '#E23A4E', '#C4283B', '#A41F31', '#861C2C', '#6E1626'],
    orange: ['#FFF5EB', '#FFE6CC', '#FFCF99', '#FFB05C', '#FF9129', '#F5760F', '#D95E07', '#B4480A', '#90390D', '#6E2D0C'],
    sky: ['#EFF8FF', '#D9EEFF', '#B6E0FF', '#85CCFA', '#4DB3F2', '#2496E0', '#0E6FB3', '#0F5A91', '#124B76', '#10395A'],
  },
  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSizes: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
  lineHeights: { xs: '1.4', sm: '1.45', md: '1.55', lg: '1.6', xl: '1.65' },
  headings: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '600',
    textWrap: 'balance',
    sizes: {
      h1: { fontSize: '1.875rem', lineHeight: '1.25', fontWeight: '700' },
      h2: { fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700' },
      h3: { fontSize: '1.25rem', lineHeight: '1.35', fontWeight: '600' },
      h4: { fontSize: '1.125rem', lineHeight: '1.4', fontWeight: '600' },
      h5: { fontSize: '1rem', lineHeight: '1.45', fontWeight: '600' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: '600' },
    },
  },
  defaultRadius: 'md',
  radius: { xs: '0.25rem', sm: '0.375rem', md: '0.625rem', lg: '0.875rem', xl: '1.25rem' },
  spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 8px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 40px rgba(15, 23, 42, 0.10)',
    xl: '0 24px 56px rgba(15, 23, 42, 0.14)',
  },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  components: {
    Button: {
      defaultProps: { size: 'md', radius: 'md', fw: 600 },
      styles: { root: { transition: 'background-color 120ms ease, transform 120ms ease' } },
    },
    ActionIcon: { defaultProps: { variant: 'subtle', color: 'slate', size: 'lg', radius: 'md' } },
    Paper: { defaultProps: { radius: 'md', p: 'lg', withBorder: true, shadow: 'sm' } },
    Table: {
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
        highlightOnHover: true,
        withRowBorders: true,
        withTableBorder: false,
        striped: false,
      },
    },
    Badge: { defaultProps: { variant: 'light', radius: 'sm', size: 'md', tt: 'none', fw: 600 } },
    Tabs: { defaultProps: { variant: 'default', radius: 'md', keepMounted: false } },
    Modal: {
      defaultProps: {
        centered: true,
        radius: 'md',
        padding: 'lg',
        overlayProps: { backgroundOpacity: 0.45, blur: 4 },
        transitionProps: { transition: 'pop', duration: 180 },
        closeButtonProps: { 'aria-label': 'Cerrar' },
      },
    },
    Drawer: {
      defaultProps: {
        position: 'right',
        offset: 8,
        radius: 'md',
        padding: 'lg',
        overlayProps: { backgroundOpacity: 0.35, blur: 3 },
        transitionProps: { transition: 'slide-left', duration: 220 },
        closeButtonProps: { 'aria-label': 'Cerrar panel' },
      },
    },
    Menu: { defaultProps: { radius: 'md', shadow: 'md', position: 'bottom-end', withinPortal: true } },
    Tooltip: { defaultProps: { radius: 'sm', withArrow: true, openDelay: 300, multiline: true, maw: 280 } },
    TextInput: { defaultProps: { size: 'md', radius: 'md' } },
    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        searchable: true,
        nothingFoundMessage: 'Sin resultados',
        checkIconPosition: 'right',
        comboboxProps: { shadow: 'md', radius: 'md' },
      },
    },
  },
};

createRoot(document.getElementById('root')).render(
  html`
    <${React.StrictMode}>
      <${ColorSchemeScript} defaultColorScheme="auto" />
      <${MantineProvider} theme=${tema} defaultColorScheme="auto">
        <${PersonasListado} />
      <//>
    <//>
  `
);
