export default function Avatar({
  name,
  size = "w-24 h-24",
}: {
  name: string;
  size?: string;
}) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Extract size values for inline styles
  const sizeMap: { [key: string]: number } = {
    "w-16 h-16": 64,
    "w-20 h-20": 80,
    "w-24 h-24": 96,
    "w-32 h-32": 128,
  };

  const pixelSize = sizeMap[size] || 80;

  return (
    <div
      className="rounded-full overflow-hidden shadow-lg border-4 border-white relative"
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
    >
      <img
        src="/avt.jpeg"
        alt={`Avatar của ${name}`}
        className="absolute inset-0 object-cover"
        style={{ width: "100%", height: "100%" }}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.className =
              "rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white";
            parent.style.background =
              "linear-gradient(135deg, #3b82f6, #8b5cf6)";
            parent.innerHTML = initials;
          }
        }}
      />
    </div>
  );
}
