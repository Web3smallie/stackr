import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
          <SearchX className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-display text-6xl font-bold text-foreground mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn't exist. It may have been moved or you typed the wrong URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Launch App
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
