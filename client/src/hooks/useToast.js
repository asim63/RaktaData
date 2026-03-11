import { useState, useEffect } from "react";

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    return () => {
      if (toast) {
        // cleanup logic here
      }
    };
  }, [toast]);

  return [toast, show];
}

// ─── PUBLIC NAV ───────────────────────────────────────────────────────────────
export default useToast;
