# Gen-AI Smart College Admin Assistant - Frontend

This directory contains the React.js frontend application for the "Gen-AI Smart College Admin Assistant" project.

## Project Structure

```
frontend/
├── public/             # Static assets (index.html, manifest.json, etc.)
├── src/
│   ├── api/            # API service calls to the backend
│   ├── assets/         # Images, icons, etc.
│   ├── components/     # Reusable UI components
│   │   ├── Auth/       # Login form, authentication context
│   │   ├── Dashboard/  # PDF upload, document form, document preview, timetable form
│   │   ├── History/    # Document history listing
│   │   └── Layout/     # Header, Sidebar
│   ├── hooks/          # Custom React hooks (e.g., useAuth)
│   ├── pages/          # Top-level page components (Login, Dashboard, History)
│   ├── App.js          # Main application component, routing
│   ├── index.css       # Global styles (including Tailwind CSS imports)
│   └── index.js        # Entry point of the React application
├── .env                # Environment variables
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Records exact dependency versions
└── README.md
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project. Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. 

We recommend that you do not use `eject` until you're comfortable with customizing build tools.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
