-- ==============================================================================
-- Land Acquisition Management System (LAMS)
-- Production Baseline Data Migration Script
--
-- Description:
-- Production-ready seed data containing ONLY essential lookup configurations
-- (Departments, Roles, System Permissions, Role-Permission mappings) and a
-- single sample Administrator account.
--
-- NOTE: Contains NO dummy projects, land parcels, property owners, residents,
-- compensation records, fake documents, or dummy officer accounts.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Optional: Clear tables if re-initializing
DELETE FROM role_permission;
DELETE FROM permissions;
DELETE FROM users WHERE id = 1 OR email = 'admin@lams.gov.lk';
DELETE FROM roles;
DELETE FROM departments;

-- 1. Departments Baseline (Same as Development)
INSERT INTO departments (id, department_name, dep_code, dep_address, dep_head, email, phone, staff, status, created_at, updated_at) VALUES
(1, 'Department of Southern Province Health Services', 'ADM', 'Lower Dickson Road, Galle, Southern Province', 'John Silva', 'admin@lams.gov.lk', '+94 11 234 1001', 12, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Department of Ayurwedha', 'AYU', 'Kachcheri Complex, Galle', 'Nimal Perera', 'land@lams.gov.lk', '+94 11 234 1002', 18, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Department of Local Government', 'LG', 'Wakwella Road, Galle', 'Kasun Fernando', 'survey@lams.gov.lk', '+94 11 234 1003', 15, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Road Development Authority', 'RDA', 'Court Road, Galle', 'Saman Jayasuriya', 'legal@lams.gov.lk', '+94 11 234 1004', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Finance', 'FIN', 'Main Street, Galle', 'Amila Gunasekara', 'finance@lams.gov.lk', '+94 11 234 1005', 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Roles Baseline
INSERT INTO roles (id, role_name, description, created_at, updated_at) VALUES
(1, 'Admin', 'System Administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'DO', 'Development Officer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'HOB', 'Head of Branch', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'AO', 'Administrative Officer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'AS', 'Assistant Secretary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'SAS', 'Senior Assistant Secretary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'SEC', 'Secretary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Viewer', 'Read-only access to system information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. System Permissions
INSERT INTO permissions (id, module, permission_name, description, created_at, updated_at) VALUES
(1, 'projects', 'view_projects', 'Ability to view project lists and details.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'projects', 'manage_projects', 'Ability to create, update, and delete projects.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'land_parcels', 'view_parcels', 'Ability to view land parcel inventory.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'land_parcels', 'manage_parcels', 'Ability to register and update land parcel records.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'valuations', 'manage_valuations', 'Ability to submit and approve property valuations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'compensation', 'manage_compensation', 'Ability to request and pay compensations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Role-Permission Mappings
INSERT INTO role_permission (id, role_id, permission_id, created_at, updated_at) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 3, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 4, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 4, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Sample Administrator Account (Initial Admin Credentials)
-- Default Password: Admin@12345
INSERT INTO users (id, department_id, role_id, name, email, email_verified_at, password, remember_token, phone, notification_preference, status, created_at, updated_at) VALUES
(1, 1, 1, 'System Administrator', 'admin@lams.gov.lk', CURRENT_TIMESTAMP, '$2y$12$50o.tB4IKQxSttC5vvYkmOSmCgZChHO7fb9T6kUTFFlVypOuCcPzO', NULL, '+94 11 234 1001', 'all', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SET FOREIGN_KEY_CHECKS = 1;
