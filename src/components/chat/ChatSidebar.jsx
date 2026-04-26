import React, { useContext, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import Scrollbar from "../Scrollbar";
import ChatConversationList from "./ChatConversationList";
import ChatContext from "../../context/ChatContext";
import api from "../../utils/axios";

import { TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

import logger from "../../utils/logger.js";
const ChatSearchBar = ({ onSearch = () => {} }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <TextField
      label="Search"
      variant="outlined"
      size="small"
      fullWidth
      sx={{ width: "100%", textAlign: "right" }}
      value={searchValue}
      onChange={handleSearch}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default function ChatSidebar() {
  const { conversations, currentChat, joinChat, leaveChat, setConversations } =
    useContext(ChatContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const { data } = await api.get("/private-conversations/", {
          params: {
            page: 1,
            limit: 100,
          },
        });
        const { conversations } = data.data;
        logger.info(conversations);
        setConversations(conversations);
      } catch (err) {
        logger.info(err);
      }
    };

    getConversations();
  }, []);

  useEffect(() => {
    const filtered = conversations.filter((conversation) =>
      conversation.participants.some(
        (participant) =>
          participant.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase()) &&
          participant.id !== "8864c717-587d-472a-929a-8e5f298024da-0"
      )
    );
    setFilteredConversations(filtered);
  }, [conversations, searchTerm]);

  return (
    <Box
      sx={{
        py: { xs: 1.5, sm: 2 },
        px: { xs: 1.5, sm: 3 },
        height: "100%",
      }}
    >
      <Stack direction="column" sx={{ height: "100%", minHeight: 0 }}>
        <Box sx={{ width: "100%", mt: 1, mb: 1.5 }}>
          <ChatSearchBar onSearch={setSearchTerm} />
        </Box>
        <Scrollbar sx={{ flexGrow: 1, minHeight: 0 }}>
          {searchTerm.length > 0 && filteredConversations.length > 0 && (
            <ChatConversationList
              conversations={filteredConversations}
              activeConversationId={currentChat?.conversationId}
              isOpenSidebar={true}
            />
          )}
          {searchTerm.length === 0 && conversations.length > 0 && (
            <ChatConversationList
              conversations={conversations}
              activeConversationId={currentChat?.conversationId}
              isOpenSidebar={true}
            />
          )}
        </Scrollbar>
      </Stack>
    </Box>
  );
}
