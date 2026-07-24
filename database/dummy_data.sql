-- Disable foreign key constraints during seeding to prevent constraint conflicts
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing tables
DELETE FROM role_permission;
DELETE FROM permissions;
DELETE FROM audit_logs;
DELETE FROM documents;
DELETE FROM compensation;
DELETE FROM residents;
DELETE FROM land_parcel_property_owner;
DELETE FROM property_owners;
DELETE FROM land_parcels;
DELETE FROM projects;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM departments;

-- 1. Seed departments table (Exact Backup Data)
INSERT INTO departments (id, department_name, dep_code, dep_head, email, phone, staff, status, created_at, updated_at) VALUES
(1, 'Administration', 'ADM', 'John Silva', 'admin@lams.gov.lk', '+94 11 234 1001', 12, 1, '2026-07-09 08:01:12', '2026-07-09 08:01:12'),
(2, 'Land Acquisition', 'LAQ', 'Nimal Perera', 'land@lams.gov.lk', '+94 11 234 1002', 18, 1, '2026-07-09 08:01:12', '2026-07-09 08:01:12'),
(3, 'Survey', 'SRV', 'Kasun Fernando', 'survey@lams.gov.lk', '+94 11 234 1003', 15, 1, '2026-07-09 08:01:12', '2026-07-09 08:01:12'),
(4, 'Legal', 'LEG', 'Saman Jayasuriya', 'legal@lams.gov.lk', '+94 11 234 1004', 8, 1, '2026-07-09 08:01:12', '2026-07-09 08:01:12'),
(5, 'Finance', 'FIN', 'Amila Gunasekara', 'finance@lams.gov.lk', '+94 11 234 1005', 10, 1, '2026-07-09 08:01:12', '2026-07-09 08:01:12');

