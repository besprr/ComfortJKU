-- Удаление базы данных (только для тестирования)
USE master;
GO

ALTER DATABASE ServiceManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

DROP DATABASE IF EXISTS ServiceManagement;
GO

-- Создание базы данных
CREATE DATABASE ServiceManagement;
GO

USE ServiceManagement;
GO

-- Таблица Роли
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL
);
GO

-- Таблица Пользователи
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Login NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
);
GO

-- Таблица Специализации
CREATE TABLE Specializations (
    SpecializationID INT IDENTITY(1,1) PRIMARY KEY,
    SpecializationName NVARCHAR(100) NOT NULL
);
GO

-- Таблица Мастера
CREATE TABLE Masters (
    MasterID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    SpecializationID INT FOREIGN KEY REFERENCES Specializations(SpecializationID)
);
GO

-- Таблица Услуги
CREATE TABLE Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Price DECIMAL(10, 2) NOT NULL
);
GO

-- Таблица СтатусыЗаявок
CREATE TABLE RequestStatuses (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL
);
GO

-- Таблица Заявки
CREATE TABLE Requests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    MasterID INT FOREIGN KEY REFERENCES Masters(MasterID),
    ProblemDescription NVARCHAR(MAX) NOT NULL, -- Описание проблемы
    Address NVARCHAR(255) NOT NULL, -- Адрес
    ApartmentNumber NVARCHAR(10) NOT NULL, -- Номер квартиры
    CreationDate DATETIME NOT NULL, -- Дата и время создания заявки
    CompletionDate DATETIME, -- Дата завершения заявки
    StatusID INT FOREIGN KEY REFERENCES RequestStatuses(StatusID)
);
GO

-- Таблица ГрафикРаботы
CREATE TABLE WorkSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    MasterID INT FOREIGN KEY REFERENCES Masters(MasterID),
    WorkDate DATE NOT NULL,
    WorkTime TIME NOT NULL
);
GO

-- Таблица Отзывы
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT FOREIGN KEY REFERENCES Requests(RequestID),
    ReviewText NVARCHAR(MAX),
    Rating INT CHECK (Rating BETWEEN 1 AND 5)
);
GO

-- Вставка начальных данных для таблицы Роли
INSERT INTO Roles (RoleName) VALUES ('Admin'), ('User');
GO

-- Вставка начальных данных для таблицы СтатусыЗаявок
INSERT INTO RequestStatuses (StatusName) VALUES ('Pending'), ('Confirmed'), ('Rejected');
GO


-- Вставка начальных данных для таблицы Специализации
INSERT INTO Specializations (SpecializationName) 
VALUES 
    ('Сантехник'),
    ('Электрик'),
    ('Слесарь'),
    ('Строитель'),
    ('Мастер по ремонту бытовой техники');
GO

CREATE TABLE RefreshTokens (
    TokenID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID), -- Связь с пользователем
    Token NVARCHAR(255) NOT NULL, -- Сам refresh токен
);
GO

-- Вставка начальных данных для таблицы Мастера
INSERT INTO Masters (Name, Phone, Email, SpecializationID) 
VALUES 
    ('Иван Петров', '+79876543210', 'ivan.petrov@example.com', 1), -- Сантехник
    ('Алексей Смирнов', '+79112223344', 'alexey.smirnov@example.com', 2), -- Электрик
    ('Сергей Иванов', '+79031234567', 'sergey.ivanov@example.com', 3), -- Слесарь
    ('Павел Сидоров', '+79998887766', 'pavel.sidorov@example.com', 4), -- Строитель
    ('Дмитрий Кузнецов', '+79261112233', 'dmitry.kuznetsov@example.com', 5); -- Мастер по ремонту бытовой техники
GO