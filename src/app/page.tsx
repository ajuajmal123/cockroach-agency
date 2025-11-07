"use client";
import Header from "@/components/Header.";
import Footer from "@/components/Footer";

import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Work />
      <Process />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
