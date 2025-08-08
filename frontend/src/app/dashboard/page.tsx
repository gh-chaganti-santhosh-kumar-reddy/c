

"use client";
import { useState, useEffect } from "react";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/IntroSection";
import TrendingEvents from "@/components/sections/trendingEvents";
import UpcommingEvents from "@/components/sections/upcommingEvents";
import Image from "next/image";
import Navbar from "@/components/cards/Navbar";


export default function Home() {

    
     

  const handleSearch = (query: string) => {
    // TODO: Implement search logic
    alert(`Search for: ${query}`);
  };

  return (
    <>
      <Navbar  showCreateEvent={true} onSearch={handleSearch} />
      <IntroSection />
      <UpcommingEvents />
      <TrendingEvents />
      {/* Removed Footer from here as per recent edits */}
      <Footer />
    </>
  );
}