# Simulación Bancaria

Una aplicación web moderna de simulación de banca digital construida con **Next.js 15**, **React 19** y **TypeScript**. Implementa patrones de diseño de software y arquitectura limpia para demostrar mejores prácticas en desarrollo de aplicaciones.

## 🎯 Características

- ✅ **Gestión de Cuentas**: Ahorros, Corriente, CDT
- ✅ **Operaciones Bancarias**: Depósitos, Retiros, Cálculo de Intereses
- ✅ **Interfaz Responsiva**: Diseño moderno con Tailwind CSS
- ✅ **Arquitectura Limpia**: Separación clara de capas (Domain, Services, UI)
- ✅ **TypeScript Strict**: Type safety completo
- ✅ **Patrones de Diseño**: Singleton, Strategy, Service Layer, DI
- ✅ **Sin Ciclos de Dependencias**: Imports controlados y seguros

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar/navegar al proyecto
cd simulacion-bancaria

# Instalar dependencias
pnpm install
# o npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
# o npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Compilación para Producción

```bash
pnpm build
pnpm start
```

## 📊 Estructura del Proyecto

```
simulacion-bancaria/
├── app/                      # Páginas y rutas (Next.js App Router)
│   ├── page.tsx             # Página principal
│   ├── layout.tsx           # Layout global
│   └── globals.css          # Estilos globales
├── components/              # Componentes React reutilizables
│   ├── CardAccount.tsx      # Tarjeta de cuenta interactiva
│   ├── Summary.tsx          # Resumen de patrimonio
│   └── UserProfile.tsx      # Perfil del usuario
├── models/                  # Entidades de dominio (lógica de negocio)
│   ├── Client.ts            # Entidad: Cliente
│   ├── Account.ts           # Clase base contable
│   ├── SavingAccount.ts     # Cuenta de ahorro
│   ├── CheckingAccount.ts   # Cuenta corriente
│   └── CDT.ts               # Certificado de depósito
├── services/                # Capa de aplicación (lógica orquestada)
│   └── AccountService.ts    # Operaciones bancarias seguras
├── store/                   # Punto central de inicialización
│   └── index.ts             # Bootstrap de instancias (Singleton)
├── controllers/             # Exportadores de tipos seguros
│   └── IndexController.ts   # Re-exporta solo interfaces
├── __tests__/               # Tests unitarios e integración
├── public/                  # Recursos estáticos
├── ARCHITECTURE.md          # Documentación de arquitectura
├── TESTING.md               # Guía de testing
└── README.md                # Este archivo
```

## 🏗️ Arquitectura

La aplicación sigue principios de **Clean Architecture** con 4 capas principales:

### 1. **Domain Layer** (`models/`)
Entidades puras sin dependencias externas. Contienen lógica de negocio core.

```typescript
const account = new SavingAccount('SAV001', 5000, 0.06);
account.Deposit(1000);
const interest = account.CalculateRate(12);
```

### 2. **Application Layer** (`services/`)
Servicios que orquestan operaciones entre el dominio e infraestructura.

```typescript
const result = depositToSavingAccount(account, 500);
if (result.success) {
  console.log('Nuevo saldo:', result.newBalance);
}
```

### 3. **Infrastructure Layer** (`store/`)
Punto central de inicialización de datos (Singleton Pattern) que evita ciclos.

```typescript
export const savingAccountInstance = new SavingAccount(...);
export const clientInstance = new Client(...);
```

### 4. **Presentation Layer** (`components/`, `app/`)
Componentes React que consumen servicios y mantienen estado.

```typescript
<CardAccount
  savingAccount={savingAccountInstance}
  onUpdated={handleAccountUpdated}
/>
```

## 🎨 Patrones de Diseño Implementados

