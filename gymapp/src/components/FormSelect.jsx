import "../styles/forms.css";

export default function FormSelect({ label, children, ...props }) {
  return (
    <>
      <label className="label">{label}</label>
      <select className="select" {...props}>
        {children}
      </select>
    </>
  );
}
