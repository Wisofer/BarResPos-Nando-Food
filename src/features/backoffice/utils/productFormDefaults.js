function emptyProductFormCore() {
  return {
    id: null,
    codigo: "",
    nombre: "",
    descripcion: "",
    precioVenta: "",
    precioCompra: "",
    categoriaProductoId: "",
    proveedorId: "",
    stock: "",
    stockMinimo: "",
    controlarStock: true,

    imagenUrl: "",
    activo: true,
    opcionesEspecialesOn: false,
    opcionesEspecialesLines: [""],
    /** Precio final de venta por cada opción (índice 1:1 con opcionesEspecialesLines). */
    opcionesEspecialesPrices: [""],
    opcionesEspecialesGrupoId: null,
    opcionesEspecialesReemplaza: false,
  };
}

/** Estado inicial del formulario (p. ej. `useState(getInitialProductForm)`). */
export function getInitialProductForm() {
  return emptyProductFormCore();
}

/**
 * Formulario vacío al abrir "Nuevo producto" (categoría/proveedor por contexto del catálogo).
 * @param {{ selectedCategory: string, categories: unknown[], providers: unknown[] }} ctx
 */
export function getNewProductForm({ selectedCategory, categories, providers }) {
  return {
    ...emptyProductFormCore(),
    categoriaProductoId: selectedCategory || categories[0]?.id || "",
    proveedorId: providers[0]?.id || "",
  };
}
