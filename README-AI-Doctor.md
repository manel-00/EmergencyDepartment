
# 🧠 AI Doctor - Plateforme de Gestion Intelligente des Urgences Médicales

**AI Doctor** est une solution intelligente dédiée à la gestion des urgences médicales. Alliant les dernières technologies web à la puissance de l’intelligence artificielle, la plateforme permet une prise en charge rapide, efficace et personnalisée des patients, tout en améliorant le quotidien du personnel médical.

---

## 🚀 Fonctionnalités Clés

- 🔐 **Gestion sécurisée des utilisateurs** : patients, médecins, administrateurs
- 📹 **Téléconsultations vidéo** en temps réel
- 💳 **Paiement en ligne** des frais médicaux
- 🧬 **Détection intelligente de maladies** à partir des symptômes (IA)
- 🚨 **Système de triage automatisé** basé sur le machine learning
- 💬 **Chatbot médical** pour une assistance instantanée 24/7
- 📂 **Gestion centralisée des documents médicaux** : ordonnances, analyses, rapports
- 🏥 **Gestion des chambres et des lits**
- 📊 **Tableaux de bord dynamiques** pour la visualisation des données médicales
- 🔎 **Historique des consultations** et moteur de recherche avancée
- 🖼️ **Analyse d’imagerie médicale** pour la détection de tumeurs via IA

---

## 🧰 Technologies Utilisées

### Backend

- Node.js + Express.js
- MongoDB
- JWT pour la gestion d’authentification
- Python (intégration des modèles IA/ML)
- Nodemon pour le rechargement à chaud
- Socket.io pour communication temps réel (chat / visioconférence)

### Frontend

- Next.js (React 18+)
- Tailwind CSS / Bootstrap
- Axios pour les appels API
- ApexCharts pour les graphiques et la data visualisation

---

## ⚙️ Installation & Démarrage

### Prérequis

- Node.js >= 18
- npm
- MongoDB (local ou cloud)
- Python 3.x

### Clonage du projet

```bash
git clone https://github.com/TaherBenIsmail/EmergencyDepartment.git
cd EmergencyDepartment
```

### Lancer le backend

```bash
cd backend
npm install
nodemon server.js
```

### Lancer le frontend

```bash
cd ../frontend
npm install
npm run dev   # Accessible sur http://localhost:3001
```

### Lancer le backoffice

```bash
cd ../backoffice
npm install
npm run dev   # Accessible sur http://localhost:3002
```

---

## 🌐 Points d’accès

- 🧑‍⚕️ **Frontend Patients & Médecins** : [http://localhost:3001](http://localhost:3001)
- 🛠️ **Backoffice Administratif** : [http://localhost:3002](http://localhost:3002)
- 🧩 **API Backend** : [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧪 Tests

### Backend

```bash
npm test
```

### Frontend

```bash
npm run test
```

---

## 🗂️ Structure du Projet

```
EmergencyDepartment/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── ml/                 # Modèles IA et ML en Python
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── pages/
│   ├── components/
│   └── public/
├── backoffice/
│   ├── pages/
│   ├── components/
│   └── public/
└── README.md
```

---

## 🤖 Intelligence Artificielle

L'intelligence artificielle est utilisée pour :

- 🩺 Prédire des maladies à partir de symptômes cliniques
- 🚑 Prioriser les patients en urgence (triage intelligent)
- 💬 Répondre automatiquement aux questions via un chatbot médical
- 🧠 Analyser des images médicales pour détecter des anomalies comme les tumeurs

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d’informations.

---

## 🤝 Contribution

1. Fork du dépôt
2. Crée une branche (`git checkout -b feature/NouvelleFonctionnalité`)
3. Commit tes changements (`git commit -m "Ajout d'une nouvelle fonctionnalité"`)
4. Push vers ta branche (`git push origin feature/NouvelleFonctionnalité`)
5. Crée une Pull Request

---
