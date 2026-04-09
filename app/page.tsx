"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

type Task = {
  id: string;
  name: string;
  xp: number;
  done?: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xp, setXP] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*");

    let taskData: Task[] = data ?? [];

    if (taskData.length === 0) {
      await supabase.from("tasks").insert([
        { name: "Gym", xp: 20 },
        { name: "Yocto", xp: 20 },
        { name: "No Porn", xp: 20 },
      ]);

      const res = await supabase.from("tasks").select("*");
      taskData = res.data ?? [];
    }

    setTasks(taskData.map((t) => ({ ...t, done: false })));
  };

  const fetchStats = async () => {
    const { data } = await supabase.from("user_stats").select("*").limit(1);

    if (data && data.length > 0) {
      setStreak(data[0].streak);
    } else {
      // create first row
      await supabase.from("user_stats").insert({
        streak: 0,
      });
    }
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
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .limit(1);

    let currentStreak = 0;
    let lastDate = null;

    if (data && data.length > 0) {
      currentStreak = data[0].streak;
      lastDate = data[0].last_completed_date;
    }

    let newStreak = currentStreak;

    if (xp === 0) {
      newStreak = 0;
      alert("❌ No tasks done. Streak reset.");
    } else {
      if (!lastDate) {
        newStreak = 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toISOString().split("T")[0];

        if (lastDate === yDate) {
          newStreak = currentStreak + 1;
        } else if (lastDate === today) {
          newStreak = currentStreak; // already counted
        } else {
          newStreak = 1; // broke streak
        }
      }
    }

    await supabase.from("user_stats").update({
      streak: newStreak,
      last_completed_date: today,
    });

    setStreak(newStreak);

    await supabase.from("daily_logs").insert({
      date: today,
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