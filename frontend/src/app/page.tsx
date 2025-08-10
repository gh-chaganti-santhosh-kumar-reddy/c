"use client";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/intro-section";
import UpcommingEvents from "@/components/sections/upcoming-events";
import TrendingEvents from "@/components/sections/trending-events";
import Image from "next/image";
import Navbar from "@/components/cards/navbar";


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