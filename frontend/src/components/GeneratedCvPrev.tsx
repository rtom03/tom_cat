import React from "react";

type ProfessionalExperience = {
  id?: number;
  title?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  technologies?: string[] | string;
  responsibilities?: string[] | string;
};

type Education = {
  school?: string;
  degree?: string;
  field?: string;
  startYear?: number | string;
  endYear?: number | string;
  location?: string;
};

type PersonalDetail = {
  contact?: string;
  email?: string;
  address?: string;
  linkedin?: string;
};

type GeneratedCv = {
  name?: string;
  title?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  projects?: unknown[] | string;
  education?: Education[] | string;
  certifications?: string[] | string;
  personalDetail?: PersonalDetail[] | string;
  professionalExperiences?: ProfessionalExperience[];
};

type Props = {
  cv?: GeneratedCv | null;
};

const parseJson = <T,>(
  value: T | string | undefined | null,
  fallback: T,
): T => {
  if (value === undefined || value === null) return fallback;

  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const cleanString = (value?: string | null) => {
  return value?.trim() || "";
};

const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = cleanString(startDate);
  const end = cleanString(endDate);

  if (!start && !end) return "";

  return `${start}${start && end ? " — " : ""}${end}`;
};

export default function GeneratedCvPreview({ cv }: Props) {
  if (!cv) {
    return (
      <div className="rounded-xl border border-[#333] bg-[#111] p-8 text-center text-gray-500">
        CV has not been generated yet.
      </div>
    );
  }

  const education = parseJson<Education[]>(cv.education, []);
  const projects = parseJson<unknown[]>(cv.projects, []);
  const certifications = parseJson<string[]>(cv.certifications, []);
  const personalDetails = parseJson<PersonalDetail[]>(cv.personalDetail, []);

  const personal = personalDetails[0];

  return (
    <div className="max-h-[750px] overflow-y-auto rounded-xl border border-[#333] bg-[#111] text-gray-200">
      {/* Header */}
      <div className="border-b border-[#333] px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          {cv.name || "Unnamed Candidate"}
        </h1>

        {cv.title && (
          <p className="mt-1 text-base font-medium text-gray-400">{cv.title}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
          {personal?.email && <span>{personal.email}</span>}
          {personal?.contact && <span>{personal.contact}</span>}
          {personal?.address && <span>{personal.address}</span>}
          {personal?.linkedin && (
            <span className="text-blue-400">{personal.linkedin}</span>
          )}
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Summary */}
        {cv.summary && (
          <section>
            <SectionTitle>Professional Summary</SectionTitle>

            <p className="mt-3 text-sm leading-6 text-gray-400">{cv.summary}</p>
          </section>
        )}

        {/* Skills */}
        {cv.skills?.length ? (
          <section>
            <SectionTitle>Skills</SectionTitle>

            <div className="mt-3 flex flex-wrap gap-2">
              {cv.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-md border border-[#333] bg-[#181818] px-3 py-1.5 text-xs text-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Experience */}
        {cv.professionalExperiences?.length ? (
          <section>
            <SectionTitle>Professional Experience</SectionTitle>

            <div className="mt-4 space-y-6">
              {cv.professionalExperiences.map((job, index) => {
                const technologies = parseJson<string[]>(job.technologies, []);

                const responsibilities = parseJson<string[]>(
                  job.responsibilities,
                  [],
                );

                return (
                  <div
                    key={job.id ?? index}
                    className="relative border-l border-[#333] pl-5"
                  >
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-gray-500" />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {job.title || "Position"}
                        </h3>

                        <p className="text-sm text-gray-400">
                          {job.companyName || "Company"}
                        </p>
                      </div>

                      {(job.startDate || job.endDate) && (
                        <span className="text-xs text-gray-500">
                          {formatDateRange(job.startDate, job.endDate)}
                        </span>
                      )}
                    </div>

                    {job.location && (
                      <p className="mt-1 text-xs text-gray-500">
                        {job.location}
                      </p>
                    )}

                    {technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {technologies.map((technology, techIndex) => (
                          <span
                            key={`${technology}-${techIndex}`}
                            className="rounded bg-[#1a1a1a] px-2 py-1 text-[11px] text-gray-400"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                    {responsibilities.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {responsibilities.map(
                          (responsibility, responsibilityIndex) => (
                            <li
                              key={responsibilityIndex}
                              className="flex gap-2 text-sm leading-5 text-gray-400"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />

                              <span>{responsibility}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <SectionTitle>Education</SectionTitle>

            <div className="mt-4 space-y-4">
              {education.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#292929] bg-[#151515] p-4"
                >
                  <h3 className="font-medium text-white">
                    {item.degree || "Degree"}
                    {item.field ? ` in ${item.field}` : ""}
                  </h3>

                  {item.school && (
                    <p className="mt-1 text-sm text-gray-400">{item.school}</p>
                  )}

                  {(item.startYear || item.endYear) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.startYear} — {item.endYear}
                    </p>
                  )}

                  {item.location && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <SectionTitle>Certifications</SectionTitle>

            <ul className="mt-3 space-y-2">
              {certifications.map((certification, index) => (
                <li key={index} className="text-sm text-gray-400">
                  • {certification}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionTitle>Projects</SectionTitle>

            <div className="mt-3 space-y-3">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#292929] bg-[#151515] p-4 text-sm text-gray-400"
                >
                  {typeof project === "string"
                    ? project
                    : JSON.stringify(project)}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[#333] pb-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
      {children}
    </h2>
  );
}
