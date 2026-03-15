import "../styles/forms.css";

export default function FormInput({ label, ...props }) {
  return (
    <>
      <label className="label">{label}</label>
      <input className="input" {...props}/>
    </>
  );
}
