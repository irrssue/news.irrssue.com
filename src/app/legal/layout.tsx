import NavBar from "../NavBar";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="legal-main">{children}</main>
    </>
  );
}
