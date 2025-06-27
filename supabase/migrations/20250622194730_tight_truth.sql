-- SPEMS Database Creation Script
-- Simple Personal Expense Management System
-- This script creates the complete database schema for SPEMS

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SPEMS')
BEGIN
    CREATE DATABASE SPEMS;
END
GO

USE SPEMS;
GO

-- Create Users table (extends ASP.NET Identity)
-- This table stores user account information
CREATE TABLE AspNetUsers (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    UserName NVARCHAR(256) NULL,
    NormalizedUserName NVARCHAR(256) NULL,
    Email NVARCHAR(256) NULL,
    NormalizedEmail NVARCHAR(256) NULL,
    EmailConfirmed BIT NOT NULL,
    PasswordHash NVARCHAR(MAX) NULL,
    SecurityStamp NVARCHAR(MAX) NULL,
    ConcurrencyStamp NVARCHAR(MAX) NULL,
    PhoneNumber NVARCHAR(MAX) NULL,
    PhoneNumberConfirmed BIT NOT NULL,
    TwoFactorEnabled BIT NOT NULL,
    LockoutEnd DATETIMEOFFSET(7) NULL,
    LockoutEnabled BIT NOT NULL,
    AccessFailedCount INT NOT NULL,
    
    -- Custom fields for SPEMS
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsVerified BIT NOT NULL DEFAULT 1,
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    Avatar NVARCHAR(500) NULL
);

-- Create indexes for AspNetUsers
CREATE UNIQUE INDEX IX_AspNetUsers_NormalizedUserName ON AspNetUsers (NormalizedUserName) WHERE NormalizedUserName IS NOT NULL;
CREATE INDEX IX_AspNetUsers_NormalizedEmail ON AspNetUsers (NormalizedEmail);

-- Create ASP.NET Identity tables
CREATE TABLE AspNetRoles (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    Name NVARCHAR(256) NULL,
    NormalizedName NVARCHAR(256) NULL,
    ConcurrencyStamp NVARCHAR(MAX) NULL
);

CREATE TABLE AspNetUserRoles (
    UserId NVARCHAR(450) NOT NULL,
    RoleId NVARCHAR(450) NOT NULL,
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES AspNetRoles (Id) ON DELETE CASCADE
);

