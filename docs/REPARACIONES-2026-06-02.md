# Reparaciones realizadas - 2 Junio 2026

## Resumen
Se analizó y reparó el proyecto completo (Frontend + Backend) para demo con cliente.

## Frontend: 25 bugs reparados

### 🔥 6 Críticos (crasheaban en runtime)
1. `src/components/ClientHistoryModal.jsx` - Faltaban imports `MapPin, Mail, Phone, User` de lucide-react → **CRASH** al abrir modal con cliente
2. `src/utils/format.js:19-31` - `Intl.DateTimeFormat.format(Invalid Date)` → **RangeError** en Chrome
3. `src/utils/whatsappMessage.js:7-9` - `toLocaleDateString(Invalid Date)` → **RangeError**
4. `src/utils/pdf.js:23` - `URL.createObjectURL(null)` → **TypeError**
5. `src/api/testimonials.js:10` - Body plano `true` en vez de `{ approved: true }`
6. `src/components/ui/ConfirmModal.jsx:12,16` - `onConfirm` sin default → **TypeError**

### 🔴 9 Graves (lógica/datos)
7. `src/config/brand.js` - Faltaban `RESERVATIONS_CACHE_PREFIX` e `INVOICES_CACHE_PREFIX`
8. `src/api/client.js:63` - `Content-Type` hardcodeado rompía FormData
9. `src/api/products.js:21-24` - `Number("abc") || 0` traga NaN como 0
10. `src/api/salesHistory.js:34` - `ticketPdfUrl` crasheaba con respuesta no-JSON
11. `src/api/invoices.js:39` - `getPdfUrl` mismo problema
12. `src/features/backoffice/utils/cashierArqueo.js:12` - `"1,500"` interpretado como 1.5
13. `src/features/backoffice/hooks/useOrdersManagement.js:85,89` - `||` traga `0` legítimo
14. `src/components/ui/BarChart.jsx`, `PieChart.jsx`, `VerticalBarChart.jsx` - Sin guard `data = []`
15. `src/utils/export.js:58-61` - `printWindow.close()` en popup cerrado

### 🟡 5 Limpieza
16. `src/api/index.js` - 5 APIs faltantes re-exportadas
17. `eslint.config.js` - Ignora dist-electron/release, agrega globals.node
18. `src/utils/format.js:3` - Guard `null` + `isFinite` en formatCurrency
19. `src/components/ui/button.tsx` eliminado (conflicto con Button.jsx)
20. `src/utils/salesHistory.js:71-80` - Guard `payment == null`

### ✅ Verificación
- `npx eslint .` → **0 errores, 0 warnings**
- `npx vite build` → **Build exitoso**

## Backend: Sin errores
- `dotnet build` → **0 errores, 0 warnings**
- `dotnet build -warnaserror` → **0 errores, 0 warnings**
- Paquetes vulnerables → **0**
- Arquitectura y lógica revisada → OK
