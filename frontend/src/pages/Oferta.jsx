import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import Footer from "../components/Footer"
import Header from "../components/Header"
import {
  CAMPUSES,
  DAYS,
  MODALITIES,
  PERIOD_STATUSES,
  ROOMS,
  SHIFTS,
  SUBJECTS,
  TEACHERS,
} from "../data/academicMockData"
import { detectarConflictos } from "../utils/academicConflicts"

function crearBloque() {
  return {
    id: `bloque-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dia: "Lunes",
    inicio: "08:30",
    termino: "10:00",
  }
}

function crearBorrador(periodoId) {
  return {
    id: "",
    codigo: "",
    asignatura: "",
    docente: "",
    sede: "",
    jornada: "",
    modalidad: "",
    cupos: 30,
    sala: "",
    periodoId,
    bloques: [crearBloque()],
  }
}

function etiquetaEstado(estado) {
  return PERIOD_STATUSES.find((status) => status.value === estado)?.label ?? estado
}

function colorEstado(estado) {
  return {
    planning: "sky",
    enrollmentOpen: "teal",
    inProgress: "orange",
    closed: "slate",
  }[estado] ?? "gray"
}

function mensajeConflicto(conflicto, seccion) {
  if (conflicto.tipo === "docente") {
    return `Conflicto de docente: ${seccion.docente} ya tiene ${conflicto.codigo} el ${conflicto.dia}, de ${conflicto.inicio} a ${conflicto.termino}.`
  }
  return `Conflicto de sala: ${conflicto.sala} ya está ocupada el ${conflicto.dia}, de ${conflicto.inicio} a ${conflicto.termino} por ${conflicto.codigo}.`
}

function Oferta({ periodos, secciones, onGuardar }) {
  const periodoEnCurso = periodos.find((periodo) => periodo.estado === "inProgress")
  const [periodoVisible, setPeriodoVisible] = useState(periodoEnCurso?.id ?? periodos[0]?.id ?? "")
  const [pestana, setPestana] = useState("secciones")
  const [editorAbierto, setEditorAbierto] = useState(false)
  const [borrador, setBorrador] = useState(() => crearBorrador(periodoEnCurso?.id ?? periodos[0]?.id ?? ""))
  const [errores, setErrores] = useState([])
  const [errorEnvio, setErrorEnvio] = useState(false)
  const [aviso, setAviso] = useState("")
  const resumenRef = useRef(null)
  const editando = Boolean(borrador.id)
  const periodoActual = periodos.find((periodo) => periodo.id === periodoVisible)
  const seccionesDelPeriodo = secciones.filter((seccion) => seccion.periodoId === periodoVisible)
  const conflictos = borrador.docente && borrador.bloques.length > 0
    ? detectarConflictos(borrador, secciones)
    : []

  useEffect(() => {
    if (errores.length > 0 || errorEnvio) resumenRef.current?.focus()
  }, [errores, errorEnvio])

  function reiniciarFormulario(periodoId = periodoVisible) {
    setBorrador(crearBorrador(periodoId))
    setErrores([])
    setErrorEnvio(false)
  }

  function abrirNuevo() {
    reiniciarFormulario()
    setEditorAbierto(true)
    setAviso("")
    setPestana("secciones")
  }

  function editarSeccion(seccion) {
    setPeriodoVisible(seccion.periodoId)
    setBorrador({ ...seccion, bloques: seccion.bloques.map((bloque) => ({ ...bloque })) })
    setErrores([])
    setErrorEnvio(false)
    setEditorAbierto(true)
    setAviso("")
    setPestana("secciones")
    window.scrollTo(0, 0)
  }

  function cambiarPeriodo(value) {
    setPeriodoVisible(value ?? "")
    reiniciarFormulario(value ?? "")
    setEditorAbierto(false)
    setAviso("")
  }

  function actualizar(campo, valor) {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
    if (campo === "periodoId") setPeriodoVisible(valor)
    setErrores([])
    setErrorEnvio(false)
    setAviso("")
  }

  function actualizarBloque(id, campo, valor) {
    setBorrador((actual) => ({
      ...actual,
      bloques: actual.bloques.map((bloque) =>
        bloque.id === id ? { ...bloque, [campo]: valor ?? "" } : bloque
      ),
    }))
    setErrores([])
    setErrorEnvio(false)
    setAviso("")
  }

  function agregarBloque() {
    setBorrador((actual) => ({ ...actual, bloques: [...actual.bloques, crearBloque()] }))
    setErrores([])
    setAviso("")
  }

  function quitarBloque(id) {
    setBorrador((actual) => ({
      ...actual,
      bloques: actual.bloques.filter((bloque) => bloque.id !== id),
    }))
    setErrores([])
    setAviso("")
  }

  function cambiarModalidad(value) {
    setBorrador((actual) => ({
      ...actual,
      modalidad: value ?? "",
      sala: value === "Online" ? "" : actual.sala,
    }))
    setErrores([])
    setErrorEnvio(false)
    setAviso("")
  }

  function guardar(evento) {
    evento.preventDefault()
    const nuevosErrores = []

    if (!borrador.asignatura) {
      nuevosErrores.push({ campo: "asignatura", mensaje: "Selecciona una asignatura." })
    }
    if (!borrador.docente) {
      nuevosErrores.push({ campo: "docente", mensaje: "Selecciona un docente." })
    }
    if (!borrador.sede) {
      nuevosErrores.push({ campo: "sede", mensaje: "Selecciona una sede." })
    }
    if (!borrador.jornada) {
      nuevosErrores.push({ campo: "jornada", mensaje: "Selecciona una jornada." })
    }
    if (!borrador.modalidad) {
      nuevosErrores.push({ campo: "modalidad", mensaje: "Selecciona una modalidad." })
    }
    if (!borrador.periodoId) {
      nuevosErrores.push({ campo: "periodoOferta", mensaje: "Selecciona un período." })
    }
    if (!Number.isInteger(borrador.cupos) || borrador.cupos < 1) {
      nuevosErrores.push({ campo: "cupos", mensaje: "Ingresa un número entero de cupos mayor que cero." })
    }
    if (borrador.modalidad !== "Online" && !borrador.sala) {
      nuevosErrores.push({ campo: "sala", mensaje: "Selecciona la sala física de la sección." })
    }
    if (borrador.bloques.length === 0) {
      nuevosErrores.push({ campo: "horarios", mensaje: "Agrega al menos un bloque horario." })
    }
    if (borrador.bloques.some((bloque) =>
      !bloque.dia || !bloque.inicio || !bloque.termino || bloque.inicio >= bloque.termino
    )) {
      nuevosErrores.push({
        campo: "horarios",
        mensaje: "Cada bloque debe tener día, inicio y un término posterior al inicio.",
      })
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores)
      setErrorEnvio(false)
      return
    }

    if (conflictos.length > 0) {
      setErrores([])
      setErrorEnvio(true)
      return
    }

    const codigoAsignatura = {
      "Ingeniería de Software I": "INF-301",
      "Base de Datos Avanzadas": "INF-302",
      "Liderazgo de Equipos": "LID-101",
      "Matemáticas Discretas": "MAT-202",
      "Algoritmos y Estructuras de Datos": "INF-201",
    }[borrador.asignatura]
    const numeroSeccion = editando
      ? Number(borrador.codigo.match(/Sec (\d+)$/)?.[1] ?? 1)
      : secciones.filter((seccion) =>
        seccion.periodoId === borrador.periodoId
        && seccion.asignatura === borrador.asignatura
      ).length + 1

    onGuardar({
      ...borrador,
      id: borrador.id || `seccion-${Date.now()}`,
      codigo: `${codigoAsignatura} · Sec ${String(numeroSeccion).padStart(2, "0")}`,
      bloques: borrador.bloques.map((bloque) => ({ ...bloque })),
    })
    setAviso(editando ? "La sección se actualizó correctamente." : "La sección se creó correctamente.")
    setBorrador(crearBorrador(periodoVisible))
    setErrores([])
    setErrorEnvio(false)
    setEditorAbierto(false)
    setPestana("secciones")
  }

  const periodosData = periodos.map((periodo) => ({
    value: periodo.id,
    label: periodo.nombre,
  }))

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
              <Title order={1} mt={6}>Oferta académica</Title>
              <Text c="gray.7" mt="xs">
                Organiza secciones, docentes, espacios y bloques horarios por período.
              </Text>
            </div>

            <Card withBorder radius="md" padding="md">
              <Grid align="center">
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <Select
                    label="Período académico"
                    data={periodosData}
                    value={periodoVisible || null}
                    onChange={cambiarPeriodo}
                    placeholder="Selecciona un período"
                    allowDeselect={false}
                    disabled={periodos.length === 0}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group justify="flex-end" mt="sm">
                    {periodoActual && (
                      <Badge color={colorEstado(periodoActual.estado)} variant="light" size="lg">
                        {etiquetaEstado(periodoActual.estado)}
                      </Badge>
                    )}
                  </Group>
                </Grid.Col>
              </Grid>
              {periodoActual?.estado === "closed" && (
                <Alert color="gray" title="Período cerrado" mt="md" role="status" aria-live="polite">
                  No se permiten inscripciones para este período.
                </Alert>
              )}
            </Card>

            {aviso && <Alert color="green" role="status" aria-live="polite">{aviso}</Alert>}

            <Tabs value={pestana} onChange={(value) => setPestana(value ?? "secciones")} keepMounted={false}>
              <Tabs.List aria-label="Vistas de la oferta académica">
                <Tabs.Tab value="secciones">
                  Secciones ({seccionesDelPeriodo.length})
                </Tabs.Tab>
                <Tabs.Tab value="semana">Vista semanal</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="secciones" pt="md">
                <Stack gap="md">
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Title order={2} size="h3">Secciones del período</Title>
                    <Button type="button" onClick={abrirNuevo} disabled={!periodoVisible}>
                      Nueva sección
                    </Button>
                  </Group>

                  {editorAbierto && (
                    <Card withBorder radius="md" padding="lg">
                      <Stack gap="md">
                        <div>
                          <Title order={2} size="h3">
                            {editando ? "Editar sección" : "Crear sección"}
                          </Title>
                          <Text c="gray.7" size="sm" mt={4}>
                            Completa los datos y agrega uno o más bloques horarios.
                          </Text>
                        </div>

                        <Alert color="blue" title="Ejemplos para probar los conflictos">
                          Selecciona a Mario Docente y un lunes de 08:30 a 10:00 para ver un conflicto de docente.
                          Para probar sala, cambia el docente y usa Aula 302 en el mismo tramo. Cambiar el horario
                          o usar una sección online sin sala permite comprobar los casos sin conflicto.
                        </Alert>

                        {errores.length > 0 && (
                          <Alert
                            color="red"
                            title="Revisa los datos de la sección"
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

                        {errorEnvio && (
                          <Alert
                            color="red"
                            title="No se puede guardar esta sección"
                            role="alert"
                            tabIndex={-1}
                            ref={resumenRef}
                            aria-live="assertive"
                          >
                            Corrige los conflictos de horario indicados antes de guardar.
                          </Alert>
                        )}

                        <form onSubmit={guardar} noValidate>
                          <Stack gap="lg">
                            <section aria-labelledby="datosSeccion">
                              <Title id="datosSeccion" order={3} size="h4" mb="sm">
                                Datos de sección
                              </Title>
                              <Grid>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="asignatura"
                                    label="Asignatura"
                                    data={SUBJECTS}
                                    value={borrador.asignatura || null}
                                    onChange={(value) => actualizar("asignatura", value ?? "")}
                                    error={errores.find((error) => error.campo === "asignatura")?.mensaje}
                                    placeholder="Selecciona una asignatura"
                                    searchable
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="docente"
                                    label="Docente"
                                    data={TEACHERS}
                                    value={borrador.docente || null}
                                    onChange={(value) => actualizar("docente", value ?? "")}
                                    error={errores.find((error) => error.campo === "docente")?.mensaje}
                                    placeholder="Selecciona un docente"
                                    searchable
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="sede"
                                    label="Sede"
                                    data={CAMPUSES}
                                    value={borrador.sede || null}
                                    onChange={(value) => actualizar("sede", value ?? "")}
                                    error={errores.find((error) => error.campo === "sede")?.mensaje}
                                    placeholder="Selecciona una sede"
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="jornada"
                                    label="Jornada"
                                    data={SHIFTS}
                                    value={borrador.jornada || null}
                                    onChange={(value) => actualizar("jornada", value ?? "")}
                                    error={errores.find((error) => error.campo === "jornada")?.mensaje}
                                    placeholder="Selecciona una jornada"
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="modalidad"
                                    label="Modalidad"
                                    data={MODALITIES}
                                    value={borrador.modalidad || null}
                                    onChange={cambiarModalidad}
                                    error={errores.find((error) => error.campo === "modalidad")?.mensaje}
                                    placeholder="Selecciona una modalidad"
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <NumberInput
                                    id="cupos"
                                    label="Cupos"
                                    min={1}
                                    value={borrador.cupos}
                                    onChange={(value) => actualizar("cupos", Number(value) || 0)}
                                    error={errores.find((error) => error.campo === "cupos")?.mensaje}
                                    required
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="sala"
                                    label="Sala"
                                    data={ROOMS}
                                    value={borrador.sala || null}
                                    onChange={(value) => actualizar("sala", value ?? "")}
                                    error={
                                      errores.find((error) => error.campo === "sala")?.mensaje
                                      ?? (conflictos.some((conflicto) => conflicto.tipo === "sala")
                                        ? "Esta sala tiene un conflicto de horario."
                                        : null)
                                    }
                                    placeholder={borrador.modalidad === "Online" ? "No requiere sala" : "Selecciona una sala"}
                                    disabled={borrador.modalidad === "Online"}
                                    required={borrador.modalidad !== "Online"}
                                  />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                  <Select
                                    id="periodoOferta"
                                    label="Período"
                                    data={periodosData}
                                    value={borrador.periodoId || null}
                                    onChange={(value) => actualizar("periodoId", value ?? "")}
                                    error={errores.find((error) => error.campo === "periodoOferta")?.mensaje}
                                    placeholder="Selecciona un período"
                                    allowDeselect={false}
                                    required
                                  />
                                </Grid.Col>
                              </Grid>
                            </section>

                            <section id="horarios" aria-labelledby="tituloHorarios">
                              <Group justify="space-between" mb="sm" wrap="wrap">
                                <div>
                                  <Title id="tituloHorarios" order={3} size="h4">
                                    Bloques horarios
                                  </Title>
                                  <Text c="gray.7" size="sm" mt={4}>
                                    Agrega todos los días y tramos en que se reúne la sección.
                                  </Text>
                                </div>
                                <Button type="button" variant="light" onClick={agregarBloque}>
                                  Agregar bloque
                                </Button>
                              </Group>

                              <Stack gap="sm">
                                {borrador.bloques.map((bloque, index) => (
                                  <Card key={bloque.id} withBorder radius="sm" padding="sm">
                                    <Grid align="flex-end">
                                      <Grid.Col span={{ base: 12, sm: 4 }}>
                                        <Select
                                          id={`dia-${bloque.id}`}
                                          label={`Día · bloque ${index + 1}`}
                                          data={DAYS}
                                          value={bloque.dia || null}
                                          onChange={(value) => actualizarBloque(bloque.id, "dia", value)}
                                          required
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 6, sm: 3 }}>
                                        <TextInput
                                          id={`inicio-${bloque.id}`}
                                          type="time"
                                          label="Inicio"
                                          value={bloque.inicio}
                                          onChange={(evento) => actualizarBloque(bloque.id, "inicio", evento.currentTarget.value)}
                                          required
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 6, sm: 3 }}>
                                        <TextInput
                                          id={`termino-${bloque.id}`}
                                          type="time"
                                          label="Término"
                                          value={bloque.termino}
                                          onChange={(evento) => actualizarBloque(bloque.id, "termino", evento.currentTarget.value)}
                                          required
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 12, sm: 2 }}>
                                        <Button
                                          type="button"
                                          variant="subtle"
                                          color="red"
                                          fullWidth
                                          disabled={borrador.bloques.length === 1}
                                          onClick={() => quitarBloque(bloque.id)}
                                          aria-label={`Quitar bloque ${index + 1}`}
                                        >
                                          Quitar
                                        </Button>
                                      </Grid.Col>
                                    </Grid>
                                  </Card>
                                ))}
                              </Stack>
                              {errores.some((error) => error.campo === "horarios") && (
                                <Text c="red" size="sm" mt="xs" role="alert">
                                  {errores.find((error) => error.campo === "horarios")?.mensaje}
                                </Text>
                              )}
                            </section>

                            {conflictos.length > 0 && (
                              <Stack gap="xs" role="status" aria-live="polite">
                                {conflictos.map((conflicto, index) => (
                                  <Alert
                                    key={`${conflicto.tipo}-${conflicto.codigo}-${conflicto.dia}-${index}`}
                                    color="red"
                                    title={conflicto.tipo === "docente" ? "Conflicto de docente" : "Conflicto de sala"}
                                  >
                                    {mensajeConflicto(conflicto, borrador)}
                                  </Alert>
                                ))}
                              </Stack>
                            )}

                            {conflictos.length > 0 && (
                              <Text c="red" size="sm">
                                Resuelve los conflictos para habilitar el guardado.
                              </Text>
                            )}

                            <Group justify="flex-end" wrap="wrap">
                              <Button type="button" variant="default" onClick={() => setEditorAbierto(false)}>
                                Cancelar
                              </Button>
                              <Button type="submit">
                                {editando ? "Guardar cambios" : "Crear sección"}
                              </Button>
                            </Group>
                          </Stack>
                        </form>
                      </Stack>
                    </Card>
                  )}

                  {seccionesDelPeriodo.length === 0 ? (
                    <Card withBorder radius="md" padding="lg">
                      <Text c="gray.7">Todavía no hay secciones para este período.</Text>
                    </Card>
                  ) : (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                      {seccionesDelPeriodo.map((seccion) => (
                        <Card key={seccion.id} withBorder radius="md" padding="lg">
                          <Stack gap="sm">
                            <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                              <div>
                                <Text c="gray.7" fw={700} size="xs">{seccion.codigo}</Text>
                                <Title order={3} size="h4" mt={4}>{seccion.asignatura}</Title>
                              </div>
                              <Badge variant="light">{seccion.modalidad}</Badge>
                            </Group>
                            <Text size="sm"><strong>Docente:</strong> {seccion.docente}</Text>
                            <Text size="sm">
                              <strong>Sede / jornada:</strong> {seccion.sede} · {seccion.jornada}
                            </Text>
                            <Text size="sm">
                              <strong>Cupos:</strong> {seccion.cupos}
                              {seccion.modalidad !== "Online" && <> · <strong>Sala:</strong> {seccion.sala}</>}
                            </Text>
                            <Stack gap={4}>
                              <Text fw={600} size="sm">Horario</Text>
                              {seccion.bloques.map((bloque) => (
                                <Text key={bloque.id} c="gray.7" size="sm">
                                  {bloque.dia}, {bloque.inicio}–{bloque.termino}
                                </Text>
                              ))}
                            </Stack>
                            <Button
                              type="button"
                              variant="light"
                              onClick={() => editarSeccion(seccion)}
                              aria-label={`Editar ${seccion.codigo}`}
                            >
                              Editar sección
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="semana" pt="md">
                <Stack gap="md">
                  <div>
                    <Title order={2} size="h3">Horario semanal</Title>
                    <Text c="gray.7" size="sm" mt={4}>
                      Revisa los bloques de todas las secciones del período seleccionado.
                    </Text>
                  </div>
                  <SimpleGrid cols={{ base: 1, xs: 2, lg: 5 }} spacing="sm">
                    {DAYS.map((dia) => {
                      const eventos = seccionesDelPeriodo
                        .flatMap((seccion) =>
                          seccion.bloques
                            .filter((bloque) => bloque.dia === dia)
                            .map((bloque) => ({ ...bloque, seccion }))
                        )
                        .sort((a, b) => a.inicio.localeCompare(b.inicio))

                      return (
                        <Card key={dia} withBorder radius="md" padding="sm">
                          <Stack gap="sm">
                            <Title order={3} size="h5">{dia}</Title>
                            {eventos.length === 0 ? (
                              <Text c="gray.7" size="sm">Sin clases</Text>
                            ) : eventos.map((evento) => (
                              <Card key={`${evento.seccion.id}-${evento.id}`} padding="sm" radius="sm" bg="gray.0">
                                <Text fw={700} size="sm">
                                  {evento.inicio}–{evento.termino}
                                </Text>
                                <Text fw={600} size="sm" mt={4}>{evento.seccion.asignatura}</Text>
                                <Text c="gray.7" size="xs" mt={4}>{evento.seccion.docente}</Text>
                                <Text c="gray.7" size="xs">
                                  {evento.seccion.modalidad === "Online"
                                    ? "Online · Sin sala"
                                    : `${evento.seccion.sala} · ${evento.seccion.modalidad}`}
                                </Text>
                              </Card>
                            ))}
                          </Stack>
                        </Card>
                      )
                    })}
                  </SimpleGrid>
                </Stack>
              </Tabs.Panel>
            </Tabs>

          </Stack>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

export default Oferta
