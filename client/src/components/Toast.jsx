import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiCheckCircle, FiAlertTriangle, FiX } from "react-icons/fi";
import { hideToast } from "../store/slices/uiSlice";

export default function Toast() {
  const dispatch = useDispatch();
  const { toast } = useSelector((state) => state.ui);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, dispatch]);

  if (!toast.visible) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-24 right-4 md:right-8 z-[9999] animate-slide-in font-sans text-xs max-w-sm w-full sm:w-80">
      <div className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md shadow-lg ${
        isSuccess
          ? "bg-green-500/10 border-green-500/20 text-green-300"
          : "bg-rose-500/10 border-rose-500/20 text-rose-300"
      }`}>
        <span className="text-base mt-0.5">
          {isSuccess ? <FiCheckCircle className="text-green-400" /> : <FiAlertTriangle className="text-rose-400" />}
        </span>
        <div className="flex-grow">
          <p className="font-semibold text-white uppercase tracking-wider text-[9px] mb-0.5">
            {isSuccess ? "Action Successful" : "Notification Alert"}
          </p>
          <p className="text-[#e2d8f0] leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={() => dispatch(hideToast())}
          className="text-white/60 hover:text-white transition-colors"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
}
