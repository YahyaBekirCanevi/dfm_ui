import logo from "../logo.svg";
import reactLogo from "../react.svg";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      <div className="logo-container" style={{ display: "flex", gap: "10px" }}>
        <img
          src={logo}
          alt="Bun Logo"
          className="logo bun-logo"
          style={{ height: "40px" }}
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="logo react-logo"
          style={{ height: "40px" }}
        />
      </div>
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
        DFM Service - STEP Viewer
      </h1>
    </header>
  );
}
