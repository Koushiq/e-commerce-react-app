# NexStore eCommerce Fullstack Application

A modern, production-grade eCommerce web application built with **React (Vite + Tailwind CSS + Lucide Icons)** and **ASP.NET Core Web API (.NET 10)** following **SOLID principles**, **Clean Architecture**, **Repository Pattern**, and **CQRS**.

---

## 🌟 Key Features

1. **Architecture & SOLID Principles**:
   - Clean separation of concerns across 4 layers:
     - `Ecommerce.Domain`: Pure business entities, enums, value objects, and repository contracts.
     - `Ecommerce.Application`: CQRS request handlers (`MediatR`), DTOs, interfaces, and exceptions.
     - `Ecommerce.Infrastructure`: EF Core DbContext, generic and custom repositories, Unit of Work, Identity, Redis/Memory cache, bKash & SSLCommerz adapters.
     - `Ecommerce.Api`: REST controllers, custom middlewares, Serilog logging, Swagger/OpenAPI.
2. **ASP.NET Core Identity & Role-Based Authorization**:
   - `ApplicationUser` & `ApplicationRole` (`Admin`, `Customer`, `Manager`).
   - Standard roles and default accounts pre-seeded.
   - Granular role-based authorization on admin operations (e.g. `[Authorize(Roles = "Admin")]`).
3. **JWT Authentication with Refresh Tokens & Claims**:
   - Signed JWTs with Issuer (`EcommerceApi`), Audience (`EcommerceClient`), and standard claims (`sub`, `email`, `role`, `name`, `jti`).
   - Refresh token storage with token rotation, revocation, and auto-refresh interceptors.
   - Google Auth integration (`Google.Apis.Auth`) for social logins with fallback simulation.
4. **Multi-Language Support (Localization)**:
   - ASP.NET Core Request Localization supporting English (`en-US`) and Bengali (`bn-BD`).
   - React frontend equipped with instant Language Toggle (`EN` / `বাংলা`), localizing catalogs, navigation, and checkout.
5. **Admin Chatbot with MCP Tools**:
   - MCP server (`Ecommerce.McpServer`) exposing tools: `search_products`, `get_product_sales`, `get_product_stock`, `get_low_stock_products`, `get_average_sales`, `get_sales_summary`, `get_top_products`, `get_recent_orders`, `get_order_status_lookup`.
   - Chat relay endpoint: `POST /api/admin/chat` (Admin role only).
   - Frontend chat widget with suggestion chips, tool-call badges, and EN/BN i18n.
   - LLM provider configurable via `LlmSettings` in `appsettings.json` (OpenAI-compatible).
6. **Hybrid Caching (Redis with In-Memory Fallback)**:
   - Pluggable `ICacheService` that dynamically connects to Redis or falls back to in-memory caching when Redis is not running.
   - High-throughput product and category queries cached with automated invalidation.
6. **Logging (File & Database)**:
   - Structured logging with **Serilog**:
     - Daily rolling file sink in `logs/ecommerce-api-.log`.
     - Database sink persisting events into the `AppLogs` table.
7. **Payment Integrations (bKash & SSLCommerz)**:
   - Open-Closed Principle compliant gateway design via `IPaymentGatewayFactory` and `IPaymentGatewayService`.
   - **bKash**: Tokenized direct checkout workflow (Payment creation + PIN execution + trxID capture).
   - **SSLCommerz**: Session initiation + validation/IPN workflow with multi-channel simulation.
8. **Pre-Seeded Catalog & Accounts**:
   - Real products across 4 categories with high quality Unsplash CDN photos and pricing in BDT (৳).
   - Demo Admin: `admin@ecommerce.com` / `Admin@123`
   - Demo Customer: `customer@ecommerce.com` / `Customer@123`

---

## 🚀 Running the Application

### 1. Run the Backend (.NET 10 API)
```bash
cd backend/Ecommerce.Api
dotnet run --urls "http://localhost:5000"
```
*API will run on `http://localhost:5000`. Swagger documentation available at `http://localhost:5000/swagger`.*

### 2. Run the Frontend (React + Vite)
```bash
cd client
npm run dev
```
*Client will run on `http://localhost:3000`.*
