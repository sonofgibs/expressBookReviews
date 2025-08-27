const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return !(validusers.length == 0);
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.query.review;
    const isbn = req.params.isbn;
    const user = req.session.authorization.username;
  // check if review with same user and isbn exists
  // if so, update existing
    const reviews = books[isbn].reviews
    if(user){
        if (review){
        if(user in reviews){
            reviews[user] = review;
            return res.status(200).send("Review successfully modified.");
        } else{
            //if not, add review
            books[isbn].reviews[user] = review;
            return res.status(200).send("Review successfully added.");
        } 
    } else{
         return res.status(404).json({message: "Please add a review message"});
    }
    }
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;