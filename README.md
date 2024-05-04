# Vike Web App

## Getting Started

1. Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) as main package manager

2. Install dependencies

```bash
yarn install
```

3. Runs the app in the development mode.

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any logs, warnings, errors in the console.

Builds the app for production to the `build` folder.<br>

```bash
yarn build
```

It bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

## Features

- React: Main frontend framework with create-react-app
- Firebase: Using authentication, real-time database, and cloud functions.
- ESLint and Prettier: Maintain code quality and consistency.

## Set up Firebase

https://console.firebase.google.com/

- Log in with your Google account.
- Create new project.
- In project root, create a file and name it .env with content below or copy from .env_example

```.env
SENTRY_AUTH_TOKEN=sentrytoken # optional
REACT_APP_FIREBASE_API_KEY=myapikey
REACT_APP_FIREBASE_AUTH_DOMAIN=myauthdomain
REACT_APP_FIREBASE_DATABASE_URL=mydatabaseurl
REACT_APP_FIREBASE_PROJECT_ID=myprojectid
REACT_APP_FIREBASE_STORAGE_BUCKET=mystoragebucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=mymessagingsenderid
```

You should now be setup to use Firebase.
