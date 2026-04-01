# Clean Architecture - ASP.NET Core 8 + MySQL

Bộ khung Clean Architecture đầy đủ với ASP.NET Core 8, MySQL, MediatR, FluentValidation.

---

## 📐 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────┐
│                    WebApi Layer                     │
│   Controllers · Middlewares · JWT Auth · Swagger    │
└─────────────────────────┬───────────────────────────┘
                          │ gọi qua MediatR
┌─────────────────────────▼───────────────────────────┐
│                 Application Layer                   │
│   Commands · Queries · DTOs · Validators            │
│   Pipeline: Logging → Validation → Handler          │
└──────────┬──────────────────────────┬───────────────┘
           │ interface                │ interface
┌──────────▼──────────┐   ┌──────────▼───────────────┐
│    Domain Layer     │   │  Infrastructure Layer    │
│  Entities · VO      │   │  EF Core · MySQL         │
│  Domain Events      │   │  Repositories · Redis    │
│  Repository Iface   │   │  BCrypt · Email Service  │
└─────────────────────┘   └──────────────────────────┘
```

### Dependency Rule (bất biến)
> **Mỗi layer chỉ được phụ thuộc vào layer bên trong.**
> Domain ← Application ← Infrastructure/WebApi

---

## 🗂️ Cấu trúc thư mục

```
CleanArchitecture/
├── src/
│   ├── Domain/                        ← Lõi nghiệp vụ, không phụ thuộc gì
│   │   ├── Common/
│   │   │   ├── BaseEntity.cs          ← Id, CreatedAt, Domain Events
│   │   │   ├── AuditableEntity.cs     ← CreatedBy, UpdatedBy
│   │   │   ├── ValueObject.cs         ← So sánh theo giá trị
│   │   │   ├── IDomainEvent.cs        ← Marker interface
│   │   │   └── Result.cs              ← Result Pattern (tránh exception)
│   │   ├── Entities/
│   │   │   └── User.cs                ← Domain Entity đầy đủ + Factory Method
│   │   ├── ValueObjects/
│   │   │   └── Email.cs               ← Email tự validate
│   │   ├── Events/
│   │   │   └── UserEvents.cs          ← Domain Events (records)
│   │   ├── Interfaces/
│   │   │   └── IUserRepository.cs     ← Repository + UnitOfWork interface
│   │   └── Exceptions/
│   │       └── DomainExceptions.cs
│   │
│   ├── Application/                   ← Use cases, orchestration
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   │   ├── LoggingBehavior.cs     ← Tự động log + đo thời gian
│   │   │   │   └── ValidationBehavior.cs  ← Tự động validate trước handler
│   │   │   ├── Exceptions/
│   │   │   │   └── ApplicationExceptions.cs
│   │   │   ├── Interfaces/
│   │   │   │   └── IServices.cs       ← IPasswordHasher, ICurrentUser, ICache
│   │   │   └── PagedResult.cs
│   │   ├── Features/
│   │   │   └── Users/
│   │   │       ├── Commands/
│   │   │       │   ├── CreateUserCommand.cs   ← Command + Validator + Handler
│   │   │       │   └── UpdateUserCommand.cs
│   │   │       ├── Queries/
│   │   │       │   └── GetUserQueries.cs
│   │   │       └── DTOs/
│   │   │           └── UserDto.cs
│   │   └── DependencyInjection.cs
│   │
│   ├── Infrastructure/                ← Implement interfaces từ Application/Domain
│   │   ├── Persistence/
│   │   │   ├── AppDbContext.cs        ← EF Core + dispatch Domain Events
│   │   │   ├── UnitOfWork.cs
│   │   │   ├── Configurations/
│   │   │   │   └── UserConfiguration.cs  ← Fluent API mapping (snake_case)
│   │   │   └── Repositories/
│   │   │       └── UserRepository.cs
│   │   ├── Services/
│   │   │   ├── BcryptPasswordHasher.cs
│   │   │   └── RedisCacheService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── WebApi/                        ← Entry point, HTTP concerns only
│       ├── Controllers/
│       │   └── UsersController.cs     ← Thin controller, chỉ gọi MediatR
│       ├── Middlewares/
│       │   └── ExceptionHandlingMiddleware.cs  ← Global error handler
│       ├── Services/
│       │   └── CurrentUserService.cs  ← Đọc JWT claims
│       ├── Program.cs
│       └── appsettings.json
│
└── tests/
    ├── Domain.Tests/
    │   ├── UserTests.cs               ← Test business logic thuần túy
    │   └── EmailTests.cs              ← Test Value Object
    ├── Application.Tests/
    │   └── Features/Users/
    │       ├── CreateUserCommandHandlerTests.cs  ← Test với NSubstitute mock
    │       └── CreateUserCommandValidatorTests.cs
    └── Integration.Tests/
        ├── ApiFactory.cs              ← WebApplicationFactory + InMemory DB
        └── UsersEndpointTests.cs      ← Test HTTP endpoints thực
