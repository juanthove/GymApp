import "../styles/forms.css";

export default function FormPage({ title, children }) {
  return (
    <div className="container">
      <h1 className="title">{title}</h1>
      {children}
    </div>
  );
}