CREATE TABLE AspNetUserClaims (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    ClaimType NVARCHAR(MAX) NULL,
    ClaimValue NVARCHAR(MAX) NULL,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

CREATE TABLE AspNetUserLogins (
    LoginProvider NVARCHAR(450) NOT NULL,
    ProviderKey NVARCHAR(450) NOT NULL,
    ProviderDisplayName NVARCHAR(MAX) NULL,
    UserId NVARCHAR(450) NOT NULL,
    PRIMARY KEY (LoginProvider, ProviderKey),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

CREATE TABLE AspNetUserTokens (
    UserId NVARCHAR(450) NOT NULL,
    LoginProvider NVARCHAR(450) NOT NULL,
    Name NVARCHAR(450) NOT NULL,
    Value NVARCHAR(MAX) NULL,
    PRIMARY KEY (UserId, LoginProvider, Name),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

CREATE TABLE AspNetRoleClaims (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    RoleId NVARCHAR(450) NOT NULL,
    ClaimType NVARCHAR(MAX) NULL,
    ClaimValue NVARCHAR(MAX) NULL,
    FOREIGN KEY (RoleId) REFERENCES AspNetRoles (Id) ON DELETE CASCADE
);

-- Create Expenses table
-- This table stores all user expenses
CREATE TABLE Expenses (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    Amount DECIMAL(18,2) NOT NULL CHECK (Amount > 0),
    Category NVARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    UserId NVARCHAR(450) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    Tags NVARCHAR(MAX) NULL, -- JSON string of tags
    Receipt NVARCHAR(500) NULL, -- File path or URL
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

-- Create indexes for Expenses
CREATE INDEX IX_Expenses_UserId_Date ON Expenses (UserId, Date);
CREATE INDEX IX_Expenses_UserId_Category ON Expenses (UserId, Category);
CREATE INDEX IX_Expenses_Date ON Expenses (Date);
CREATE INDEX IX_Expenses_Category ON Expenses (Category);

-- Create Budgets table
-- This table stores user budget limits by category and month
CREATE TABLE Budgets (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    Category NVARCHAR(100) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL CHECK (Amount > 0),
    Month NVARCHAR(7) NOT NULL, -- Format: YYYY-MM
    UserId NVARCHAR(450) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

-- Create unique constraint for budget (one budget per category per month per user)
CREATE UNIQUE INDEX IX_Budgets_UserId_Month_Category ON Budgets (UserId, Month, Category);

-- Create UserPreferences table
-- This table stores user preferences and settings
CREATE TABLE UserPreferences (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    Theme NVARCHAR(10) NOT NULL DEFAULT 'light', -- 'light' or 'dark'
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    BudgetAlerts BIT NOT NULL DEFAULT 1,
    MonthlyReports BIT NOT NULL DEFAULT 1,
    ExpenseReminders BIT NOT NULL DEFAULT 0,
    Language NVARCHAR(10) NOT NULL DEFAULT 'en',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

-- Create unique constraint for user preferences (one preference record per user)
CREATE UNIQUE INDEX IX_UserPreferences_UserId ON UserPreferences (UserId);

-- Create Categories table (reference data)
-- This table stores predefined expense categories
CREATE TABLE Categories (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50) NOT NULL,
    Color NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create unique constraint for category names
CREATE UNIQUE INDEX IX_Categories_Name ON Categories (Name);

-- Insert default categories
INSERT INTO Categories (Id, Name, Icon, Color) VALUES
(NEWID(), 'Food & Dining', 'UtensilsCrossed', 'bg-red-500'),
(NEWID(), 'Transportation', 'Car', 'bg-blue-500'),
(NEWID(), 'Shopping', 'ShoppingCart', 'bg-purple-500'),
(NEWID(), 'Entertainment', 'Film', 'bg-pink-500'),
(NEWID(), 'Bills & Utilities', 'Zap', 'bg-yellow-500'),
(NEWID(), 'Healthcare', 'Heart', 'bg-green-500'),
(NEWID(), 'Travel', 'Plane', 'bg-indigo-500'),
(NEWID(), 'Education', 'GraduationCap', 'bg-orange-500'),
(NEWID(), 'Personal Care', 'Scissors', 'bg-teal-500'),
(NEWID(), 'Home & Garden', 'Home', 'bg-emerald-500'),
(NEWID(), 'Gifts & Donations', 'Gift', 'bg-rose-500'),
(NEWID(), 'Other', 'MoreHorizontal', 'bg-gray-500');

-- Create Currencies table (reference data)
-- This table stores supported currencies
CREATE TABLE Currencies (
    Code NVARCHAR(3) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Symbol NVARCHAR(10) NOT NULL,
    Flag NVARCHAR(10) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Insert supported currencies
INSERT INTO Currencies (Code, Name, Symbol, Flag) VALUES
('USD', 'US Dollar', '$', '🇺🇸'),
('EUR', 'Euro', '€', '🇪🇺'),
('GBP', 'British Pound', '£', '🇬🇧'),
('KES', 'Kenyan Shilling', 'KSh', '🇰🇪'),
('JPY', 'Japanese Yen', '¥', '🇯🇵'),
('CAD', 'Canadian Dollar', 'C$', '🇨🇦'),
('AUD', 'Australian Dollar', 'A$', '🇦🇺'),
('CHF', 'Swiss Franc', 'CHF', '🇨🇭'),
('CNY', 'Chinese Yuan', '¥', '🇨🇳'),
('INR', 'Indian Rupee', '₹', '🇮🇳');

-- Create ExchangeRates table
-- This table stores currency exchange rates
CREATE TABLE ExchangeRates (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    BaseCurrency NVARCHAR(3) NOT NULL,
    TargetCurrency NVARCHAR(3) NOT NULL,
    Rate DECIMAL(18,6) NOT NULL,
    LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (BaseCurrency) REFERENCES Currencies (Code),
    FOREIGN KEY (TargetCurrency) REFERENCES Currencies (Code)
);

-- Create unique constraint for exchange rates
CREATE UNIQUE INDEX IX_ExchangeRates_BaseCurrency_TargetCurrency ON ExchangeRates (BaseCurrency, TargetCurrency);

-- Create NotificationLogs table
-- This table stores notification history
CREATE TABLE NotificationLogs (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- 'BudgetAlert', 'MonthlyReport', 'ExpenseReminder'
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
);

-- Create index for notification logs
CREATE INDEX IX_NotificationLogs_UserId_CreatedAt ON NotificationLogs (UserId, CreatedAt);

-- Create AuditLogs table
-- This table stores audit trail for important operations
CREATE TABLE AuditLogs (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(450) NULL,
    Action NVARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    EntityType NVARCHAR(100) NOT NULL, -- 'Expense', 'Budget', 'User'
    EntityId NVARCHAR(450) NOT NULL,
    OldValues NVARCHAR(MAX) NULL, -- JSON
    NewValues NVARCHAR(MAX) NULL, -- JSON
    IPAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE SET NULL
);

-- Create index for audit logs
CREATE INDEX IX_AuditLogs_UserId_CreatedAt ON AuditLogs (UserId, CreatedAt);
CREATE INDEX IX_AuditLogs_EntityType_EntityId ON AuditLogs (EntityType, EntityId);

-- Create useful views for reporting

-- View: Monthly Expense Summary
CREATE VIEW vw_MonthlyExpenseSummary AS
SELECT 
    e.UserId,
    FORMAT(e.Date, 'yyyy-MM') as Month,
    e.Category,
    e.Currency,
    COUNT(*) as TransactionCount,
    SUM(e.Amount) as TotalAmount,
    AVG(e.Amount) as AverageAmount,
    MIN(e.Amount) as MinAmount,
    MAX(e.Amount) as MaxAmount
FROM Expenses e
GROUP BY e.UserId, FORMAT(e.Date, 'yyyy-MM'), e.Category, e.Currency;

-- View: Budget vs Actual Spending
CREATE VIEW vw_BudgetVsActual AS
SELECT 
    b.UserId,
    b.Month,
    b.Category,
    b.Amount as BudgetAmount,
    b.Currency as BudgetCurrency,
    ISNULL(SUM(e.Amount), 0) as ActualSpent,
    (b.Amount - ISNULL(SUM(e.Amount), 0)) as Remaining,
    CASE 
        WHEN b.Amount > 0 THEN (ISNULL(SUM(e.Amount), 0) / b.Amount) * 100 
        ELSE 0 
    END as UtilizationPercentage
FROM Budgets b
LEFT JOIN Expenses e ON b.UserId = e.UserId 
    AND b.Category = e.Category 
    AND b.Month = FORMAT(e.Date, 'yyyy-MM')
GROUP BY b.UserId, b.Month, b.Category, b.Amount, b.Currency;

-- View: User Dashboard Summary
CREATE VIEW vw_UserDashboardSummary AS
SELECT 
    u.Id as UserId,
    u.Name,
    u.Email,
    u.Currency,
    (SELECT COUNT(*) FROM Expenses WHERE UserId = u.Id) as TotalExpenses,
    (SELECT COUNT(*) FROM Budgets WHERE UserId = u.Id) as TotalBudgets,
    (SELECT COUNT(DISTINCT Category) FROM Expenses WHERE UserId = u.Id) as CategoriesUsed,
    (SELECT SUM(Amount) FROM Expenses WHERE UserId = u.Id AND YEAR(Date) = YEAR(GETDATE()) AND MONTH(Date) = MONTH(GETDATE())) as CurrentMonthSpending,
    (SELECT SUM(Amount) FROM Budgets WHERE UserId = u.Id AND Month = FORMAT(GETDATE(), 'yyyy-MM')) as CurrentMonthBudget
FROM AspNetUsers u;

-- Create stored procedures for common operations

-- Procedure: Get User Expense Summary
CREATE PROCEDURE sp_GetUserExpenseSummary
    @UserId NVARCHAR(450),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -12, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();
    
    SELECT 
        Category,
        Currency,
        COUNT(*) as TransactionCount,
        SUM(Amount) as TotalAmount,
        AVG(Amount) as AverageAmount,
        MIN(Date) as FirstTransaction,
        MAX(Date) as LastTransaction
    FROM Expenses 
    WHERE UserId = @UserId 
        AND Date BETWEEN @StartDate AND @EndDate
    GROUP BY Category, Currency
    ORDER BY TotalAmount DESC;
END;

-- Procedure: Get Budget Performance
CREATE PROCEDURE sp_GetBudgetPerformance
    @UserId NVARCHAR(450),
    @Month NVARCHAR(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Month IS NULL SET @Month = FORMAT(GETDATE(), 'yyyy-MM');
    
    SELECT 
        b.Category,
        b.Amount as BudgetAmount,
        b.Currency,
        ISNULL(SUM(e.Amount), 0) as ActualSpent,
        (b.Amount - ISNULL(SUM(e.Amount), 0)) as Remaining,
        CASE 
            WHEN b.Amount > 0 THEN (ISNULL(SUM(e.Amount), 0) / b.Amount) * 100 
            ELSE 0 
        END as UtilizationPercentage,
        CASE 
            WHEN ISNULL(SUM(e.Amount), 0) > b.Amount THEN 'Over Budget'
            WHEN (ISNULL(SUM(e.Amount), 0) / b.Amount) * 100 > 80 THEN 'Warning'
            ELSE 'On Track'
        END as Status
    FROM Budgets b
    LEFT JOIN Expenses e ON b.UserId = e.UserId 
        AND b.Category = e.Category 
        AND FORMAT(e.Date, 'yyyy-MM') = b.Month
    WHERE b.UserId = @UserId AND b.Month = @Month
    GROUP BY b.Category, b.Amount, b.Currency
    ORDER BY UtilizationPercentage DESC;
END;

-- Create triggers for audit logging

-- Trigger: Audit Expense Changes
CREATE TRIGGER tr_Expenses_Audit
ON Expenses
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Handle INSERT
    IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, NewValues, CreatedAt)
        SELECT 
            NEWID(),
            i.UserId,
            'CREATE',
            'Expense',
            i.Id,
            (SELECT * FROM inserted i2 WHERE i2.Id = i.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM inserted i;
    END
    
    -- Handle UPDATE
    IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, CreatedAt)
        SELECT 
            NEWID(),
            i.UserId,
            'UPDATE',
            'Expense',
            i.Id,
            (SELECT * FROM deleted d WHERE d.Id = i.Id FOR JSON AUTO),
            (SELECT * FROM inserted i2 WHERE i2.Id = i.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM inserted i;
    END
    
    -- Handle DELETE
    IF NOT EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, OldValues, CreatedAt)
        SELECT 
            NEWID(),
            d.UserId,
            'DELETE',
            'Expense',
            d.Id,
            (SELECT * FROM deleted d2 WHERE d2.Id = d.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM deleted d;
    END
END;

-- Trigger: Audit Budget Changes
CREATE TRIGGER tr_Budgets_Audit
ON Budgets
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Handle INSERT
    IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, NewValues, CreatedAt)
        SELECT 
            NEWID(),
            i.UserId,
            'CREATE',
            'Budget',
            i.Id,
            (SELECT * FROM inserted i2 WHERE i2.Id = i.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM inserted i;
    END
    
    -- Handle UPDATE
    IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, CreatedAt)
        SELECT 
            NEWID(),
            i.UserId,
            'UPDATE',
            'Budget',
            i.Id,
            (SELECT * FROM deleted d WHERE d.Id = i.Id FOR JSON AUTO),
            (SELECT * FROM inserted i2 WHERE i2.Id = i.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM inserted i;
    END
    
    -- Handle DELETE
    IF NOT EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLogs (Id, UserId, Action, EntityType, EntityId, OldValues, CreatedAt)
        SELECT 
            NEWID(),
            d.UserId,
            'DELETE',
            'Budget',
            d.Id,
            (SELECT * FROM deleted d2 WHERE d2.Id = d.Id FOR JSON AUTO),
            GETUTCDATE()
        FROM deleted d;
    END
END;

-- Create functions for common calculations

-- Function: Calculate Monthly Spending
CREATE FUNCTION fn_GetMonthlySpending(@UserId NVARCHAR(450), @Month NVARCHAR(7))
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @TotalSpending DECIMAL(18,2);
    
    SELECT @TotalSpending = ISNULL(SUM(Amount), 0)
    FROM Expenses 
    WHERE UserId = @UserId 
        AND FORMAT(Date, 'yyyy-MM') = @Month;
    
    RETURN @TotalSpending;
END;

-- Function: Calculate Budget Utilization
CREATE FUNCTION fn_GetBudgetUtilization(@UserId NVARCHAR(450), @Month NVARCHAR(7))
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @TotalBudget DECIMAL(18,2);
    DECLARE @TotalSpent DECIMAL(18,2);
    DECLARE @Utilization DECIMAL(5,2);
    
    SELECT @TotalBudget = ISNULL(SUM(Amount), 0)
    FROM Budgets 
    WHERE UserId = @UserId AND Month = @Month;
    
    SELECT @TotalSpent = ISNULL(SUM(Amount), 0)
    FROM Expenses 
    WHERE UserId = @UserId 
        AND FORMAT(Date, 'yyyy-MM') = @Month;
    
    IF @TotalBudget > 0
        SET @Utilization = (@TotalSpent / @TotalBudget) * 100;
    ELSE
        SET @Utilization = 0;
    
    RETURN @Utilization;
END;

-- Create sample data (optional - for testing)
/*
-- Insert sample user (password hash would be generated by ASP.NET Identity)
INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, Name, Currency)
VALUES 
('sample-user-id', 'john@example.com', 'JOHN@EXAMPLE.COM', 'john@example.com', 'JOHN@EXAMPLE.COM', 1, 'John Doe', 'USD');

-- Insert sample user preferences
INSERT INTO UserPreferences (Id, UserId, Theme, Currency, BudgetAlerts, MonthlyReports, ExpenseReminders)
VALUES 
(NEWID(), 'sample-user-id', 'light', 'USD', 1, 1, 0);

-- Insert sample expenses
INSERT INTO Expenses (Id, Amount, Category, Date, Description, UserId, Currency)
VALUES 
(NEWID(), 25.50, 'Food & Dining', '2024-01-15', 'Lunch at Restaurant', 'sample-user-id', 'USD'),
(NEWID(), 45.00, 'Transportation', '2024-01-14', 'Gas Station', 'sample-user-id', 'USD'),
(NEWID(), 120.75, 'Shopping', '2024-01-13', 'Grocery Shopping', 'sample-user-id', 'USD');

-- Insert sample budgets
INSERT INTO Budgets (Id, Category, Amount, Month, UserId, Currency)
VALUES 
(NEWID(), 'Food & Dining', 400.00, '2024-01', 'sample-user-id', 'USD'),
(NEWID(), 'Transportation', 200.00, '2024-01', 'sample-user-id', 'USD'),
(NEWID(), 'Shopping', 300.00, '2024-01', 'sample-user-id', 'USD');
*/

PRINT 'SPEMS Database schema created successfully!';
PRINT 'Database includes:';
PRINT '- User management with ASP.NET Identity';
PRINT '- Expenses tracking with categories and currencies';
PRINT '- Budget management with monthly limits';
PRINT '- User preferences and settings';
PRINT '- Audit logging for data changes';
PRINT '- Reporting views and stored procedures';
PRINT '- Currency and exchange rate support';
PRINT '- Notification logging';
PRINT '';
PRINT 'Ready for SPEMS Angular + .NET application!';