import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const GREEN = "#526b3c"; // olive green matching the docx

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },

  // ── HEADER ──────────────────────────────────────────────
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  name: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    letterSpacing: 5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9.5,
    color: "#333333",
    letterSpacing: 0.3,
  },

  // ── SECTION HEADER (label + extending rule) ────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginRight: 8,
    flexShrink: 0,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: "#888888",
  },

  // ── OBJECTIVE / GENERIC TEXT ────────────────────────────
  bodyText: {
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.55,
    marginBottom: 4,
  },

  // ── EXPERIENCE / EDUCATION ITEMS ────────────────────────
  entryBlock: {
    marginBottom: 12,
  },
  entryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    flexShrink: 1,
    paddingRight: 8,
  },
  entryDate: {
    fontSize: 10.5,
    color: "#1a1a1a",
    flexShrink: 0,
    textAlign: "right",
  },
  entryMeta: {
    fontSize: 10.5,
    color: "#1a1a1a",
    marginTop: 1,
    marginBottom: 4,
  },
  entryDesc: {
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.55,
  },

  // ── REFERENCES ──────────────────────────────────────────
  refName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  refMeta: {
    fontSize: 10.5,
    color: "#1a1a1a",
  },
});

// Reusable section heading with extending rule
const SectionHeading = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionRule} />
  </View>
);

const ResumePDF = ({ resume }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.name}>{resume.name}</Text>
        {/* Contact line: address | city | phone | email */}
        <Text style={styles.contactLine}>
          {[resume.address, resume.cityState, resume.phone, resume.email]
            .filter(Boolean)
            .join("  |  ")}
        </Text>
      </View>

      {/* ── OBJECTIVE ── */}
      {resume.summary && (
        <View>
          <SectionHeading title="Objective" />
          <Text style={styles.bodyText}>{resume.summary}</Text>
        </View>
      )}

      {/* ── EXPERIENCE ── */}
      {resume.professionalExperiences?.length > 0 && (
        <View>
          <SectionHeading title="Experience" />
          {resume.professionalExperiences.map((exp: any, i: number) => (
            <View key={i} style={styles.entryBlock}>
              <View style={styles.entryTopRow}>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} – {exp.endDate || "Present"}
                </Text>
              </View>
              <Text style={styles.entryMeta}>
                {[exp.companyName, exp.location].filter(Boolean).join("  |  ")}
              </Text>
              {exp.description && (
                <Text style={styles.entryDesc}>{exp.description}</Text>
              )}
              {exp.responsibilities?.map((r: string, j: number) => (
                <Text key={j} style={styles.entryDesc}>
                  {r}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* ── EDUCATION ── */}
      {resume.education?.length > 0 && (
        <View>
          <SectionHeading title="Education" />
          {resume.education.map((edu: any, i: number) => (
            <View key={i} style={styles.entryBlock}>
              <View style={styles.entryTopRow}>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                <Text style={styles.entryDate}>{edu.year}</Text>
              </View>
              <Text style={styles.entryMeta}>{edu.institution}</Text>
              {edu.description && (
                <Text style={styles.entryDesc}>{edu.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* ── SKILLS / EXTRA SECTIONS ── */}
      {resume.skills?.length > 0 && (
        <View>
          <SectionHeading title="Skills" />
          <Text style={styles.bodyText}>{resume.skills.join("  ·  ")}</Text>
        </View>
      )}

      {/* ── COMMUNICATION ── */}
      {resume.communication && (
        <View>
          <SectionHeading title="Communication" />
          <Text style={styles.bodyText}>{resume.communication}</Text>
        </View>
      )}

      {/* ── LEADERSHIP ── */}
      {resume.leadership && (
        <View>
          <SectionHeading title="Leadership" />
          <Text style={styles.bodyText}>{resume.leadership}</Text>
        </View>
      )}

      {/* ── REFERENCES ── */}
      {resume.references?.length > 0 && (
        <View>
          <SectionHeading title="References" />
          {resume.references.map((ref: any, i: number) => (
            <View key={i} style={styles.entryBlock}>
              <Text style={styles.refName}>{ref.name}</Text>
              <Text style={styles.refMeta}>
                {[ref.company, ref.contact].filter(Boolean).join("  |  ")}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default ResumePDF;
