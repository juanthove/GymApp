import "../styles/forms.css";

export default function PrimaryButton({ children, ...props }) {
  return (
    <button className="primaryButton" {...props}>
      {children}
    </button>
  );
}
