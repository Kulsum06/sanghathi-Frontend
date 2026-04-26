import axios from "axios";
import { BASE_URL } from "./config";
import trackedFetch from "./utils/trackedFetch";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post(`${BASE_URL}/users/login`, userCredential);
    
    if (userCredential.college) {
      localStorage.setItem("selectedCollege", userCredential.college);
    }
    
    // Store the token in localStorage
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      // Set the Authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
    }
    
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data.data.user });
    return res.data; 
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err });
    throw err;
  }
};

export async function askRag(question) {
  const url = `${BASE_URL}/ask`;
  const res = await trackedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error || data?.detail || JSON.stringify(data);
    throw new Error(`RAG request failed: ${message}`);
  }

  return data.answer;
}

