import React, { useState } from "react";
import axios from "axios";

import logger from "../../utils/logger.js";
const BASE_URL = import.meta.env.VITE_API_URL;
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Define roleName based on the selected role
    const roleName = role === "student" ? "student" : "admin"; 
  
    try {
      const response = await axios.post(`${BASE_URL}/users/signup`, {
        name,
        email,
        password,
        passwordConfirm,
        role,
        roleName,
      });
      
      <div>
      <h2>Signed up!</h2>
      </div>
      logger.info("User signed up:", response.data);
  
    } catch (error) {
      logger.error("Error during signup:", error);
      setError("Signup failed, please try again.");
    }
  };
  
  

  return (
    <div>
      <h2>Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm">Confirm Password:</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;