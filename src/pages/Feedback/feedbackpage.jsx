import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from "@mui/material";
import api from "../../utils/axios";

export default function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const resp = await api.get("/feedback/all");
        console.log(resp.data); // check what comes here
        setFeedbacks(resp.data.data || []);// <-- use resp.data.data
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ m: 2 }}>
        Feedback Records
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Issues</TableCell>
            <TableCell>Features</TableCell>
            <TableCell>Performance</TableCell>
            <TableCell>Feedback</TableCell>
            <TableCell>Date Given</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbacks.map((fb) => (
            <TableRow key={fb._id}>
              <TableCell>{fb.userId?.name || "Anonymous"}</TableCell>
              <TableCell>{fb.issues}</TableCell>
              <TableCell>{fb.features}</TableCell>
              <TableCell>{fb.performance}</TableCell>
              <TableCell>{fb.feedback}</TableCell>
              <TableCell>
                {new Date(fb.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
