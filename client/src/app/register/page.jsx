import dynamic from "next/dynamic";

const RegisterPage = dynamic(() => import("../../views/RegisterPage"), { ssr: false });

export default function Page() {
  return <RegisterPage />;
}
