import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Setup = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-serif text-2xl text-foreground">Onboarding coming soon ✨</p>
    </div>
  );
};

export default Setup;
