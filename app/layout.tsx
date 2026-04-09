"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    let { data } = await supabase.from("tasks").select("*");

    if (!data || data.length === 0) {
      await supabase.from("tasks").insert([
        { name: "Gym", xp: 20 },
        { name: "Yocto", xp: 20 },
        { name: "No Porn", xp: 20 },
      ]);

      let res = await supabase.from("tasks").select("*");
      data = res.data;
    }

    setTasks(data.map((t) => ({ ...t, done: false })));
  };

  const toggle = (i: number) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);

    const total = updated
      .filter((t) => t.done)
      .reduce((sum, t) => sum + t.xp, 0);

    setXP(total);
  };

  const saveDay = async () => {
    if (xp === 0) {
      alert("❌ No tasks done. Streak reset.");
      setStreak(0);
    } else {
      setStreak(streak + 1);
    }

    await supabase.from("daily_logs").insert({
      date: new Date().toISOString(),
      xp: xp,
    });

    alert("Day saved 🔥");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Life RPG</h1>

      <h2 className="mt-4 text-xl">XP: {xp}</h2>
      <h3 className="text-lg">Level: {Math.floor(xp / 100)}</h3>
      <h3 className="text-lg">🔥 Streak: {streak}</h3>

      <div className="mt-4 space-y-2">
        {tasks.map((t, i) => (
          <div key={t.id} className="flex gap-2">
            <input type="checkbox" onChange={() => toggle(i)} />
            <span>
              {t.name} (+{t.xp})
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={saveDay}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        End Day
      </button>
    </div>
  );
}