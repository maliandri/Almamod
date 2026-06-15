// Helper PURO de costeo de un modelo. Sin estado, sin red, sin redondeo.
// El redondeo se hace SOLO al mostrar en la UI, nunca acá.
//
// calcularCostoModelo({ modelo, etapas, partesPorEtapa, config })
//   modelo         → { superficie, ... }
//   etapas         → [{ id, nombre, estado: 'detallado'|'estimado', horas_estimadas, monto_estimado }]
//   partesPorEtapa → { [etapa_id]: [{ cantidad_necesaria, partes: { costo } }] }
//   config         → { valor_hora, pct_indirectos, pct_margen, costo_m2_ref }
//
// Por etapa:
//   'detallado': materiales = Σ(cantidad_necesaria × partes.costo); mo = horas × valor_hora; subtotal = materiales + mo
//   'estimado' : subtotal = monto_estimado (ya es el costo directo de la etapa)
export function calcularCostoModelo({ modelo, etapas = [], partesPorEtapa = {}, config = {} }) {
  const valor_hora     = Number(config.valor_hora)     || 0;
  const pct_indirectos = Number(config.pct_indirectos) || 0;
  const pct_margen     = Number(config.pct_margen)     || 0;

  let materiales = 0;
  let mano_obra  = 0;
  let estimado   = 0;
  const porEtapa = [];

  for (const etapa of etapas) {
    const estado = etapa?.estado === 'estimado' ? 'estimado' : 'detallado';

    if (estado === 'estimado') {
      const subtotal = Number(etapa?.monto_estimado) || 0;
      estimado += subtotal;
      porEtapa.push({ id: etapa.id, nombre: etapa.nombre, estado, materiales: 0, mano_obra: 0, subtotal });
      continue;
    }

    const items = partesPorEtapa[etapa.id] || [];
    const mat = items.reduce(
      (s, it) => s + (Number(it?.cantidad_necesaria) || 0) * (Number(it?.partes?.costo) || 0),
      0
    );
    const mo = (Number(etapa?.horas_estimadas) || 0) * valor_hora;
    materiales += mat;
    mano_obra  += mo;
    porEtapa.push({ id: etapa.id, nombre: etapa.nombre, estado, materiales: mat, mano_obra: mo, subtotal: mat + mo });
  }

  const subtotal_directo = materiales + mano_obra + estimado;
  const indirectos       = subtotal_directo * pct_indirectos;
  const base_margen      = subtotal_directo + indirectos;
  const margen           = base_margen * pct_margen;
  const precio_venta     = base_margen + margen;
  const superficie       = Number(modelo?.superficie) || 0;
  const costo_m2         = superficie ? subtotal_directo / superficie : 0;

  return {
    materiales,
    mano_obra,
    estimado,
    subtotal_directo,
    indirectos,
    base_margen,
    margen,
    precio_venta,
    costo_m2,
    porEtapa,
  };
}
