import { useState } from "react";
import { X, Plus } from "lucide-react";

const COMMON_SYMPTOMS = ["Fever","Headache","Cough","Sore throat","Fatigue","Body pain","Nausea","Chest pain","Shortness of breath","Dizziness","Back pain","Runny nose","Rash","Vomiting","Joint pain","Stomach pain","Blurred vision","Palpitations"];

interface Props { selected: string[]; onChange: (s: string[]) => void; }

export default function SymptomInput({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");

  const suggestions = COMMON_SYMPTOMS.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s));

  function add(symptom: string) {
    if (!selected.includes(symptom)) onChange([...selected, symptom]);
    setQuery("");
  }

  function remove(symptom: string) { onChange(selected.filter(s => s !== symptom)); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && query.trim()) {
      e.preventDefault();
      add(query.trim());
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-xl font-medium">
              {s}
              <button onClick={() => remove(s)} className="text-primary/60 hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a symptom and press Enter…"
          className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
            {suggestions.slice(0, 5).map(s => (
              <button key={s} onClick={() => add(s)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-left text-foreground">
                <Plus className="w-3.5 h-3.5 text-accent flex-shrink-0" />{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Common suggestions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Common symptoms — tap to add:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.filter(s => !selected.includes(s)).slice(0, 12).map(s => (
            <button key={s} onClick={() => add(s)} className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-xl hover:border-primary/40 hover:text-foreground transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
