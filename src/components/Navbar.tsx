const Navbar = () => {
  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-start">
          <h1 className="text-xl font-semibold text-foreground">
            PRODI
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;