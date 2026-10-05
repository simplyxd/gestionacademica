import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { PERIOD_STATUSES } from "../data/academicMockData"

const statusColors = {
  planning: "sky",
  enrollmentOpen: "teal",
  inProgress: "orange",
  closed: "slate",
}

function crearPeriodoVacio() {
  return {
    id: "",
    nombre: "",
    inicio: "",
    termino: "",
    inscripcionInicio: "",
    inscripcionTermino: "",
    estado: "planning",
  }
}

function etiquetaEstado(value) {
  return PERIOD_STATUSES.find((status) => status.value === value)?.label ?? value
}

function mostrarFecha(value) {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}

function Periodos({ periodos, onGuardar }) {
  const [borrador, setBorrador] = useState(crearPeriodoVacio)
  const [errores, setErrores] = useState([])
  const [aviso, setAviso] = useState("")
  const resumenRef = useRef(null)
  const editando = Boolean(borrador.id)

  useEffect(() => {
    if (errores.length > 0) resumenRef.current?.focus()
  }, [errores])

  function actualizar(campo, valor) {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
    setErrores([])
    setAviso("")
  }

  function reiniciarFormulario() {
    setBorrador(crearPeriodoVacio())
    setErrores([])
    setAviso("")
  }

  function editarPeriodo(periodo) {
    setBorrador({ ...periodo })
    setErrores([])
    setAviso("")
    window.scrollTo(0, 0)
  }

  function guardar(evento) {
    evento.preventDefault()
    const nuevosErrores = []

    if (!borrador.nombre.trim()) {
      nuevosErrores.push({ campo: "nombrePeriodo", mensaje: "Ingresa el nombre del período." })
    }
    if (!borrador.inicio || !borrador.termino) {
      nuevosErrores.push({ campo: "inicioPeriodo", mensaje: "Completa el inicio y el término del período." })
    } else if (borrador.inicio > borrador.termino) {
      nuevosErrores.push({ campo: "inicioPeriodo", mensaje: "El inicio del período debe ser anterior a su término." })
    }
    if (!borrador.inscripcionInicio || !borrador.inscripcionTermino) {
      nuevosErrores.push({ campo: "inicioInscripcion", mensaje: "Completa la ventana de inscripción." })
    } else if (borrador.inscripcionInicio > borrador.inscripcionTermino) {
      nuevosErrores.push({
        campo: "inicioInscripcion",
        mensaje: "El inicio de inscripción debe ser anterior a su término.",
      })
    }
    if (
      borrador.estado === "inProgress"
      && periodos.some((periodo) => periodo.estado === "inProgress" && periodo.id !== borrador.id)
    ) {
      nuevosErrores.push({
        campo: "estadoPeriodo",
        mensaje: "Ya existe un período en curso. Cambia su estado antes de iniciar otro.",
      })
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores)
      setAviso("")
      return
    }

    const nombre = borrador.nombre.trim()
    onGuardar({
      ...borrador,
      id: borrador.id || `periodo-${Date.now()}`,
      nombre,
    })
    setAviso(editando ? `Se actualizaron los datos de ${nombre}.` : `Se creó ${nombre}.`)
    setBorrador(crearPeriodoVacio())
    setErrores([])
  }

  const periodosOrdenados = [...periodos].sort((a, b) => a.inicio.localeCompare(b.inicio))

  return (
    <div className="sga-page flex min-h-dvh flex-col">
      <Header />
      <main className="w-full flex-1 py-8 sm:py-10">
        <Container size="xl">
          <Stack gap="xl">
            <div>
              <Text c="gray.7" fw={700} size="sm" tt="uppercase">
                Coordinación académica
              </Text>
              <Title order={1} mt={6}>Períodos académicos</Title>
              <Text c="gray.7" mt="xs">
                Administra las fechas del período y su ventana de inscripción por separado.
              </Text>
            </div>

            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <div>
                  <Title order={2} size="h3">
                    {editando ? "Editar período" : "Crear período"}
                  </Title>
                  <Text c="gray.7" size="sm" mt={4}>
                    La ventana de inscripción puede comenzar antes del inicio académico.
                  </Text>
                </div>

                {errores.length > 0 && (
                  <Alert
                    color="red"
                    title="Revisa los datos del período"
                    role="alert"
                    tabIndex={-1}
                    ref={resumenRef}
                    aria-live="assertive"
                  >
                    <ul className="m-0 pl-5">
                      {errores.map(({ campo, mensaje }) => (
                        <li key={campo}><a href={`#${campo}`}>{mensaje}</a></li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {aviso && <Alert color="green" role="status" aria-live="polite">{aviso}</Alert>}

                <form onSubmit={guardar} noValidate>
                  <Stack gap="md">
                    <TextInput
                      id="nombrePeriodo"
                      label="Nombre del período"
                      placeholder="Ej. 2027 · Primer semestre"
                      value={borrador.nombre}
                      onChange={(evento) => actualizar("nombre", evento.currentTarget.value)}
                      error={errores.find((error) => error.campo === "nombrePeriodo")?.mensaje}
                      required
                    />

                    <div>
                      <Text fw={600} mb="xs">Fechas académicas</Text>
                      <Grid>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            id="inicioPeriodo"
                            type="date"
                            label="Inicio"
                            value={borrador.inicio}
                            onChange={(evento) => actualizar("inicio", evento.currentTarget.value)}
                            error={errores.find((error) => error.campo === "inicioPeriodo")?.mensaje}
                            required
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            id="terminoPeriodo"
                            type="date"
                            label="Término"
                            value={borrador.termino}
                            onChange={(evento) => actualizar("termino", evento.currentTarget.value)}
                            required
                          />
                        </Grid.Col>
                      </Grid>
                    </div>

                    <div>
                      <Text fw={600} mb="xs">Ventana de inscripción</Text>
                      <Grid>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            id="inicioInscripcion"
                            type="date"
                            label="Inicio de inscripción"
                            value={borrador.inscripcionInicio}
                            onChange={(evento) => actualizar("inscripcionInicio", evento.currentTarget.value)}
                            error={errores.find((error) => error.campo === "inicioInscripcion")?.mensaje}
                            required
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            id="terminoInscripcion"
                            type="date"
                            label="Término de inscripción"
                            value={borrador.inscripcionTermino}
                            onChange={(evento) => actualizar("inscripcionTermino", evento.currentTarget.value)}
                            required
                          />
                        </Grid.Col>
                      </Grid>
                    </div>

                    <Select
                      id="estadoPeriodo"
                      label="Estado"
                      data={PERIOD_STATUSES}
                      value={borrador.estado}
                      onChange={(value) => actualizar("estado", value ?? "")}
                      error={errores.find((error) => error.campo === "estadoPeriodo")?.mensaje}
                      allowDeselect={false}
                      required
                    />

                    <Group justify="flex-end" wrap="wrap">
                      {editando && (
                        <Button variant="default" type="button" onClick={reiniciarFormulario}>
                          Cancelar edición
                        </Button>
                      )}
                      <Button type="submit">
                        {editando ? "Guardar cambios" : "Crear período"}
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Stack>
            </Card>

            <section aria-labelledby="periodosRegistrados">
              <Group justify="space-between" mb="sm">
                <Title id="periodosRegistrados" order={2} size="h3">Períodos registrados</Title>
                <Text c="gray.7" size="sm">
                  {periodos.length} {periodos.length === 1 ? "período" : "períodos"}
                </Text>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {periodosOrdenados.map((periodo) => (
                  <Card key={periodo.id} withBorder radius="md" padding="lg">
                    <Stack gap="sm">
                      <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                        <Title order={3} size="h4">{periodo.nombre}</Title>
                        <Badge color={statusColors[periodo.estado] ?? "gray"} variant="light">
                          {etiquetaEstado(periodo.estado)}
                        </Badge>
                      </Group>
                      <Text size="sm">
                        <strong>Período:</strong> {mostrarFecha(periodo.inicio)} – {mostrarFecha(periodo.termino)}
                      </Text>
                      <Text size="sm">
                        <strong>Inscripción:</strong> {mostrarFecha(periodo.inscripcionInicio)} – {mostrarFecha(periodo.inscripcionTermino)}
                      </Text>
                      {periodo.estado === "closed" && (
                        <Alert color="gray" title="Período cerrado" role="status" aria-live="polite">
                          No se realizan inscripciones para este período.
                        </Alert>
                      )}
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => editarPeriodo(periodo)}
                        aria-label={`Editar ${periodo.nombre}`}
                      >
                        Editar período
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </section>
          </Stack>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

export default Periodos
