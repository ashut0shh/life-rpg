"use client";
import { useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([
    { name: "Gym", xp: 20, done: false },
    { name: "Yocto", xp: 20, done: false },
    { name: "No Porn", xp: 20, done: false },
  ]);

  const toggle = (i: number) => {
    const t = [...tasks];
    t[i].done = !t[i].done;
    setTasks(t);
  };

  const xp = tasks
    .filter(t => t.done)
    .reduce((sum, t) => sum + t.xp, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Life RPG</h1>

      <h2 className="mt-4 text-xl">XP: {xp}</h2>
      <h3 className="text-lg">Level: {Math.floor(xp / 100)}</h3>

      <div className="mt-4 space-y-2">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={() => toggle(i)}
            />
            <span>{t.name} (+{t.xp})</span>
          </div>
        ))}
      </div>
    </div>
  );
}