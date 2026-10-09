import { getMission } from "@/content/missions";
import { requireChild } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import MissionWorkspace from "@/components/mission/MissionWorkspace";
import { starsNeededToUnlock } from "@/lib/missions/gamification";

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await requireChild();
  
  const mission = getMission(id);
  if (!mission) return notFound();

  // Progress logic check (optional, let's keep it simple for now)
  const starsToUnlock = starsNeededToUnlock(mission.level);

  return (
    <MissionWorkspace 
      mission={mission} 
      childId={child.id} 
      starsToUnlock={starsToUnlock}
    />
  );
}

