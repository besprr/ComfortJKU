-- �������� ���� ������ (������ ��� ������������)
USE master;
GO

ALTER DATABASE ServiceManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

DROP DATABASE IF EXISTS ServiceManagement;
GO

-- �������� ���� ������
CREATE DATABASE ServiceManagement;
GO

USE ServiceManagement;
GO

-- ������� ����
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL
);
GO

-- ������� ������������
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

-- ������� �������������
CREATE TABLE Specializations (
    SpecializationID INT IDENTITY(1,1) PRIMARY KEY,
    SpecializationName NVARCHAR(100) NOT NULL
);
GO

-- ������� �������
CREATE TABLE Masters (
    MasterID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    SpecializationID INT FOREIGN KEY REFERENCES Specializations(SpecializationID)
);
GO

-- ������� ������
CREATE TABLE Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Price DECIMAL(10, 2) NOT NULL
);
GO

-- ������� �������������
CREATE TABLE RequestStatuses (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL
);
GO

-- ������� ������
CREATE TABLE Requests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    MasterID INT FOREIGN KEY REFERENCES Masters(MasterID),
    ProblemDescription NVARCHAR(MAX) NOT NULL, -- �������� ��������
    Address NVARCHAR(255) NOT NULL, -- �����
    ApartmentNumber NVARCHAR(10) NOT NULL, -- ����� ��������
    CreationDate DATETIME NOT NULL, -- ���� � ����� �������� ������
    CompletionDate DATETIME, -- ���� ���������� ������
    StatusID INT FOREIGN KEY REFERENCES RequestStatuses(StatusID)
);
GO

-- ������� ������������
CREATE TABLE WorkSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    MasterID INT FOREIGN KEY REFERENCES Masters(MasterID),
    WorkDate DATE NOT NULL,
    WorkTime TIME NOT NULL
);
GO

-- ������� ������
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT FOREIGN KEY REFERENCES Requests(RequestID),
    ReviewText NVARCHAR(MAX),
    Rating INT CHECK (Rating BETWEEN 1 AND 5)
);
GO

-- ������� ��������� ������ ��� ������� ����
INSERT INTO Roles (RoleName) VALUES ('Admin'), ('User');
GO

-- ������� ��������� ������ ��� ������� �������������
INSERT INTO RequestStatuses (StatusName) VALUES ('Pending'), ('Confirmed'), ('Rejected');
GO


-- ������� ��������� ������ ��� ������� �������������
INSERT INTO Specializations (SpecializationName) 
VALUES 
    ('���������'),
    ('��������'),
    ('�������'),
    ('���������'),
    ('������ �� ������� ������� �������');
GO

CREATE TABLE RefreshTokens (
    TokenID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID), -- ����� � �������������
    Token NVARCHAR(255) NOT NULL, -- ��� refresh �����
);
GO

-- ������� ��������� ������ ��� ������� �������
INSERT INTO Masters (Name, Phone, Email, SpecializationID) 
VALUES 
    ('���� ������', '+79876543210', 'ivan.petrov@example.com', 1), -- ���������
    ('������� �������', '+79112223344', 'alexey.smirnov@example.com', 2), -- ��������
    ('������ ������', '+79031234567', 'sergey.ivanov@example.com', 3), -- �������
    ('����� �������', '+79998887766', 'pavel.sidorov@example.com', 4), -- ���������
    ('������� ��������', '+79261112233', 'dmitry.kuznetsov@example.com', 5); -- ������ �� ������� ������� �������
GO