-- 2. Seed roles table (Exact Backup Data)
INSERT INTO roles (id, role_name, description, created_at, updated_at) VALUES
(1, 'Admin', 'System Administrator', '2026-07-08 19:23:19', '2026-07-08 19:23:19'),
(2, 'DO', 'Development Officer', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(3, 'HOB', 'Head of Branch', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(4, 'AO', 'Administrative Officer', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(5, 'AS', 'Assistant Secretary', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(6, 'SAS', 'Senior Assistant Secretary', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(7, 'SEC', 'Secretary', '2026-07-09 08:04:46', '2026-07-09 08:04:46'),
(8, 'Viewer', 'Read-only access to system information', '2026-07-09 08:04:46', '2026-07-09 08:04:46');

-- 3. Seed permissions table
INSERT INTO permissions (id, module, permission_name, description, created_at, updated_at) VALUES
(1, 'projects', 'view_projects', 'Ability to view project lists and details.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'projects', 'manage_projects', 'Ability to create, update, and delete projects.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'land_parcels', 'view_parcels', 'Ability to view land parcel inventory.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'land_parcels', 'manage_parcels', 'Ability to register and update land parcel records.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'valuations', 'manage_valuations', 'Ability to submit and approve property valuations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'compensation', 'manage_compensation', 'Ability to request and pay compensations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Seed role_permission pivot table
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

-- 5. Seed users table (Exact Backup Data)
INSERT INTO users (id, department_id, role_id, name, email, email_verified_at, password, remember_token, created_at, updated_at) VALUES
(1, 1, 1, 'System Administrator', 'admin@gov.lk', '2026-07-09 08:08:45', '$2y$12$me4L4f.ebnkbbD0tlbx/ru5CsHqxdKgQV9dl.f.cCnqHAlPYU9n92', NULL, '2026-07-09 08:08:45', '2026-07-09 08:08:45'),
(3, 2, 3, 'Head of Branch', 'hob@gov.lk', NULL, '$2y$12$vp6vuyfP6wHHvFfpEGwE6e9gfpiFkvDaBE1yVsAZ/xUXp0eSsLGky', NULL, '2026-07-09 08:19:44', '2026-07-09 08:19:44'),
(4, 2, 2, 'Development Officer', 'do@gov.lk', NULL, '$2y$12$y9avKCry3I0sOzZHlOC/iua25AUW0yw0L.LsWWwlf7lZgkU5tWA1i', NULL, '2026-07-09 08:21:13', '2026-07-09 08:21:13'),
(5, 2, 4, 'Administrative Officer', 'ao@gov.lk', NULL, '$2y$12$NU8.100iqmsuKMZcREzCT.AliqvZ40DQLF.IETFH8sUCLYU9A1.0q', NULL, '2026-07-09 08:22:50', '2026-07-09 08:22:50'),
(6, 2, 5, 'Assistant Secretary', 'assec@gov.lk', NULL, '$2y$12$LeZ.Ex2/1mePHpBH8tjinuQLWwmmrpIDZhZIoIKhJGL7BPC3L8DVO', NULL, '2026-07-09 08:24:17', '2026-07-09 08:24:17'),
(7, 2, 6, 'Senior Assistant Secretary', 'sas@gov.lk', NULL, '$2y$12$qCKIZUYu4eUIyuptWH/9KOM6upfbwUfuwqpOBco.hAYgtiLqsHnU.', NULL, '2026-07-09 08:25:17', '2026-07-09 08:25:17'),
(8, 2, 7, 'Secretary', 'sec@gov.lk', NULL, '$2y$12$OctYayhplY48pWV35dU1hORRD5gV6NtQVzuYePyAiXNCvL1tYE9ke', NULL, '2026-07-09 08:25:47', '2026-07-09 08:25:47');

-- 6. Seed projects table
INSERT INTO projects (id, project_id, title, purpose, institution, institution_address, land_area_to_be_acquired_acers, land_area_to_be_acquired_roods, land_area_to_be_acquired_perches, full_land_area_to_be_acquired, are_residents_moved_temp, section20_observation, section21_secretary_report, section22_secretary_recommendation, section23_valuation_recommendation, section24_decision_remarks, section25_additional_conditions, section26_final_recommendation, approval_date, approved_by, case_status, do_status, hob_status, ao_status, as_status, sas_status, sec_status, remarks, created_at, updated_at) VALUES
(1, 'PRJ-2024-045', 'Southern Highway Expansion Phase 2', 'Construction of 4-lane highway from Galle to Matara', 'Ministry of Highways - RDA', 'No 218, Densil Kobbekaduwa Mawatha, Battaramulla', 25.00, 2.00, 15.00, 4115.00, 0, 1, 1, 'Recommended for acquisition', 'Valuation completed and verified', 1, 'Standard resettlement terms apply', 1, '2024-01-15', 1, 'active', 'submitted', 'approved', 'approved', 'approved', 'approved', 'approved', 'High priority highway network development.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'PRJ-2024-043', 'Mattala Airport Development', 'Terminal and runway expansion project.', 'Ministry of Aviation - AASL', 'Mattala, Hambantota', 10.00, 1.00, 20.00, 1660.00, 1, 1, 0, 'Pending clearance', 'Valuation report submitted', 0, 'Environmental mitigation required', 0, '2024-02-20', 1, 'pending', 'submitted', 'pending', 'pending', 'pending', 'pending', 'pending', 'Pending environmental clearance approval.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'PRJ-2023-122', 'Kandy Urban Infrastructure Project', 'Traffic ease and urban beautification.', 'Ministry of Urban Development - UDA', 'Getambe, Kandy', 5.00, 0.00, 0.00, 800.00, 0, 1, 1, 'Fully approved', 'Approved', 1, 'None', 1, '2023-08-22', 1, 'completed', 'submitted', 'approved', 'approved', 'approved', 'approved', 'approved', 'Completed ahead of scheduled timeline.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Seed land_parcels table
INSERT INTO land_parcels (id, parcel_id, project_id, land_name, province, district, divisional_secretariat, grama_niladari_division, village, land_size_acers, land_size_roods, land_size_perches, full_land_size, latitude, longitude, boundary_geojson, has_plan, plan_number, parcel_numbers, boundaries_north, boundaries_south, boundaries_east, boundaries_west, has_residential_houses, is_resident_owner, cultivation, cultivation_status, annual_income, land_type, estimated_value, remarks, status, created_at, updated_at) VALUES
(1, 'PCL-8934', 1, 'Unawatuna Residential Parcel', 'Southern', 'Galle', 'Galle Four Gravets', 'GN-521', 'Unawatuna', 2.50, 0.00, 15.00, 415.00, 6.01000000, 80.25000000, '{"type":"Polygon","coordinates":[[[80.25,6.01],[80.26,6.01],[80.26,6.02],[80.25,6.02],[80.25,6.01]]]}', 1, 'P-123/4A', '["Lot 1", "Lot 2"]', 'Road', 'River', 'Private Land', 'Private Land', 1, 1, 'Coconut', 'fertile', 450000.00, 'Residential', 15000000.00, 'Clear terrain, high value residential land.', 'acquired', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'PCL-8935', 1, 'Galle Town Commercial Parcel', 'Southern', 'Galle', 'Galle Four Gravets', 'GN-512', 'Galle', 1.80, 0.00, 10.00, 298.00, 6.03000000, 80.21000000, NULL, 1, 'P-124/1B', '["Lot 3"]', 'Main Street', 'Building', 'Shop', 'Lane', 1, 0, 'Commercial Garden', 'mid', 1200000.00, 'Commercial', 25000000.00, 'Residential property with a 2-story building structure.', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'PCL-8936', 2, 'Habaraduwa Coconut Estate', 'Southern', 'Galle', 'Habaraduwa', 'GN-405', 'Habaraduwa', 3.20, 0.00, 25.00, 537.00, 5.98000000, 80.30000000, NULL, 0, NULL, '[]', 'Forest', 'Paddy', 'Road', 'Estate', 0, 0, 'Coconut Plantation', 'fertile', 800000.00, 'Agricultural', 18000000.00, 'Agricultural coconut estate land.', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'PCL-8937', NULL, 'Tangalle Coastal Bare Land', 'Southern', 'Hambantota', 'Tangalle', 'GN-102', 'Tangalle', 4.10, 0.00, 0.00, 656.00, 6.02000000, 80.79000000, NULL, 1, 'P-89/2C', '["Lot A"]', 'Beach Road', 'Sea', 'Hotel', 'Empty Plot', 0, 0, 'None', 'infertile', 0.00, 'Bare Land', 12000000.00, 'Vacant commercial space near coastal main road.', 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Seed residents table
INSERT INTO residents (id, land_parcel_id, name, address, nic, contact, relationship, created_at, updated_at) VALUES
(1, 1, 'W.A. Perera', '45, Galle Road, Unawatuna', '722345678V', '+94 71 234 5678', 'owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'K.L. Jayawardena', '12, Hospital Road, Galle', '851234567V', '+94 77 111 2233', 'tenant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 9. Seed property_owners table
INSERT INTO property_owners (id, owner_id, name, nic, address, contact, created_at, updated_at) VALUES
(1, 'OWN-1247', 'W.A. Perera', '722345678V', '45, Galle Road, Unawatuna', '+94 71 234 5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'OWN-1248', 'S.M. Fernando', '801234567V', '12, Hospital Road, Galle', '+94 77 345 6789', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'OWN-1249', 'R.K. Silva', '691234567V', '78, Matara Road, Habaraduwa', '+94 76 456 7890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 10. Seed land_parcel_property_owner pivot table
INSERT INTO land_parcel_property_owner (id, land_parcel_id, property_owner_id, created_at, updated_at) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 4, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11. Seed compensation table
INSERT INTO compensation (id, owner_id, land_parcel_id, compensation_id, amount, approved_date, payment_date, status, created_at, updated_at) VALUES
(1, 1, 1, 'COMP-3456', 15000000.00, '2024-05-10', '2024-05-15', 'paid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, 'COMP-3457', 10800000.00, '2024-05-15', '2024-05-20', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 12. Seed documents table
INSERT INTO documents (id, user_id, project_id, original_filename, stored_filename, file_type, file_path, file_size, document_category, upload_date, created_at, updated_at) VALUES
(1, 4, 1, 'Project Approval Letter.pdf', 'proj_approval.pdf', 'PDF', '/uploads/docs/proj_approval.pdf', '2.3 MB', 'Approvals', '2024-01-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 1, 'Environmental Impact Assessment.pdf', 'env_impact.pdf', 'PDF', '/uploads/docs/env_impact.pdf', '15.7 MB', 'Reports', '2024-01-20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 1, 'Survey Plans - Lot 123.dwg', 'survey_plan_123.dwg', 'DWG', '/uploads/docs/survey_plan_123.dwg', '8.2 MB', 'Survey Plan', '2024-02-05', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 13. Seed audit_logs table
INSERT INTO audit_logs (id, user_id, name, action, module, detail, ip_address, user_agent, created_at, updated_at) VALUES
(1, 4, 'Development Officer', 'Create', 'Projects', 'Created project Southern Highway Expansion Phase 2', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 'Head of Branch', 'Update', 'Land Parcels', 'Updated parcel status PCL-8935: In Progress', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
