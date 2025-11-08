export const NavBar = () => {
  return (
    <nav className="w-full flex items-center justify-between py-4 px-8 bg-gray-800 text-white">
      <div className="text-lg font-bold">Urban Pulse</div>
      <div className="space-x-4">
        <a href="#" className="hover:underline">
          Home
        </a>
        <a href="#" className="hover:underline">
          Map
        </a>
        <a href="#" className="hover:underline">
          About
        </a>
      </div>
    </nav>
  );
}