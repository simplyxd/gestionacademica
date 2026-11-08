export interface ParametrosInstitucionales {
  nombreInstitucion: string;
  nombreCorto: string;
  siglasPortal: string;
  correoContacto: string;
  telefonoMesa: string;
  zonaHoraria: string;
  mensajeBienvenida: string;
  duracionSesionMinutos: number;
  permitirRecuperacionClave: boolean;
  mostrarCodigoAsignaturaEnTablas: boolean;
}

export const PARAMETROS_DEFAULT: ParametrosInstitucionales = {
  nombreInstitucion: 'Instituto Universitario Nueva Formación',
  nombreCorto: 'IUNF',
  siglasPortal: 'SGA',
  correoContacto: 'mesa.ayuda@iunf.cl',
  telefonoMesa: '+56 2 2345 6789',
  zonaHoraria: 'America/Santiago',
  mensajeBienvenida:
    'Bienvenido al portal académico. Ante dudas de matrícula o inscripción, contacta a la mesa de ayuda.',
  duracionSesionMinutos: 45,
  permitirRecuperacionClave: true,
  mostrarCodigoAsignaturaEnTablas: true,
};

export const ZONAS_HORARIAS = [
  { value: 'America/Santiago', label: 'Chile continental (Santiago)' },
  { value: 'America/Punta_Arenas', label: 'Magallanes' },
  { value: 'Pacific/Easter', label: 'Isla de Pascua' },
];
