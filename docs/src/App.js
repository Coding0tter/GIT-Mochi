import React from "react";
import "./styles.css";
import { MochiBlob } from "./components/Mochi";
import Card from "./components/Card";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0c6c6] to-[var(--color-mauve)]">
      <MochiBlob />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-center items-center mb-16">
          <img src="/logo.svg" alt="Mochi Logo" width={120} height={40} />
        </header>
        <main>
          <section className="hero text-center mb-24">
            <h1 className="text-5xl font-bold mb-6 text-[var(--color-mauve)]">
              Effortless Task Management, Made Sweet
            </h1>
            <p className="text-xl mb-8 text-[var(--color-subtext1)] max-w-2xl mx-auto">
              Say goodbye to cluttered workflows. Mochi is your streamlined,
              keyboard-first Kanban tool, designed to make productivity feel
              intuitive and rewarding.
            </p>
            <a
              href="https://github.com/Coding0tter/GIT-Mochi"
              className="cursor-pointer bg-[#f0c6c6] text-[var(--color-text)] px-8 py-3 rounded-full text-lg hover:bg-[#eed49f] transition-colors"
            >
              Get Mochi Now
            </a>
          </section>
          <section className="features mb-24">
            <h2 className="text-3xl font-semibold text-center mb-12 text-[var(--color-mauve)]">
              Features That Boost Your Productivity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card
                title="Effortless Navigation"
                description="Navigate tasks and boards with lightning-fast keyboard shortcuts. Achieve more, minus the hassle."
                icon="navigation"
              />
              <Card
                title="Seamless Task Management"
                description="Create, organize, and move tasks effortlessly, enhancing your workflow with unparalleled simplicity."
                icon="tasks"
              />
              <Card
                title="Personalized to Perfection"
                description="Customize shortcuts and features to align with your unique needs. Mochi adapts to you, not the other way around."
                icon="customize"
              />
              <Card
                title="Distraction-Free Focus"
                description="Immerse yourself in a tranquil, distraction-free workspace that keeps you calm and productive."
                icon="zen"
              />
              <Card
                title="Precision Sorting"
                description="Organize and filter tasks effortlessly with intuitive keyboard-driven sorting for ultimate clarity."
                icon="filter"
              />
              <Card
                title="Real-Time Sync"
                description="Stay in sync with your team or devices. Every change updates in real time, ensuring you're always on track."
                icon="sync"
              />
            </div>
          </section>
          <section className="cta bg-[var(--color-surface0)] rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-semibold mb-6 text-[var(--color-mauve)]">
              Elevate Your Workflow Today
            </h2>
            <p className="text-xl mb-8 text-[var(--color-subtext1)] max-w-2xl mx-auto">
              Join a community of productivity enthusiasts who value efficiency
              and simplicity. Experience Mochi. Your ultimate keyboard-driven
              task management tool, perfect for those who love the control and
              elegance of Vim.
            </p>
          </section>
        </main>
        <footer className="mt-24 text-center text-[var(--color-subtext0)]">
          <p>&copy; 2024 Mochi. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
