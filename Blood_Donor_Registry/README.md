# Blood Donor Registry

**Purpose:** A web application that lets a barangay / hospital / school blood program register voluntary
blood donors, view and search the list, update donor details, and remove records. It helps staff quickly
find donors by blood type when someone needs blood.

**Main record:** Donor — `fullName`, `age`, `bloodType`, `contactNumber`, `address`, `lastDonationDate`.

## Features
- Add, view, update, and delete donors from the React interface (the list updates without a page refresh)
- Search donors by name or blood type
- Summary of donor counts per blood type
- Loading, empty-list, and error messages, plus form validation before sending
- Server-side validation with clear JSON error messages

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL (`pg` package)
- Version control: Git / GitHub

## Project Structure
```
Blood_Donor_Registry/
├── backend/                 # Node.js + Express API
│   ├── routes/
│   │   └── donors.js        # REST routes (create, read, update, delete) + validation
│   ├── .env                 # Secret values (NOT pushed to GitHub)
│   ├── .env.example         # Template of the required variables
│   ├── db.js                # PostgreSQL connection + creates the donors table
│   ├── package.json
│   └── server.js            # Express server entry point
├── frontend/                # React (Vite) app
│   ├── src/
│   │   ├── api.js           # Calls to the backend API
│   │   ├── App.css          # Styles
│   │   ├── App.jsx          # Main interface (form, list, summary)
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Dev server + proxy to the backend
├── .gitignore
└── README.md
```

## REST API
| Method | Route | Description | Success code |
|--------|-------|-------------|--------------|
| POST   | /api/donors     | Add a donor        | 201 |
| GET    | /api/donors     | List all donors    | 200 |
| GET    | /api/donors/:id | Get one donor      | 200 (404 if missing) |
| PUT    | /api/donors/:id | Update a donor     | 200 (404 if missing) |
| DELETE | /api/donors/:id | Delete a donor     | 200 (404 if missing) |

Invalid data returns `400` with a JSON `{ "error": "..." }` message.

## Database
Table: `donors`

| Column | Type |
|--------|------|
| id | SERIAL, primary key |
| full_name | VARCHAR(100), required |
| age | INTEGER, 16 to 65 |
| blood_type | VARCHAR(3), one of A+, A-, B+, B-, AB+, AB-, O+, O- |
| contact_number | VARCHAR(20), required |
| address | VARCHAR(200) |
| last_donation_date | DATE |
| created_at | TIMESTAMP |

## How to Run
1. Install PostgreSQL and create the database (the `donors` table is created automatically when the server starts):
```bash
   psql -U postgres -c "CREATE DATABASE blood_donor_registry;"
```
2. Backend:
```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
```
3. Frontend (new terminal):
```bash
   cd frontend
   npm install
   npm run dev
```
4. Open the link shown in the frontend terminal  http://localhost:5174/ .

## Author
**Mae Angela Faylon**
IDSC Integrative Programming and Technologies (IPT2) Midterm Examination