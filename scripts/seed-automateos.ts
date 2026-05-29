import { PrismaClient, AgentType, LeadStatus, ApptStatus, DocStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AutomateOS demo data...");

  // Clean up existing AutomateOS data
  await prisma.auditLog.deleteMany({});
  await prisma.extractedDocumentData.deleteMany({});
  await prisma.osDocument.deleteMany({});
  await prisma.trainingModule.deleteMany({});
  await prisma.osWorkflow.deleteMany({});
  await prisma.osMessage.deleteMany({});
  await prisma.osAppointment.deleteMany({});
  await prisma.osLead.deleteMany({});
  await prisma.osCustomer.deleteMany({});
  await prisma.businessAgent.deleteMany({});
  await prisma.osSubscription.deleteMany({});
  await prisma.osUser.deleteMany({});
  await prisma.osBusiness.deleteMany({});

  // Create business
  const business = await prisma.osBusiness.create({
    data: {
      id: process.env.DEMO_BUSINESS_ID ?? "demo-business-001",
      name: "Cool Air HVAC",
      industry: "HVAC Services",
      description: "Residential and commercial HVAC installation, maintenance, and repair.",
      website: "https://coolair.example.com",
      phone: "(555) 867-5309",
      address: "1234 Main St, Dallas, TX 75201",
    },
  });

  // Create owner user
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.osUser.create({
    data: {
      email: "demo@automateos.com",
      name: "Alex Rivera",
      passwordHash,
      role: "OWNER",
      businessId: business.id,
    },
  });

  // Enable all 5 agents
  const agentTypes: AgentType[] = [
    "RECEPTIONIST",
    "SALES_FOLLOWUP",
    "SUPPORT",
    "DOCUMENT",
    "TRAINING",
  ];
  for (const agentType of agentTypes) {
    await prisma.businessAgent.create({
      data: { businessId: business.id, agentType, enabled: true },
    });
  }

  // Create subscription
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.osSubscription.create({
    data: {
      businessId: business.id,
      tier: "PROFESSIONAL",
      status: "ACTIVE",
      currentPeriodEnd: periodEnd,
    },
  });

  // Create leads
  const leadData = [
    { name: "Maria Santos", email: "maria@gmail.com", phone: "(555) 111-2222", company: "", status: "NEW" as LeadStatus, source: "Website", value: 850 },
    { name: "James Walker", email: "james.w@email.com", phone: "(555) 333-4444", company: "Walker Realty", status: "CONTACTED" as LeadStatus, source: "Referral", value: 3200 },
    { name: "Priya Patel", email: "priya@startupco.com", phone: "(555) 555-6666", company: "Startup Co", status: "QUALIFIED" as LeadStatus, source: "Google Ads", value: 12000 },
    { name: "Tom Nguyen", email: "tom.n@yahoo.com", phone: "(555) 777-8888", company: "", status: "CONVERTED" as LeadStatus, source: "Website", value: 1500 },
    { name: "Laura Kim", email: "l.kim@business.com", phone: "(555) 999-0000", company: "Kim Properties", status: "CONTACTED" as LeadStatus, source: "Cold Call", value: 5500 },
    { name: "Derek Jones", email: "derek@dj.net", phone: "(555) 222-3333", company: "", status: "NEW" as LeadStatus, source: "Facebook", value: 700 },
    { name: "Sandra Cruz", email: "sandra.c@email.com", phone: "(555) 444-5555", company: "Cruz Dental", status: "QUALIFIED" as LeadStatus, source: "Referral", value: 8900 },
    { name: "Mike Thompson", email: "mthompson@corp.com", phone: "(555) 666-7777", company: "Thompson Corp", status: "LOST" as LeadStatus, source: "Website", value: 2200 },
  ];
  const leads = await Promise.all(
    leadData.map((d) => prisma.osLead.create({ data: { businessId: business.id, ...d } }))
  );

  // Create customers
  await prisma.osCustomer.createMany({
    data: [
      { businessId: business.id, name: "Carlos Mendez", email: "carlos@home.com", phone: "(555) 123-4567", company: "", notes: "Loyal customer, annual maintenance plan." },
      { businessId: business.id, name: "Beth Sullivan", email: "beth.s@email.com", phone: "(555) 234-5678", company: "Sullivan Cafe", notes: "Commercial unit, quarterly service." },
      { businessId: business.id, name: "Ryan Park", email: "rpark@realty.com", phone: "(555) 345-6789", company: "Park Real Estate", notes: "Multiple properties." },
    ],
  });

  // Create appointments
  const now = new Date();
  const apptData = [
    {
      title: "AC Installation - Maria Santos",
      leadId: leads[0].id,
      startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      status: "SCHEDULED" as ApptStatus,
    },
    {
      title: "Annual Maintenance - Priya Patel",
      leadId: leads[2].id,
      startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: "CONFIRMED" as ApptStatus,
    },
    {
      title: "System Inspection - James Walker",
      leadId: leads[1].id,
      startAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      status: "COMPLETED" as ApptStatus,
    },
    {
      title: "Emergency Repair - Laura Kim",
      leadId: leads[4].id,
      startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      status: "SCHEDULED" as ApptStatus,
    },
  ];
  for (const appt of apptData) {
    await prisma.osAppointment.create({ data: { businessId: business.id, ...appt } });
  }

  // Create workflows
  await prisma.osWorkflow.createMany({
    data: [
      {
        businessId: business.id,
        name: "New Lead Follow-Up",
        trigger: "New lead captured via website form",
        action: "Send AI-drafted follow-up email within 5 minutes",
        enabled: true,
        runCount: 42,
        lastRunAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        businessId: business.id,
        name: "Appointment Reminder",
        trigger: "24 hours before scheduled appointment",
        action: "Send SMS reminder to customer",
        enabled: true,
        runCount: 18,
        lastRunAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Create documents
  const doc1 = await prisma.osDocument.create({
    data: {
      businessId: business.id,
      name: "Service Contract - Q1 2026.pdf",
      fileType: "application/pdf",
      fileSize: 84230,
      status: "DONE" as DocStatus,
      text: "Service contract between Cool Air HVAC and Priya Patel for annual maintenance.",
    },
  });
  await prisma.extractedDocumentData.createMany({
    data: [
      { documentId: doc1.id, fieldName: "Client Name", fieldValue: "Priya Patel", confidence: 0.98 },
      { documentId: doc1.id, fieldName: "Contract Start Date", fieldValue: "2026-01-15", confidence: 0.95 },
      { documentId: doc1.id, fieldName: "Contract Value", fieldValue: "$8,900", confidence: 0.99 },
      { documentId: doc1.id, fieldName: "Service Type", fieldValue: "Annual Maintenance Plan", confidence: 0.97 },
    ],
  });
  const doc2 = await prisma.osDocument.create({
    data: {
      businessId: business.id,
      name: "Invoice #2847.pdf",
      fileType: "application/pdf",
      fileSize: 21540,
      status: "DONE" as DocStatus,
      text: "Invoice for HVAC installation at 456 Oak Ave.",
    },
  });
  await prisma.extractedDocumentData.createMany({
    data: [
      { documentId: doc2.id, fieldName: "Invoice Number", fieldValue: "#2847", confidence: 1.0 },
      { documentId: doc2.id, fieldName: "Amount Due", fieldValue: "$3,200", confidence: 0.99 },
      { documentId: doc2.id, fieldName: "Due Date", fieldValue: "2026-06-15", confidence: 0.96 },
      { documentId: doc2.id, fieldName: "Service Address", fieldValue: "456 Oak Ave, Dallas TX", confidence: 0.94 },
    ],
  });

  // Create training modules
  await prisma.trainingModule.createMany({
    data: [
      {
        businessId: business.id,
        title: "HVAC Safety Protocols & First Day Onboarding",
        content: `# Welcome to Cool Air HVAC\n\n## Safety First\n- Always wear PPE: gloves, safety glasses, steel-toe boots\n- Never work on live electrical components without lockout/tagout\n- Keep vehicles clean and organized\n\n## Customer Service\n- Greet customers professionally\n- Always show your ID badge\n- Explain work before starting\n\n## Scheduling\n- Check the app for your daily appointments by 7am\n- Call customers 30 min before arrival\n- Update appointment status after each job`,
      },
      {
        businessId: business.id,
        title: "Common HVAC Issues & Troubleshooting Guide",
        content: `# Troubleshooting Guide\n\n## Unit Not Cooling\n1. Check thermostat settings\n2. Inspect air filter (replace if dirty)\n3. Check circuit breaker\n4. Inspect refrigerant levels\n5. Check condenser coils for blockage\n\n## Strange Noises\n- Banging: loose or broken part\n- Squealing: belt or bearing issue\n- Clicking: relay problem\n\n## High Energy Bills\n- Check for refrigerant leaks\n- Inspect ductwork for leaks\n- Recommend insulation upgrade if needed`,
      },
    ],
  });

  console.log("✅ AutomateOS demo data seeded successfully.");
  console.log(`   Business: ${business.name} (ID: ${business.id})`);
  console.log("   Login: demo@automateos.com / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
