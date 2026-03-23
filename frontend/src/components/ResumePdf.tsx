import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Outfit",
  fonts: [
    { src: "/fonts/Outfit-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Outfit-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Outfit-Bold.ttf", fontWeight: 700 },
  ],
});

// ── THEME ────────────────────────────────────────────────────────────────────
const GREEN = "#526b3c";

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 52,
    fontSize: 10.5,
    fontFamily: "Outfit", // ← body default
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },

  // ── HEADER ─────────────────────────────────────────────────────────────────
  header: {
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontFamily: "Outfit", // ← bold headers
    fontWeight: 700,
    color: GREEN,
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    color: "#444444",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  contactLine: {
    fontSize: 9.5,
    color: "#333333",
    letterSpacing: 0.2,
  },

  // ── SECTION HEADER ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    marginTop: 13,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Outfit", // ← bold headers
    color: GREEN,
    letterSpacing: 2.5,
    marginRight: 8,
    flexShrink: 0,
    fontWeight: 600,
  },
  sectionRule: {
    flex: 1,
    height: 0.75,
    backgroundColor: "#aaaaaa",
  },

  // ── BODY TEXT ──────────────────────────────────────────────────────────────
  bodyText: {
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.55,
  },

  // ── SKILLS ─────────────────────────────────────────────────────────────────
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillLabel: {
    fontSize: 10.5,
    fontFamily: "Outfit", // ← bold headers
    color: "#1a1a1a",
    width: 190,
    flexShrink: 0,
    fontWeight: 600,
  },
  skillValue: {
    fontSize: 10.5,
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 1.4,
  },

  // ── EXPERIENCE / EDUCATION ────────────────────────────────────────────────
  entryBlock: {
    marginBottom: 11,
  },
  entryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    fontSize: 10.5,
    fontFamily: "Outfit", // ← bold headers
    fontWeight: 600,
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
    marginTop: 2,
    marginBottom: 5,
  },

  // ── BULLET LIST ────────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 4,
  },
  bulletChar: {
    fontSize: 10.5,
    color: "#1a1a1a",
    width: 14,
    flexShrink: 0,
    marginTop: 0,
  },
  bulletText: {
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.5,
    flex: 1,
  },
});

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

const SectionHeading = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionRule} />
  </View>
);

/** Renders a single bullet point line */
const BulletItem = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletChar}>{"•"}</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/**
 * Renders a categorised skill row, e.g.
 *   "Programming Languages:   C#, JavaScript, HTML, CSS, SQL"
 */
const SkillRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.skillRow}>
    <Text style={styles.skillLabel}>{label}</Text>
    <Text style={styles.skillValue}>{value}</Text>
  </View>
);

// ── TYPES ─────────────────────────────────────────────────────────────────────

type SkillCategory = {
  label: string; // e.g. "Programming Languages:"
  value: string; // e.g. "C#, JavaScript, HTML, CSS, SQL"
};

type Experience = {
  title: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  responsibilities?: string[];
};

type PersonalDetail = {
  contact: string;
  email: string;
  address: string;
  linkedin: string;
};

type Education = {
  degree: string;
  field?: string;
  school: string;
  startYear?: string | number;
  endYear?: string | number;
  description?: string;
};

type Resume = {
  name: string;
  title?: string; // e.g. "Senior SharePoint-Power Apps Developer"
  phone?: string;
  email?: string;
  cityState?: string;
  summary?: string;
  skillCategories?: SkillCategory[]; // categorised skills (preferred)
  skills?: string[]; // flat list fallback
  professionalExperiences?: Experience[];
  education?: Education[];
  personalDetail: PersonalDetail[];
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

const ResumePDF = ({ resume }: { resume: Resume }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          {resume.title && <Text style={styles.title}>{resume.title}</Text>}
          {resume.personalDetail.map((detail, index) => {
            return (
              <View
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  alignItems: "center",
                }}
              >
                <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
                  {detail.address.length && (
                    <Text>Address: {detail.address} ||</Text>
                  )}

                  <Text>Email: {detail.email}</Text>
                </View>
                <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
                  <Text>Phone: {detail.contact}</Text>
                  <Text>||</Text>
                  <Text>Linkedin: {detail.linkedin}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── PROFESSIONAL SUMMARY ── */}
        {resume.summary && (
          <View>
            <SectionHeading title="Professional Summary" />
            <Text style={styles.bodyText}>{resume.summary}</Text>
          </View>
        )}

        {/* ── TECHNICAL SKILLS ── */}
        {resume.skillCategories?.length || resume.skills?.length ? (
          <View>
            <SectionHeading title="Technical Skills" />
            {resume.skillCategories?.length ? (
              resume.skillCategories.map((cat, i) => (
                <SkillRow key={i} label={cat.label} value={cat.value} />
              ))
            ) : (
              /* flat fallback */
              <Text style={styles.bodyText}>
                {resume.skills!.join("  ·  ")}
              </Text>
            )}
          </View>
        ) : null}

        {/* ── WORK EXPERIENCE ── */}
        {resume.professionalExperiences?.length ? (
          <View>
            <SectionHeading title="Work Experience" />
            {resume.professionalExperiences.map((exp, i) => (
              <View key={i} style={styles.entryBlock}>
                {/* Title + Date on same row */}
                <View style={styles.entryTopRow}>
                  <Text style={styles.entryTitle}>
                    {exp.title}
                    {exp.companyName ? `  |  ${exp.companyName}` : ""}
                    {exp.location ? `  |  ${exp.location}` : ""}
                  </Text>
                  <Text style={styles.entryDate}>
                    {exp.startDate} – {exp.endDate ?? "Present"}
                  </Text>
                </View>

                {/* Bullet responsibilities */}
                {exp.responsibilities?.map((r, j) => (
                  <BulletItem key={j} text={r} />
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── EDUCATION & CERTIFICATIONS ── */}
        {resume.education?.length ? (
          <View>
            <SectionHeading title="Education & Certifications" />
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryTopRow}>
                  <Text style={styles.entryTitle}>
                    {[edu.degree, edu.field].filter(Boolean).join(" ")}
                  </Text>
                  <Text style={styles.entryDate}>
                    {edu.startYear} – {edu.endYear}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>{edu.school}</Text>
                {edu.description && (
                  <Text style={styles.bodyText}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default ResumePDF;
