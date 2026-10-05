import { useMemo, useState } from 'react';

/** Paginación en cliente. La página se ajusta sola si la lista se acorta (p. ej. al filtrar). */
export function usePaginacion<T>(items: readonly T[], porPagina = 8) {
  const [pagina, setPagina] = useState(1);
  const total = Math.max(1, Math.ceil(items.length / porPagina));
  const actual = Math.min(pagina, total);

  const visibles = useMemo(
    () => items.slice((actual - 1) * porPagina, actual * porPagina),
    [items, actual, porPagina],
  );

  return {
    pagina: actual,
    setPagina,
    total,
    visibles,
    desde: items.length === 0 ? 0 : (actual - 1) * porPagina + 1,
    hasta: Math.min(actual * porPagina, items.length),
  };
}
