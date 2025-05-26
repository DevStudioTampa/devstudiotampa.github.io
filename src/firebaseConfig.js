// src/firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBhXk4QEZPQvWk5RkNBrzqYvvyKf4f4qg",
  authDomain: "devstudiotampa-3c9da.firebaseapp.com",
  projectId: "devstudiotampa",
  storageBucket: "devstudiotampa-3c9da.appspot.com",
  messagingSenderId: "842447093136",
  appId: "1:842447093136:web:9feaec09793a2ec56bac55"
};

const app = initializeApp(firebaseConfig);

export default app;
