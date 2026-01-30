import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const useInactivityLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    toast.info("Sessão expirada por inatividade. Faça login novamente.");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    // Events that indicate user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    // Throttle activity detection to avoid excessive updates
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledResetTimer = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        resetTimer();
      }, 1000); // Only reset once per second max
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledResetTimer, { passive: true });
    });

    // Check for inactivity on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT) {
          handleLogout();
        } else {
          resetTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [resetTimer, handleLogout]);
};
