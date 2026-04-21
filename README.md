# AKI Gym Management System

A desktop gym management app built with Electron.js.

---

## Project Structure

```
gym-management/
├── src/
│   ├── main/           # Electron main process
│   │   └── main.js
│   ├── renderer/       # UI (frontend)
│   │   ├── index.html
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── js/
│   │       └── renderer.js
│   └── preload/        # Secure IPC bridge
│       └── preload.js
├── assets/             # Icons, images
├── data/               # Local database (app.db)
├── dist/               # Built output (git-ignored)
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the app
```bash
npm start
```

---

## MySQL Integration

All database calls are centralized in `src/renderer/js/renderer.js`.
Look for `// TODO: MySQL` comments — each one shows exactly which
`window.electronAPI` call to swap in when your MySQL backend is ready.

The IPC handlers for those calls go in `src/main/main.js`, and the
bridge methods are pre-declared in `src/preload/preload.js`.

### Suggested MySQL setup
```sql
CREATE DATABASE aki_gym;
USE aki_gym;

CREATE TABLE members (
  id           VARCHAR(10) PRIMARY KEY,
  fname        VARCHAR(100) NOT NULL,
  lname        VARCHAR(100) NOT NULL,
  email        VARCHAR(255),
  phone        VARCHAR(50),
  service_id   VARCHAR(10),
  status       ENUM('active', 'inactive', 'on-hold') DEFAULT 'active',
  joined       DATE,
  next_billing DATE,
  emergency    VARCHAR(255)
);

CREATE TABLE invoices (
  id          VARCHAR(10) PRIMARY KEY,
  member_id   VARCHAR(10),
  member_name VARCHAR(255),
  service_id  VARCHAR(10),
  amount      DECIMAL(10,2),
  due_date    DATE,
  status      ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);
```

---

## Services

All AKI Boxing plans are defined in `renderer.js` under `AKI_SERVICES`.
No backend needed for services — they are managed in code.
