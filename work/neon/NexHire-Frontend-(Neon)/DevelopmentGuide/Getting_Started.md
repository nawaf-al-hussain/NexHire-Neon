# Running the Project

### Backend
```bash
cd server
node index.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### Check connection string
[.env](file:///c:/Users/Hp%20ENVY%20X360%202%20in%201/Desktop/NexHire-Frontend/server/.env) in `/server`:
```
DB_CONNECTION_STRING=Driver={SQL Server Native Client 11.0};Server=LAPTOP-XXXX\SQLEXPRESS;Database=RecruitmentDB;Trusted_Connection=Yes;
```
Adjust `Server=` to your machine name (run `SELECT @@SERVERNAME` in SSMS).

### Health check
```
GET http://localhost:5000/api/status
```
