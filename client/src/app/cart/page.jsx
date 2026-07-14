import dynamic from "next/dynamic";

const CartPage = dynamic(() => import("../../views/CartPage"), { ssr: false });

export default function Page() {
  return <CartPage />;
}
