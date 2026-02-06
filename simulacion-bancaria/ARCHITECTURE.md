# Arquitectura - Simulación Bancaria

## Descripción General

La aplicación es una simulación de banca digital construida con **Next.js** y **React** que sigue principios de arquitectura limpios y patrones de diseño actuales.

## Estructura de Carpetas

```
├── app/                      # Next.js App Router (páginas y layout)
├── components/               # Componentes React reutilizables
├── controllers/              # Exportadores de interfaces/tipos seguros
├── models/                   # Entidades de dominio
├── services/                 # Lógica de aplicación (orquestación)
├── store/                    # Punto central de inicialización de datos
└── public/                   # Recursos estáticos
```

## Capas Arquitectónicas

### 1. **Domain Layer** (`/models/`)
Entidades puras que representan conceptos del negocio.

- `Client.ts`: Entidad que representa un cliente bancario
- `Account.ts`: Clase base para registros contables
- `SavingAccount.ts`: Cuenta de ahorro con cálculo de intereses
- `CheckingAccount.ts`: Cuenta corriente
- `CDT.ts`: Certificado de Depósito a Término

**Características:**
- Sin dependencias externas
- Métodos puros o con efectos controlados (mutación permitida dentro del modelo)
- Validación de entrada

**Ejemplo:**
```typescript
const saving = new SavingAccount('SAVING001', 1000, 0.06);
const interest = saving.CalculateRate(12); // Calcula interés anual
```

### 2. **Application Layer** (`/services/`)
Orquesta la lógica entre dominio e infraestructura. Proporciona operaciones de alto nivel.

- `AccountService.ts`: Operaciones seguras sobre cuentas (depósitos, retiros, cálculos)

**Características:**
- Funciones puras que devuelven resultados con estado de éxito/error
- Validación centralizada
- Sin mutación de estado (devuelve nuevo estado)
- Fácil de testear

**Ejemplo:**
```typescript
const result = depositToSavingAccount(account, 100);
if (result.success) {
  console.log('Nuevo saldo:', result.newBalance);
} else {
  console.error(result.error);
}
```

### 3. **Infrastructure Layer** (`/store/`)
Inicialización y gestión centralizada de datos.

- `index.ts`: Bootstrap de todas las instancias (singleton pattern)
- Proporciona punto único de exportación para evitar ciclos de dependencias
- Función `syncAccountsRegistry()` para mantener registros contables actualizados

**Características:**
- Evita ciclos de import
- Fuente única de verdad (single source of truth)

### 4. **Presentation Layer** (`/components/`, `/app/`)

#### Componentes (`/components/`)
- `CardAccount.tsx`: Tarjeta interactiva de una cuenta (depósitos, retiros, cálculos)
- `Summary.tsx`: Resumen visual del patrimonio total
- `UserProfile.tsx`: Información del cliente

**Características:**
- Componentes funcionales con React Hooks
- Estado local para formularios
- Inyección de dependencias vía props
- Callback para notificar cambios al padre

#### Páginas (`/app/`)
- `page.tsx`: Página principal que orquesta todo
  - Mantiene estado centralizado con `useState`
  - Inicializa instancias desde `store/index.ts`
  - Pasa funciones de actualización a componentes hijos
  - Muestra resumen y tarjetas de cuentas

### 5. **Types/Interfaces Layer** (`/controllers/`)
Exporta solo tipos e interfaces para evitar dependencias circulares.

- `InterfaceController.ts`: Re-exporta interfaces de modelos
- `IndexController.ts`: Re-exporta solo tipos (NO instancias)

## Patrones de Diseño Implementados

### 1. **Singleton Pattern** (`store/index.ts`)
```typescript
export const clientInstance = new ClientModel('John Doe', 'CLIENT123');
export const savingAccountInstance = new SavingAccount('SAVING789', 2000000, 0.006);
// ... más instancias
```
**Ventaja:** Única instancia de cada recurso; fácil de remplazar para testing.

### 2. **Service Layer Pattern** (`services/AccountService.ts`)
```typescript
export function depositToSavingAccount(account, amount) {
  // Validación y lógica centralizada
  // Devuelve resultado seguro con error handling
}
```
**Ventaja:** Lógica reutilizable, testeable, separada de componentes.

