export default function LoginLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#fff9ea",
      margin: 0,
      padding: 0
    }}>
      {children}
    </div>
  );
}