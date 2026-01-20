interface NumericInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function NumericInput(props: NumericInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      onInput={(e) => {
        e.currentTarget.value =
          e.currentTarget.value.replace(/\D/g, '');
      }}
    />
  );
}
