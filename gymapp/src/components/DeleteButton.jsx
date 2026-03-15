import "../styles/forms.css";

export default function DeleteButton({ children, ...props }) {
  return (
    <button className="deleteButton" {...props}>
      {children}
    </button>
  );
}