```

---

## 🚀 Chạy nhanh

### Yêu cầu
- .NET 8 SDK
- Docker Desktop (hoặc MySQL 8 + Redis cài local)

### 1. Clone & chạy bằng Docker
```bash
git clone <repo>
cd CleanArchitecture
docker-compose up -d
```
API chạy tại: http://localhost:5000  
Swagger UI: http://localhost:5000/swagger

### 2. Chạy local (không Docker)
```bash
# Cập nhật connection string trong appsettings.Development.json
# Chạy migration
cd src/WebApi
dotnet ef migrations add InitialCreate --project ../Infrastructure
dotnet ef database update --project ../Infrastructure

# Start API
dotnet run
```

### 3. Chạy tests
```bash
# Tất cả tests
dotnet test

# Chỉ Domain tests
dotnet test tests/Domain.Tests

# Chỉ Application tests
dotnet test tests/Application.Tests
```

---

## 🧠 Các nguyên tắc áp dụng

| Nguyên tắc | Áp dụng ở đâu |
|---|---|
| **Clean Architecture** | 4 layer tách biệt, dependency hướng vào trong |
| **DIP** (Dependency Inversion) | IUserRepository ở Domain, implement ở Infrastructure |
| **SRP** (Single Responsibility) | Mỗi Handler chỉ xử lý 1 use case |
| **Result Pattern** | `Result<T>` thay vì throw exception trong Domain |
| **Value Object** | `Email` bất biến, tự validate, so sánh theo giá trị |
| **Domain Events** | `UserCreatedEvent` dispatch sau SaveChanges |
| **Pipeline Behavior** | Logging + Validation tự động qua MediatR pipeline |
| **Repository + UoW** | Tách EF Core ra khỏi Application layer |
| **Soft Delete** | `IsDeleted` + Global Query Filter |
| **Factory Method** | `User.Create(...)` thay vì `new User(...)` |

---

## 📦 NuGet packages chính

| Package | Mục đích |
|---|---|
| `MediatR` | CQRS, Pipeline Behaviors |
| `FluentValidation` | Validation rules |
| `Pomelo.EntityFrameworkCore.MySql` | EF Core provider cho MySQL |
| `BCrypt.Net-Next` | Password hashing |
| `Serilog.AspNetCore` | Structured logging |
| `StackExchange.Redis` | Distributed cache |

---

## 🔧 Thêm Feature mới

Ví dụ thêm `Product`:

```bash
# 1. Domain
src/Domain/Entities/Product.cs
src/Domain/Events/ProductEvents.cs

# 2. Application
src/Application/Features/Products/DTOs/ProductDto.cs
src/Application/Features/Products/Commands/CreateProductCommand.cs
src/Application/Features/Products/Queries/GetProductQueries.cs

# 3. Infrastructure
src/Infrastructure/Persistence/Configurations/ProductConfiguration.cs
src/Infrastructure/Persistence/Repositories/ProductRepository.cs

# 4. WebApi
src/WebApi/Controllers/ProductsController.cs

# 5. Tests
tests/Domain.Tests/ProductTests.cs
tests/Application.Tests/Features/Products/CreateProductCommandHandlerTests.cs
```
