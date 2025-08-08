"use client";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/IntroSection";
import UpcommingEvents from "@/components/sections/upcommingEvents";
import TrendingEvents from "@/components/sections/trendingEvents";
import Image from "next/image";
import Navbar from "@/components/cards/Navbar";


export default function Home() {
  const handleSearch = (query: string) => {
    // TODO: Implement search logic
    alert(`Search for: ${query}`);
  };

  return (
    <>
      <Navbar isLoggedIn={false} onSearch={handleSearch} />
      <IntroSection />
      <TrendingEvents />
      <UpcommingEvents />
    </>
  );
}