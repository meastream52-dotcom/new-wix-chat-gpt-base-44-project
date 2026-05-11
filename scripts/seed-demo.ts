/**
 * Demo seed script — populates the database with realistic Evidence AI data
 * for the Kickstarter demo without requiring OpenAI/Neo4j/Redis.
 *
 * Usage:  npx tsx scripts/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARILYN_DOC = {
  id: "doc-marilyn-001",
  title: "FBI Field Report — Monroe, Marilyn (1962-08-05)",
  source: "FBI FOIA Release — File 62-108473",
  caseTag: "marilyn-monroe",
  text: `FEDERAL BUREAU OF INVESTIGATION
Memorandum
TO: Director, FBI
FROM: SAC, Los Angeles
DATE: August 5, 1962
RE: MARILYN MONROE — DEATH INVESTIGATION

Subject Marilyn Monroe was found deceased at her residence at 12305 Fifth Helena Drive, Brentwood, California at approximately 3:35 AM on August 5, 1962. The Los Angeles Police Department responded to the scene at 4:25 AM. Dr. Ralph Greenson, Monroe's psychiatrist, arrived at the residence at approximately 3:30 AM and confirmed her death.

A bottle of Nembutal (pentobarbital) was found on the nightstand. The bottle, originally containing 50 capsules, was empty. Additional bottles of prescription medications were found nearby. The housekeeper, Eunice Murray, stated she discovered the body at approximately 3:00 AM after noticing lights on in Monroe's bedroom and receiving no response to knocking.

The coroner's office placed the time of death between 8:00 PM and 10:00 PM on the night of August 4, 1962. This estimate conflicts with the reported discovery time of 3:00 AM by the housekeeper. Peter Lawford, brother-in-law of President John F. Kennedy, stated he spoke with Monroe by telephone at approximately 7:45 PM on August 4, 1962.

Blood toxicology results showed chloral hydrate at 8.0 mg% and pentobarbital at 4.5 mg% — levels described by the coroner as consistent with a lethal overdose. No needle marks were found on the body. The official cause of death was ruled probable suicide by acute barbiturate poisoning.`,
};

const MARILYN_CLAIMS = [
  { text: "Marilyn Monroe was found deceased at 12305 Fifth Helena Drive, Brentwood, California.", confidence: 0.97, status: "ACCEPTED", timeRef: "August 5, 1962", entities: ["Marilyn Monroe", "Brentwood", "California"] },
  { text: "The Los Angeles Police Department responded to the scene at 4:25 AM.", confidence: 0.92, status: "ACCEPTED", timeRef: "4:25 AM, August 5, 1962", entities: ["Los Angeles Police Department"] },
  { text: "Dr. Ralph Greenson arrived at the residence at approximately 3:30 AM.", confidence: 0.88, status: "ACCEPTED", timeRef: "3:30 AM", entities: ["Dr. Ralph Greenson", "12305 Fifth Helena Drive"] },
  { text: "An empty bottle of Nembutal (pentobarbital) was found on the nightstand.", confidence: 0.95, status: "ACCEPTED", timeRef: null, entities: ["Nembutal", "pentobarbital"] },
  { text: "Eunice Murray stated she discovered the body at approximately 3:00 AM.", confidence: 0.85, status: "ACCEPTED", timeRef: "3:00 AM", entities: ["Eunice Murray"] },
  { text: "The coroner placed the time of death between 8:00 PM and 10:00 PM on August 4, 1962.", confidence: 0.90, status: "ACCEPTED", timeRef: "8:00 PM – 10:00 PM, August 4, 1962", entities: ["coroner"] },
  { text: "Peter Lawford stated he spoke with Monroe by telephone at approximately 7:45 PM on August 4.", confidence: 0.82, status: "ACCEPTED", timeRef: "7:45 PM, August 4, 1962", entities: ["Peter Lawford", "Marilyn Monroe", "John F. Kennedy"] },
  { text: "Blood toxicology showed chloral hydrate at 8.0 mg% and pentobarbital at 4.5 mg%.", confidence: 0.96, status: "ACCEPTED", timeRef: null, entities: ["chloral hydrate", "pentobarbital"] },
  { text: "No needle marks were found on Monroe's body.", confidence: 0.94, status: "ACCEPTED", timeRef: null, entities: ["Marilyn Monroe"] },
  { text: "The official cause of death was ruled probable suicide by acute barbiturate poisoning.", confidence: 0.93, status: "ACCEPTED", timeRef: null, entities: ["barbiturate", "Los Angeles coroner"] },
  { text: "The housekeeper noticed lights in Monroe's bedroom and received no response to knocking.", confidence: 0.78, status: "WEAK", timeRef: null, entities: ["Eunice Murray", "Marilyn Monroe"] },
  { text: "The discovery time reported by Murray (3:00 AM) conflicts with the coroner's estimated death window (8–10 PM).", confidence: 0.72, status: "WEAK", timeRef: null, entities: ["Eunice Murray"] },
];

const JFK_DOC = {
  id: "doc-jfk-001",
  title: "Warren Commission Report — Summary of Findings (1964)",
  source: "Warren Commission — Report of the President's Commission on the Assassination",
  caseTag: "jfk",
  text: `WARREN COMMISSION — SUMMARY OF PRINCIPAL FINDINGS

President John F. Kennedy was assassinated on November 22, 1963, in Dealey Plaza, Dallas, Texas, at 12:30 PM CST. The presidential motorcade was traveling along Elm Street when three shots were fired from the Texas School Book Depository building located at 411 Elm Street.

Lee Harvey Oswald, a 24-year-old former Marine who had defected to the Soviet Union in 1959 and returned to the United States in 1962, was identified as the lone assassin. Oswald fired three shots from the sixth floor, southeast corner window of the Depository using a Mannlicher-Carcano rifle.

The first shot missed. The second shot struck both President Kennedy and Governor John Connally — the "single bullet theory" — entering Kennedy's upper back, exiting his throat, then wounding Connally in his back, wrist, and thigh. The third shot struck Kennedy in the head at 12:30:10 PM, causing the fatal wound.

Oswald was apprehended at the Texas Theatre in the Oak Cliff neighborhood of Dallas at 1:50 PM. He was charged with the murders of President Kennedy and Dallas Police Officer J.D. Tippit, who was shot at approximately 1:15 PM.

On November 24, 1963, at 11:21 AM, Lee Harvey Oswald was fatally shot by Jack Ruby in the basement of Dallas Police Headquarters during a transfer to the county jail.

The Commission concluded that Oswald acted alone and found no credible evidence of a conspiracy, foreign or domestic.`,
};

const JFK_CLAIMS = [
  { text: "President Kennedy was assassinated on November 22, 1963 in Dealey Plaza, Dallas, Texas.", confidence: 0.99, status: "ACCEPTED", timeRef: "November 22, 1963, 12:30 PM CST", entities: ["John F. Kennedy", "Dealey Plaza", "Dallas", "Texas"] },
  { text: "Three shots were fired from the Texas School Book Depository at 411 Elm Street.", confidence: 0.92, status: "ACCEPTED", timeRef: "12:30 PM CST", entities: ["Texas School Book Depository", "Elm Street"] },
  { text: "Lee Harvey Oswald was a 24-year-old former Marine who defected to the Soviet Union in 1959.", confidence: 0.95, status: "ACCEPTED", timeRef: "1959", entities: ["Lee Harvey Oswald", "Soviet Union"] },
  { text: "Oswald fired from the sixth floor southeast corner window using a Mannlicher-Carcano rifle.", confidence: 0.87, status: "ACCEPTED", timeRef: null, entities: ["Lee Harvey Oswald", "Mannlicher-Carcano"] },
  { text: "The second shot struck both Kennedy and Governor Connally (single bullet theory).", confidence: 0.80, status: "WEAK", timeRef: null, entities: ["John F. Kennedy", "John Connally"] },
  { text: "The fatal headshot struck Kennedy at 12:30:10 PM.", confidence: 0.88, status: "ACCEPTED", timeRef: "12:30:10 PM, November 22, 1963", entities: ["John F. Kennedy"] },
  { text: "Oswald was apprehended at the Texas Theatre in Oak Cliff, Dallas at 1:50 PM.", confidence: 0.96, status: "ACCEPTED", timeRef: "1:50 PM, November 22, 1963", entities: ["Lee Harvey Oswald", "Texas Theatre", "Oak Cliff"] },
  { text: "Dallas Police Officer J.D. Tippit was shot at approximately 1:15 PM.", confidence: 0.94, status: "ACCEPTED", timeRef: "1:15 PM", entities: ["J.D. Tippit", "Dallas Police"] },
  { text: "Jack Ruby fatally shot Oswald at 11:21 AM on November 24, 1963 in Dallas Police Headquarters.", confidence: 0.98, status: "ACCEPTED", timeRef: "11:21 AM, November 24, 1963", entities: ["Jack Ruby", "Lee Harvey Oswald", "Dallas Police Headquarters"] },
  { text: "The Warren Commission concluded Oswald acted alone with no credible evidence of conspiracy.", confidence: 0.91, status: "ACCEPTED", timeRef: "1964", entities: ["Warren Commission", "Lee Harvey Oswald"] },
];

const THEORY = {
  id: "theory-marilyn-001",
  title: "Conflicting timeline suggests undisclosed delay in reporting",
  description: "The gap between the coroner's estimated death window (8–10 PM) and the housekeeper's reported discovery time (3 AM) — a 5+ hour discrepancy — suggests Monroe's death was not immediately reported to authorities.",
  claimIds: ["claim-marilyn-003", "claim-marilyn-005", "claim-marilyn-006"],
  score: 0.67,
  scoreBreakdown: {
    supportRatio: 0.75,
    contradictionRatio: 0.20,
    avgConfidence: 0.88,
    coverageScore: 0.45,
  },
};

const CONTRADICTIONS = [
  {
    claimAId: "claim-marilyn-005",
    claimBId: "claim-marilyn-006",
    reason: "Housekeeper reported discovery at 3:00 AM but coroner estimated death between 8–10 PM — a minimum 5-hour gap with no documented explanation.",
    severity: 0.82,
  },
];

async function seed() {
  console.log("Seeding Evidence AI demo data…\n");

  // Clean existing demo data
  await prisma.contradiction.deleteMany({ where: { claimAId: { startsWith: "claim-marilyn" } } });
  await prisma.contradiction.deleteMany({ where: { claimAId: { startsWith: "claim-jfk" } } });
  await prisma.theory.deleteMany({ where: { id: { startsWith: "theory-" } } });
  await prisma.claim.deleteMany({ where: { documentId: { in: ["doc-marilyn-001", "doc-jfk-001"] } } });
  await prisma.document.deleteMany({ where: { id: { in: ["doc-marilyn-001", "doc-jfk-001"] } } });

  // Marilyn document
  await prisma.document.create({ data: MARILYN_DOC });
  console.log("✓ Marilyn Monroe document created");

  for (let i = 0; i < MARILYN_CLAIMS.length; i++) {
    const c = MARILYN_CLAIMS[i];
    await prisma.claim.create({
      data: {
        id: `claim-marilyn-${String(i + 1).padStart(3, "0")}`,
        documentId: "doc-marilyn-001",
        text: c.text,
        confidence: c.confidence,
        status: c.status as "ACCEPTED" | "WEAK" | "REJECTED" | "PENDING",
        timeRef: c.timeRef,
        entities: c.entities,
      },
    });
  }
  console.log(`✓ ${MARILYN_CLAIMS.length} Marilyn claims seeded`);

  // JFK document
  await prisma.document.create({ data: JFK_DOC });
  console.log("✓ JFK document created");

  for (let i = 0; i < JFK_CLAIMS.length; i++) {
    const c = JFK_CLAIMS[i];
    await prisma.claim.create({
      data: {
        id: `claim-jfk-${String(i + 1).padStart(3, "0")}`,
        documentId: "doc-jfk-001",
        text: c.text,
        confidence: c.confidence,
        status: c.status as "ACCEPTED" | "WEAK" | "REJECTED" | "PENDING",
        timeRef: c.timeRef,
        entities: c.entities,
      },
    });
  }
  console.log(`✓ ${JFK_CLAIMS.length} JFK claims seeded`);

  // Theory
  await prisma.theory.create({ data: { ...THEORY, scoreBreakdown: THEORY.scoreBreakdown } });
  console.log("✓ Demo theory seeded");

  // Contradiction
  await prisma.contradiction.create({ data: CONTRADICTIONS[0] });
  console.log("✓ Contradiction seeded (housekeeper timeline gap)");

  console.log("\nDemo seed complete. Run: npm run dev");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
