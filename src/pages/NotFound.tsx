
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-7xl font-display mb-4 text-primary">404</h1>
        <p className="text-xl mb-8">Oops! This part of your adventure map hasn't been discovered yet.</p>
        <Button className="gradient-button group">
          <Link to="/" className="w-full h-full flex items-center justify-center">
            <span className="gradient-button-bg group-hover:opacity-100"></span>
            <span className="gradient-button-text group-hover:translate-y-1">Return to Home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
