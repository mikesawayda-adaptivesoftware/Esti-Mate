# 🃏 Esti-Mate

**Esti-Mate** is a sleek, real-time Planning Poker application designed for Agile teams to estimate tasks efficiently and collaboratively. Built with Angular and Firebase, it provides a seamless experience for distributed teams to reach consensus with a touch of fun.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)

---

## ✨ Features

- 👥 **Real-time Collaboration**: Join rooms and see teammate's votes instantly via Firebase Firestore.
- 🎯 **Fibonacci Estimation**: Standard Fibonacci scale for agile estimation.
- 🎉 **Consensus Celebrations**: Automated confetti and fireworks when the team reaches a unanimous decision!
- 📱 **Responsive Design**: Works great on desktops, tablets, and mobile devices.
- 🔐 **Unique Room Codes**: Easy to create and join specific estimation sessions with 6-digit codes.

## 🚀 Tech Stack

- **Frontend**: [Angular v21](https://angular.dev/)
- **Backend/Real-time**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Styling**: SCSS
- **Animations**: [canvas-confetti](https://github.com/catdad/canvas-confetti), [fireworks-js](https://github.com/crashmax-dev/fireworks-js)
- **Testing**: [Vitest](https://vitest.dev/)
- **Deployment**: [Docker](https://www.docker.com/) & Nginx

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+)
- npm (v10+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/msawayda/Esti-Mate.git
   cd Esti-Mate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Firebase Configuration

The project requires a Firebase project for real-time functionality.

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database**.
3. Create a Web App in your Firebase project.
4. Copy your Firebase configuration.
5. Update the environment files:
   - `src/environments/environment.ts` (for development)
   - `src/environments/environment.prod.ts` (for production)

Example configuration structure:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  }
};
```

## 💻 Development

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

```bash
npm start
```

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 🏗️ Building

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
npm run build
```

### Docker

You can also run the application using Docker:

1. Build the Docker image:
   ```bash
   docker build -t esti-mate .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:80 esti-mate
   ```

## 🧪 Testing

### Unit Tests

To execute the unit tests via [Vitest](https://vitest.dev/):

```bash
npm test
```

---

Developed with ❤️ for Agile Teams.
