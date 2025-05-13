# Pour Windows (PowerShell)
# Trouver le processus qui utilise le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacez PID par l'ID du processus trouvé)
taskkill /F /PID PID

# Pour Linux/Mac
# Trouver le processus qui utilise le port 3000
lsof -i :3000

# Tuer le processus
kill -9 PID