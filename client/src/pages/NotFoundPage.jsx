import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-6">
      <h1 className="font-display font-bold text-8xl md:text-[12rem] text-white/5 select-none leading-none tracking-widest">
        404
      </h1>
      <div className="-mt-8 md:-mt-16">
        <h2 className="font-display font-bold text-3xl md:text-5xl gradient-text tracking-wide">
          Page Not Found
        </h2>
        <p className="font-serif italic text-[#9d8bbb] mt-3 text-sm md:text-base max-w-md mx-auto">
          The page you're looking for has drifted beyond the aura. Let's guide you back.
        </p>
      </div>
      <Link to="/" className="btn-primary mt-2">
        Return to Home
      </Link>
    </div>
  );
}
