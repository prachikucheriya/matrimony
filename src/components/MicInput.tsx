"use client";

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useT } from "@/components/LocaleProvider";

type SharedProps = {
  value: string;
  onValueChange: (value: string) => void;
  append?: boolean;
  showHint?: boolean;
};

type MicInputProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
    multiline?: false;
  };

type MicTextareaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
    multiline: true;
  };

function MicButton({
  listening,
  onClick,
  disabled,
}: {
  listening: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "listening" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={listening ? t("mic.listening") : t("mic.speak")}
      aria-label={listening ? t("mic.listening") : t("mic.speak")}
      aria-pressed={listening}
    >
      <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
        {listening ? (
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />
        ) : (
          <>
            <path
              fill="currentColor"
              d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z"
            />
            <path
              fill="currentColor"
              d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11z"
            />
          </>
        )}
      </svg>
    </button>
  );
}

export function MicInput(props: MicInputProps | MicTextareaProps) {
  const t = useT();
  const {
    value,
    onValueChange,
    append = true,
    showHint = false,
    multiline,
    ...rest
  } = props;

  const { listening, supported, error, toggle } = useSpeechInput((spoken) => {
    if (append && value.trim()) {
      onValueChange(`${value.trim()} ${spoken}`);
    } else {
      onValueChange(spoken);
    }
  });

  return (
    <div className="mic-field-wrap">
      <div className={`mic-field ${listening ? "is-listening" : ""}`}>
        {multiline ? (
          <textarea
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
        ) : (
          <input
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
        )}
        <MicButton
          listening={listening}
          onClick={toggle}
          disabled={!supported || Boolean(rest.readOnly) || Boolean(rest.disabled)}
        />
      </div>
      {error ? (
        <p className="mic-error" role="alert">
          {error}
        </p>
      ) : showHint ? (
        <p className="mic-hint">{t("mic.hint")}</p>
      ) : null}
    </div>
  );
}
