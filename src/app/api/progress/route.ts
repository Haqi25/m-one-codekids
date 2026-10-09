import { requireChild } from "@/lib/session";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getMission, nextMission } from "@/content/missions";
import { computeStars, computeScore, evaluateBadges } from "@/lib/missions/gamification";

export async function POST(request: Request) {
  try {
    const child = await requireChild();
    const fd = await request.formData();
    const missionId = fd.get("missionId") as string;
    const success = fd.get("success") === "true";
    const blocksUsed = parseInt(fd.get("blocksUsed") as string) || 0;
    const hintsUsed = parseInt(fd.get("hintsUsed") as string) || 0;
    const durationSec = 10; // Demo: should come from client tracking

    const mission = getMission(missionId);
    if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });

    // 1. Log Attempt
    await db.attempt.create({
      data: {
        childId: child.id,
        missionId,
        success,
        blocksUsed,
        hintsUsed,
        durationSec,
      }
    });

    // 2. Fetch past attempts & progress to calculate stats
    const pastAttempts = await db.attempt.findMany({
      where: { childId: child.id, missionId },
      orderBy: { createdAt: "asc" }
    });
    const failedAttempts = pastAttempts.filter(a => !a.success).length;
    // maxHintLevel logic will be extracted from ChatLog if Bibi is used
    const maxHintLevel = 0; 

    // 3. Update Progress (only if success, or create initial row)
    let p = await db.progress.findUnique({
      where: { childId_missionId: { childId: child.id, missionId } }
    });

    if (success) {
      const stars = computeStars({ blocksUsed, optimalBlocks: mission.optimalBlocks, failedAttempts, hintsUsed, maxHintLevel });
      const score = computeScore(stars, hintsUsed, failedAttempts);
      
      const isNewBest = !p || score > p.bestScore;
      p = await db.progress.upsert({
        where: { childId_missionId: { childId: child.id, missionId } },
        update: {
          completed: true,
          stars: Math.max(p?.stars || 0, stars),
          bestScore: Math.max(p?.bestScore || 0, score),
          attempts: (p?.attempts || 0) + 1,
          completedAt: p?.completedAt || new Date(),
        },
        create: {
          childId: child.id,
          missionId,
          completed: true,
          stars,
          bestScore: score,
          attempts: failedAttempts + 1,
          hintsUsed,
          completedAt: new Date(),
        }
      });

      // Update attempt with earned stars & score
      const latestAttempt = await db.attempt.findFirst({
        where: { childId: child.id, missionId },
        orderBy: { createdAt: "desc" }
      });
      if (latestAttempt) {
        await db.attempt.update({
          where: { id: latestAttempt.id },
          data: { stars, score }
        });
      }

      // Check Badges
      const allProgress = await db.progress.findMany({ where: { childId: child.id } });
      const earnedBadges = evaluateBadges(allProgress, { success, stars, hintsUsed });
      for (const badgeId of earnedBadges) {
        await db.childBadge.upsert({
          where: { childId_badgeId: { childId: child.id, badgeId } },
          create: { childId: child.id, badgeId },
          update: {} // do nothing if exists
        });
      }

      // Update child lastActiveAt
      await db.childProfile.update({
        where: { id: child.id },
        data: { lastActiveAt: new Date() }
      });

      const next = nextMission(missionId);
      return NextResponse.json({ 
        success: true, 
        stars, 
        score,
        badges: earnedBadges,
        nextMission: next?.id 
      });

    } else {
      // Just update attempts count
      p = await db.progress.upsert({
        where: { childId_missionId: { childId: child.id, missionId } },
        update: { attempts: (p?.attempts || 0) + 1 },
        create: {
          childId: child.id,
          missionId,
          attempts: 1,
          hintsUsed,
        }
      });
      
      // Update child lastActiveAt
      await db.childProfile.update({
        where: { id: child.id },
        data: { lastActiveAt: new Date() }
      });

      return NextResponse.json({ success: true, progress: p });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

