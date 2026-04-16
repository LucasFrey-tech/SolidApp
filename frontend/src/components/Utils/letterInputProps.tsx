type LetterInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function LetterInput(props: LetterInputProps) {
  return (
    <input
      {...props}
      type="text"
      onInput={(e) => {
        const regex = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s.,;:!?()\-"']/g;
        e.currentTarget.value = 
          e.currentTarget.value.replace(regex, '');
        props.onInput?.(e);
      }}
    />
  );
}
