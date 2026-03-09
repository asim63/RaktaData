import logoPng from "../assets/RaktadataLogo.png";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <img src={logoPng} alt="RaktaData logo" width="32" height="36" />
    <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.1rem" }}>
      Rakta<span style={{ color: "var(--red)" }}>Data</span>
    </span>
  </div>
);

export default Logo;
