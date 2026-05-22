"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { TheoryResult } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 32 },
  brand: { fontSize: 9, color: "#6b7280", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#6b7280" },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 8, color: "#9ca3af", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  verdict: { fontSize: 28, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  score: { fontSize: 14, color: "#6b7280" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  barLabel: { fontSize: 9, color: "#6b7280", width: 120 },
  barTrack: { flex: 1, height: 4, backgroundColor: "#f3f4f6", borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2, backgroundColor: "#3b82f6" },
  barValue: { fontSize: 9, color: "#374151", width: 32, textAlign: "right" },
  explanation: { fontSize: 11, color: "#374151", lineHeight: 1.6 },
  claimRow: { flexDirection: "row", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" },
  claimBullet: { width: 16, fontSize: 10, color: "#9ca3af" },
  claimText: { flex: 1, fontSize: 10, color: "#374151", lineHeight: 1.5 },
  claimStatus: { fontSize: 8, color: "#6b7280", width: 60, textAlign: "right" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#d1d5db" },
});

const VERDICT_COLORS: Record<string, string> = {
  STRONG: "#16a34a",
  PLAUSIBLE: "#2563eb",
  WEAK: "#d97706",
  CONTRADICTED: "#dc2626",
};

interface TheoryPDFProps {
  title: string;
  description: string;
  result: TheoryResult;
  claims: Array<{ text: string; status: string; confidence: number }>;
  generatedAt: string;
}

export function TheoryPDFDocument({ title, description, result, claims, generatedAt }: TheoryPDFProps) {
  const verdictColor = VERDICT_COLORS[result.verdict] ?? "#374151";
  const breakdownEntries = Object.entries(result.breakdown);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>Evidence AI — Theory Report</Text>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.subtitle}>{description}</Text> : null}
        </View>

        {/* Verdict + Score */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Verdict</Text>
          <Text style={[styles.verdict, { color: verdictColor }]}>{result.verdict}</Text>
          <Text style={styles.score}>Score: {Math.round(result.score * 100)} / 100</Text>
        </View>

        {/* Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Score Breakdown</Text>
          {breakdownEntries.map(([key, val]) => (
            <View key={key} style={styles.barRow}>
              <Text style={styles.barLabel}>{key}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.round(val * 100)}%` }]} />
              </View>
              <Text style={styles.barValue}>{Math.round(val * 100)}%</Text>
            </View>
          ))}
        </View>

        {/* Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Analysis</Text>
          <Text style={styles.explanation}>{result.explanation}</Text>
        </View>

        {/* Claims */}
        {claims.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Supporting Claims ({claims.length})</Text>
            {claims.map((c, i) => (
              <View key={i} style={styles.claimRow}>
                <Text style={styles.claimBullet}>{i + 1}.</Text>
                <Text style={styles.claimText}>{c.text}</Text>
                <Text style={styles.claimStatus}>{c.status} {Math.round(c.confidence * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Evidence AI — Structured Reasoning Platform</Text>
          <Text style={styles.footerText}>{generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadTheoryPDF(props: TheoryPDFProps) {
  const blob = await pdf(<TheoryPDFDocument {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `theory-${props.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
