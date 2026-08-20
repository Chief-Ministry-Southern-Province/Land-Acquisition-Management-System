# Land Acquisition Management System

A comprehensive digital platform designed to manage and streamline the end-to-end process of land acquisition, from project initiation and land parcel identification to owner documentation and final compensation payments.

## 🚀 Overview

The Land Acquisition Management System is built to digitize the complex workflow of acquiring land for public projects. It ensures transparency, accountability, and efficiency by providing a structured approval process, precise land tracking via GIS integration, and robust compensation management.

The system supports a multi-tiered administrative hierarchy with Role-Based Access Control (RBAC), ensuring that data is managed and approved by the appropriate authorities.

## ✨ Key Features

### 🛠 Project & Land Management
- **Project Tracking:** Manage multiple land acquisition projects with detailed metadata.
- **Land Parcel Management:** Detailed recording of land parcels, including area calculations and location tracking.
- **Property Owner Registry:** Comprehensive database of property owners and residents affected by acquisition.
- **GIS Integration:** Integration with maps for precise land location picking and visualization.

### 💰 Compensation & Payments
- **Automated Calculation:** Tools to calculate compensation based on predefined rates and land area.
- **Payment Tracking:** Monitor the status of compensation payments to owners and residents.

### 📄 Document & Audit Management
- **Document Repository:** Centralized storage for legal documents, deeds, and certificates related to land parcels.
- **Audit Logs:** Full traceability of all system changes to ensure transparency and prevent fraud.

### ⚙️ Administrative Workflow
- **Approval Pipeline:** A multi-stage approval workflow involving various officers (DO → HOB → AO → AS → SAS → SEC).
- **Role-Based Access Control (RBAC):** Tailored dashboards and permissions for different administrative roles.
- **Multilingual Support:** Full support for English and Sinhala languages to cater to local administrative needs.

## 🛠 Tech Stack

- **Backend:** [Laravel](https://laravel.com/) (PHP)
- **Frontend:** [React](https://react.dev/) & [Inertia.js](https://inertiajs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** SQLite (Default for development/demonstration)
- **Build Tool:** [Vite](https://vitejs.dev/)

## 👥 User Roles & Permissions

The system implements a strict hierarchy for approvals and data management:

| Role | Description | Key Responsibilities |
| :--- | :--- | :--- |
| **Admin** | System Administrator | User management, Role/Department config, System settings, Audit logs. |
| **DO** | Development Officer | Initial data entry, land parcel identification, owner registration. |
| **HOB** | Head of Branch | Reviewing and approving submissions from the Development Officer. |
| **AO** | Administrative Officer | Processing administrative requirements and verifying documents. |
| **AS** | Assistant Secretary | Intermediate level review and approval. |
| **SAS** | Senior Assistant Secretary | High-level review and approval. |
| **SEC** | Secretary | Final authority for project and payment approvals. |

## 🐳 Running with Docker (Recommended)

The fastest way to get the system running is using Docker. This sets up the application, database (MySQL), cache (Redis), and mail server (Mailpit) automatically.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/land-acquisition-management-system.git
   cd land-acquisition-management-system
   ```

2. **Launch the system**
   ```bash
   docker compose up -d
   ```
   *This will build the image locally and start all required services.*

3. **Using Pre-built Docker Hub Image**
   If you prefer to use the public image from Docker Hub instead of building locally:
   - Open `docker-compose.yml`
   - Update the `image` tag for the `app` service to: `your-dockerhub-username/land-acquisition-app:latest`
   - Run `docker compose up -d`

4. **Access the Application**
   The app will be available at: [http://localhost:8000](http://localhost:8000)

### Useful Docker Commands
- **Stop services:** `docker compose stop`
- **Stop and remove containers:** `docker compose down`
- **View logs:** `docker compose logs -f app`
- **Restart services:** `docker compose restart`

## 🛠 Local Manual Installation

### Prerequisites
- PHP $\ge$ 8.2
- Composer
- Node.js $\ge$ 18
- NPM or PNPM


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/land-acquisition-management-system.git
   cd land-acquisition-management-system
   ```

2. **Install Backend Dependencies**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database Setup**
   The project uses SQLite by default for ease of setup.
   ```bash
   php artisan migrate --seed
   ```

6. **Run the Application**
   Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   In a separate terminal, start the Vite development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

7. **Access the App**
   Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## 📂 Project Structure

- `app/Models`: Database entities (Project, LandParcel, Compensation, etc.).
- `app/Http/Controllers`: Business logic and request handling.
- `app/Services`: Reusable business logic services.
- `resources/js`: React components and Inertia page definitions.
- `routes/web.php`: Route definitions and middleware assignments.
- `database/migrations`: Database schema definitions.
- `lang/`: Localization files for English (`en`) and Sinhala (`si`).

## 📜 License
This project is licensed under the [MIT License](LICENSE).
