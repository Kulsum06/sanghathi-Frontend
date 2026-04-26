// @mui
import { Box, Card, Container, Divider } from "@mui/material";
import ChatProvider from "../hooks/useChat";
// redux

// components
import Page from "../components/Page";

import ChatWindow from "../components/chat/ChatWindow";
import ChatSidebar from "../components/chat/ChatSidebar";
import useResponsive from "../hooks/useResponsive";

// ----------------------------------------------------------------------

export default function Chat() {
  const isMobile = useResponsive("down", "sm");

  return (
    <Page title="Chat">
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1.5, sm: 3 }, overflowX: "hidden", overflowY: "auto" }}
      >
        <Card
          sx={{
            height: { xs: "calc(100vh - 140px)", sm: "78vh" },
            minHeight: { xs: 520, sm: 620 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            overflow: "hidden",
          }}
        >
          <ChatProvider>
            <Box
              sx={{
                width: { xs: "100%", sm: 340 },
                maxWidth: { xs: "100%", sm: 420 },
                minHeight: { xs: 220, sm: "100%" },
                overflow: "hidden",
              }}
            >
              <ChatSidebar />
            </Box>
            <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem />
            <Box sx={{ flexGrow: 1, minWidth: 0, minHeight: 0 }}>
              <ChatWindow />
            </Box>
          </ChatProvider>
        </Card>
      </Container>
    </Page>
  );
}
