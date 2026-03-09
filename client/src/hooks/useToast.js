import { useState } from "react";

  const [toast, setToast] = useState(null);
  const show = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  return [toast, show];
};

// ─── PUBLIC NAV ───────────────────────────────────────────────────────────────

export default useToast;
