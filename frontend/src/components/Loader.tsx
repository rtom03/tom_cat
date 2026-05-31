import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin w-5 h-5" />
    </div>
  );
};

export default Loader;