| Patrón | Ubicación | Propósito |
|--------|-----------|----------|
| **Singleton** | `store/index.ts` | Única instancia de cada recurso |
| **Strategy** | `models/*Account.ts` | Estrategias de cálculo de interés |
| **Service Layer** | `services/AccountService.ts` | Lógica reutilizable y testeable |
| **Dependency Injection** | `components/CardAccount.tsx` | Props inyectadas en componentes |
| **Repository** | `store/index.ts` | Acceso centralizado a datos |

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para detalles completos.

## 🧪 Testing

La aplicación incluye ejemplos de testing en todas las capas:

```bash
# Ejecutar tests
pnpm test

# Con cobertura
pnpm test --coverage

# En modo watch
pnpm test --watch
```

Ver [TESTING.md](TESTING.md) para ejemplos y mejores prácticas.

## 💡 Características Clave de Código

### ✔️ Type Safety Completo
```typescript
// AccountService.ts retorna tipo Result con discriminated union
export function deposit(account: SavingAccount, amount: number) {
  return {
    success: boolean;
    newBalance: number;
    error?: string;
  };
}
```

### ✔️ Error Handling Seguro
```typescript
const result = depositToSavingAccount(account, amount);
if (result.success) {
  // Usar result.newBalance
} else {
  // Usar result.error
}
```

### ✔️ Sin Ciclos de Dependencias
- `store/index.ts` controla la inicialización
- `controllers/` exporta solo tipos (no instancias)
- Componentes importan desde `store/index.ts`

### ✔️ React State Management
```typescript
const [updateTrigger, setUpdateTrigger] = useState(0);
const handleAccountUpdated = useCallback(() => {
  syncAccountsRegistry();
  setUpdateTrigger(prev => prev + 1);
}, []);
```

## 📝 Guía de Uso

### Hacer un Depósito
1. Haz clic en el botón "Depositar" en la tarjeta de cuenta
2. Ingresa el monto en el formulario
3. Confirma la operación
4. El saldo se actualiza automáticamente

### Hacer un Retiro
1. Haz clic en "Retirar"
2. Ingresa el monto (máximo = balance actual)
3. Confirma
4. Recibe confirmación de éxito

### Calcular Interés (Cuenta de Ahorro)
1. Ingresa el número de meses
2. Haz clic en "Calcular"
3. Ver interés acumulado y saldo final

### Cerrar CDT
1. Haz clic en "Cerrar" en la tarjeta CDT
2. Recibe el saldo final (inicial + interés acumulado)
3. CDT se marca como cerrado

## 🔧 Tecnologías

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Build Tool**: pnpm, Turbopack

## 📚 Aprendizajes Clave

Al trabajar en este proyecto, aprenderás:

1. **Arquitectura Limpia**: Separación de responsabilidades en capas
2. **TypeScript Avanzado**: Types discriminados, generics, utilities
3. **React Hooks**: `useState`, `useCallback`, composición
4. **Patrones de Diseño**: 5 patrones implementados y explicados
5. **Testing**: Unit tests, integration tests, assertions
6. **Next.js**: App Router, SSR basics, bundling
7. **Tailwind CSS**: Responsive design, dark mode

## 🚦 Mejoras Futuras

- [ ] Persistencia en localStorage/IndexedDB
- [ ] Integración con API backend
- [ ] Autenticación y autorización
- [ ] Dashboard con gráficas de transacciones
- [ ] Exportar estados de cuenta (PDF/CSV)
- [ ] Notificaciones en tiempo real
- [ ] Auditoría de transacciones
- [ ] Migración a Zustand/Redux para estado complejo

## 📖 Documentación

- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura detallada y patrones
- [TESTING.md](TESTING.md) - Guía de testing con ejemplos
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contribuir

Este es un proyecto de aprendizaje. Siéntete libre de:
- Extender funcionalidades
- Refactorizar código
- Añadir tests
- Mejorar UX/UI
- Documentar conocimientos

## 📄 Licencia

MIT - Libre para uso educativo y comercial

---

**Última actualización**: Febrero 2026
**Estado**: ✅ Refactor arquitectónico completado
