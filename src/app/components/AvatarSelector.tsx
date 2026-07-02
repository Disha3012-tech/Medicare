import { CheckCircle2 } from "lucide-react";

export type AvatarId = string;

interface AvatarDef { id: AvatarId; label: string; gender: "male" | "female"; svg: React.ReactNode; }

function Face({ skin, hair, hairPath, accessory }: { skin: string; hair: string; hairPath: string; accessory?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" fill="currentColor" className="text-secondary" />
      {/* Hair back */}
      <path d={hairPath} fill={hair} />
      {/* Neck */}
      <rect x="27" y="42" width="10" height="8" rx="2" fill={skin} />
      {/* Face */}
      <ellipse cx="32" cy="34" rx="13" ry="14" fill={skin} />
      {/* Ears */}
      <ellipse cx="19" cy="35" rx="3" ry="4" fill={skin} />
      <ellipse cx="45" cy="35" rx="3" ry="4" fill={skin} />
      {/* Eyes */}
      <ellipse cx="27" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
      <ellipse cx="37" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
      <circle cx="27.7" cy="31.3" r="0.7" fill="white" />
      <circle cx="37.7" cy="31.3" r="0.7" fill="white" />
      {/* Nose */}
      <path d="M32 35 Q30.5 38 32 39 Q33.5 38 32 35" fill={skin} stroke="#00000020" strokeWidth="0.5" />
      {/* Mouth */}
      <path d="M28.5 42 Q32 44.5 35.5 42" stroke="#00000040" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Hair front */}
      <path d={hairPath.replace("Z", " ")} fill={hair} opacity="0.4" />
      {accessory}
    </svg>
  );
}

const SKINS = { light: "#FDDBB4", medium: "#D4956A", mediumBrown: "#C68642", dark: "#7D4C1A", deeper: "#3E1C0A" };
const HAIRS = { black: "#1a1a1a", darkBrown: "#3b2314", brown: "#6B4226", auburn: "#8B3A3A", lightBrown: "#A0522D", blonde: "#C9A84C", gray: "#8a8a8a", white: "#d4d4d4" };

