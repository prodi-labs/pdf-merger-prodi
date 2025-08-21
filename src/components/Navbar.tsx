import prodiLogo from "@/assets/prodi-logo.png";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-start">
          <img 
            src={prodiLogo} 
            alt="Prodi" 
            className="h-8 w-auto"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;