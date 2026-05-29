import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      newLeadsThisWeek,
      qualifiedLeads,
      totalCustomers,
      upcomingAppointments,
      completedAppointments,
      activeWorkflows,
      totalDocuments,
      recentMessages,
      subscription,
    ] = await Promise.all([
      prisma.osLead.count({ where: { businessId } }),
      prisma.osLead.count({ where: { businessId, createdAt: { gte: sevenDaysAgo } } }),
      prisma.osLead.count({ where: { businessId, status: "QUALIFIED" } }),
      prisma.osCustomer.count({ where: { businessId } }),
      prisma.osAppointment.count({
        where: { businessId, startAt: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      }),
      prisma.osAppointment.count({
        where: { businessId, status: "COMPLETED", startAt: { gte: thirtyDaysAgo } },
      }),
      prisma.osWorkflow.count({ where: { businessId, enabled: true } }),
      prisma.osDocument.count({ where: { businessId } }),
      prisma.osMessage.findMany({
        where: { businessId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.osSubscription.findUnique({ where: { businessId } }),
    ]);

    const totalLeadValue = await prisma.osLead.aggregate({
      where: { businessId, status: { in: ["QUALIFIED", "CONTACTED"] } },
      _sum: { value: true },
    });

    const convertedLeads = await prisma.osLead.count({
      where: { businessId, status: "CONVERTED" },
    });

    const recentLeads = await prisma.osLead.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const nextAppointments = await prisma.osAppointment.findMany({
      where: { businessId, startAt: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      include: { lead: true, customer: true },
      orderBy: { startAt: "asc" },
      take: 5,
    });

    return NextResponse.json({
      kpis: {
        totalLeads,
        newLeadsThisWeek,
        qualifiedLeads,
        totalCustomers,
        upcomingAppointments,
        completedAppointments,
        activeWorkflows,
        totalDocuments,
        pipelineValue: totalLeadValue._sum.value ?? 0,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      },
      recentLeads,
      nextAppointments,
      recentMessages,
      subscription,
    });
  } catch (err) {
    console.error("[api/dashboard GET]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