const AVATARS: AvatarDef[] = [
  // Male
  {
    id: "m1", label: "Professional", gender: "male",
    svg: <Face skin={SKINS.medium} hair={HAIRS.black}
      hairPath="M19 26 Q19 14 32 14 Q45 14 45 26 Q44 16 32 16 Q20 16 19 26Z" />,
  },
  {
    id: "m2", label: "Curly", gender: "male",
    svg: <Face skin={SKINS.dark} hair={HAIRS.black}
      hairPath="M18 25 Q15 14 32 13 Q49 14 46 25 Q45 18 39 16 Q36 12 32 13 Q28 12 25 16 Q21 18 18 25Z" />,
  },
  {
    id: "m3", label: "Distinguished", gender: "male",
    svg: (
      <Face skin={SKINS.light} hair={HAIRS.gray}
        hairPath="M19 28 Q19 14 32 14 Q45 14 45 28 Q44 17 32 16 Q20 17 19 28Z"
        accessory={
          <>
            <rect x="23" y="30" width="8" height="4" rx="1" fill="none" stroke="#334155" strokeWidth="1" />
            <rect x="33" y="30" width="8" height="4" rx="1" fill="none" stroke="#334155" strokeWidth="1" />
            <line x1="31" y1="32" x2="33" y2="32" stroke="#334155" strokeWidth="1" />
          </>
        }
      />
    ),
  },
  {
    id: "m4", label: "Bearded", gender: "male",
    svg: (
      <Face skin={SKINS.mediumBrown} hair={HAIRS.darkBrown}
        hairPath="M19 26 Q19 14 32 14 Q45 14 45 26 Q44 16 32 16 Q20 16 19 26Z"
        accessory={
          <path d="M22 40 Q24 47 32 48 Q40 47 42 40 Q38 43 32 43 Q26 43 22 40Z" fill={HAIRS.darkBrown} />
        }
      />
    ),
  },
  {
    id: "m5", label: "Bald", gender: "male",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="32" fill="currentColor" className="text-secondary" />
        <rect x="27" y="42" width="10" height="8" rx="2" fill={SKINS.dark} />
        <ellipse cx="32" cy="34" rx="13" ry="14" fill={SKINS.dark} />
        <ellipse cx="19" cy="35" rx="3" ry="4" fill={SKINS.dark} />
        <ellipse cx="45" cy="35" rx="3" ry="4" fill={SKINS.dark} />
        <ellipse cx="32" cy="24" rx="13" ry="11" fill={SKINS.dark} />
        <ellipse cx="27" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
        <ellipse cx="37" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
        <circle cx="27.7" cy="31.3" r="0.7" fill="white" />
        <circle cx="37.7" cy="31.3" r="0.7" fill="white" />
        <path d="M32 35 Q30.5 38 32 39 Q33.5 38 32 35" fill={SKINS.dark} stroke="#00000020" strokeWidth="0.5" />
        <path d="M28.5 42 Q32 44.5 35.5 42" stroke="#00000040" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "m6", label: "Athletic", gender: "male",
    svg: <Face skin={SKINS.light} hair={HAIRS.brown}
      hairPath="M19 24 Q20 13 32 13 Q44 13 45 24 Q43 15 32 15 Q21 15 19 24Z" />,
  },
  {
    id: "m7", label: "Casual", gender: "male",
    svg: <Face skin={SKINS.mediumBrown} hair={HAIRS.auburn}
      hairPath="M18 27 Q18 13 32 13 Q46 13 46 27 Q45 16 32 15 Q19 16 18 27Z" />,
  },
  {
    id: "m8", label: "Classic", gender: "male",
    svg: <Face skin={SKINS.deeper} hair={HAIRS.black}
      hairPath="M19 25 Q20 13 32 13 Q44 13 45 25 Q43 15 32 15 Q21 15 19 25Z" />,
  },
  // Female
  {
    id: "f1", label: "Long hair", gender: "female",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="32" fill="currentColor" className="text-secondary" />
        <path d="M14 30 Q14 55 24 57 Q32 60 40 57 Q50 55 50 30 Q50 13 32 13 Q14 13 14 30Z" fill={HAIRS.darkBrown} />
        <rect x="27" y="42" width="10" height="8" rx="2" fill={SKINS.light} />
        <ellipse cx="32" cy="33" rx="13" ry="13" fill={SKINS.light} />
        <ellipse cx="19" cy="34" rx="3" ry="4" fill={SKINS.light} />
        <ellipse cx="45" cy="34" rx="3" ry="4" fill={SKINS.light} />
        <path d="M19 23 Q19 13 32 13 Q45 13 45 23" fill={HAIRS.darkBrown} />
        <ellipse cx="27" cy="31" rx="2" ry="2.5" fill="#1a1a2e" />
        <ellipse cx="37" cy="31" rx="2" ry="2.5" fill="#1a1a2e" />
        <circle cx="27.7" cy="30.3" r="0.7" fill="white" />
        <circle cx="37.7" cy="30.3" r="0.7" fill="white" />
        <path d="M32 34 Q30.5 37 32 38 Q33.5 37 32 34" fill={SKINS.light} stroke="#00000020" strokeWidth="0.5" />
        <path d="M28.5 41 Q32 43.5 35.5 41" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M24 27 Q26 24 28 25.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M40 27 Q38 24 36 25.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "f2", label: "Short bob", gender: "female",
    svg: <Face skin={SKINS.medium} hair={HAIRS.black}
      hairPath="M18 34 Q18 13 32 13 Q46 13 46 34 Q46 38 44 40 Q40 44 32 44 Q24 44 20 40 Q18 38 18 34Z"
      accessory={<path d="M28.5 41 Q32 43.5 35.5 41" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />}
    />,
  },
  {
    id: "f3", label: "Curly", gender: "female",
    svg: (
      <Face skin={SKINS.dark} hair={HAIRS.black}
        hairPath="M15 28 Q14 12 32 12 Q50 12 49 28 Q49 18 44 15 Q40 11 32 11 Q24 11 20 15 Q15 18 15 28Z"
        accessory={
          <>
            <path d="M28.5 41 Q32 43.5 35.5 41" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="17" cy="28" rx="3" ry="4" fill={HAIRS.black} />
            <ellipse cx="47" cy="28" rx="3" ry="4" fill={HAIRS.black} />
            <ellipse cx="19" cy="22" rx="3" ry="3.5" fill={HAIRS.black} />
            <ellipse cx="45" cy="22" rx="3" ry="3.5" fill={HAIRS.black} />
          </>
        }
      />
    ),
  },
  {
    id: "f4", label: "Bun", gender: "female",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="32" fill="currentColor" className="text-secondary" />
        <circle cx="32" cy="10" r="7" fill={HAIRS.brown} />
        <rect x="30" y="14" width="4" height="6" fill={HAIRS.brown} />
        <path d="M19 26 Q19 14 32 14 Q45 14 45 26 Q44 16 32 16 Q20 16 19 26Z" fill={HAIRS.brown} />
        <rect x="27" y="42" width="10" height="8" rx="2" fill={SKINS.mediumBrown} />
        <ellipse cx="32" cy="34" rx="13" ry="14" fill={SKINS.mediumBrown} />
        <ellipse cx="19" cy="35" rx="3" ry="4" fill={SKINS.mediumBrown} />
        <ellipse cx="45" cy="35" rx="3" ry="4" fill={SKINS.mediumBrown} />
        <ellipse cx="27" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
        <ellipse cx="37" cy="32" rx="2" ry="2.5" fill="#1a1a2e" />
        <circle cx="27.7" cy="31.3" r="0.7" fill="white" />
        <circle cx="37.7" cy="31.3" r="0.7" fill="white" />
        <path d="M32 35 Q30.5 38 32 39 Q33.5 38 32 35" fill={SKINS.mediumBrown} stroke="#00000020" strokeWidth="0.5" />
        <path d="M28.5 42 Q32 44.5 35.5 42" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "f5", label: "Ponytail", gender: "female",
    svg: <Face skin={SKINS.light} hair={HAIRS.auburn}
      hairPath="M19 26 Q19 13 32 13 Q45 13 45 26 Q44 16 32 15 Q20 16 19 26Z"
      accessory={
        <>
          <path d="M44 20 Q50 25 48 35 Q46 30 44 26" fill={HAIRS.auburn} />
          <path d="M28.5 42 Q32 44.5 35.5 42" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      }
    />,
  },
  {
    id: "f6", label: "Hijab", gender: "female",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="32" fill="currentColor" className="text-secondary" />
        <path d="M12 35 Q12 14 32 13 Q52 14 52 35 Q52 50 32 52 Q12 50 12 35Z" fill="#1B4F72" />
        <path d="M19 28 Q19 19 32 19 Q45 19 45 28 Q44 20 32 21 Q20 20 19 28Z" fill="#1B4F72" opacity="0.7" />
        <rect x="27" y="42" width="10" height="8" rx="2" fill={SKINS.medium} />
        <ellipse cx="32" cy="33" rx="11" ry="12" fill={SKINS.medium} />
        <ellipse cx="20" cy="34" rx="2.5" ry="3.5" fill={SKINS.medium} />
        <ellipse cx="44" cy="34" rx="2.5" ry="3.5" fill={SKINS.medium} />
        <ellipse cx="27" cy="31" rx="2" ry="2.5" fill="#1a1a2e" />
        <ellipse cx="37" cy="31" rx="2" ry="2.5" fill="#1a1a2e" />
        <circle cx="27.7" cy="30.3" r="0.7" fill="white" />
        <circle cx="37.7" cy="30.3" r="0.7" fill="white" />
        <path d="M32 34 Q30.5 37 32 38 Q33.5 37 32 34" fill={SKINS.medium} stroke="#00000020" strokeWidth="0.5" />
        <path d="M28.5 41 Q32 43.5 35.5 41" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "f7", label: "Natural", gender: "female",
    svg: (
      <Face skin={SKINS.deeper} hair={HAIRS.black}
        hairPath="M15 27 Q13 12 32 11 Q51 12 49 27 Q49 20 44 16 Q39 11 32 11 Q25 11 20 16 Q15 20 15 27Z"
        accessory={
          <>
            <ellipse cx="16" cy="25" rx="3.5" ry="5" fill={HAIRS.black} />
            <ellipse cx="48" cy="25" rx="3.5" ry="5" fill={HAIRS.black} />
            <path d="M28.5 42 Q32 44.5 35.5 42" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </>
        }
      />
    ),
  },
  {
    id: "f8", label: "Wavy", gender: "female",
    svg: <Face skin={SKINS.light} hair={HAIRS.blonde}
      hairPath="M16 35 Q15 13 32 12 Q49 13 48 35 Q47 20 32 14 Q17 20 16 35Z"
      accessory={<path d="M28.5 42 Q32 44.5 35.5 42" stroke="#cc7b7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />}
    />,
  },
];

export const MALE_AVATARS   = AVATARS.filter(a => a.gender === "male");
export const FEMALE_AVATARS = AVATARS.filter(a => a.gender === "female");

interface Props {
  gender: "male" | "female";
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
}

export default function AvatarSelector({ gender, selected, onSelect }: Props) {
  const list = gender === "male" ? MALE_AVATARS : FEMALE_AVATARS;

  return (
    <div className="grid grid-cols-4 gap-3">
      {list.map(avatar => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${selected === avatar.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary">
            {avatar.svg}
          </div>
          <p className="text-xs text-muted-foreground">{avatar.label}</p>
          {selected === avatar.id && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function getAvatarById(id: AvatarId) {
  return AVATARS.find(a => a.id === id);
}
