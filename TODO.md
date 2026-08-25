# TODO - brain-capture

States: `[ ]` pending - `[~]` partial or unverified - `[!]` blocked - `[x]`
verified complete - `[-]` obsolete or superseded.

## Baseline gate debt

- [ ] **Cobertura de tipos al 96.93%, el liston compartido es 99%.** `dupes`,
      `knip` y `deps:graph` pasaron limpios; este es el unico gate que no llega.
      25 expresiones sin cubrir, 18 de ellas en
      `src/services/captures/captureFromRow.ts` -- un mapper de filas de base de
      datos, o sea un borde real con el driver, no dejadez. `type-coverage`
      corre con `--at-least 96.9`, que congela el estado actual: la cobertura ya
      no puede bajar, y el numero en `package.json` es la deuda, visible en
      cualquier diff que lo toque. Tipar la fila en `captureFromRow.ts` es lo
      que sube el numero; al hacerlo, subir tambien el `--at-least` y borrar
      esta entrada cuando llegue a 99.