### 3. **Strategy Pattern** (cálculo de intereses)
Cada tipo de cuenta (`SavingAccount`, `CDT`) implementa su propia estrategia de cálculo.

```typescript
// SavingAccount usa interés compuesto
return this.Balance * (Math.pow(1 + this.Rate, months) - 1);

// CDT usa interés simple (ejemplo)
return cdt.Balance * (cdt.Rate * cdt.Time);
```

### 4. **Repository Pattern** (em desarrollo)
`store/index.ts` actúa como repositorio centralizado de entidades.

### 5. **Dependency Injection**
Componentes reciben dependencias vía props:
```typescript
<CardAccount
  savingAccount={savingAccountInstance}
  onUpdated={handleAccountUpdated}
/>
```

## Flujo de Datos

```
User Interaction (UI)
        ↓
React Component (CardAccount)
        ↓
AccountService (operación pura)
        ↓
Domain Model (depósito/retiro)
        ↓
setUpdateTrigger() → re-render
        ↓
Summary actualiza automáticamente
```

## Estado y Re-render

**Problema resuelto:** Anteriormente, mutaciones directas en instancias compartidas no causaban re-render en React.

**Solución implementada:**
1. `app/page.tsx` mantiene `updateTrigger` state
2. Cada operación (depósito, retiro) llama a `onUpdated()`
3. `handleAccountUpdated()` sincroniza registry y dispara re-render
4. Componentes re-se-rendeerizan automáticamente con nuevos valores

## Cómo Añadir una Nueva Transacción

1. **Crear función en `services/AccountService.ts`:**
```typescript
export function transferBetweenAccounts(from, to, amount) {
  const withdrawResult = withdrawFromSavingAccount(from, amount);
  if (withdrawResult.success) {
    const depositResult = depositToCheckingAccount(to, withdrawResult.newBalance);
    return { success: true, fromBalance: withdrawResult.newBalance, ... };
  }
  return { success: false, error: '...' };
}
```

2. **Usar en componente:**
```typescript
const result = transferBetweenAccounts(savingAccount, checkingAccount, amount);
if (result.success) {
  setMessage({ type: 'success', text: '...' });
  onUpdated?.();
}
```

## Testing

Estructura recomendada:
```
__tests__/
├── models/
│   ├── SavingAccount.test.ts
│   ├── CheckingAccount.test.ts
│   └── CDT.test.ts
├── services/
│   └── AccountService.test.ts
└── components/
    └── CardAccount.test.tsx
```

**Ejemplo con Jest:**
```typescript
// tests/services/AccountService.test.ts
describe('AccountService', () => {
  it('deposita correctamente a una cuenta', () => {
    const account = new SavingAccount('TEST', 1000, 0.06);
    const result = depositToSavingAccount(account, 500);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(1500);
  });
});
```

## Mejoras Futuras

1. **State Management centralizado:** Migrar a `useReducer` o `Zustand` para estado complejo
2. **Persistencia:** Integrar localStorage o base de datos
3. **API Backend:** Conectar con servidor para operaciones remotas
4. **Validación avanzada:** Schema validation con `Zod` o `Yup`
5. **Auditoría:** Log de transacciones
6. **Seguridad:** Autenticación, autorización, encriptación
7. **Notificaciones:** Toast, modal alerts mejorados

## Beneficios de la Arquitectura

✅ **Separación de responsabilidades:** Cada capa tiene un propósito claro
✅ **Testabilidad:** Servicios puros son fáciles de testear
✅ **Reutilización:** Lógica compartida en services
✅ **Mantenibilidad:** Cambios localizados, bajo impacto
✅ **Escalabilidad:** Fácil añadir nuevas cuentas/operaciones
✅ **Evita ciclos:** Importes controlados, no hay dependencias circulares
✅ **React-friendly:** State management y re-render controlados

## Referencias

- [Clean Architecture in Node.js](https://github.com/ryanmcdermott/clean-code-javascript)
- [Design Patterns in TypeScript](https://refactoring.guru/design-patterns/typescript)
- [React Best Practices](https://react.dev/learn)
