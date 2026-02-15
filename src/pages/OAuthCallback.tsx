import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Setup the listener first to catch any events immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth State Change:", event, session);

        if (event === "SIGNED_IN" && session) {
          await handleSession(session);
        } else if (event === "SIGNED_OUT") {
          // If we get a signed out event on the callback page, something might be wrong, 
          // but we'll wait for the getSession check to confirm.
          console.log("User signed out during callback");
        }
      }
    );

    // 2. Check for existing session (in case we missed the event or it was already processed)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setError(error.message);
          return;
        }

        if (session) {
          console.log("Session found immediately:", session);
          await handleSession(session);
        } else {
          // If no session found, and we have a hash, Supabase might still be processing it.
          // The onAuthStateChange listener above should catch it.
          console.log("No session found immediately, waiting for auth event...");

          // Fallback: If after 3 seconds we still don't have a session, try one more time or show error
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              await handleSession(retrySession);
            } else {
              console.warn("Session retrieval timeout");
              // We don't strictly redirect here to avoid loops, but we show a message
              // if the URL looks like it should have worked.
              if (window.location.hash.includes("access_token")) {
                setError("Could not retrieve session from URL. Please try logging in again.");
              } else {
                navigate("/login", { replace: true });
              }
            }
          }, 4000);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError(err.message || "An unexpected error occurred");
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSession = async (session: any) => {
    try {
      // Check for profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, first_name")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        // Continue anyway, maybe to welcome or username
      }

      if (profile?.username) {
        navigate("/home", { replace: true });
      } else if (profile?.first_name) {
        navigate("/username", { replace: true });
      } else {
        navigate("/welcome", { replace: true });
      }
    } catch (err) {
      console.error("Navigation logic error:", err);
      navigate("/welcome", { replace: true });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-destructive font-bold mb-2">Authentication Error</div>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        Completing sign in...
      </p>
    </div>
  );
};

export default OAuthCallback;
