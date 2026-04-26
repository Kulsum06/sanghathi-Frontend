import { Container } from "@mui/material";
import Page from "../../components/Page";
import UserList from "../Users/UserList";
import { useNavigate } from "react-router-dom";

export default function ViewUsers() {
  const navigate = useNavigate();

  const handleEdit = (user) => {
    if (user.roleName === "student") {
      // Navigate to student profile with admin edit mode
      navigate(`/student/profile/${user._id}?adminEdit=true`);
    }
  };

  return (
    <Page title="View Users">
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <UserList onEdit={handleEdit} />
      </Container>
    </Page>
  );
}