import React, { useState, useEffect } from "react";
import axios from "axios";

const MentorMenteeConversation = ({ mentorId }) => {
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState("");
  const [moocCompleted, setMoocCompleted] = useState(false);
  const [miniProjectCompleted, setMiniProjectCompleted] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch mentees for the mentor
  useEffect(() => {
    axios.get(`/api/mentors/${mentorId}/mentees`)
      .then((res) => setMentees(res.data.data))
      .catch(() => setError("Failed to load mentees"));
  }, [mentorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (summary.trim().length < 30) {
      setError("Summary must be at least 30 characters long.");
      return;
    }

    try {
      await axios.post("/api/conversations", {
        mentorId,
        menteeId: selectedMentee,
        moocCompleted,
        miniProjectCompleted,
        summary,
      });
      setSuccess("Conversation recorded successfully!");
      setSummary("");
      setMoocCompleted(false);
      setMiniProjectCompleted(false);
    } catch {
      setError("Failed to create conversation.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Mentor-Mentee Conversation</h2>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Select Mentee</label>
        <select
          value={selectedMentee}
          onChange={(e) => setSelectedMentee(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        >
          <option value="">-- Select Mentee --</option>
          {mentees.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Check Completed Items</label>
          <div>
            <label className="mr-4">
              <input
                type="checkbox"
                checked={moocCompleted}
                onChange={() => setMoocCompleted(!moocCompleted)}
              />{" "}
              MOOC Completed
            </label>
            <label>
              <input
                type="checkbox"
                checked={miniProjectCompleted}
                onChange={() => setMiniProjectCompleted(!miniProjectCompleted)}
              />{" "}
              Mini Project Completed
            </label>
          </div>
        </div>

        <label className="block mb-2">Conversation Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter at least 30 characters..."
          className="w-full border p-2 rounded h-24 mb-4"
          required
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MentorMenteeConversation;
