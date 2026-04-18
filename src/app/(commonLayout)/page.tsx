import HeaderTabItems from "@/components/commonLayout/header/HeaderTabItems";
import Banner from "@/components/commonLayout/home/Banner";
import NavItems from "@/components/commonLayout/home/NavItems";


export default function Home() {
  return (
    <main className="min-h-screen space-y-3">
      <div className="py-1 px-2 bg-linear-to-b border-radius-none from-[#a79556] via-[#695f37]">
        <Banner />
      </div>
      <NavItems />
      <HeaderTabItems />
    </main>
  );
}