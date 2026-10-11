# NexStore Project Guidance

This document outlines the architecture, conventions, and development workflows for the NexStore project. Adhere to these guidelines to maintain consistency and quality across the codebase.

## 🏗️ Tech Stack

### Backend
- **Framework:** ASP.NET Core (.NET 10)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, Api)
- **Patterns:** CQRS (via MediatR), Repository Pattern, Unit of Work
- **Security:** ASP.NET Core Identity, JWT with Refresh Tokens, Google Auth
- **Logging:** Serilog (Console, Rolling File, and Database sinks)
- **Localization:** ASP.NET Core Localization (EN-US, BN-BD)
- **Caching:** Hybrid (Redis with In-Memory fallback)
- **API Docs:** Swagger/OpenAPI (available at `/swagger`)

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS (via CDN in `index.html`)
- **Icons:** Lucide React
- **State Management:** React Context API
- **Localization:** Custom implementation (LanguageContext)

---

## 📂 Project Structure

- `backend/`: Root folder for the .NET solution.
  - `Ecommerce.Domain/`: Core business logic, entities, enums, and repository interfaces. **No dependencies on other projects.**
  - `Ecommerce.Application/`: Application logic, CQRS handlers, DTOs, and interfaces. Depends on Domain.
  - `Ecommerce.Infrastructure/`: Persistence (EF Core), Identity, External Services (Payment, Auth), and Caching. Depends on Application.
  - `Ecommerce.Api/`: Entry point, controllers, middlewares, and configuration. Depends on Infrastructure and Application.
- `client/`: Root folder for the React application.
  - `src/api/`: API client and service calls.
  - `src/components/`: Reusable UI components.
  - `src/context/`: State management via Context API.
  - `src/pages/`: Main application views.

---

## 🛠️ Development Workflow

### Local Setup
The project includes a `run.sh` script to start both services concurrently:
```bash
./run.sh
```
- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000`

### Backend Conventions
- **Clean Architecture:** Respect the dependency flow (API -> Infrastructure -> Application -> Domain).
- **CQRS:** Every feature should be implemented using MediatR Commands or Queries.
  - Place Commands/Queries/DTOs within `Ecommerce.Application/Features/[FeatureName]`.
- **Dependency Injection:** Register services in the respective layer's `DependencyInjection.cs`.
- **Validation:** Use Data Annotations or FluentValidation (if introduced) for request validation.
- **Exception Handling:** Use `ExceptionMiddleware` for global error management.

### Frontend Conventions
- **Functional Components:** Use functional components with hooks.
- **Styling:** Use Tailwind CSS utility classes. Avoid custom CSS files unless absolutely necessary.
- **State:** Prefer Context API for global state (Auth, Cart) and `useState`/`useReducer` for local state.
- **Components:** Keep components small and focused. Extract logic into custom hooks if it's complex or reusable.

---

## 🌍 Multi-Language Support
The application supports English and Bengali.
- **Backend:** Use `IStringLocalizer` and resource files in `Ecommerce.Api/Resources`.
- **Frontend:** Use the `useLanguage` hook and translations defined in `LanguageContext.jsx`.

---

## 💳 Payment Integration
Supported gateways: **bKash** and **SSLCommerz**.
- Implementations reside in `Ecommerce.Infrastructure/Payments`.
- Use `IPaymentGatewayFactory` to resolve the appropriate gateway at runtime.
