var firebase = require("firebase/app");

require("firebase/database");

var firebaseConfig = {
    apiKey: "AIzaSyClgPzBheXdALDHyyN2RlJuYg55Uw2jWHc",
    authDomain: "urlsh0rtener.firebaseapp.com",
    databaseURL: "https://urlsh0rtener-default-rtdb.firebaseio.com",
    projectId: "urlsh0rtener",
    storageBucket: "urlsh0rtener.appspot.com",
    messagingSenderId: "857724538529",
    appId: "1:857724538529:web:be5aced905f1baeb2f2ae0"
};

firebase.initializeApp(firebaseConfig);

module.exports = firebase 