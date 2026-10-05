import { Badge, Button, Card, SimpleGrid, Stack, Table, Text, Title, useMantineTheme } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { useEstructura } from '@/features/estructura/EstructuraContext';
import { resolver } from '@/features/matricula/catalogos';
import { useMatriculas } from '@/features/matricula/MatriculaContext';
import { useOfertaStore } from '@/features/oferta/OfertaContext';
import { MODALIDAD_LABEL } from '@/features/oferta/types';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { formatearFecha } from '@/features/periodos/estado';
import { textoBloques } from '@/lib/horas';
import { nombreCompleto } from '@/mock/personas';
import { calcularCarga } from './carga';
import classes from './Personas.module.css';
import { usePersonas } from './PersonasContext';
import type { Persona, RolPersona } from './types';

interface FichaDrawerProps {
  persona: Persona | null;
  rol: RolPersona;
  onClose: () => void;
  onEditar: (persona: Persona) => void;
}

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Stack gap={2}>
      <Text fz="xs" c="dimmed">
        {etiqueta}
      </Text>
      <Text fz="sm" fw={500} className={classes.largo}>
        {children}
      </Text>
    </Stack>
  );
}

function Dato({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <Card withBorder shadow="none" padding="sm">
      <Text fz="xl" fw={700} className="sga-tnum">
        {valor}
      </Text>
      <Text fz="xs" c="dimmed">
        {etiqueta}
      </Text>
    </Card>
  );
}

/** Ficha de solo lectura (E4-2). El docente muestra su carga académica; el estudiante, sus matrículas. */
export function FichaDrawer({ persona, rol, onClose, onEditar }: FichaDrawerProps) {
  const theme = useMantineTheme();
  const { secciones } = useOfertaStore();
  const { periodos, periodoActual } = usePeriodos();
  const { estudiantes } = usePersonas();
  const { matriculas } = useMatriculas();
  const { carreras, planes } = useEstructura();

  const docente = persona && 'especialidad' in persona ? persona : null;
  const estudiante = persona && 'codigoEstudiante' in persona ? persona : null;

  const nombre = persona ? nombreCompleto(persona) : '';
  const carga = docente && periodoActual ? calcularCarga(nombre, secciones, periodoActual.id) : null;
  const propias =
    docente && periodoActual ? secciones.filter((s) => s.docente === nombre && s.periodoId === periodoActual.id) : [];
  const matriculasDe = estudiante
    ? matriculas
        .filter((m) => m.estudianteId === estudiante.id)
        .map((m) => resolver(m, periodos, estudiantes, carreras, planes))
        .filter((r) => r !== null)
    : [];

  return (
    <DetailDrawer
      opened={persona !== null}
      onClose={onClose}
      size={theme.other.layout.drawerWidthLg}
      title={persona ? `Ficha de ${rol === 'docente' ? 'docente' : 'estudiante'}` : ''}
      subtitle={persona ? nombre : undefined}
      footer={
        persona && (
          <>
            <Button variant="subtle" color="slate" onClick={onClose}>
              Cerrar
            </Button>
            <Button variant="light" leftSection={<IconEdit size={18} stroke={1.5} />} onClick={() => onEditar(persona)}>
              Editar datos
            </Button>
          </>
        )
      }
    >
      {persona && (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Campo etiqueta="Nombre completo">{nombre}</Campo>
            <Campo etiqueta="Estado">
              <Badge color={persona.estado === 'activo' ? 'teal' : 'slate'}>
                {persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </Badge>
            </Campo>
            <Campo etiqueta="RUT">
              <span className="sga-code">{persona.rut}</span>
            </Campo>
            <Campo etiqueta="Correo institucional">{persona.email}</Campo>
            <Campo etiqueta="Teléfono">{persona.telefono}</Campo>
            <Campo etiqueta="Fecha de incorporación">{formatearFecha(persona.incorporacion)}</Campo>
            {docente && (
              <>
                <Campo etiqueta="Especialidad o área">{docente.especialidad}</Campo>
                <Campo etiqueta="Tipo de vínculo">{docente.tipoVinculo}</Campo>
              </>
            )}
            {estudiante && (
              <>
                <Campo etiqueta="Código de estudiante">
                  <span className="sga-code">{estudiante.codigoEstudiante}</span>
                </Campo>
                <Campo etiqueta="Nivel que está cursando">{estudiante.nivelCursando}</Campo>
                <Campo etiqueta="Contacto de emergencia">{estudiante.contactoEmergencia}</Campo>
              </>
            )}
          </SimpleGrid>

          {docente && (
            <Stack gap="sm" component="section" aria-labelledby="titulo-carga">
              <Title id="titulo-carga" order={3} size="h5">
                Carga académica{periodoActual ? ` · ${periodoActual.codigo}` : ''}
              </Title>
              {!carga ? (
                <Text fz="sm" c="dimmed">
                  No hay un período en curso.
                </Text>
              ) : (
                <>
                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                    <Dato valor={carga.secciones} etiqueta="Secciones asignadas" />
                    <Dato valor={carga.asignaturas} etiqueta="Asignaturas distintas" />
                    <Dato valor={carga.horasPedagogicas} etiqueta="Horas pedagógicas / semana" />
                    <Dato valor={carga.inscritos} etiqueta="Estudiantes inscritos" />
                  </SimpleGrid>
                  {propias.length === 0 ? (
                    <Text fz="sm" c="dimmed">
                      No tiene secciones en este período.
                    </Text>
                  ) : (
                    <Table.ScrollContainer minWidth={460}>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Asignatura</Table.Th>
                            <Table.Th>Horario</Table.Th>
                            <Table.Th>Sala / modalidad</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {propias.map((s) => (
                            <Table.Tr key={s.id}>
                              <Table.Td>
                                <Text fz="sm" fw={500}>
                                  {s.nombreAsignatura}
                                </Text>
                                <Text component="span" className="sga-code sga-code-indigo" fz="xs">
                                  {s.codigoAsignatura}
                                </Text>{' '}
                                <Text component="span" fz="xs" c="dimmed">
                                  · Sección {s.seccion}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fz="sm">{textoBloques(s.bloques)}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fz="sm">{s.sala ?? MODALIDAD_LABEL[s.modalidad]}</Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Table.ScrollContainer>
                  )}
                </>
              )}
            </Stack>
          )}

          {estudiante && (
            <Stack gap="sm" component="section" aria-labelledby="titulo-matriculas">
              <Title id="titulo-matriculas" order={3} size="h5">
                Matrículas
              </Title>
              {matriculasDe.length === 0 ? (
                <Text fz="sm" c="dimmed">
                  Aún no tiene matrículas registradas.
                </Text>
              ) : (
                matriculasDe.map((m) => (
                  <Card key={m.matricula.id} withBorder shadow="none" padding="sm">
                    <Text fz="sm" fw={500}>
                      {m.carrera.nombre} · {m.plan.nombre}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {m.periodo.codigo} · {m.matricula.estado}
                    </Text>
                  </Card>
                ))
              )}
            </Stack>
          )}
        </Stack>
      )}
    </DetailDrawer>
  );
}
