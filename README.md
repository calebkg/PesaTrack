# Personal Expense Management System (SPEMS)

A modern, full-stack web application for tracking personal expenses, managing budgets, and generating insightful financial reports. Built with Angular (frontend) and ASP.NET Core (.NET 8) (backend).

## Features

### User Management
- User registration, login, and JWT-based authentication
- Profile management and password reset
- Email verification

### Expense Tracking
- Add, edit, delete, and filter expenses by category, date, and amount
- Multi-currency support with live exchange rates
- Tagging and categorization of expenses
- Recent activity and transaction history

### Budget Management
- Set monthly budgets per category
- Track spending against budgets
- Visual progress bars and status indicators (under, near, over budget)
- Budget summaries and alerts

### Reports & Analytics
- Visualize spending by category and over time
- Budget vs. actual comparisons
- Export reports as PDF
- Monthly trends and summaries

### Dashboard
- Overview of total spent, budgets, transactions, and categories
- Quick actions for adding expenses, setting budgets, and viewing reports

### Settings & Preferences
- Dark/light mode toggle
- Select default currency and region
- Notification preferences (budget alerts, monthly reports, reminders)

## Tech Stack

- **Frontend:** Angular 17, TailwindCSS, Chart.js, ng2-charts
- **Backend:** ASP.NET Core 8, Entity Framework Core, JWT Auth, Serilog, AutoMapper, FluentValidation
- **Database:** SQL Server or MySQL (configurable)
- **Other:** Docker-ready, RESTful API, Swagger/OpenAPI docs

## Getting Started

### Prerequisites
- Node.js & npm
- .NET 8 SDK
- SQL Server or MySQL
- Git

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd SPEMS.API
   ```
2. Update `appsettings.json` with your database connection string.
3. Run migrations:
   ```sh
   dotnet ef database update
   ```
4. Start the API:
   ```sh
   dotnet run
   ```

### Frontend Setup
1. Navigate to the frontend folder (root):
   ```sh
   npm install
   ```
2. Start the Angular app:
   ```sh
   npm start
   ```

### Environment Variables
- Configure API endpoints in `src/environments/environment.ts`.

## Usage
- Register a new account or log in.
- Add expenses, set budgets, and view reports from the dashboard.
- Customize your preferences in the settings page.

## Project Structure
```
Personal Expense Management System/
├── SPEMS.API/         # ASP.NET Core backend
├── src/               # Angular frontend
├── supabase/          # (Optional) DB migrations
├── ...
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

**Personal Expense Management System** – Track, budget, and take control of your finances. 