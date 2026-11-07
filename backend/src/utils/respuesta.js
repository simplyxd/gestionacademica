// Formato de éxito del contrato: { data: <objeto> } y, en las listas, { data: [...], meta: { page, limit, total } }.

/** "data" nunca desaparece del JSON: si no hay nada, vale null (JSON.stringify descarta undefined). */
export const envolver = (data) => ({ data: data ?? null });

export const envolverLista = (data, meta) => ({ data, meta });
