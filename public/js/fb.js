import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBf7XtYcIMSm12nbjhvRvjawSBothTnJeU",
  authDomain: "circat-purrtentio.firebaseapp.com",
  databaseURL: "https://circat-purrtentio-default-rtdb.firebaseio.com",
  projectId: "circat-purrtentio",
  storageBucket: "circat-purrtentio.appspot.com",
  messagingSenderId: "776264403183",
  appId: "1:776264403183:web:985017bb658d078522731a",
  measurementId: "G-N73X30BVQY"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
set("database reached");
