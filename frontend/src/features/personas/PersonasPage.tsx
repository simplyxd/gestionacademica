import { ActionIcon, Badge, Box, Button, Card, Group, Menu, SegmentedControl, Stack, Table, Tabs, Text, TextInput, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArchive, IconArchiveOff, IconDotsVertical, IconEdit, IconEye, IconPlus, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { useOfertaStore } from '@/features/oferta/OfertaContext';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { formatearFecha } from '@/features/periodos/estado';
import { notify } from '@/lib/notify';
import { usePaginacion } from '@/lib/usePaginacion';
import { nombreCompleto } from '@/mock/personas';
import { calcularCarga } from './carga';
import { FichaDrawer } from './FichaDrawer';
import { PersonaFormDrawer } from './PersonaFormDrawer';
import classes from './Personas.module.css';
import { usePersonas } from './PersonasContext';
import type { Persona, RolPersona } from './types';

type FiltroEstado = 'activos' | 'inactivos' | 'todos';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function EstadoBadge({ persona }: { persona: Persona }) {
  const activo = persona.estado === 'activo';
  return (
    <Badge color={activo ? 'teal' : 'slate'} variant={activo ? 'light' : 'outline'}>
      {activo ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}

function Acciones({
  persona,
  onVer,
  onEditar,
  onEstado,
}: {
  persona: Persona;
  onVer: () => void;
  onEditar: () => void;
  onEstado: () => void;
}) {
  const nombre = nombreCompleto(persona);
  const activa = persona.estado === 'activo';
  return (
    <Group gap={4} wrap="nowrap" justify="flex-end">
      <Tooltip label="Ver ficha">
        <ActionIcon aria-label={`Ver ficha de ${nombre}`} onClick={onVer}>
          <IconEye size={18} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
      <Menu>
        <Menu.Target>
          <ActionIcon aria-label={`Más acciones para ${nombre}`}>
            <IconDotsVertical size={18} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={onEditar}>
            Editar
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color={activa ? 'crimson' : 'teal'}
            leftSection={activa ? <IconArchive size={16} stroke={1.5} /> : <IconArchiveOff size={16} stroke={1.5} />}
            onClick={onEstado}
          >
            {activa ? 'Desactivar' : 'Reactivar'}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

/** Docentes y estudiantes (RF5 / CU4): alta, edición, ficha y baja lógica. Solo el Coordinador. */
export function PersonasPage() {
  const { docentes, estudiantes, alternarEstado } = usePersonas();
  const { secciones } = useOfertaStore();
  const { periodoActual } = usePeriodos();
  const [rol, setRol] = useState<RolPersona>('docente');
  const [filtro, setFiltro] = useState<FiltroEstado>('activos');
  const [busqueda, setBusqueda] = useState('');
  const [formAbierto, form] = useDisclosure(false);
  const [editando, setEditando] = useState<Persona | null>(null);
  const [ficha, setFicha] = useState<Persona | null>(null);
  const [pendiente, setPendiente] = useState<Persona | null>(null);

  const lista: Persona[] = rol === 'docente' ? docentes : estudiantes;
  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return lista.filter((p) => {
      if (filtro === 'activos' && p.estado !== 'activo') return false;
      if (filtro === 'inactivos' && p.estado !== 'inactivo') return false;
      return !q || norm(nombreCompleto(p)).includes(q) || norm(p.rut).includes(q) || norm(p.email).includes(q);
    });
  }, [lista, filtro, busqueda]);
  const pag = usePaginacion(filtradas, 8);

  const nombreRol = rol === 'docente' ? 'docente' : 'estudiante';
  const plural = rol === 'docente' ? 'docentes' : 'estudiantes';
  const activos = lista.filter((p) => p.estado === 'activo').length;

  const nuevo = () => {
    setEditando(null);
    form.open();
  };
  const editar = (p: Persona) => {
    setFicha(null);
    setEditando(p);
    form.open();
  };

  const seccionesDelDocente = (p: Persona) =>
    rol === 'docente' && periodoActual ? calcularCarga(nombreCompleto(p), secciones, periodoActual.id).secciones : 0;

  const confirmar = () => {
    if (!pendiente) return;
    const nuevoEstado = alternarEstado(rol, pendiente.id);
    notify.success({
      title: nuevoEstado === 'inactivo' ? 'Baja registrada' : 'Persona reactivada',
      message: `${nombreCompleto(pendiente)} ${nuevoEstado === 'inactivo' ? 'dejó de figurar como miembro activo' : 'volvió a figurar como miembro activo'}.`,
    });
    setPendiente(null);
  };

  const desactivando = pendiente?.estado === 'activo';
  const conSecciones = pendiente ? seccionesDelDocente(pendiente) : 0;
  const colExtra = rol === 'docente' ? 'Especialidad' : 'Nivel';
  const valorExtra = (p: Persona) => ('especialidad' in p ? p.especialidad : 'nivelCursando' in p ? p.nivelCursando : '');

  return (
    <>
      <PageHeader
        title="Docentes y estudiantes"
        description="Alta, edición y baja lógica. Al desactivar, la persona deja de figurar como miembro activo y su registro se conserva."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Docentes y estudiantes' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={nuevo}>
            {rol === 'docente' ? 'Nuevo docente' : 'Nuevo estudiante'}
          </Button>
        }
      />

      <Tabs
        value={rol}
        onChange={(v) => {
          setRol((v as RolPersona) ?? 'docente');
          setBusqueda('');
          pag.setPagina(1);
        }}
        keepMounted={false}
      >
        <Tabs.List aria-label="Tipo de persona">
          <Tabs.Tab value="docente">Docentes ({docentes.length})</Tabs.Tab>
          <Tabs.Tab value="estudiante">Estudiantes ({estudiantes.length})</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Card mt="md">
        <Stack gap="md">
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <TextInput
              placeholder="Buscar por nombre, RUT o correo"
              aria-label={`Buscar ${plural}`}
              leftSection={<IconSearch size={16} stroke={1.5} />}
              w={{ base: '100%', sm: 320 }}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.currentTarget.value);
                pag.setPagina(1);
              }}
            />
            <SegmentedControl
              aria-label="Filtrar por estado"
              value={filtro}
              onChange={(v) => {
                setFiltro(v as FiltroEstado);
                pag.setPagina(1);
              }}
              data={[
                { value: 'activos', label: 'Activos' },
                { value: 'inactivos', label: 'Inactivos' },
                { value: 'todos', label: 'Todos' },
              ]}
            />
          </Group>

          <Text fz="sm" c="dimmed" role="status" aria-live="polite" className="sga-tnum">
            {filtradas.length} {filtradas.length === 1 ? nombreRol : plural}
            {filtro === 'todos' ? ` · ${activos} activos` : ' en el listado'}
          </Text>

          {filtradas.length === 0 ? (
            <EmptyState
              title={lista.length === 0 ? `Todavía no hay ${plural}` : `Sin ${plural} para esta búsqueda`}
              description={
                lista.length === 0
                  ? `Usa «Nuevo ${nombreRol}» para dar de alta el primero.`
                  : 'Prueba con otro nombre o cambia el filtro de estado.'
              }
            />
          ) : (
            <>
              {/* Escritorio y tableta: tabla de 7 columnas */}
              <Box visibleFrom="sm">
                <Table.ScrollContainer minWidth={860}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Persona</Table.Th>
                        <Table.Th>Correo</Table.Th>
                        <Table.Th>Teléfono</Table.Th>
                        <Table.Th>{colExtra}</Table.Th>
                        <Table.Th>Incorporación</Table.Th>
                        <Table.Th>Estado</Table.Th>
                        <Table.Th w={96} aria-label="Acciones" />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pag.visibles.map((p) => (
                        <Table.Tr key={p.id}>
                          <Table.Td>
                            <Text fz="sm" fw={500}>
                              {nombreCompleto(p)}
                            </Text>
                            <Text component="span" className="sga-code" c="dimmed" fz="xs">
                              {p.rut}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" lineClamp={1}>
                              {p.email}
                            </Text>
                          </Table.Td>
                          <Table.Td className="sga-tnum">{p.telefono}</Table.Td>
                          <Table.Td>
                            <Text fz="sm">{valorExtra(p)}</Text>
                          </Table.Td>
                          <Table.Td className="sga-tnum">{formatearFecha(p.incorporacion)}</Table.Td>
                          <Table.Td>
                            <EstadoBadge persona={p} />
                          </Table.Td>
                          <Table.Td>
                            <Acciones persona={p} onVer={() => setFicha(p)} onEditar={() => editar(p)} onEstado={() => setPendiente(p)} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Box>

              {/* Móvil: una card por persona */}
              <Stack gap="sm" hiddenFrom="sm">
                {pag.visibles.map((p) => (
                  <Card key={p.id} withBorder shadow="none" padding="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600}>{nombreCompleto(p)}</Text>
                        <Text component="span" className="sga-code" c="dimmed" fz="xs">
                          {p.rut}
                        </Text>
                      </Stack>
                      <Acciones persona={p} onVer={() => setFicha(p)} onEditar={() => editar(p)} onEstado={() => setPendiente(p)} />
                    </Group>
                    <Text fz="sm" mt="xs" className={classes.largo}>
                      {p.email}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {valorExtra(p)} · {p.telefono}
                    </Text>
                    <Box mt="xs">
                      <EstadoBadge persona={p} />
                    </Box>
                  </Card>
                ))}
              </Stack>

              <PaginacionBar
                pagina={pag.pagina}
                total={pag.total}
                desde={pag.desde}
                hasta={pag.hasta}
                cantidad={filtradas.length}
                onChange={pag.setPagina}
              />
            </>
          )}
        </Stack>
      </Card>

      <PersonaFormDrawer opened={formAbierto} onClose={form.close} rol={rol} persona={editando} />
      <FichaDrawer persona={ficha} rol={rol} onClose={() => setFicha(null)} onEditar={editar} />

      <ConfirmModal
        opened={pendiente !== null}
        onClose={() => setPendiente(null)}
        title={desactivando ? `Desactivar ${nombreRol}` : `Reactivar ${nombreRol}`}
        message={
          pendiente ? (
            desactivando ? (
              <>
                <strong>{nombreCompleto(pendiente)}</strong> dejará de figurar como miembro activo y no se ofrecerá
                {rol === 'docente' ? ' al asignar docentes en la oferta' : ' al matricular'}. El registro se conserva.
                {conSecciones > 0 && (
                  <>
                    {' '}
                    Tiene <strong>{conSecciones}</strong> {conSecciones === 1 ? 'sección' : 'secciones'} en el período en curso: seguirán
                    asignadas hasta que las reasignes.
                  </>
                )}
              </>
            ) : (
              <>
                <strong>{nombreCompleto(pendiente)}</strong> volverá a figurar como miembro activo.
              </>
            )
          ) : (
            ''
          )
        }
        confirmLabel={desactivando ? 'Desactivar' : 'Reactivar'}
        destructive={desactivando}
        onConfirm={confirmar}
      />
    </>
  );
}
